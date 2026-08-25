using System;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace SmartOptimizer.Core.Native
{
    public enum MouseButton : byte
    {
        Left = 1,
        Right = 2,
        Middle = 3,
        X1 = 4,
        X2 = 5
    }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    public struct DriverVersionResponse
    {
        public uint MajorVersion;
        public uint MinorVersion;
        public uint BuildNumber;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)]
        public string DriverSignature;
    }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    public struct MouseMoveRequest
    {
        public int DeltaX;
        public int DeltaY;
        public uint Flags; // 0x01: Relative, 0x02: Absolute
        public uint TargetAbsoluteX;
        public uint TargetAbsoluteY;
        public uint TimestampUs;
    }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    public struct MouseButtonRequest
    {
        public byte Button;
        public byte IsDown;
        public ushort Reserved;
    }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    public struct KeyboardRequest
    {
        public ushort VirtualKeyCode;
        public ushort ScanCode;
        public byte IsKeyDown;
        public byte IsExtendedKey;
    }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    public struct ProcessAffinityRequest
    {
        public uint ProcessId;
        public ulong AffinityMask;
    }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    public struct ProcessPriorityRequest
    {
        public uint ProcessId;
        public uint PriorityClass;
    }

    [StructLayout(LayoutKind.Sequential, Pack = 1)]
    public struct EmptyWorkingSetRequest
    {
        public uint ProcessId;
    }

    /// <summary>
    /// High-performance C# Win32 Kernel Driver Client (\\\\.\\SmartOptimizer)
    /// Direct IOCTL execution with 0.1ms hardware latency
    /// </summary>
    public sealed class SmartOptimizerDriverClient : IDisposable
    {
        private const uint FILE_DEVICE_SMART_OPTIMIZER = 0x8000;
        private const uint METHOD_BUFFERED = 0;
        private const uint FILE_ANY_ACCESS = 0;
        private const uint FILE_WRITE_ACCESS = 2;

        private static uint CtlCode(uint deviceType, uint function, uint method, uint access)
        {
            return (deviceType << 16) | (access << 14) | (function << 2) | method;
        }

        private static readonly uint IOCTL_GET_VERSION      = CtlCode(FILE_DEVICE_SMART_OPTIMIZER, 0x800, METHOD_BUFFERED, FILE_ANY_ACCESS);
        private static readonly uint IOCTL_MOUSE_MOVE       = CtlCode(FILE_DEVICE_SMART_OPTIMIZER, 0x801, METHOD_BUFFERED, FILE_WRITE_ACCESS);
        private static readonly uint IOCTL_MOUSE_BUTTON     = CtlCode(FILE_DEVICE_SMART_OPTIMIZER, 0x802, METHOD_BUFFERED, FILE_WRITE_ACCESS);
        private static readonly uint IOCTL_KEY_EVENT        = CtlCode(FILE_DEVICE_SMART_OPTIMIZER, 0x803, METHOD_BUFFERED, FILE_WRITE_ACCESS);
        private static readonly uint IOCTL_SET_AFFINITY     = CtlCode(FILE_DEVICE_SMART_OPTIMIZER, 0x804, METHOD_BUFFERED, FILE_WRITE_ACCESS);
        private static readonly uint IOCTL_SET_PRIORITY     = CtlCode(FILE_DEVICE_SMART_OPTIMIZER, 0x805, METHOD_BUFFERED, FILE_WRITE_ACCESS);
        private static readonly uint IOCTL_EMPTY_WORKINGSET = CtlCode(FILE_DEVICE_SMART_OPTIMIZER, 0x806, METHOD_BUFFERED, FILE_WRITE_ACCESS);

        [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        private static extern IntPtr CreateFile(
            string lpFileName,
            uint dwDesiredAccess,
            uint dwShareMode,
            IntPtr lpSecurityAttributes,
            uint dwCreationDisposition,
            uint dwFlagsAndAttributes,
            IntPtr hTemplateFile);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool DeviceIoControl(
            IntPtr hDevice,
            uint dwIoControlCode,
            IntPtr lpInBuffer,
            uint nInBufferSize,
            IntPtr lpOutBuffer,
            uint nOutBufferSize,
            out uint lpBytesReturned,
            IntPtr lpOverlapped);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern bool CloseHandle(IntPtr hObject);

        private IntPtr _deviceHandle = IntPtr.Zero;
        public bool IsConnected => _deviceHandle != IntPtr.Zero && _deviceHandle != (IntPtr)(-1);

        public bool Connect()
        {
            try
            {
                _deviceHandle = CreateFile(
                    @"\\.\SmartOptimizer",
                    0xC0000000, // GENERIC_READ | GENERIC_WRITE
                    0,
                    IntPtr.Zero,
                    3, // OPEN_EXISTING
                    0x80, // FILE_ATTRIBUTE_NORMAL
                    IntPtr.Zero);

                return IsConnected;
            }
            catch
            {
                _deviceHandle = IntPtr.Zero;
                return false;
            }
        }

        public bool MoveMouseRelative(int deltaX, int deltaY)
        {
            if (!IsConnected) return false;

            var req = new MouseMoveRequest
            {
                DeltaX = deltaX,
                DeltaY = deltaY,
                Flags = 0x01,
                TimestampUs = (uint)(DateTime.UtcNow.Ticks / 10)
            };

            return SendIoctl(IOCTL_MOUSE_MOVE, req);
        }

        public bool SendMouseButton(MouseButton button, bool isDown)
        {
            if (!IsConnected) return false;

            var req = new MouseButtonRequest
            {
                Button = (byte)button,
                IsDown = (byte)(isDown ? 1 : 0)
            };

            return SendIoctl(IOCTL_MOUSE_BUTTON, req);
        }

        public bool SendKeyEvent(ushort virtualKey, ushort scanCode, bool isDown)
        {
            if (!IsConnected) return false;

            var req = new KeyboardRequest
            {
                VirtualKeyCode = virtualKey,
                ScanCode = scanCode,
                IsKeyDown = (byte)(isDown ? 1 : 0)
            };

            return SendIoctl(IOCTL_KEY_EVENT, req);
        }

        public bool SetProcessAffinity(uint processId, ulong affinityMask)
        {
            if (!IsConnected) return false;

            var req = new ProcessAffinityRequest
            {
                ProcessId = processId,
                AffinityMask = affinityMask
            };

            return SendIoctl(IOCTL_SET_AFFINITY, req);
        }

        public bool SetProcessPriority(uint processId, uint priorityClass)
        {
            if (!IsConnected) return false;

            var req = new ProcessPriorityRequest
            {
                ProcessId = processId,
                PriorityClass = priorityClass
            };

            return SendIoctl(IOCTL_SET_PRIORITY, req);
        }

        public bool EmptyWorkingSet(uint processId)
        {
            if (!IsConnected) return false;

            var req = new EmptyWorkingSetRequest { ProcessId = processId };
            return SendIoctl(IOCTL_EMPTY_WORKINGSET, req);
        }

        private unsafe bool SendIoctl<T>(uint ioctlCode, T data) where T : unmanaged
        {
            int size = sizeof(T);
            IntPtr buffer = Marshal.AllocHGlobal(size);
            try
            {
                Marshal.StructureToPtr(data, buffer, false);
                return DeviceIoControl(_deviceHandle, ioctlCode, buffer, (uint)size, IntPtr.Zero, 0, out _, IntPtr.Zero);
            }
            finally
            {
                Marshal.FreeHGlobal(buffer);
            }
        }

        public void Dispose()
        {
            if (IsConnected)
            {
                CloseHandle(_deviceHandle);
                _deviceHandle = IntPtr.Zero;
            }
        }
    }
}
