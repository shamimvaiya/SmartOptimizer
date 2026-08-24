using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using SharpDX;
using SharpDX.Direct3D11;
using SharpDX.DXGI;
using Device = SharpDX.Direct3D11.Device;

namespace SmartOptimizer.Core.Engines;

public sealed class ScreenCaptureEngine : IDisposable
{
    private readonly object captureLock = new();
    private Device? device;
    private OutputDuplication? desktopDuplication;
    private int outputWidth = 1920;
    private int outputHeight = 1080;
    private Texture2D? stagingTexture;
    private byte[]? lastValidFrame;
    private bool disposed;
    private bool dxgiAvailable = true;

    public ScreenCaptureEngine()
    {
        InitializeDxgi();
    }

    private void InitializeDxgi()
    {
        lock (captureLock)
        {
            CleanupDxgiResources();
            try
            {
                using var factory = new Factory1();
                using var adapter = factory.GetAdapter1(0);
                using var output = adapter.GetOutput(0);
                using var output1 = output.QueryInterface<Output1>();

                device = new Device(
                    SharpDX.Direct3D.DriverType.Hardware,
                    DeviceCreationFlags.BgraSupport);
                desktopDuplication = output1.DuplicateOutput(device);

                var bounds = output.Description.DesktopBounds;
                outputWidth = bounds.Right - bounds.Left;
                outputHeight = bounds.Bottom - bounds.Top;
                dxgiAvailable = true;
            }
            catch (Exception)
            {
                dxgiAvailable = false;
            }
        }
    }

    private void CleanupDxgiResources()
    {
        stagingTexture?.Dispose();
        stagingTexture = null;
        desktopDuplication?.Dispose();
        desktopDuplication = null;
        device?.Dispose();
        device = null;
    }

    public byte[] CaptureRegion(int x, int y, int width, int height)
    {
        ObjectDisposedException.ThrowIf(disposed, this);
        if (width <= 0 || height <= 0)
            return Array.Empty<byte>();

        x = Math.Max(0, x);
        y = Math.Max(0, y);

        if (dxgiAvailable)
        {
            try
            {
                return CaptureRegionDxgi(x, y, width, height);
            }
            catch (SharpDXException ex) when (ex.ResultCode == SharpDX.DXGI.ResultCode.AccessLost || ex.ResultCode == SharpDX.DXGI.ResultCode.AccessDenied)
            {
                InitializeDxgi();
            }
            catch (Exception)
            {
                // Fallback to GDI capture below
            }
        }

        return CaptureRegionGdi(x, y, width, height);
    }

    private byte[] CaptureRegionDxgi(int x, int y, int width, int height)
    {
        lock (captureLock)
        {
            if (device is null || desktopDuplication is null)
            {
                InitializeDxgi();
                if (device is null || desktopDuplication is null)
                    return CaptureRegionGdi(x, y, width, height);
            }

            // Clamp coordinates to output display
            var captureW = Math.Min(width, outputWidth - x);
            var captureH = Math.Min(height, outputHeight - y);
            if (captureW <= 0 || captureH <= 0)
                return Array.Empty<byte>();

            EnsureStagingTexture(captureW, captureH);
            SharpDX.DXGI.Resource? desktopResource = null;
            var frameAcquired = false;

            try
            {
                var result = desktopDuplication.TryAcquireNextFrame(20, out var frameInfo, out desktopResource);
                if (result.Failure || desktopResource is null)
                {
                    // If frame acquisition timed out or failed, return last known valid frame or fallback
                    if (lastValidFrame != null && lastValidFrame.Length == captureW * captureH * 4)
                        return lastValidFrame;
                    return CaptureRegionGdi(x, y, width, height);
                }

                frameAcquired = true;

                using var desktopTexture = desktopResource.QueryInterface<Texture2D>();
                var region = new ResourceRegion(x, y, 0, x + captureW, y + captureH, 1);
                device.ImmediateContext.CopySubresourceRegion(
                    desktopTexture,
                    0,
                    region,
                    stagingTexture!,
                    0);

                var frameData = new byte[captureW * captureH * 4];
                var mapped = device.ImmediateContext.MapSubresource(
                    stagingTexture!,
                    0,
                    MapMode.Read,
                    SharpDX.Direct3D11.MapFlags.None);
                try
                {
                    var rowBytes = captureW * 4;
                    for (var row = 0; row < captureH; row++)
                    {
                        Marshal.Copy(
                            IntPtr.Add(mapped.DataPointer, row * mapped.RowPitch),
                            frameData,
                            row * rowBytes,
                            rowBytes);
                    }
                }
                finally
                {
                    device.ImmediateContext.UnmapSubresource(stagingTexture!, 0);
                }

                lastValidFrame = frameData;
                return frameData;
            }
            finally
            {
                desktopResource?.Dispose();
                if (frameAcquired)
                {
                    try { desktopDuplication.ReleaseFrame(); } catch { }
                }
            }
        }
    }

    private byte[] CaptureRegionGdi(int x, int y, int width, int height)
    {
        try
        {
            using var bitmap = new Bitmap(width, height, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
            using (var g = Graphics.FromImage(bitmap))
            {
                g.CopyFromScreen(x, y, 0, 0, new System.Drawing.Size(width, height), CopyPixelOperation.SourceCopy);
            }

            var frameData = new byte[width * height * 4];
            var bmpData = bitmap.LockBits(new Rectangle(0, 0, width, height), ImageLockMode.ReadOnly, System.Drawing.Imaging.PixelFormat.Format32bppArgb);
            try
            {
                Marshal.Copy(bmpData.Scan0, frameData, 0, frameData.Length);
            }
            finally
            {
                bitmap.UnlockBits(bmpData);
            }

            lastValidFrame = frameData;
            return frameData;
        }
        catch
        {
            return Array.Empty<byte>();
        }
    }

    private void EnsureStagingTexture(int width, int height)
    {
        if (stagingTexture?.Description.Width == width && stagingTexture.Description.Height == height)
            return;

        stagingTexture?.Dispose();
        if (device != null)
        {
            stagingTexture = new Texture2D(device, new Texture2DDescription
            {
                Width = width,
                Height = height,
                ArraySize = 1,
                MipLevels = 1,
                Format = Format.B8G8R8A8_UNorm,
                SampleDescription = new SampleDescription(1, 0),
                Usage = ResourceUsage.Staging,
                BindFlags = BindFlags.None,
                CpuAccessFlags = CpuAccessFlags.Read,
                OptionFlags = ResourceOptionFlags.None
            });
        }
    }

    public void Dispose()
    {
        if (disposed)
            return;

        disposed = true;
        CleanupDxgiResources();
    }
}
