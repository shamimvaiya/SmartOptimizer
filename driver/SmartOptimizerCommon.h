/**
 * SmartOptimizer Ultimate (AIM/OPT Pro v3.0)
 * Kernel-Mode Driver Shared Header & IOCTL Definitions
 * Target Architecture: Windows x64 (NTOSKRNL / Win32 Kernel Driver)
 */

#ifndef _SMART_OPTIMIZER_COMMON_H_
#define _SMART_OPTIMIZER_COMMON_H_

#define SMART_OPTIMIZER_DEVICE_NAME     L"\\Device\\SmartOptimizer"
#define SMART_OPTIMIZER_DOS_DEVICE_NAME L"\\DosDevices\\SmartOptimizer"
#define SMART_OPTIMIZER_WIN32_DEVICE    L"\\\\.\\SmartOptimizer"

#define FILE_DEVICE_SMART_OPTIMIZER     0x8000

// CTL_CODE Macro definition for userland/kernel alignment
#ifndef CTL_CODE
#define CTL_CODE( DeviceType, Function, Method, Access ) ( \
    ((DeviceType) << 16) | ((Access) << 14) | ((Function) << 2) | (Method) \
)
#endif

#define METHOD_BUFFERED                 0
#define METHOD_IN_DIRECT                1
#define METHOD_OUT_DIRECT               2
#define METHOD_NEITHER                  3

#define FILE_ANY_ACCESS                 0
#define FILE_READ_ACCESS                ( 0x0001 )
#define FILE_WRITE_ACCESS               ( 0x0002 )

// ---------------------------------------------------------------------------
// IOCTL Code Definitions (0x800 - 0x810)
// ---------------------------------------------------------------------------

// 1. Get Driver Status & Protocol Version
#define IOCTL_SMARTO_GET_DRIVER_VERSION \
    CTL_CODE(FILE_DEVICE_SMART_OPTIMIZER, 0x800, METHOD_BUFFERED, FILE_ANY_ACCESS)

// 2. Inject Relative/Absolute Synthetic Mouse Move (Bypasses user32 hook filters)
#define IOCTL_SMARTO_INJECT_MOUSE_MOVE \
    CTL_CODE(FILE_DEVICE_SMART_OPTIMIZER, 0x801, METHOD_BUFFERED, FILE_WRITE_ACCESS)

// 3. Inject Mouse Button Down / Up Event
#define IOCTL_SMARTO_INJECT_MOUSE_BUTTON \
    CTL_CODE(FILE_DEVICE_SMART_OPTIMIZER, 0x802, METHOD_BUFFERED, FILE_WRITE_ACCESS)

// 4. Inject Hardware Keyboard Scan Code / Virtual Key
#define IOCTL_SMARTO_INJECT_KEY_EVENT \
    CTL_CODE(FILE_DEVICE_SMART_OPTIMIZER, 0x803, METHOD_BUFFERED, FILE_WRITE_ACCESS)

// 5. Lock Process CPU Core Affinity Mask (Heterogeneous Performance Cores)
#define IOCTL_SMARTO_SET_PROCESS_AFFINITY \
    CTL_CODE(FILE_DEVICE_SMART_OPTIMIZER, 0x804, METHOD_BUFFERED, FILE_WRITE_ACCESS)

// 6. Elevate Process Scheduling Priority Class to RealTime / High
#define IOCTL_SMARTO_SET_PROCESS_PRIORITY \
    CTL_CODE(FILE_DEVICE_SMART_OPTIMIZER, 0x805, METHOD_BUFFERED, FILE_WRITE_ACCESS)

// 7. Flush RAM Working Set & Trim Memory Limits
#define IOCTL_SMARTO_EMPTY_WORKING_SET \
    CTL_CODE(FILE_DEVICE_SMART_OPTIMIZER, 0x806, METHOD_BUFFERED, FILE_WRITE_ACCESS)

// ---------------------------------------------------------------------------
// Kernel IOCTL Packet Structs
// ---------------------------------------------------------------------------

#pragma pack(push, 1)

typedef struct _SMARTO_DRIVER_VERSION_RESPONSE {
    unsigned long MajorVersion;
    unsigned long MinorVersion;
    unsigned long BuildNumber;
    char DriverSignature[32]; // "SMARTO_KERNEL_V3_0"
} SMARTO_DRIVER_VERSION_RESPONSE, *PSMARTO_DRIVER_VERSION_RESPONSE;

typedef struct _SMARTO_MOUSE_MOVE_REQUEST {
    long DeltaX;
    long DeltaY;
    unsigned long Flags; // 0x0001: Relative, 0x0002: Absolute (Desktop coords)
    unsigned long TargetAbsoluteX;
    unsigned long TargetAbsoluteY;
    unsigned long TimestampUs;
} SMARTO_MOUSE_MOVE_REQUEST, *PSMARTO_MOUSE_MOVE_REQUEST;

typedef enum _SMARTO_MOUSE_BUTTON {
    SMARTO_BUTTON_LEFT = 1,
    SMARTO_BUTTON_RIGHT = 2,
    SMARTO_BUTTON_MIDDLE = 3,
    SMARTO_BUTTON_X1 = 4,
    SMARTO_BUTTON_X2 = 5
} SMARTO_MOUSE_BUTTON;

typedef struct _SMARTO_MOUSE_BUTTON_REQUEST {
    unsigned char Button;   // SMARTO_MOUSE_BUTTON
    unsigned char IsDown;   // 1 = Down, 0 = Up
    unsigned short Reserved;
} SMARTO_MOUSE_BUTTON_REQUEST, *PSMARTO_MOUSE_BUTTON_REQUEST;

typedef struct _SMARTO_KEYBOARD_REQUEST {
    unsigned short VirtualKeyCode;
    unsigned short ScanCode;
    unsigned char IsKeyDown; // 1 = Down, 0 = Up
    unsigned char IsExtendedKey;
} SMARTO_KEYBOARD_REQUEST, *PSMARTO_KEYBOARD_REQUEST;

typedef struct _SMARTO_PROCESS_AFFINITY_REQUEST {
    unsigned long ProcessId;
    unsigned __int64 AffinityMask; // 64-bit Core Bitmask
} SMARTO_PROCESS_AFFINITY_REQUEST, *PSMARTO_PROCESS_AFFINITY_REQUEST;

typedef struct _SMARTO_PROCESS_PRIORITY_REQUEST {
    unsigned long ProcessId;
    unsigned long PriorityClass; // 0x00000080: HIGH_PRIORITY_CLASS, 0x00000100: REALTIME_PRIORITY_CLASS
} SMARTO_PROCESS_PRIORITY_REQUEST, *PSMARTO_PROCESS_PRIORITY_REQUEST;

typedef struct _SMARTO_EMPTY_WORKING_SET_REQUEST {
    unsigned long ProcessId;
} SMARTO_EMPTY_WORKING_SET_REQUEST, *PSMARTO_EMPTY_WORKING_SET_REQUEST;

#pragma pack(pop)

#endif // _SMART_OPTIMIZER_COMMON_H_
