# SmartOptimizer

SmartOptimizer হলো Windows-এর জন্য তৈরি একটি .NET 8 WPF ভিত্তিক Android emulator optimizer ও automation project। এতে Core engine, WPF user interface এবং আলাদা C++ Windows kernel driver module রয়েছে।

এই repository-তে শুধু source code, project configuration, documentation এবং প্রয়োজনীয় configuration রাখা হবে। build output বা machine-specific generated file রাখা হবে না।

## বৈশিষ্ট্য

- Android emulator detection ও performance tuning
- ADB manager এবং emulator configuration
- DirectX 11/DXGI screen capture
- OpenCV ভিত্তিক visual processing
- Node-based macro execution UI
- Optional C++ WDM kernel driver integration

## ফোল্ডার কাঠামো

```text
SmartOptimizer/
├── Config/                         # Global settings ও profiles
├── SmartOptimizer.Core/            # Engine, manager ও utility source
├── SmartOptimizer.UI/              # WPF application ও views
├── SmartOptimizer.Driver/          # C++ Windows kernel driver source
├── PROJECT_BLUEPRINT.md            # বিস্তারিত technical documentation
├── SmartOptimizer.sln              # Visual Studio solution
└── README.md
```

## প্রয়োজনীয় সফটওয়্যার

### Core এবং UI-এর জন্য

- Windows 10/11
- .NET 8 SDK (Windows desktop workload সহ)
- Visual Studio 2022 অথবা Visual Studio Build Tools
- Desktop development with .NET workload

### Driver build-এর জন্য

- Visual Studio 2022-এর Desktop development with C++ workload
- Windows Driver Kit (WDK) 10
- x64 native tools এবং test-signing সম্পর্কিত Windows driver development setup

Driver build করতে administrator privilege, signing policy এবং target Windows version অনুযায়ী অতিরিক্ত setup লাগতে পারে। Driver source repository-তে আছে, কিন্তু বর্তমান `SmartOptimizer.sln`-এ project হিসেবে যুক্ত নেই।

### ঐচ্ছিক runtime dependency

- Android emulator এবং তার `adb.exe`
- GPU driver যা DirectX 11 সমর্থন করে

NuGet package-গুলো project file-এ version সহ ঘোষিত আছে। আলাদা করে package folder repository-তে রাখা হয়নি।

## নতুন কম্পিউটারে project প্রস্তুত করা

Repository clone করার পর PowerShell-এ project folder-এ গিয়ে চালান:

```powershell
dotnet --version
dotnet restore .\SmartOptimizer.sln
dotnet build .\SmartOptimizer.sln --configuration Release
```

Debug build চাইলে:

```powershell
dotnet build .\SmartOptimizer.sln --configuration Debug
```

UI চালানোর জন্য:

```powershell
dotnet run --project .\SmartOptimizer.UI\SmartOptimizer.UI.csproj --configuration Release
```

Visual Studio ব্যবহার করলে `SmartOptimizer.sln` খুলে `SmartOptimizer.UI` startup project নির্বাচন করে Run করুন। প্রথম restore/build-এর সময় NuGet package স্বয়ংক্রিয়ভাবে download হবে।

## Configuration

`Config/global.json`-এ local machine-এর default settings থাকে। এখানে সাধারণত `AdbPath`, hotkey এবং preset সংক্রান্ত মান পরিবর্তন করা যায়। ব্যক্তিগত বা machine-specific profile commit করার আগে যাচাই করুন।

## Driver build

Visual Studio-তে `SmartOptimizer.Driver/SmartOptimizer.Driver.vcxproj` খুলে `Release | x64` নির্বাচন করুন এবং WDK install থাকা অবস্থায় Build করুন। Generated `.sys`, `.inf`, `.cat`, signing certificate এবং build folder commit করবেন না; এগুলো `.gitignore`-এ বাদ দেওয়া আছে। Driver load/install করার আগে code review, test-signing এবং Windows security policy যাচাই করুন।

## GitHub-এ upload

Project folder থেকে প্রথমবার:

```powershell
git init
git add .
git status
git commit -m "Initial project backup"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

`USERNAME/REPOSITORY` নিজের GitHub repository অনুযায়ী বদলাবেন। `git status`-এ `bin/`, `obj/`, `.vs/` বা অন্য generated output দেখা গেলে commit করার আগে কারণ যাচাই করুন।

## এই cleanup-এ যা সরানো হয়েছে

Repository ছোট রাখতে নিচের generated folder-গুলো সরানো হয়েছে:

- `SmartOptimizer.Core/bin/`
- `SmartOptimizer.Core/obj/`
- `SmartOptimizer.UI/bin/`
- `SmartOptimizer.UI/obj/`

এগুলো source code নয়। এগুলোতে প্রায় ৬৯৬ MB build output ও intermediate file ছিল এবং পরবর্তী `dotnet restore` ও `dotnet build` কমান্ডে আবার তৈরি হবে। Source, project file, solution, configuration, documentation এবং driver code রাখা হয়েছে।

## Clean rebuild

কোনো সময় generated output নতুন করে তৈরি করতে:

```powershell
dotnet clean .\SmartOptimizer.sln
dotnet restore .\SmartOptimizer.sln
dotnet build .\SmartOptimizer.sln --configuration Release
```

## গুরুত্বপূর্ণ নোট

- এই project Windows-only; Linux বা macOS-এ WPF/Windows Forms/WDK অংশ build হবে না।
- `SmartOptimizer.slnx` ফাইলটি খুব ছোট placeholder ধরনের; নিয়মিত build-এর জন্য `SmartOptimizer.sln` ব্যবহার করুন।
- Release build-এর আগে emulator, ADB path এবং driver ব্যবহারের প্রয়োজনীয়তা নিজের test environment-এ যাচাই করুন।
- GitHub-এ secret, ব্যক্তিগত profile, compiled binary বা signing key upload করবেন না।
