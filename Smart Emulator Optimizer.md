# Smart Emulator Optimizer

## সম্পূর্ণ প্রজেক্ট ব্লুপ্রিন্ট, ব্যবহার নির্দেশিকা ও বাস্তব বিশ্লেষণ

> **বিশ্লেষণের ভিত্তি:** বর্তমান repository-র source code, configuration, React component, Express API এবং utility module।
>
> **গুরুত্বপূর্ণ বাস্তবতা:** এই repository-র বর্তমান runnable application একটি React/Vite frontend এবং Express backend simulation। README ও পুরনো blueprint-এ .NET 8 WPF, C++ kernel driver, DXGI, OpenCV এবং real Windows process control-এর কথা বলা হয়েছে; কিন্তু সেই project/source folderগুলো বর্তমান workspace-এ নেই। তাই এই নথিতে পরিকল্পিত architecture এবং বর্তমানে সত্যিই কাজ করা prototype behavior আলাদা করে লেখা হয়েছে।

---

## ১. এক নজরে প্রজেক্টটি কী

Smart Emulator Optimizer হলো Windows Android emulator-কেন্দ্রিক একটি optimization dashboard ও visual automation prototype। এর উদ্দেশ্য হলো:

- emulator-এর performance profile সাজানো;
- CPU priority, CPU affinity, FPS ও DPI-এর মতো setting profile আকারে রাখা;
- emulator instance নির্বাচন, launch/stop এবং ADB bridge status দেখানো;
- screen region নির্বাচন করে visual target configuration তৈরি করা;
- node graph বা block-style workflow দিয়ে macro sequence বানানো;
- color/image matching, mouse movement, click, keyboard, delay ও ADB action-কে workflow-এ সাজানো;
- C# বা JavaScript code preview তৈরি করা;
- runtime telemetry, logs এবং floating HUD দেখানো;
- profile অনুযায়ী আলাদা game/app configuration রাখা।

বর্তমান version-টি মূলত একটি **UI demonstration এবং behavior simulation**। এটি browser-এর মাধ্যমে dashboard চালায়; সরাসরি Windows desktop capture, বাস্তব emulator process, ADB executable, kernel driver বা physical mouse/keyboard injection করে না।

---

## ২. বর্তমান প্রযুক্তিগত কাঠামো

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS plugin
- `lucide-react` icon library
- `motion` dependency রাখা আছে, যদিও প্রধান workflow-এ এর ব্যবহার সীমিত

Frontend-এর entry point হলো `src/main.tsx`; এটি `src/App.tsx` render করে।

### Backend

- Node.js
- Express
- TypeScript চালানোর জন্য `tsx`
- CORS এবং JSON request support

`server.ts`-এ API route ও in-memory state একসঙ্গে রাখা হয়েছে। Backend server-এর default port `3000`।

### Run command

```powershell
npm install
npm run dev
```

তারপর browser-এ খুলুন:

```text
http://localhost:3000
```

Production build:

```powershell
npm run build
npm start
```

### Configuration বাস্তবতা

`.env.example`-এ `PORT` ও `NODE_ENV` আছে, কিন্তু বর্তমান `server.ts` port হিসেবে সরাসরি `3000` ব্যবহার করে। ফলে environment variable বদলালেও port পরিবর্তনের নিশ্চয়তা নেই।

---

## ৩. অ্যাপ চালু হলে কী ঘটে

`App.tsx` প্রথমে নিচের পাঁচটি API call একসঙ্গে করে:

1. `/api/config`
2. `/api/presets`
3. `/api/emulators`
4. `/api/logs`
5. `/api/telemetry`

তারপর React state-এ config, active profile, emulator list, logs ও telemetry বসে। প্রতি প্রায় ১.২ সেকেন্ডে telemetry এবং logs আবার fetch হয়।

Server চালুর সময়:

- default profile না থাকলে `Default_Optimization` তৈরি হয়;
- emulator না থাকলে একটি sample `BlueStacks 5` instance তৈরি হয়;
- initial system logs যোগ হয়;
- সব state memory-তে থাকে।

**ফলাফল:** server বন্ধ বা restart করলে profile, custom emulator, active state এবং logs হারিয়ে যায়। বর্তমান active flow কোনো JSON file বা database-এ save করে না।

---

## ৪. বাম পাশের Navigation

Sidebar-এ সাতটি প্রধান section আছে:

1. **Dashboard**: emulator, ADB, engine, telemetry ও logs
2. **Logic & Intelligence**: navigator, script, vision, humanizer ও ghost recorder
3. **Snipping & Calibration**: screen region, color ও serialized snip data
4. **Visual Macro Studio**: node graph, block coding, custom action ও code preview
5. **Performance Engine**: priority, CPU core, FPS এবং DPI
6. **C# / WPF .NET 8 Code**: embedded code catalog দেখানোর view
7. **Settings & Stealth HUD**: hotkey, auto-hide, process override এবং profiles

Sidebar-এর `In-Game HUD` button দিয়ে floating HUD দৃশ্যমান/অদৃশ্য করা যায়। `RESTART ENGINE` লেখা button আসলে application বন্ধ করে না; এটি memory optimize করে আবার initial data reload করে।

---

## ৫. Dashboard: কী আছে এবং কীভাবে ব্যবহার করবেন

### ৫.১ Telemetry cards

Dashboard-এর উপরের অংশে তিনটি card থাকে:

#### Emulator Status

- Running বা Standby দেখায়;
- active emulator name;
- process name ও PID;
- emulator family/type।

#### ADB Connection

- Connected বা Disconnected status;
- `127.0.0.1:<port>` display;
- port override input।

#### Optimizer Engine

- Optimized বা Idle status;
- engine version label;
- current FPS এবং target FPS;
- DirectX/OpenCV সম্পর্কিত descriptive label।

### ৫.২ Emulator নির্বাচন

Emulator card-এ click করলে selected emulator বদলায়। Default sample হিসেবে BlueStacks 5 থাকে।

### ৫.৩ Custom emulator যোগ করা

1. `+ Add Emulator` চাপুন।
2. Display name দিন।
3. `.exe` path লিখুন।
4. ADB port দিন।
5. Family নির্বাচন করুন।
6. `Add Emulator` চাপুন।

বর্তমানে এটি শুধু server-এর in-memory list-এ নতুন object যোগ করে। Path সত্যিই আছে কি না এবং executable সত্যিই চালু হয় কি না যাচাই করা হয় না।

### ৫.৪ Launch & Hook

Selected emulator থাকলে `LAUNCH & HOOK` চাপুন। বর্তমান server:

- status `Running` করে;
- random fake PID তৈরি করে;
- active emulator set করে;
- priority, ADB hook এবং FPS push-এর log লেখে;
- telemetry-তে running/connected দেখায়।

এটি বাস্তবে `.exe` launch করে না এবং ADB command চালায় না।

### ৫.৫ Terminate Emulator

`TERMINATE EMULATOR` চাপলে active emulator-এর status `Ready` হয় এবং active state পরিষ্কার হয়। বাস্তব process terminate করা হয় না।

### ৫.৬ Initialize & Optimize System

এই button `/api/engine/toggle` call করে। অর্থাৎ এটি engine state toggle করে:

- active থাকলে paused/idle;
- inactive থাকলে active/optimized।

নামটি initialize/optimize হলেও বর্তমান implementation মূলত state toggle ও log update করে।

### ৫.৭ Flush RAM Cache

`FLUSH RAM CACHE` চাপলে server random একটি freed MB value তৈরি করে log দেখায়। এটি বাস্তব RAM trim বা process working set পরিষ্কার করে না।

### ৫.৮ ADB port override

Port input বদলালেই `/api/engine/apply-tweaks`-এ `adbPort` পাঠানো হয়। Active profile-এর port memory-তে update হয়, কিন্তু বাস্তব ADB connection তৈরি হয় না।

### ৫.৯ Live terminal log

- engine, ADB, driver, success এবং error log আলাদা রঙে দেখায়;
- `Clear` চাপলে log list reset হয়;
- Auto-Scroll toggle UI আছে, কিন্তু এই component-এ scroll-to-bottom behavior বাস্তবে implement করা হয়নি।

---

## ৬. Performance Engine

এই view active profile-এর performance settings সম্পাদনা করে।

### ৬.১ Process Priority

চারটি option:

- `Normal`
- `AboveNormal`
- `High`
- `RealTime`

`High` সাধারণত recommended হিসেবে দেখানো। `RealTime` extreme label-সহ দেখানো হয়েছে। বাস্তব Windows scheduler priority পরিবর্তন করা হয় না; value profile-এ রাখা হয়।

### ৬.২ CPU Core Affinity

আটটি core visualized হয়:

- CPU 0-3: E-Core label
- CPU 4-7: P-Core label

প্রতিটি chip click করে on/off করা যায়।

Quick selection:

- `All Performance Cores (4-7)` = bitmask `240`
- `Select All (0-7)` = bitmask `255`

নিচে hexadecimal ও decimal affinity mask দেখা যায়। `APPLY & SAVE TO PROFILE` চাপলে priority, mask, FPS এবং DPI server-এ পাঠিয়ে active preset update করে।

**সীমাবদ্ধতা:** `enableAffinity` state code-এ আছে, কিন্তু UI control বা save payload-এ ব্যবহার করা হয়নি।

### ৬.৩ FPS target

Slider range 60 থেকে 240 FPS। `INJECT FPS SYS-PROP VIA ADB` চাপলে FPS value `/api/adb/command`-এ যায় এবং log-এ `debug.sf.fps`/`debug.fps` command লেখা হয়। এটি বর্তমানে log simulation।

### ৬.৪ DPI density

Slider range 160 থেকে 480 DPI। `APPLY DENSITY VIA WM COMMAND` চাপলে `wm density`-ধরনের log তৈরি হয়। বাস্তবে emulator-এর Android density পরিবর্তন হয় না।

### ৬.৫ Save flow

`APPLY & SAVE TO PROFILE`:

1. UI state থেকে নতুন preset object তৈরি করে;
2. `/api/engine/apply-tweaks` call করে;
3. `/api/presets` POST করে;
4. active profile হিসেবে update করে;
5. UI-তে success feedback দেখায়।

---

## ৭. Snipping & Calibration

এটি screen region এবং visual target setup-এর জন্য। Sidebar, Header-এর `Snip Area`, অথবা Calibration view-এর `SELECT AREA (SNIP)` button থেকে খোলা যায়।

### ৭.১ Smart Snipping Overlay ব্যবহার

1. Snipping overlay খুলুন।
2. canvas-এর উপর mouse drag করে একটি rectangular area নির্বাচন করুন।
3. selection box-এ X, Y, W, H দেখা যাবে।
4. `Copy` menu থেকে বেছে নিন:
   - `Copy Coords Only`
   - `Copy All (SO_DATA + Img)`
5. `Confirm` চাপলে region active snip হিসেবে সেট হবে।
6. `ESC` চাপলে overlay বন্ধ হবে।

### ৭.২ বর্তমান snipper কী capture করে

Overlay একটি synthetic canvas আঁকে, যেখানে sample emulator frame, crosshair, HP bar, game text এবং loot crate তৈরি করা হয়। তাই এটি desktop বা emulator-এর আসল screen capture নয়; এই demo canvas-ই crop করা হয়।

### ৭.৩ Calibration controls

Calibration page-এ edit করা যায়:

- X position
- Y position
- Width
- Height
- target pixel color hex
- color tolerance

`SAVE & APPLY OVERRIDES` চাপলে active preset-এর visualProcessing region এবং tolerance update হয়।

### ৭.৪ Master Paste

`MASTER PASTE` clipboard থেকে নিচের format parse করতে পারে:

```text
SO_DATA|X:860|Y:440|W:200|H:200|COLOR:#39FF14
```

এছাড়াও কিছু fallback format গ্রহণ করে:

```text
X:100, Y:200, W:300, H:400
100, 200, 300, 400, #39FF14
```

### ৭.৫ Serialization

`serialization.ts`-এর format:

- `SO_DATA` header;
- X, Y, W, H;
- optional `IMG` base64;
- optional `COLOR` hex।

এটি copy/paste workflow-এ snip data বহন করে। Clipboard API না চললে textarea ও `execCommand('copy')` fallback ব্যবহার করা হয়।

---

## ৮. Visual Macro Studio

Visual Macro Studio-তে তিনটি workspace mode আছে:

1. Node Graph
2. Block Coding (Sketchware)
3. C# Transpiled Code

### ৮.১ Node Graph mode

#### Node যোগ করা

Palette থেকে যোগ করা যায়:

- Event (Start)
- Search Color
- Multi-Image Search
- Move Mouse
- Human Click
- Click Mouse
- Press Key
- Delay
- ADB Tap
- ADB Shell
- Script Block

নতুন node-এর default parameters action অনুযায়ী তৈরি হয়।

#### Node সরানো

Node drag করে canvas-এ reposition করা যায়। `snap to grid` থাকলে 20-pixel grid-এ position আটকে যায়।

#### Node নির্বাচন

- সাধারণ click: একটি node select;
- Shift + click: multi-select;
- selected node copy করতে `Copy` button বা Ctrl+C ব্যবহার করা যায়।

#### Node connect করা

একটি node-এর output থেকে অন্য node-এ connection toggle করলে `nextNodes` list update হয়। Execution-এর সময় সাধারণত `nextNodes[0]` অনুসরণ করা হয়।

#### Parameters পরিবর্তন

Node inspector/parameter editor থেকে action parameters পরিবর্তন করা যায়। উদাহরণ:

```text
Search Color: 860, 440, 200, 200, #39FF14
Move Mouse: 960, 540, true
Click Mouse: left
Delay: 50
ADB Tap: 960, 540
```

#### Node delete

Node delete করলে graph থেকে node সরার পাশাপাশি অন্য node-এর `nextNodes` reference থেকেও তার ID বাদ যায়।

#### Clipboard copy/paste

Selected node copy করলে clipboard payload-এর শুরু হয়:

```text
AIMOPT_CLIP|{"version":"3.0","nodes":[...]}
```

Paste করলে নতুন ID তৈরি হয়, position সামান্য offset হয় এবং internal next-node references remap হয়। Clipboard-এ snip data থাকলে একটি `Search Color` node তৈরি হয়।

#### Save Graph

`Save Graph` active preset-এর `macroGraph` update করে server-এ save করে।

#### Run Macro

`Run Macro` `/api/macro/run` call করে। বর্তমান server 450 ms interval-এ node list ঘুরিয়ে log লেখে। এটি node-এর বাস্তব mouse click, ADB tap বা visual search করে না। `Stop Execution` interval বন্ধ করে।

### ৮.২ Block Coding mode

এখানে category অনুযায়ী block যোগ করা যায়:

- Vision
- Input
- Loops
- Logic
- ADB
- Custom

কিছু block container/child block ধারণ করতে পারে এবং sample nested block দেখানো হয়। কিন্তু বর্তমানে:

- block drag করে nesting করা যায় না;
- block persistence নেই;
- block থেকে run করা হয় না;
- block editor-এর data node graph-এ automatically convert হয় না।

### ৮.৩ Action Crafter

`+ Action Crafter` থেকে custom action তৈরি করা যায়:

- action name
- category
- glow color
- icon
- default parameter template
- C# script body

`Register Action` চাপলে action বর্তমান Visual Macro Studio component state-এ যোগ হয় এবং palette-এ ব্যবহার করা যায়। Server বা profile-এ এটি persist হয় না; page reload হলে হারিয়ে যায়।

### ৮.৪ C# code preview

Graph node থেকে `transpileGraphToCSharp()` code generate করে। Block-এর জন্য `transpileBlocksToCSharp()` code generate করে। এগুলো code preview; generated code compile বা actual .NET runtime-এ run হয় না।

---

## ৯. Logic & Intelligence

এই view-এর পাঁচটি tab আছে।

### ৯.১ Execution Engine / Navigator

`Run Sequence` active preset-এর macro graph-কে `GraphNavigator` দিয়ে sequentially চালায়। শুরু node হিসেবে `Event (Start)` থাকলে সেটি নেওয়া হয়, না থাকলে প্রথম node।

প্রতিটি step-এ:

- node active highlight হয়;
- execution latency map update হয়;
- runtime variables দেখা যায়;
- success/failure log হয়;
- node-এর `nextNodes[0]` অনুসরণ করা হয়।

Runtime variables-এর উদাহরণ:

```text
mouseX, mouseY, foundX, foundY, matchScore, loopCount
```

**বাস্তবতা:** action implementation synthetic delay, synthetic coordinate ও synthetic match score ব্যবহার করে। Physical input বা actual screenshot processing হয় না।

### ৯.২ Hybrid Scripting

দুটি language option:

- C#
- JavaScript

Active graph থেকে script code generate হয়। `Run Script` চাপলে sandbox-like simulation চালানো হয়। JavaScript-এর জন্য mock Vision, Mouse, Keyboard এবং ADB object থাকে; C# execution-ও simulated result/log হিসেবে সম্পন্ন হয়।

### ৯.৩ Intelligent Vision

এই tab-এ multi-image search test, confidence/sensitivity, grayscale এবং resolution scaling সম্পর্কিত control থাকে। `executeMultiImageSearch()`:

- সর্বোচ্চ পাঁচটি target নেয়;
- priority অনুযায়ী sort করে;
- configured sensitivity-এর সঙ্গে synthetic confidence compare করে;
- scaled region হিসাব করে;
- random কাছাকাছি match coordinate দেয়।

**বাস্তবতা:** image বা canvas inspect না করে random/simulated result তৈরি হয়।

### ৯.৪ Humanizer

Humanizer utility-তে:

- cubic Bézier mouse path;
- natural/easeOutQuad/easeInOutCubic easing;
- curvature intensity;
- delay jitter;
- click offset radius;
- random micro-jitter;
- trajectory canvas visualization

দেখানো হয়। এটি UI demo এবং algorithm utility। নামের anti-detect ধারণা বাস্তব security বা anti-cheat bypass-এর নিশ্চয়তা নয়। Online game বা third-party software-এ automation ব্যবহারের আগে সংশ্লিষ্ট rules ও terms যাচাই করা প্রয়োজন।

### ৯.৫ Ghost Loop Macro Recorder

Recorder canvas area-তে:

- mouse move;
- mouse button down/up;
- key down/up

event record করে। Recording stop হলে JSON-compatible `GhostMacroFile` তৈরি হয়। এতে timestamp, event count, screen resolution এবং event list থাকে।

Playback-এ speed multiplier, timing jitter, progress এবং log দেখা যায়। JSON export/import-ও আছে।

**বাস্তবতা:** playback actual OS mouse/keyboard inject করে না; event log ও progress simulation করে।

---

## ১০. Stealth HUD

Floating HUD-এ থাকে:

- current FPS;
- CPU load;
- RAM usage;
- active profile;
- hooked status;
- configured hotkey।

### ব্যবহার

- Sidebar-এর `In-Game HUD` button চাপুন;
- Header-এর HUD indicator চাপুন;
- configured key চাপুন;
- HUD header drag করে position বদলান;
- close button চাপলে hide করুন;
- auto-hide থাকলে প্রায় চার সেকেন্ড পরে dim হয়;
- hover করলে opacity ফিরে আসে।

### গুরুত্বপূর্ণ সীমাবদ্ধতা

এটি browser page-এর fixed React element। এটি Windows-এর global always-on-top overlay নয়। Browser window focus না থাকলে key listener কাজ নাও করতে পারে। `RegisterHotKey`, native overlay window বা real game overlay integration বর্তমান code-এ নেই।

---

## ১১. Settings ও Profile Management

### Hotkey recorder

1. Hotkey box-এ click করুন।
2. keyboard-এর একটি key চাপুন।
3. key name preview হবে।
4. `Save` চাপুন।

Space-কে `SPACE` এবং Escape-কে `ESC` নামে normalize করা হয়। Save করলে active profile এবং global default hotkey update হয়।

### Auto-hide

Toggle দিয়ে HUD auto-hide enable/disable করা যায়। Current implementation auto-hide delay code-এ 4 seconds; profile-এর delay value display/config model-এ থাকলেও UI-তে আলাদা numeric editor নেই।

### Target process override

`HD-Player.exe`, `dnplayer.exe`, `Nox.exe` ইত্যাদি process name লিখে `Save Override` চাপা যায়। এটি active profile update করে এবং API-তে `processOverride` পাঠায়। বাস্তবে process scan বা hook হয় না।

### Profile তৈরি

1. Header-এর `+ New` অথবা Settings-এর `+ Create Profile` চাপুন।
2. profile name দিন;
3. target game/app দিন;
4. description দিন;
5. create করুন।

নতুন profile active profile-এর deep copy নিয়ে তৈরি হয়; name spaces underscore-এ বদলে যায়।

### Duplicate

`Duplicate Active` active profile-এর copy তৈরি করে, সাধারণত `_Copy` suffix দিয়ে।

### Delete

শেষ profile delete করা যায় না। একাধিক profile থাকলে confirmation-এর পরে active profile delete হয় এবং প্রথম remaining profile active হয়।

### Profile switch

Header dropdown থেকে profile নির্বাচন করলে server active preset name বদলায় এবং corresponding configuration UI-তে আসে।

---

## ১২. Data model-এর গুরুত্বপূর্ণ অংশ

`src/types.ts`-এ প্রধান interfaceগুলো:

- `InstalledEmulatorInfo`: emulator identity, type, path, status, port
- `EmulatorConfig`: process, priority, affinity, port, autoLaunch
- `PerformanceConfig`: target FPS, CPU affinity, RAM optimization, monitor interval
- `DisplayConfig`: width, height, DPI, auto scale
- `VisualProcessingConfig`: region, tolerance, sensitivity, target image, scaling
- `OverlayConfig`: hotkey, auto-hide, transparency, FPS/system stats
- `MacroNode`: action type, parameters, position, next node IDs, execution status
- `PresetProfile`: emulator + performance + display + vision + overlay + macro graph
- `TelemetryData`: CPU, RAM, FPS, emulator/ADB/engine/driver status
- `SnipData`: X/Y/width/height/image/color/timestamp

---

## ১৩. API route map

| Route                              | কাজ                              |
| ---------------------------------- | -------------------------------- |
| `GET /api/health`                  | server health                    |
| `GET /api/config`                  | global config ও active preset    |
| `POST /api/config`                 | global config update             |
| `GET /api/presets`                 | সব profile                       |
| `GET /api/presets/:name`           | একটি profile                     |
| `POST /api/presets`                | profile save/create              |
| `POST /api/presets/duplicate`      | profile duplicate                |
| `DELETE /api/presets/:name`        | profile delete                   |
| `POST /api/presets/switch`         | active profile switch            |
| `GET /api/emulators`               | emulator list                    |
| `POST /api/emulators/custom`       | custom emulator add              |
| `POST /api/emulators/launch`       | simulated launch/hook            |
| `POST /api/emulators/stop`         | simulated stop                   |
| `POST /api/engine/toggle`          | engine state toggle              |
| `POST /api/engine/optimize-memory` | simulated RAM optimization       |
| `POST /api/engine/apply-tweaks`    | profile tweak update             |
| `POST /api/adb/command`            | simulated ADB command log        |
| `POST /api/transpile/csharp`       | simple server-side code response |
| `POST /api/macro/run`              | simulated macro interval শুরু    |
| `POST /api/macro/stop`             | macro interval বন্ধ              |
| `GET /api/telemetry`               | generated telemetry              |
| `GET /api/logs`                    | logs                             |
| `DELETE /api/logs`                 | logs clear                       |

API wrapper `src/services/api.ts` সাধারণত HTTP error status আলাদাভাবে validate করে না; সরাসরি `res.json()` return করে।

---

## ১৪. কোন feature বাস্তব, কোনটি simulation

### বর্তমানে সত্যিই কাজ করে

- React navigation এবং view switching;
- form input, sliders, toggles;
- profile object create/save/switch/delete/duplicate in memory;
- custom emulator list update in memory;
- node add/delete/move/connect/edit;
- clipboard serialization/parsing;
- synthetic snip canvas crop;
- generated code preview;
- synthetic graph traversal;
- generated telemetry এবং logs;
- HUD show/hide, drag, dim এবং browser key listener;
- JSON export/import structure;
- utility-level Bézier path ও color/coordinate calculations।

### বর্তমানে বাস্তব নয় বা অসম্পূর্ণ

- actual emulator executable launch/terminate;
- Windows registry scan;
- real process priority বা CPU affinity;
- actual RAM working-set trim;
- real ADB binary discovery/connection/shell execution;
- real FPS unlock বা Android `setprop` execution;
- actual desktop/emulator DXGI capture;
- actual OpenCV image matching;
- real mouse/keyboard injection;
- global Windows hotkey;
- always-on-top native overlay;
- kernel driver IOCTL;
- real C# Roslyn execution;
- profile file/database persistence;
- block editor persistence এবং graph conversion;
- custom action persistence;
- production security sandbox।

---

## ১৫. README ও বর্তমান repository-এর mismatch

README এবং পুরনো `PROJECT_BLUEPRINT.md`-এ যেসব folder/project-এর কথা বলা হয়েছে, যেমন:

- `SmartOptimizer.Core`
- `SmartOptimizer.UI`
- `SmartOptimizer.Driver`
- `Config`
- `.sln`/`.csproj`
- WPF XAML views
- C++ driver source

সেগুলো বর্তমান workspace structure-এ নেই। C#/WPF architecture-এর কিছু sample code `CsharpWpfCodeView.tsx`-এর embedded display content হিসেবে আছে; সেগুলো আলাদা compileable project নয়।

সুতরাং বর্তমান project-কে সবচেয়ে সঠিকভাবে বলা যায়:

> **SmartOptimizer-এর React/Vite proof-of-concept dashboard, যেখানে ভবিষ্যৎ native optimizer architecture-এর UI ও simulated workflow দেখানো হয়েছে।**

---

## ১৬. নিরাপদ ব্যবহার ও operational সতর্কতা

- `High` বা `RealTime` process priority বাস্তব implementation যোগ করার সময় system responsiveness ক্ষতিগ্রস্ত করতে পারে।
- ADB shell ও process control বাস্তব করলে input validation, permission boundary এবং audit log প্রয়োজন।
- Kernel driver কখনও production machine-এ code review, signing এবং isolated test environment ছাড়া চালানো উচিত নয়।
- Automation বা input injection ব্যবহার করলে game/app-এর terms of service এবং anti-cheat policy মানতে হবে।
- Clipboard-এ base64 image বা custom script রাখলে sensitive data leak হতে পারে।
- Profile name, process path, ADB command ও generated script sanitize করা দরকার।
- Real sandbox ছাড়া arbitrary C# বা JavaScript execution নিরাপদ নয়।

---

## ১৭. ভবিষ্যৎ বাস্তবায়নের প্রস্তাবিত roadmap

### ধাপ ১: Prototype শক্ত করা

- server state JSON বা SQLite-এ persist করা;
- API error handling ও schema validation যোগ করা;
- profile এবং custom action-এর proper import/export;
- block-to-node conversion সম্পূর্ণ করা;
- macro execution-এর single source of truth ঠিক করা;
- unit test ও integration test যোগ করা।

### ধাপ ২: Native Windows service layer

- আলাদা Windows-native service তৈরি;
- verified emulator discovery;
- process lifecycle ও permission handling;
- real ADB executable invocation;
- telemetry-এর জন্য actual process metrics;
- frontend-এর সঙ্গে authenticated local IPC/API।

### ধাপ ৩: Vision ও capture

- real window capture abstraction;
- DXGI fallback strategy;
- actual image/template matching;
- coordinate scaling test;
- capture failure, timeout ও stale-frame handling।

### ধাপ ৪: Automation reliability

- cancellation token;
- graph cycle detection;
- retry/timeout/branch node;
- dry-run mode;
- action audit log;
- user confirmation for destructive ADB/process actions।

### ধাপ ৫: Security ও distribution

- script sandbox isolation;
- signed binaries;
- least-privilege execution;
- driver প্রয়োজন না হলে driver বাদ দেওয়া;
- installer এবং rollback strategy;
- documentation-এ implemented বনাম planned feature আলাদা রাখা।

---

## ১৮. ব্যবহারকারীর জন্য সংক্ষিপ্ত workflow

### শুধু dashboard ও telemetry দেখতে

1. `npm install`
2. `npm run dev`
3. browser-এ `http://localhost:3000`
4. Dashboard খুলে sample emulator দেখুন
5. Launch, engine toggle, RAM flush এবং logs পরীক্ষা করুন

### performance profile বানাতে

1. নতুন profile তৈরি করুন
2. Performance Engine খুলুন
3. priority, core mask, FPS ও DPI ঠিক করুন
4. `APPLY & SAVE TO PROFILE` চাপুন
5. Header dropdown থেকে profile switch করে যাচাই করুন

### visual region বানাতে

1. Snipping overlay খুলুন
2. synthetic emulator canvas-এ area drag করুন
3. Confirm করুন
4. Calibration-এ color/tolerance ঠিক করুন
5. Save overrides করুন
6. প্রয়োজনে `SO_DATA` copy/paste করুন

### macro graph বানাতে

1. Visual Macro Studio খুলুন
2. action node যোগ করুন
3. parameters সম্পাদনা করুন
4. node connect করুন
5. Save Graph করুন
6. Run Macro দিয়ে simulated execution log দেখুন

### logic পরীক্ষা করতে

1. Logic & Intelligence খুলুন
2. Navigator দিয়ে graph sequence চালান
3. Vision tab-এ synthetic search test করুন
4. Humanizer tab-এ path দেখুন
5. Ghost tab-এ event record/export/import পরীক্ষা করুন

---

## ১৯. চূড়ান্ত মূল্যায়ন

Smart Emulator Optimizer-এর UI scope যথেষ্ট বিস্তৃত: dashboard, profile system, performance controls, visual calibration, node graph, script preview, vision test, humanizer visualization, ghost recorder এবং HUD একসঙ্গে আছে। Presentation layer একটি পূর্ণাঙ্গ product direction দেখায়।

তবে বর্তমান codebase-কে production optimizer বা real anti-detection tool বলা যাবে না, কারণ native Windows integration এবং persistent backend এখনো implement হয়নি। বর্তমান version-এর সবচেয়ে সঠিক মূল্যায়ন হলো:

> **একটি polished, feature-rich emulator optimization ও automation control-center prototype, যার UI/algorithm ধারণা আছে এবং native execution layer ভবিষ্যতের কাজ হিসেবে বাকি।**

---

## ২০. প্রধান source file index

- `src/App.tsx` - application state ও orchestration
- `src/types.ts` - data model
- `server.ts` - Express API ও in-memory simulation
- `src/services/api.ts` - frontend API client
- `src/services/profileService.ts` - profile helper ও unused localStorage fallback
- `src/components/DashboardView.tsx` - dashboard
- `src/components/PerformanceView.tsx` - performance settings
- `src/components/VisualMacroStudio.tsx` - node/block/code workspace
- `src/components/LogicIntelligenceView.tsx` - navigator, vision, scripting, humanizer, ghost
- `src/components/CalibrationView.tsx` - calibration controls
- `src/components/SmartSnippingOverlay.tsx` - synthetic snipping overlay
- `src/components/StealthHUDOverlay.tsx` - floating HUD
- `src/components/SettingsOverlayView.tsx` - settings ও profile controls
- `src/utils/graphNavigator.ts` - sequential graph simulation
- `src/utils/visualEngine.ts` - visual matching/scaling simulation
- `src/utils/humanizer.ts` - Bézier ও timing utilities
- `src/utils/ghostMacroRecorder.ts` - recorder/playback model
- `src/utils/scriptTranspiler.ts` - C#/JavaScript code generation
- `src/utils/serialization.ts` - SO_DATA ও clipboard support
- `src/components/CsharpWpfCodeView.tsx` - embedded native architecture code catalog
