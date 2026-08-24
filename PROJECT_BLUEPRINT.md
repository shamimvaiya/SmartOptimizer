# 🚀 SmartOptimizer (AIM/OPT) - সম্পূর্ণ প্রজেক্ট ব্লুপ্রিন্ট ও কারিগরি ডকুমেন্টেশন
> **Project Name:** SmartOptimizer (AIM/OPT Pro Optimizer v2.1)  
> **Platform & Framework:** .NET 8.0 Windows (WPF + Win32 Interop + OpenCvSharp + SharpDX DXGI + C++ Kernel Driver)  
> **Architecture Pattern:** MVVM (Model-View-ViewModel), Layered Subsystem Architecture, Event-Driven & Async Execution  

---

## 📑 সূচিপত্র (Table of Contents)
1. [প্রজেক্টের সাধারণ পরিচিতি (Project Overview)](#1-প্রজেক্টের-সাধারণ-পরিচিতি-project-overview)
2. [সিস্টেম আর্কিটেকচার ব্লুপ্রিন্ট (System Architecture Blueprint)](#2-সিস্টেম-আর্কিটেকচার-ব্লুপ্রিন্ট-system-architecture-blueprint)
3. [প্রজেক্টের ফোল্ডার ও ফাইল স্ট্রাকচার (Project Structure)](#3-প্রজেক্টের-ফোল্ডার-ও-ফাইল-স্ট্রাকচার-project-structure)
4. [মডিউল ও ইঞ্জিনের বিস্তারিত বিবরণ (Core Engines & Managers)](#4-মডিউল-ও-ইঞ্জিনের-বিস্তারিত-বিবরণ-core-engines--managers)
   - 4.1 `BackgroundEngine` (কেন্দ্রীয় অর্কেস্ট্রেটর ও টেলিমেট্রি)
   - 4.2 `EmulatorDetector` (অটো ডিটেকশন, উইন্ডোজ রেজিস্ট্রি স্ক্যান ও প্রসেস টিউনিং)
   - 4.3 `ADBManager` (অ্যান্ড্রয়েড ডিবাগ ব্রিজ, এফপিএস আনলকার ও ডিপ আই/ও)
   - 4.4 `ScreenCaptureEngine` (DirectX 11 DXGI Desktop Duplication & GDI Fallback)
   - 4.5 `VisualProcessingEngine` (OpenCV কালার ট্র্যাকিং ও সেন্ট্রয়েড অ্যালগরিদম)
   - 4.6 `DriverInterface` (কার্নেল ড্রাইভ IOCTL ও ইউজার-মোড ইনপুট ইনজেকশন)
   - 4.7 `ExecutionManager` (ভিজ্যুয়াল নোড গ্রাফ এক্সিকিউশন ও অ্যাকশন ডিসপ্যাচার)
   - 4.8 `PresetManager` (প্রোফাইল ম্যানেজমেন্ট ও গ্লোবাল কনফিগারেশন)
5. [ইউজার ইন্টারফেস ও কম্পোনেন্টস (UI Architecture & Components)](#5-ইউজার-ইন্টারফেস-ও-কম্পোনেন্টস-ui-architecture--components)
   - 5.1 `MainWindow` ও ৪টি প্রধান পেজ
   - 5.2 `MainViewModel` (রিঅ্যাকটিভ স্টেট ম্যানেজমেন্ট)
   - 5.3 `NodeCanvas` (ইন্টারেক্টিভ নোড বেসড ভিজ্যুয়াল ম্যাক্রো স্টুডিও)
   - 5.4 `OverlayWindow` (গ্লোবাল হটকি চালিত স্টিলথ HUD ওভারলে)
6. [কার্নেল ড্রাইভার মডিউল (SmartOptimizer.Driver)](#6-কার্নেল-ড্রাইভার-মডিউল-smartoptimizerdriver)
7. [সিস্টেমের কাজের ধাপ (How It Works: Step-by-Step Execution Flow)](#7-সিস্টেমের-কাজের-ধাপ-how-it-works-step-by-step-execution-flow)
8. [প্রজেক্টের মূল ফিচারসমূহ (Key Features & Functions)](#8-প্রজেক্টের-মূল-ফিচারসমূহ-key-features--functions)
9. [এটি দিয়ে কি কি করা যায়? (Real-World Use Cases & Applications)](#9-এটি-দিয়ে-কি-কি-করা-যায়-real-world-use-cases--applications)
10. [ভবিষ্যত উন্নয়ন ও এক্সটেনসিবিলিটি (Future Roadmap)](#10-ভবিষ্যত-উন্নয়ন-ও-এক্সটেনসিবিলিটি-future-roadmap)

---

## 1. প্রজেক্টের সাধারণ পরিচিতি (Project Overview)

**SmartOptimizer (AIM/OPT)** হলো উইন্ডোজ অপারেটিং সিস্টেমে অ্যান্ড্রয়েড এমুলেটর (যেমন: BlueStacks, LDPlayer, NoxPlayer, MSI App Player, Gameloop, MEmu, MuMu Player) এর জন্য তৈরি করা একটি **হাই-পারফরম্যান্স অটোমেশন, অপটিমাইজেশন এবং ম্যাক্রো ইঞ্জিন সফটওয়্যার**।

### মূল লক্ষ্য:
1. **ল্যাটেন্সি কমানো ও এফপিএস বাড়ানো:** এমুলেটরের প্রসেস শিডিউলার প্রায়োরিটি বৃদ্ধি করা, সিপিইউ অ্যাফিনিটি দিয়ে পাওয়ারফুল কোরে লক করা এবং র‍্যাম ক্লিনিংয়ের মাধ্যমে গেম ল্যাগ ও স্টাটার দূর করা।
2. **অ্যান্ড্রয়েড কার্নেল ও ডিসপ্লে টিউনিং:** অটোমেটিক লোকাল ADB ডিটেকশন ও কানেকশনের মাধ্যমে এমুলেটরের ফ্রেমরেট ৯০/১২০/১৪৪ FPS-এ আনলক করা, কাস্টম DPI ও রেজোলিউশন ফোর্স করা।
3. **ভিজ্যুয়াল নোড-বেসড ম্যাক্রো অটোমেশন:** আনরিয়েল ইঞ্জিন বা ব্লেন্ডারের মতো ড্র্যাগ-অ্যান্ড-ড্রপ ভিজ্যুয়াল নোড গ্রাফ তৈরির সুবিধা, যার মাধ্যমে কালার ট্র্যাকিং, মাউস মুভমেন্ট, ক্লিক, কি-প্রেস এবং ADB কমান্ড একটার পর একটা স্বয়ংক্রিয়ভাবে চালানো যায়।
4. **সুপার-ফাস্ট স্ক্রিন ক্যাপচার ও ইমেজ প্রসেসিং:** DirectX 11 (DXGI Desktop Duplication API) ব্যবহার করে প্রতি সেকেন্ডে মিলি-সেকেন্ড ল্যাটেন্সিতে ফ্রেম রিড করা এবং OpenCV দিয়ে সুনির্দিষ্ট পিক্সেল/কালার ডিটেক্ট করা।
5. **স্টিলথ ইন-গেম HUD ওভারলে:** গেম চলাকালীন স্ক্রিনের উপরে একটি স্বচ্ছ ওভারলে HUD যা গ্লোবাল হটকি (যেমন `HOME`, `F8`, `INSERT`) প্রেস করলে দৃশ্যমান হয় বা স্বয়ংক্রিয়ভাবে হাইড হয়ে যায়।

---

## 2. সিস্টেম আর্কিটেকচার ব্লুপ্রিন্ট (System Architecture Blueprint)

সিস্টেমটি ৩টি প্রধান লেয়ারে বিভক্ত:

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER (UI)                            |
|  [ MainWindow ] <----> [ MainViewModel (MVVM) ] <----> [ OverlayWindow (HUD) ]       |
|         |                        |                                                    |
|  [ Dashboard ]  [ Performance ]  [ NodeCanvas (Visual Macro) ]  [ Settings ]          |
+---------------------------------------------------------------------------------------+
                                           │
                                           ▼
+---------------------------------------------------------------------------------------+
|                                CORE ENGINE SUBSYSTEM LAYER                            |
|                                [ BackgroundEngine ]                                   |
|                                          │                                            |
|         ┌─────────────────┬──────────────┴───────────────┬──────────────────┐         |
|         ▼                 ▼                              ▼                  ▼         |
| [ EmulatorDetector ]  [ ADBManager ]            [ ExecutionManager ]  [ PresetManager ]|
|  • Registry Scan       • Port 5555/7555/etc      • Graph Traversal     • JSON Config  |
|  • Process Priority    • Local ADB Auto-Hook     • SubGraph Dispatch   • Profiles Sync|
|  • CPU Core Affinity   • FPS Boost (144Hz)       • Action Nodes                       |
|  • WorkingSet Trim     • Density/Resolution                                           |
+---------------------------------------------------------------------------------------+
            │                      │                               │
            ▼                      ▼                               ▼
+───────────────────────────────────────────────────────────────────────────────────────+
|                           HARDWARE / DRIVER / OS INTEGRATION                          |
|  [ ScreenCaptureEngine ]        [ VisualProcessingEngine ]    [ DriverInterface ]     |
|   • DXGI Desktop Duplication     • OpenCvSharp Mat/Moments     • IOCTL Driver Hook    |
|   • Direct3D 11 Staging Textures • Centroid Calculation        • Win32 SetCursorPos   |
|   • GDI Fallback Buffer          • RGB/BGR Scalar Tolerance    • mouse_event/keybd    |
+---------------------------------------------------------------------------------------+
                                           │
                                           ▼
+---------------------------------------------------------------------------------------+
|                         LOW-LEVEL SYSTEM / KERNEL / EMULATOR                          |
|  [ SmartOptimizer.Driver (C++) ]    [ Windows Kernel APIs ]     [ Android Emulator ]  |
|   • \Device\SmartOptimizer          • kernel32 / user32 / psapi  • BlueStacks / LD    |
+---------------------------------------------------------------------------------------+
```

---

## 3. প্রজেক্টের ফোল্ডার ও ফাইল স্ট্রাকচার (Project Structure)

```
SmartOptimizer/
│
├── Config/                                # কনফিগারেশন ফাইল ও সেভ করা প্রোফাইলসমূহ
│   ├── global.json                        # সিস্টেম গ্লোবাল সেটিংস (হটকি, থিম, ডিফল্ট পোর্ট ইত্যাদি)
│   └── profiles/                          # ইউজার এবং গেম প্রোফাইল (.json ফাইল ফরম্যাটে)
│
├── SmartOptimizer.Core/                   # কোর বিজনেস লজিক, অ্যালগরিদম ও ব্যাকগ্রাউন্ড ইঞ্জিন
│   ├── Engines/
│   │   ├── BackgroundEngine.cs            # সেন্ট্রাল কোঅর্ডিনেটর ও লাইভ টেলিমেট্রি প্রোভাইডার
│   │   ├── ScreenCaptureEngine.cs         # DirectX 11 DXGI ও GDI স্ক্রিন ক্যাপচার ইঞ্জিন
│   │   └── VisualProcessingEngine.cs      # OpenCV কালার রিকগনিশন ও সেন্ট্রয়েড ফাইন্ডার
│   ├── Managers/
│   │   ├── ADBManager.cs                  # ADB ব্রোকার, শেল কমান্ড, রেজোলিউশন ও FPS অপটিমাইজার
│   │   ├── DriverInterface.cs             # কার্নেল ড্রাইভার ও ইউজার-মোড ইনপুট ডিসপ্যাচার
│   │   ├── EmulatorDetector.cs            # উইন্ডোজ রেজিস্ট্রি স্ক্যানার, এমুলেটর লাইফসাইকেল ট্র্যাকার
│   │   ├── ExecutionManager.cs            # ম্যাক্রো নোড গ্রাফ এক্সিকিউটর লুপ
│   │   └── PresetManager.cs               # প্রোফাইল তৈরি, লোড, ডুপ্লিকেট ও সেভ করার ম্যানেজার
│   ├── Utils/
│   │   └── Logger.cs                      # সিস্টেম লগ ইউটিলিটি
│   └── SmartOptimizer.Core.csproj         # Core লাইব্রেরি ডিপেনডেন্সি ও বিল্ড কনফিগ
│
├── SmartOptimizer.Driver/                 # C++ কার্নেল ড্রাইভার প্রজেক্ট (Kernel Mode Driver)
│   ├── include/
│   │   └── driver.h                       # কার্নেল ডেফিনিশন, IOCTL কোডস ও স্ট্রাকচার
│   ├── src/
│   │   ├── main.cpp                       # DriverEntry, IRP হ্যান্ডলার ও আনলোড মেকানিজম
│   │   ├── memory.cpp                     # কার্নেল মেমরি রিড রিকোয়েস্ট
│   │   └── mouse.cpp                      # কার্নেল মাউস মুভমেন্ট মেকানিজম
│   └── SmartOptimizer.Driver.vcxproj      # Visual C++ ড্রাইভার প্রজেক্ট
│
├── SmartOptimizer.UI/                     # প্রেজেন্টেশন লেয়ার (WPF সাইবারপাঙ্ক ডার্ক UI)
│   ├── Components/
│   │   ├── NodeCanvas.xaml                # ভিজ্যুয়াল নোড এডিটর ক্যানভাস ও ইনস্পেক্টর
│   │   └── NodeCanvas.xaml.cs             # বেজিয়ের কার্ভ ওয়্যারিং, জুম/প্যান ও নোড লজিক
│   ├── ViewModels/
│   │   └── MainViewModel.cs               # MVVM আর্কিটেকচারের সেন্ট্রাল ভিউমডেল
│   ├── Views/
│   │   ├── MainWindow.xaml                # মূল ড্যাশবোর্ড উইন্ডো XAML ডিজাইন
│   │   ├── MainWindow.xaml.cs             # উইন্ডো ইভেন্টস, নেভিগেশন ও ডায়ালগ লজিক
│   │   ├── OverlayWindow.xaml             # ইন-গেম ব্রিদিং গ্লো HUD ওভারলে
│   │   ├── OverlayWindow.xaml.cs          # গ্লোবাল হটকি হুক ও অটো-হাইড টাইমার
│   │   └── SettingsWindow.xaml            # সেটিংস ডায়ালগ
│   ├── App.xaml / App.xaml.cs             # অ্যাপ্লিকেশন এন্ট্রি পয়েন্ট ও গ্লোবাল রিসোর্স
│   ├── app.manifest                       # উইন্ডোজ হাই-ডিপিআই ও অ্যাডমিন পারমিশন ম্যানিফেস্ট
│   └── SmartOptimizer.UI.csproj           # UI প্রজেক্ট ডিপেনডেন্সি (CommunityToolkit.Mvvm, MaterialDesign)
│
└── SmartOptimizer.sln                     # ভিজ্যুয়াল স্টুডিও সলিউশন ফাইল
```

---

## 4. মডিউল ও ইঞ্জিনের বিস্তারিত বিবরণ (Core Engines & Managers)

### 4.1 `BackgroundEngine.cs` (সিস্টেম অর্কেস্ট্রেটর)
* **ভূমিকা:** এটি সম্পূর্ণ অ্যাপ্লিকেশনের মূল নিউক্লিয়াস। এটি `EmulatorDetector`, `ADBManager`, `PresetManager`, এবং `ExecutionManager`-কে একসাথে কানেক্ট করে পরিচালনা করে।
* **প্রধান কাজসমূহ:**
  1. `InitializeAsync()`: প্রি-সেট ও ADB সাবসিস্টেম বুটস্ট্র্যাপ করে।
  2. `BackgroundWorkerAsync()`: ব্যাকগ্রাউন্ডে প্রতি ১ সেকেন্ড পর পর চলে। এমুলেটর চালু হলে অটোমেটিক ADB কানেক্ট করে এবং লাইভ টেলিমেট্রি ডেটা তৈরি করে।
  3. `CalculateCpuUsage()`: উইন্ডোজ কার্নেলের `GetSystemTimes` API কল করে রিয়েল-টাইম নির্ভুল CPU লোড (%) পরিমাপ করে।
  4. `ApplyPresetAsync()`: অ্যাক্টিভ প্রোফাইলের সেটিংস নিয়ে সরাসরি এমুলেটর প্রসেস ও ADB-তে ইনজেক্ট করে।
  5. `OptimizeMemoryAsync()`: এমুলেটরের মেমরি ওয়ার্কিং সেট ট্রিম করে র‍্যাম খালি করে।

### 4.2 `EmulatorDetector.cs` (এমুলেটর ডিটেকশন ও সিস্টেম টিউনিং)
* **ভূমিকা:** সিস্টেমে ইনস্টল থাকা এমুলেটর খোঁজা, রানিং এমুলেটরের উইন্ডো ট্র্যাক করা এবং কার্নেল প্রায়োরিটি পরিবর্তন করা।
* **প্রধান কাজসমূহ:**
  1. `ScanInstalledEmulators()`: Windows Registry-র `HKLM` এবং `HKCU` (32-bit & 64-bit ভিউ) স্ক্যান করে LDPlayer (4/64/9), BlueStacks 5, MSI App Player, NoxPlayer, Gameloop, MEmu, MuMu ইত্যাদি এমুলেটরের রিয়েল ইনস্টলেশন পাথ ও ভার্সন খুঁজে বের করে।
  2. `ScanNow()` ও `MonitorAsync()`: রানিং ব্যাকগ্রাউন্ড প্রসেস স্ক্যান করে এবং `EnumWindows` ও `GetWindowRect` ব্যবহার করে এমুলেটরের এক্স্যাক্ট উইন্ডো সাইজ ও বাউন্ডস ট্র্যাক করে।
  3. `SetProcessPriority(ProcessPriorityClass)`: এমুলেটর প্রসেসকে `High` বা `RealTime` শিডিউলিং প্রায়োরিটি দেয় যাতে গেমে কোনো ইনপুট ল্যাগ না থাকে।
  4. `SetProcessAffinity(long mask)`: মাল্টি-কোর প্রসেসরের নির্দিষ্ট পাওয়ারফুল কোরগুলোতে (Core 0, Core 2 ইত্যাদি) এমুলেটরকে লক করে রাখে যাতে থ্রেড জাম্পিংয়ের কারণে স্টাটারিং না হয়।
  5. `OptimizeMemoryWorkingSet()`: `psapi.dll`-এর `EmptyWorkingSet` মেথড কল করে এমুলেটরের আন-ইউজড মেমরি ও ক্যাশ ফ্ল্যাশ করে।

### 4.3 `ADBManager.cs` (অ্যান্ড্রয়েড সাবসিস্টেম ও অপটিমাইজার)
* **ভূমিকা:** এমুলেটরের অ্যান্ড্রয়েড ইন্টার্নাল সাবসিস্টেমের সাথে ADB প্রোটোকলে যোগাযোগ করে।
* **প্রধান কাজসমূহ:**
  1. `AutoDiscoverAdb()`: সিস্টেমে গ্লোবাল ADB না থাকলেও এমুলেটরের নিজস্ব ফোল্ডার থেকে (`HD-Adb.exe`, `nox_adb.exe`, `vbox_adb.exe`) স্বয়ংক্রিয়ভাবে ADB বাইনারি খুঁজে বের করে লিঙ্ক করে।
  2. `AutoConnectAsync()`: পরিচিত সব এমুলেটর পোর্ট (যেমন: 5555, 5554, 7555, 21503, 62001, 5565 ইত্যাদি) স্ক্যান করে এমুলেটরের সাথে অটো-হুক করে।
  3. `BoostFpsAsync(int targetFps)`: অ্যান্ড্রয়েডের অভ্যন্তরীণ সিস্টেম প্রোপার্টি টুইক করে:
     - `setprop debug.sf.fps <fps>`
     - `setprop debug.fps <fps>`
     - `setprop debug.gr.swapinterval 0`
     - `settings put system peak_refresh_rate <fps>.0`
     - `settings put system min_refresh_rate <fps>.0`
  4. `SetResolutionAsync()` ও `SetDpiAsync()`: এমুলেটরের ভেতরে ডিসপ্লে রেজোলিউশন ও পিক্সেল ডেনসিটি ফোর্স সেট করে।
  5. ইনপুট ফাংশনালিটি: `TapAsync()`, `SwipeAsync()`, `SendKeyEventAsync()`, `SendTextAsync()`, `ForceStopAppAsync()`।

### 4.4 `ScreenCaptureEngine.cs` (DXGI ও GDI স্ক্রিন ক্যাপচার)
* **ভূমিকা:** অতি দ্রুত ডিসপ্লে থেকে পিক্সেল ফ্রেম রিড করা।
* **প্রধান কাজসমূহ:**
  1. `CaptureRegionDxgi()`: SharpDX লাইব্রেরি ব্যবহার করে **DirectX 11 DXGI Desktop Duplication API (Output1)** দিয়ে সরাসরি GPU ফ্রেমবাফার থেকে আল্ট্রা-লো ল্যাটেন্সিতে BGRA32 বাইট অ্যারে রিড করে।
  2. DirectX রিসোর্স লস্ট বা এক্সেস ডিনাইড হলে স্বয়ংক্রিয়ভাবে রিস্টার্ট করে অথবা ফলব্যাক হিসেবে হাই-স্পিড **GDI `CopyFromScreen`** এবং `LockBits` ব্যবহার করে ফ্রেম রিড নিশ্চিত করে।

### 4.5 `VisualProcessingEngine.cs` (OpenCV কালার অ্যানালাইসিস)
* **ভূমিকা:** স্ক্রিনের ক্যাপচার করা ফ্রেমে নির্দিষ্ট কালার টার্গেট খুঁজে বের করা।
* **প্রধান কাজসমূহ:**
  1. `FindColor()`: `OpenCvSharp4` ব্যবহার করে ফ্রেম ডেটাকে `Mat` অবজেক্টে রূপান্তর করে।
  2. কালার টলারেন্স (Tolerance) অনুযায়ী লোয়ার এবং আপার বাউন্ড রেঞ্জ ফিল্টার করে বাইনারি মাস্ক তৈরি করে (`Cv2.InRange`)।
  3. ইমেজ মোমেন্টস (`Cv2.Moments`) বের করে সেন্ট্রয়েড সূত্র `X = M10 / M00`, `Y = M01 / M00` দিয়ে টার্গেটের কেন্দ্রবিন্দু পিক্সেল স্থানাঙ্ক রিটার্ন করে।

### 4.6 `DriverInterface.cs` (কার্নেল ও ইউজার-মোড ইনপুট ডিসপ্যাচার)
* **ভূমিকা:** মাউস এবং কিবোর্ড ইনপুট অ্যান্টি-চিট বাইপাস ও লো-ল্যাটেন্সিতে পাঠানোর ইন্টারফেস।
* **প্রধান কাজসমূহ:**
  1. কার্নেল মোড: `CreateFile` দিয়ে `\\.\SmartOptimizer` ড্রাইভার ডিভাইসে কানেক্ট করে `DeviceIoControl` এর মাধ্যমে `IOCTL_MOVE_MOUSE` পাঠায়।
  2. ইউজার মোড ফলব্যাক: ড্রাইভার ইনস্টল না থাকলে সরাসরি Win32 API (`SetCursorPos`, `mouse_event`, `keybd_event`) ব্যবহার করে নিখুঁত মাউস মুভ, লেফট/রাইট ক্লিক ও কি-প্রেস সম্পন্ন করে।

### 4.7 `ExecutionManager.cs` (ম্যাক্রো গ্রাফ এক্সিকিউটর)
* **ভূমিকা:** ভিজ্যুয়াল নোড ক্যানভাসে তৈরি করা নোড গ্রাফ একের পর এক লজিক্যাল অর্ডারে রান করা।
* **সাপোর্টেড অ্যাকশন নোডস:**
  - `Search Color` / `Color Search`: স্ক্রিনের নির্দিষ্ট এরিয়া স্ক্যান করে কাঙ্ক্ষিত কালার পিক্সেল খোঁজা।
  - `Move Mouse`: মাউস কার্সার রিলেটিভ বা এবসলিউট কোঅর্ডিনেটে মুভ করা।
  - `Click Mouse`: লেফট বা রাইট ক্লিক করা।
  - `Press Key`: কিবোর্ডের নির্দিষ্ট কী প্রেস করা (যেমন: `HOME`, `SPACE`, `R`, `1`, `W`, `ENTER` ইত্যাদি)।
  - `Delay`: নির্দিষ্ট মিলি-সেকেন্ড বিরতি দেওয়া।
  - `ADB Tap`: সরাসরি এমুলেটরের স্ক্রিনে টাচ পাঠানো।
  - `ADB Shell`: যেকোনো কাস্টম অ্যান্ড্রয়েড শেল কমান্ড রান করা।

### 4.8 `PresetManager.cs` (প্রোফাইল সাবসিস্টেম)
* **ভূমিকা:** গেম অনুযায়ী আলাদা আলাদা সেটিংস প্রোফাইল ও ম্যাক্রো নোড গ্রাফ সেভ ও লোড করা।
* **প্রধান কাজসমূহ:**
  - `Config/global.json` ও `Config/profiles/<ProfileName>.json` ফাইল রিড/রাইট করে।
  - প্রোফাইল ডুপ্লিকেট, সেভ, ডিলিট এবং রিয়েল-টাইমে সুইচ করার ফুল সাপোর্ট প্রদান করে।

---

## 5. ইউজার ইন্টারফেস ও কম্পোনেন্টস (UI Architecture & Components)

WPF দিয়ে তৈরি ইউজার ইন্টারফেসে ব্যবহার করা হয়েছে আধুনিক **সাইবারপাঙ্ক ডার্ক নিয়ন (Neon Green #39FF14 & Cyan #00E5FF)** নান্দনিক ডিজাইন।

### 5.1 MainWindow ও এর ৪টি মূল সেকশন
1. **⚡ Dashboard:**
   - এমুলেটর ডিটেকশন লাইভ স্ট্যাটাস।
   - ADB কানেকশন স্ট্যাটাস এবং এডিটেবল কাস্টম ADB পোর্ট বক্স।
   - অপটিমাইজার ইঞ্জিনের অ্যাক্টিভ স্টেটাস।
   - ইনস্টলড এমুলেটর ড্রপডাউন, "+ Add Emulator" ফাইল ব্রাউজার, "Launch & Hook" বাটন।
   - "Initialize & Optimize System" এবং "Flush RAM Cache" কুইক অ্যাকশন বাটন।
   - রিয়েল-টাইম নিয়ন টার্মিনাল লগ কনসোল।
2. **🚀 Performance (পারফরম্যান্স টিউনিং):**
   - **Process Priority:** Normal, AboveNormal, High, RealTime সিলেক্টর।
   - **CPU Core Affinity Matrix:** প্রতিটি সিপিইউ কোর আলাদাভাবে চেক/আনচেক করার বক্স + "All Performance Cores" অটো-সিলেক্টর।
   - **ADB FPS Target Booster:** স্লাইডার দিয়ে ৬০ থেকে ১৪৪ FPS টার্গেট সেট করা।
   - **Android DPI Density Scaling:** ১৬০ থেকে ৪৮০ DPI ফাইন-টিউনিং স্লাইডার।
3. **🎨 Visual Macro (ভিজ্যুয়াল ম্যাক্রো স্টুডিও):**
   - নোড বেসড অটোমেশন স্টুডিও।
   - "RUN MACRO", "STOP", "Clear Canvas", "Save Graph" কন্ট্রোল বার।
4. **⚙ Settings & Overlay (সেটিংস ও ওভারলে HUD):**
   - **Interactive Hotkey Recorder:** বক্সে ক্লিক করে কিবোর্ডের যেকোনো কী প্রেস করলেই সেটি রেকর্ড হয়ে গ্লোবাল হটকি হিসেবে রেজিস্টার হয়।
   - **Smart Auto-Hide HUD:** ৪ সেকেন্ড পর অটোমেটিক HUD হাইড করার ফিচার।
   - **Target Emulator Process Override:** কাস্টম প্রসেস নাম দিয়ে হুক করার সুবিধা।
   - **Preset Profile Hub:** নতুন প্রোফাইল তৈরি, ডুপ্লিকেট ও ডিলিট করার ম্যানেজার।

### 5.2 `NodeCanvas.xaml` ও `NodeCanvas.xaml.cs` (ভিজ্যুয়াল ম্যাক্রো ক্যানভাস)
* **রাইট-ক্লিক মেনু:** ক্যানভাসে রাইট ক্লিক করলেই নতুন অ্যাকশন নোড তৈরি হয়।
* **স্মুথ বেজিয়ের কার্ভ ওয়্যারিং (Bézier Wires):** এক নোডের আউটপুট পিন থেকে টেনে অন্য নোডের ইনপুট পিনে ড্র্যাগ করলে নিয়ন গ্লো সহ স্মুথ কার্ভ তার তৈরি হয়।
* **জুম ও প্যানিং:** `Ctrl + Mouse Wheel` দিয়ে জুম-ইন/জুম-আউট এবং মিডল মাউস ড্র্যাগ করে সম্পূর্ণ ক্যানভাস প্যান করা যায়।
* **স্লাইড-আউট নোড ইনস্পেক্টর (Node Inspector):** প্রতিটি নোডের গিয়ার আইকনে (`⚙`) ক্লিক করলে সাইড প্যানেল খুলে যায়, যেখান থেকে অ্যাকশন টাইপ, প্যারামিটার এবং কুইক টেমপ্লেট নির্বাচন করা যায়।

### 5.3 `OverlayWindow.xaml` ও `OverlayWindow.xaml.cs` (স্টিলথ HUD ওভারলে)
* গেমের উপরে ভাসমান একটি স্বচ্ছ ফ্ল্যাটিং উইন্ডো।
* **হার্ডওয়্যার এক্সিলারেটেড ব্রিদিং পালস (Breathing Glow Animation):** স্ট্যাটাস ডটের চারপাশে লাইভ নিয়ন গ্লো পালস করে।
* **গ্লোবাল হটকি হুক:** `user32.dll`-এর `RegisterHotKey` ব্যবহার করে উইন্ডোজ-লেভেলে হটকি হ্যান্ডেল করে, ফলে গেমের ভেতর ফুলস্ক্রিন থাকলেও `HOME` বাটন চাপলে HUD টগল হয়।
* **স্মার্ট মাউস হোভার ট্র্যাকিং:** কার্সার ওভারলের ওপর নিয়ে গেলে অটো-হাইড টাইমার পজ হয়ে যায়।

---

## 6. কার্নেল ড্রাইভার মডিউল (SmartOptimizer.Driver)

* **প্রজেক্ট টাইপ:** Windows Driver Framework (C++/C).
* **ডিভাইস নেম:** `\Device\SmartOptimizer` (Symbolic Link: `\DosDevices\SmartOptimizer`).
* **কন্ট্রোল কোডস (IOCTLs):**
  - `IOCTL_MOVE_MOUSE` (`0x222004` / `CTL_CODE(0x800)`): সরাসরি কার্নেল স্পেস থেকে মাউস পয়েন্টার মুভমেন্ট।
  - `IOCTL_READ_MEMORY` (`0x222008` / `CTL_CODE(0x801)`): টার্গেট প্রসেসের ভার্চুয়াল অ্যাড্রেস রিড।
* ড্রাইভারটি অপশনাল হিসেবে কাজ করে; ড্রাইভার লোড না থাকলে কোর ইঞ্জিন স্বয়ংক্রিয়ভাবে সেফ Win32 মোডে কাজ চালিয়ে যায়।

---

## 7. সিস্টেমের কাজের ধাপ (How It Works: Step-by-Step Execution Flow)

```
[1. Application Launch]
        │
        ▼
[2. Registry & Process Scan] ──► উইন্ডোজ রেজিস্ট্রি থেকে সব এমুলেটর খুঁজে বের করে
        │
        ▼
[3. Local ADB Discovery] ──────► এমুলেটরের ফোল্ডারে থাকা নিজস্ব ADB বাইনারি খুঁজে লিঙ্ক করে
        │
        ▼
[4. Preset Profile Load] ──────► Active Preset (যেমন: FreeFire_Opt) এর ডিসপ্লে, পারফরম্যান্স সেটিংস লোড করে
        │
        ▼
[5. Hook & Optimize] ──────────► প্রসেস প্রায়োরিটি High করে, CPU Cores লক করে, ADB তে 120/144 FPS পুশ করে
        │
        ▼
[6. Real-time Telemetry] ──────► BackgroundWorker প্রতি ১ সেকেন্ডে CPU Load ও RAM Usage আপডেট করে
        │
        ▼
[7. Macro Execution] ──────────► Run Macro চাপলে DXGI স্ক্রিন ক্যাপচার + OpenCV কালার সার্চ + ইনপুট ইনজেকশন চলে
        │
        ▼
[8. Stealth HUD Overlay] ──────► হটকি চাপলেই স্ক্রিনের উপরে লাইভ স্ট্যাটাস HUD ভেসে ওঠে
```

---

## 8. প্রজেক্টের মূল ফিচারসমূহ (Key Features & Functions)

| ফিচার | বিবরণ | সংশ্লিষ্ট ফাইল ও মেথড |
| :--- | :--- | :--- |
| **অটো এমুলেটর ডিটেকশন** | ব্লুস্ট্যাক্স, এলডিপ্লেয়ার, নক্স, গেমলুপ ইত্যাদি নিজে থেকেই ডিটেক্ট করে। | `EmulatorDetector.ScanInstalledEmulators()` |
| **প্রসেস প্রায়োরিটি ইনজেকশন** | এমুলেটরের প্রসেসকে উইন্ডোজ শিডিউলারে প্রায়োরিটি দিয়ে ল্যাগ দূর করে। | `EmulatorDetector.SetProcessPriority()` |
| **সিপিইউ কোর অ্যাফিনিটি লক** | দুর্বল কোর বাদ দিয়ে শুধুমাত্র হাই-পারফরম্যান্স কোরে এমুলেটরকে রান করায়। | `EmulatorDetector.SetProcessAffinity()` |
| **র‍্যাম ক্যাশ ফ্লাশিং** | ব্যাকগ্রাউন্ডে জমে থাকা আন-ইউজড মেমরি এক ক্লিকে খালি করে। | `EmulatorDetector.OptimizeMemoryWorkingSet()` |
| **লোকাল ADB অটো-ডিসকভারি** | গ্লোবাল কোনো ইনস্টলেশন ছাড়া এমুলেটরের নিজস্ব ADB অটোমেশন কাজে লাগায়। | `ADBManager.AutoDiscoverAdb()` |
| **FPS ওভারক্লক (144 FPS)** | অ্যান্ড্রয়েড ফ্রেমবাফার এবং সারফেসফ্লিঙ্গার অপটিমাইজ করে ফ্রেম আনলক করে। | `ADBManager.BoostFpsAsync()` |
| **DXGI ডাইরেক্ট স্ক্রিন ক্যাপচার** | জিপিইউ ফ্রেমবাফার থেকে আল্ট্রা ফাস্ট স্ক্রিনশট রিড করে (DXGI Desktop Duplication)। | `ScreenCaptureEngine.CaptureRegionDxgi()` |
| **OpenCV কালার ট্র্যাকিং** | নির্দিষ্ট পিক্সেল কালার ও সেন্ট্রয়েড বের করে টার্গেটের এক্স্যাক্ট পয়েন্ট খুঁজে নেয়। | `VisualProcessingEngine.FindColor()` |
| **ভিজ্যুয়াল নোড ম্যাক্রো গ্রাফ** | আনরিয়েল ব্লুপ্রিন্টের মতো ভিজ্যুয়াল তার ও নোড দিয়ে অটোমেশন গ্রাফ তৈরি। | `NodeCanvas.xaml.cs` & `ExecutionManager.cs` |
| **স্টিলথ গ্লোয়িং HUD ওভারলে** | গেমের ভেতরে যেকোনো সময় কিবোর্ড শর্টকাট চেপে স্ট্যাটাস দেখার ওভারলে। | `OverlayWindow.xaml.cs` |
| **ইন্টারেক্টিভ হটকি রেকর্ডার** | কোনো জটিল কোডিং ছাড়া সরাসরি যেকোনো কী প্রেস করে শর্টকাট পরিবর্তন। | `MainWindow.TxtHotkeyRecorder_PreviewKeyDown` |
| **প্রোফাইল ও প্রি-সেট সিস্টেম** | প্রতিটি গেমের জন্য আলাদা রেজোলিউশন, ডিপিআই ও ম্যাক্রো প্রোফাইল সেভ রাখা। | `PresetManager.cs` |

---

## 9. এটি দিয়ে কি কি করা যায়? (Real-World Use Cases & Applications)

1. **গেমিং পারফরম্যান্স বুস্টিং (Free Fire, PUBG Mobile, COD Mobile ইত্যাদি):**
   - লো-এন্ড বা মিড-রেঞ্জ পিসিতে এমুলেটরের ফ্রেম ড্রপ বন্ধ করা।
   - এমুলেটরের রেন্ডারিং পাইপলাইন ৯০Hz বা ১২০Hz/১৪৪Hz এ ফোর্স করা।
   - ইনপুট ডিলে (Input Latency) প্রায় শূন্যের কোঠায় নামিয়ে আনা।

2. **কালার বেসড ট্রিগার ও অটোমেশন (Pixel / Color Trigger Bot):**
   - স্ক্রিনের নির্দিষ্ট পয়েন্টে এনিমি বা নির্দিষ্ট কালার ক্রসহেয়ারে আসলে ইনস্ট্যান্ট মাউস ক্লিক বা ফায়ার ট্রিগার করা।
   - মেনু স্ক্রিনে কোনো নির্দিষ্ট কালার বাটন আসলে অটো-ক্লিক করে ম্যাচ স্টার্ট বা রিওয়ার্ড ক্লেইম করা।

3. **কমপ্লেক্স ইন-গেম ম্যাক্রো সিকোয়েন্স (Combo Macros):**
   - ফাস্ট গ্লু-ওয়াল (Fast Gloo Wall), ক্যারেক্টার স্কিল সুইচ, কুইক গান সুইচ এবং ক্রাউচ-শট কম্বো একটি কি-প্রেসে এক মিলি-সেকেন্ডের মধ্যে এক্সিকিউট করা।
   - ADB Tap দিয়ে এমুলেটরের ইন্টার্নাল কোঅর্ডিনেটে সরাসরি টাচ ইনজেক্ট করা।

4. **মাল্টি-এমুলেটর ম্যানেজমেন্ট:**
   - একাধিক এমুলেটর বা ইনস্ট্যান্সের জন্য আলাদা প্রোফাইল তৈরি করে এক ক্লিকে সেটিংস সুইচ করা।

---

## 10. ভবিষ্যত উন্নয়ন ও এক্সটেনসিবিলিটি (Future Roadmap)

1. **YOLO / AI অবজেক্ট ডিটেকশন ইন্টিগ্রেশন:** OpenCV কালার সার্চের পাশাপাশি ONNX Runtime দিয়ে রিয়েল-টাইম AI অবজেক্ট ও এনিমি ডিটেকশন নোড যোগ করা।
2. **সাউন্ড ভিত্তিক ট্রিগার (Audio Reactive Triggers):** গেমের সাউন্ড (যেমন ফুটস্টেপ বা গানশট) ডিটেক্ট করে ম্যাক্রো চালানো।
3. **কার্নেল মাউস ড্রাইভার সাইনিং:** অ্যান্টি-চিট প্রোটেক্টেড গেমের জন্য WHQL / টেস্ট সাইনড কার্নেল ড্রাইভার সরাসরি ড্রপ করা।

---

> **সংকলন ও আর্কিটেকচার:** Antigravity AI (Google DeepMind)  
> **তারিখ:** ২৪ আগস্ট ২০২৬  
> **স্ট্যাটাস:** প্রোডাকশন রেডি & ফুল্লি ফাংশনাল (.NET 8.0 Windows WPF)
