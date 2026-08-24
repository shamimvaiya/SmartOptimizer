using Microsoft.Win32.SafeHandles;
using System.Runtime.InteropServices;

namespace SmartOptimizer.Core.Managers;

public sealed class DriverInterface : IDisposable
{
    private const uint GenericRead = 0x80000000;
    private const uint GenericWrite = 0x40000000;
    private const uint OpenExisting = 3;
    private const uint FileShareRead = 0x00000001;
    private const uint FileShareWrite = 0x00000002;

    // Custom IOCTL definitions matching SmartOptimizer.Driver
    private const uint IoctlMoveMouse = 0x222004;
    private const uint IoctlReadMemory = 0x222008;

    [StructLayout(LayoutKind.Sequential)]
    private struct MouseMoveIoctl
    {
        public int DeltaX;
        public int DeltaY;
        public uint Flags;
    }

    [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern SafeFileHandle CreateFile(
        string fileName,
        uint desiredAccess,
        uint shareMode,
        IntPtr securityAttributes,
        uint creationDisposition,
        uint flagsAndAttributes,
        IntPtr templateFile);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool DeviceIoControl(
        SafeFileHandle hDevice,
        uint dwIoControlCode,
        IntPtr lpInBuffer,
        uint nInBufferSize,
        IntPtr lpOutBuffer,
        uint nOutBufferSize,
        out uint lpBytesReturned,
        IntPtr lpOverlapped);

    // Win32 User-Mode Fallback APIs
    [DllImport("user32.dll")]
    private static extern bool SetCursorPos(int x, int y);

    [DllImport("user32.dll")]
    private static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);

    [DllImport("user32.dll")]
    private static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);

    private const uint MouseeventfMove = 0x0001;
    private const uint MouseeventfLeftdown = 0x0002;
    private const uint MouseeventfLeftup = 0x0004;
    private const uint MouseeventfRightdown = 0x0008;
    private const uint MouseeventfRightup = 0x0010;
    private const uint MouseeventfAbsolute = 0x8000;

    private const uint KeyeventfKeyup = 0x0002;

    private SafeFileHandle? _deviceHandle;

    public bool IsConnected => _deviceHandle is { IsInvalid: false, IsClosed: false };

    public bool Connect()
    {
        Disconnect();

        try
        {
            _deviceHandle = CreateFile(
                @"\\.\SmartOptimizer",
                GenericRead | GenericWrite,
                FileShareRead | FileShareWrite,
                IntPtr.Zero,
                OpenExisting,
                0,
                IntPtr.Zero);

            if (IsConnected)
                return true;

            _deviceHandle?.Dispose();
            _deviceHandle = null;
            return false;
        }
        catch
        {
            _deviceHandle = null;
            return false;
        }
    }

    public void Disconnect()
    {
        _deviceHandle?.Dispose();
        _deviceHandle = null;
    }

    public bool MoveMouse(int x, int y, bool isAbsolute = false)
    {
        if (IsConnected && _deviceHandle != null)
        {
            var req = new MouseMoveIoctl
            {
                DeltaX = x,
                DeltaY = y,
                Flags = isAbsolute ? MouseeventfAbsolute : MouseeventfMove
            };
            var size = (uint)Marshal.SizeOf(req);
            var ptr = Marshal.AllocHGlobal((int)size);
            try
            {
                Marshal.StructureToPtr(req, ptr, false);
                if (DeviceIoControl(_deviceHandle, IoctlMoveMouse, ptr, size, IntPtr.Zero, 0, out _, IntPtr.Zero))
                    return true;
            }
            finally
            {
                Marshal.FreeHGlobal(ptr);
            }
        }

        // User-mode Fallback
        if (isAbsolute)
        {
            return SetCursorPos(x, y);
        }
        else
        {
            mouse_event(MouseeventfMove, (uint)x, (uint)y, 0, 0);
            return true;
        }
    }

    public bool Click(bool left = true, bool right = false)
    {
        if (left)
        {
            mouse_event(MouseeventfLeftdown, 0, 0, 0, 0);
            Thread.Sleep(15);
            mouse_event(MouseeventfLeftup, 0, 0, 0, 0);
            return true;
        }
        else if (right)
        {
            mouse_event(MouseeventfRightdown, 0, 0, 0, 0);
            Thread.Sleep(15);
            mouse_event(MouseeventfRightup, 0, 0, 0, 0);
            return true;
        }
        return false;
    }

    public bool SendKey(byte vkCode, int holdMs = 25)
    {
        try
        {
            keybd_event(vkCode, 0, 0, 0); // Down
            if (holdMs > 0)
                Thread.Sleep(holdMs);
            keybd_event(vkCode, 0, KeyeventfKeyup, 0); // Up
            return true;
        }
        catch
        {
            return false;
        }
    }

    public void Dispose()
    {
        Disconnect();
        GC.SuppressFinalize(this);
    }
}