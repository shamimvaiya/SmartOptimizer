export type Language = 'en' | 'bn';

export interface TranslationDictionary {
  // Navigation & Brand
  appTitle: string;
  appSubtitle: string;
  navDashboard: string;
  navLogicIntelligence: string;
  navCalibration: string;
  navMacroStudio: string;
  navPerformance: string;
  navSettings: string;
  inGameHud: string;
  hudVisible: string;
  hudHidden: string;
  cpuLoad: string;
  ramUsage: string;
  kernelIoctl: string;
  restartEngine: string;
  exitApp: string;

  // Header
  snipArea: string;
  hudHotkey: string;
  profile: string;
  newProfile: string;
  deleteProfile: string;
  language: string;

  // Macro Studio
  actionLibrary: string;
  tabNodeGraph: string;
  tabBlockCoding: string;
  tabCsharpTranspile: string;
  templates: string;
  undo: string;
  redo: string;
  duplicate: string;
  crafter: string;
  clearAll: string;
  importJson: string;
  exportJson: string;
  runMacro: string;
  stopMacro: string;
  stopExecution: string;
  saveGraph: string;
  runNodeGraph: string;
  runBlockCoding: string;
  runCompiledScript: string;
  addNode: string;
  connectNodes: string;
  cancelConnect: string;
  resetView: string;
  snapGrid: string;
  minimap: string;
  helpGuide: string;
  searchNodes: string;
  totalNodes: string;

  // Minimap
  radarHud: string;
  radarExpanded: string;
  clickOrDragToJump: string;
  
  // Templates Modal
  templateLibraryTitle: string;
  templateLibrarySubtitle: string;
  saveCurrentAsTemplate: string;
  exportAllTemplates: string;
  importTemplates: string;
  noTemplatesFound: string;
  noTemplatesHint: string;
  applyTemplate: string;
  replaceCanvas: string;
  appendGraph: string;
  editTemplate: string;
  deleteTemplate: string;
  templateName: string;
  templateCategory: string;
  templateDescription: string;
  templateTags: string;
  saveChanges: string;
  cancel: string;

  // Dashboard
  systemTelemetry: string;
  activeTargetEmulator: string;
  installedInstances: string;
  autoScanEmulators: string;
  addInstance: string;
  liveAdbLogs: string;
  clearLogs: string;
  pinToTop: string;
  unpin: string;
  pinned: string;
  statusActive: string;
  statusIdle: string;
  clearRamCache: string;
  initOptimize: string;
  noEmulatorWarning: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  en: {
    appTitle: 'AIM/OPT',
    appSubtitle: 'PRO OPTIMIZER v3.0',
    navDashboard: 'Dashboard',
    navLogicIntelligence: 'Logic & Intelligence',
    navCalibration: 'Snipping & Calibration',
    navMacroStudio: 'Macro Studio',
    navPerformance: 'Performance Engine',
    navSettings: 'Settings & Stealth HUD',
    inGameHud: 'In-Game HUD',
    hudVisible: 'VISIBLE',
    hudHidden: 'HIDDEN',
    cpuLoad: 'CPU LOAD',
    ramUsage: 'RAM USAGE',
    kernelIoctl: 'Kernel IOCTL',
    restartEngine: 'RESTART ENGINE',
    exitApp: 'QUIT / EXIT APP',

    snipArea: 'Snip Area',
    hudHotkey: 'HUD Hotkey',
    profile: 'Profile',
    newProfile: 'New Profile',
    deleteProfile: 'Delete',
    language: 'Language',
    actionLibrary: 'Action Library',

    tabNodeGraph: 'Visual Node Graph',
    tabBlockCoding: 'Block Coding Mode',
    tabCsharpTranspile: 'C# .NET 8 Transpiled Code',
    templates: 'Templates',
    undo: 'Undo (Ctrl+Z)',
    redo: 'Redo (Ctrl+Y)',
    duplicate: 'Duplicate (Ctrl+D)',
    crafter: '+ Crafter',
    clearAll: 'Clear All',
    importJson: 'Import',
    exportJson: 'Export',
    runMacro: 'RUN MACRO',
    stopMacro: 'STOP RUNNING',
    stopExecution: 'STOP EXECUTION',
    saveGraph: 'Save Graph',
    runNodeGraph: 'RUN GRAPH MACRO',
    runBlockCoding: 'RUN BLOCK LOGIC',
    runCompiledScript: 'EXECUTE SCRIPT',
    addNode: 'Add Node',
    connectNodes: 'Connect Wire',
    cancelConnect: 'Cancel Connect',
    resetView: 'Reset View',
    snapGrid: 'Snap to Grid',
    minimap: 'Radar Minimap',
    helpGuide: 'Help & Guide',
    searchNodes: 'Search action blocks...',
    totalNodes: 'Nodes Active',

    radarHud: 'RADAR HUD',
    radarExpanded: 'EXPANDED',
    clickOrDragToJump: 'Click or drag radar to pan canvas',

    templateLibraryTitle: 'Macro Templates Manager',
    templateLibrarySubtitle: 'Save, import, export, edit, and apply custom graph templates.',
    saveCurrentAsTemplate: '+ Save Graph as Template',
    exportAllTemplates: 'Export All (.json)',
    importTemplates: 'Import Templates (.json)',
    noTemplatesFound: 'No templates in your library yet.',
    noTemplatesHint: 'Create an awesome node graph and click "+ Save Graph as Template" or import JSON templates.',
    applyTemplate: 'Apply Template',
    replaceCanvas: 'Replace Canvas',
    appendGraph: 'Append to Graph',
    editTemplate: 'Edit Template',
    deleteTemplate: 'Delete Template',
    templateName: 'Template Name',
    templateCategory: 'Category',
    templateDescription: 'Description',
    templateTags: 'Tags (comma-separated)',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',

    systemTelemetry: 'System Telemetry & Performance Engine',
    activeTargetEmulator: 'Active Target Emulator',
    installedInstances: 'Detected / Configured Emulators',
    autoScanEmulators: 'Auto Scan Instances',
    addInstance: '+ Add Custom Emulator',
    liveAdbLogs: 'Real-Time ADB Execution Logs',
    clearLogs: 'Clear Logs',
    pinToTop: 'Pin to Top',
    unpin: 'Unpin',
    pinned: 'PINNED',
    statusActive: 'ACTIVE',
    statusIdle: 'IDLE',
    clearRamCache: 'Clear RAM Cache',
    initOptimize: 'Initialize & Optimize System',
    noEmulatorWarning: 'Please add and select an emulator first!',
  },
  bn: {
    appTitle: 'এইম/অপট',
    appSubtitle: 'প্রো অপটিমাইজার ৩.০',
    navDashboard: 'ড্যাশবোর্ড',
    navLogicIntelligence: 'লজিক ও ইন্টেলিজেন্স',
    navCalibration: 'স্নিপিং ও ক্যালিব্রেশন',
    navMacroStudio: 'ম্যাক্রো স্টুডিও',
    navPerformance: 'পারফরম্যান্স ইঞ্জিন',
    navSettings: 'সেটিংস ও স্টিলথ HUD',
    inGameHud: 'ইন-গেম HUD',
    hudVisible: 'চালু',
    hudHidden: 'লুকানো',
    cpuLoad: 'সিপিইউ লোড',
    ramUsage: 'র‍্যাম ব্যবহার',
    kernelIoctl: 'কার্নেল IOCTL',
    restartEngine: 'ইঞ্জিন রিস্টার্ট',
    exitApp: 'সফটওয়্যার বন্ধ করুন',

    snipArea: 'স্নিপ এরিয়া',
    hudHotkey: 'HUD হট-কি',
    profile: 'প্রোফাইল',
    newProfile: 'নতুন প্রোফাইল',
    deleteProfile: 'মুছুন',
    language: 'ভাষা',
    actionLibrary: 'অ্যাকশন লাইব্রেরী',

    tabNodeGraph: 'ভিজুয়াল নোড গ্রাফ',
    tabBlockCoding: 'ব্লক কোডিং মোড',
    tabCsharpTranspile: 'সি# ডটনেট ৮ কোড',
    templates: 'টেমপ্লেট সমূহ',
    undo: 'আনডু (Ctrl+Z)',
    redo: 'রিডু (Ctrl+Y)',
    duplicate: 'ডুপ্লিকেট (Ctrl+D)',
    crafter: '+ ক্রাফটার',
    clearAll: 'সব মুছুন',
    importJson: 'ইমপোর্ট',
    exportJson: 'এক্সপোর্ট',
    runMacro: 'ম্যাক্রো চালু করুন',
    stopMacro: 'ম্যাক্রো বন্ধ করুন',
    stopExecution: 'ম্যাক্রো বন্ধ করুন',
    saveGraph: 'গ্রাফ সেভ করুন',
    runNodeGraph: 'গ্রাফ ম্যাক্রো চালু',
    runBlockCoding: 'ব্লক লজিক চালু',
    runCompiledScript: 'স্ক্রিপ্ট চালু',
    addNode: 'নোড যোগ করুন',
    connectNodes: 'তার জোড়া দিন',
    cancelConnect: 'বাতিল',
    resetView: 'ভিউ রিসেট',
    snapGrid: 'গ্রিড স্ন্যাপ',
    minimap: 'রাডার মিনিম্যাপ',
    helpGuide: 'সহায়িকা ও গাইড (?)',
    searchNodes: 'অ্যাকশন ব্লক খুঁজুন...',
    totalNodes: 'সক্রিয় নোড',

    radarHud: 'রাডার HUD',
    radarExpanded: 'বড় ভিউ',
    clickOrDragToJump: 'ক্যানভাস সরাতে রাডারে ক্লিক বা ড্র্যাগ করুন',

    templateLibraryTitle: 'ম্যাক্রো টেমপ্লেট ম্যানেজার',
    templateLibrarySubtitle: 'কাস্টম টেমপ্লেট সেভ, ইমপোর্ট, এক্সপোর্ট ও এডিট করুন।',
    saveCurrentAsTemplate: '+ বর্তমান গ্রাফ টেমপ্লেট হিসেবে সেভ করুন',
    exportAllTemplates: 'সব টেমপ্লেট এক্সপোর্ট (.json)',
    importTemplates: 'টেমপ্লেট ইমপোর্ট করুন (.json)',
    noTemplatesFound: 'আপনার লাইব্রেরিতে কোনো টেমপ্লেট নেই।',
    noTemplatesHint: 'গ্রাফ সাজিয়ে "+ বর্তমান গ্রাফ টেমপ্লেট হিসেবে সেভ করুন" বাটনে চাপুন বা JSON ফাইল ইমপোর্ট করুন।',
    applyTemplate: 'টেমপ্লেট প্রয়োগ করুন',
    replaceCanvas: 'ক্যানভাস রিপ্লেস করুন',
    appendGraph: 'গ্রাফে যুক্ত করুন',
    editTemplate: 'টেমপ্লেট এডিট',
    deleteTemplate: 'টেমপ্লেট মুছুন',
    templateName: 'টেমপ্লেটের নাম',
    templateCategory: 'ক্যাটাগরি',
    templateDescription: 'বর্ণনা',
    templateTags: 'ট্যাগ (কমা দিয়ে আলাদা করুন)',
    saveChanges: 'পরিবর্তন সংরক্ষণ করুন',
    cancel: 'বাতিল',

    systemTelemetry: 'সিস্টেম টেলিমেট্রি ও পারফরম্যান্স ইঞ্জিন',
    activeTargetEmulator: 'সক্রিয় টার্গেট ইমুলেটর',
    installedInstances: 'সনাক্তকৃত ইমুলেটর সমূহ',
    autoScanEmulators: 'অটো স্ক্যান',
    addInstance: '+ নতুন ইমুলেটর যোগ',
    liveAdbLogs: 'রিয়েল-টাইম ADB লগস',
    clearLogs: 'লগ মুছুন',
    pinToTop: 'শীর্ষে পিন করুন',
    unpin: 'আনপিন',
    pinned: 'পিন করা',
    statusActive: 'সক্রিয়',
    statusIdle: 'নিষ্ক্রিয়',
    clearRamCache: 'ক্লিয়ার র‍্যাম ক্যাশ',
    initOptimize: 'ইনিশিয়ালাইজ ও অপ্টিমাইজ সিস্টেম',
    noEmulatorWarning: 'দয়া করে আগে একটি ইমুলেটর যোগ করুন!',
  },
};
