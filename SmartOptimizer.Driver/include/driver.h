#pragma once

#include <ntddk.h>

#define SMARTOPTIMIZER_DEVICE_NAME L"\\Device\\SmartOptimizer"
#define SMARTOPTIMIZER_DOS_DEVICE_NAME L"\\DosDevices\\SmartOptimizer"

#define IOCTL_MOVE_MOUSE \
    CTL_CODE(FILE_DEVICE_UNKNOWN, 0x800, METHOD_BUFFERED, FILE_ANY_ACCESS)
#define IOCTL_READ_MEMORY \
    CTL_CODE(FILE_DEVICE_UNKNOWN, 0x801, METHOD_BUFFERED, FILE_ANY_ACCESS)

typedef struct _MOUSE_INPUT
{
    LONG x;
    LONG y;
} MOUSE_INPUT, *PMOUSE_INPUT;

typedef struct _MEM_READ_REQUEST
{
    ULONG_PTR ProcessId;
    ULONG_PTR Address;
    PVOID Buffer;
    SIZE_T Size;
} MEM_READ_REQUEST, *PMEM_READ_REQUEST;

extern "C" DRIVER_INITIALIZE DriverEntry;

_Dispatch_type_(IRP_MJ_CREATE)
    DRIVER_DISPATCH DispatchCreate;

_Dispatch_type_(IRP_MJ_CLOSE)
    DRIVER_DISPATCH DispatchClose;

_Dispatch_type_(IRP_MJ_DEVICE_CONTROL)
    DRIVER_DISPATCH DispatchIoControl;

DRIVER_UNLOAD DriverUnload;
