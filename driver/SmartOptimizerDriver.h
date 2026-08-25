/**
 * SmartOptimizer Ultimate (AIM/OPT Pro v3.0)
 * Kernel-Mode Driver Internal Header
 */

#ifndef _SMART_OPTIMIZER_DRIVER_H_
#define _SMART_OPTIMIZER_DRIVER_H_

#include <ntddk.h>
#include <wdf.h>
#include "SmartOptimizerCommon.h"

#define DRIVER_TAG 'mtSO'

typedef struct _DEVICE_EXTENSION {
    PDEVICE_OBJECT DeviceObject;
    UNICODE_STRING DeviceName;
    UNICODE_STRING SymLinkName;
    KSPIN_LOCK InputSpinLock;
    BOOLEAN IsInitialized;
} DEVICE_EXTENSION, *PDEVICE_EXTENSION;

// Function Prototypes
DRIVER_INITIALIZE DriverEntry;
DRIVER_UNLOAD SmartOptimizerUnload;

_Dispatch_type_(IRP_MJ_CREATE)
_Dispatch_type_(IRP_MJ_CLOSE)
DRIVER_DISPATCH SmartOptimizerCreateClose;

_Dispatch_type_(IRP_MJ_DEVICE_CONTROL)
DRIVER_DISPATCH SmartOptimizerDeviceControl;

// Low-level helper functions
NTSTATUS SmartOptimizerInjectMouseMove(PSMARTO_MOUSE_MOVE_REQUEST pRequest);
NTSTATUS SmartOptimizerInjectMouseButton(PSMARTO_MOUSE_BUTTON_REQUEST pRequest);
NTSTATUS SmartOptimizerInjectKeyboard(PSMARTO_KEYBOARD_REQUEST pRequest);
NTSTATUS SmartOptimizerSetAffinity(PSMARTO_PROCESS_AFFINITY_REQUEST pRequest);
NTSTATUS SmartOptimizerSetPriority(PSMARTO_PROCESS_PRIORITY_REQUEST pRequest);
NTSTATUS SmartOptimizerTrimWorkingSet(PSMARTO_EMPTY_WORKING_SET_REQUEST pRequest);

#endif // _SMART_OPTIMIZER_DRIVER_H_
