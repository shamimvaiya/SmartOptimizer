import React, { useState, useEffect, useRef } from 'react';
import {
  FileCode,
  Save,
  Download,
  Upload,
  Play,
  Check,
  Copy,
  Trash2,
  Plus,
  RefreshCw,
  Zap,
  Terminal,
  Layers,
  Code2,
  FileJson,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Folder,
  FolderPlus,
  FilePlus,
  Edit2,
  X,
  Maximize2,
  Tv,
  Eye,
  Settings,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { MacroProfileItem } from '../types';

interface CodeMacroEditorProps {
  macros: MacroProfileItem[];
  activeMacroId: string;
  onSelectMacro: (id: string) => void;
  onSaveMacro: (macro: MacroProfileItem) => void;
  onDeleteMacro: (id: string) => void;
  onCreateNewMacro: (newMacro: MacroProfileItem) => void;
  onExecuteMacro: (macro: MacroProfileItem) => void;
  isBn?: boolean;
}

interface FileTreeItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileTreeItem[];
  content?: string;
  category?: string;
}

export const CodeMacroEditor: React.FC<CodeMacroEditorProps> = ({
  macros,
  activeMacroId,
  onSelectMacro,
  onSaveMacro,
  onDeleteMacro,
  onCreateNewMacro,
  onExecuteMacro,
  isBn = true,
}) => {
  const activeMacro = macros.find((m) => m.id === activeMacroId) || macros[0];

  // Open Tabs Management
  const [openTabIds, setOpenTabIds] = useState<string[]>(() => [activeMacroId]);
  const [activeTabId, setActiveTabId] = useState<string>(activeMacroId);

  // Editor State
  const [code, setCode] = useState<string>('');
  const [macroName, setMacroName] = useState<string>('');
  const [hotkey, setHotkey] = useState<string>('F6');
  const [category, setCategory] = useState<string>('combat');
  const [categories, setCategories] = useState<string[]>([
    'combat',
    'recoil',
    'movement',
    'looting',
    'sniper',
    'utility',
  ]);
  const [newCatName, setNewCatName] = useState<string>('');
  const [isAddingCategoryModal, setIsAddingCategoryModal] = useState<boolean>(false);

  // Pane Split Resizing State
  const [sidebarWidth, setSidebarWidth] = useState<number>(240);
  const [isResizingPane, setIsResizingPane] = useState<boolean>(false);

  // Dual Simulation Mode: 'text' | 'graphic'
  const [simulationMode, setSimulationMode] = useState<'text' | 'graphic'>('graphic');

  // Console & Notifications
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [mouseTrail, setMouseTrail] = useState<{ x: number; y: number }[]>([]);

  // Folder Collapse State
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // File Tree Right Click Context Menu
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    targetId: string;
    targetType: 'file' | 'folder' | 'root';
    targetCategory?: string;
  } | null>(null);

  // Rename Dialog State
  const [renamingTarget, setRenamingTarget] = useState<{
    id: string;
    name: string;
    type: 'file' | 'folder';
  } | null>(null);
  const [renameInputValue, setRenameInputValue] = useState<string>('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Dismiss context menu on global click or Escape key
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Keep openTabIds in sync when user selects macro externally
  useEffect(() => {
    if (activeMacroId && !openTabIds.includes(activeMacroId)) {
      setOpenTabIds((prev) => [...prev, activeMacroId]);
    }
    setActiveTabId(activeMacroId);
  }, [activeMacroId]);

  // Sync state when active macro changes
  useEffect(() => {
    if (activeMacro) {
      setMacroName(activeMacro.name);
      setHotkey(activeMacro.hotkey || 'F6');
      setCategory(activeMacro.category || 'combat');
      setCode(activeMacro.codeScript || '{}');
      setParseError(null);
      setSimulationLogs([]);
      setIsSimulating(false);
    }
  }, [activeMacro]);

  // Pane Resize Drag Handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingPane && editorContainerRef.current) {
        const rect = editorContainerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        setSidebarWidth(Math.max(160, Math.min(520, relativeX)));
      }
    };
    const handleMouseUp = () => {
      setIsResizingPane(false);
    };

    if (isResizingPane) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingPane]);

  const showStatus = (msg: string) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleCodeChange = (val: string) => {
    setCode(val);
    try {
      JSON.parse(val);
      setParseError(null);
    } catch (e: any) {
      setParseError(e.message || 'Invalid JSON syntax');
    }
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(code);
      setCode(JSON.stringify(parsed, null, 2));
      setParseError(null);
      showStatus(isBn ? 'কোড ফরম্যাট করা হয়েছে!' : 'JSON formatted!');
    } catch (e: any) {
      setParseError(e.message);
    }
  };

  const handleSave = () => {
    if (!activeMacro) return;
    try {
      JSON.parse(code);
    } catch (e: any) {
      setParseError(e.message);
      showStatus(isBn ? 'ত্রুটি: কোডে সঠিক JSON ফরম্যাট নেই!' : 'Error: Invalid JSON syntax!');
      return;
    }

    const updated: MacroProfileItem = {
      ...activeMacro,
      name: macroName,
      hotkey,
      category: category as any,
      codeScript: code,
      lastExecutedTime: new Date().toLocaleTimeString(),
    };

    onSaveMacro(updated);
    showStatus(isBn ? 'ম্যাক্রো সেভ হয়েছে!' : 'Macro saved!');
  };

  // Add category handler
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const cat = newCatName.trim().toLowerCase();
    if (!categories.includes(cat)) {
      setCategories((prev) => [...prev, cat]);
      setCategory(cat);
    }
    setNewCatName('');
    setIsAddingCategoryModal(false);
    showStatus(isBn ? `নতুন ক্যাটাগরি '${cat}' যুক্ত হয়েছে!` : `Category '${cat}' added!`);
  };

  // Export edited script to Macro Library as new macro card
  const handleExportToMacroLibrary = () => {
    const newId = `macro_lib_${Date.now()}`;
    const newMacroItem: MacroProfileItem = {
      id: newId,
      name: `${macroName} (Exported)`,
      category: (category || 'combat') as any,
      hotkey: hotkey || 'F9',
      isEnabled: true,
      isExecuted: false,
      tags: ['Exported', 'Library'],
      executionLayers: ['DirectInput IOCTL Pipe', 'Bézier Humanizer'],
      descriptionEn: 'Exported directly from Code & Script Editor.',
      descriptionBn: 'কোড এডিটর থেকে সরাসরি লাইব্রেরিতে এক্সপোর্ট করা ম্যাক্রো।',
      usageGuideEn: 'Activate in game using hotkey.',
      usageGuideBn: 'ইন-গেম হট-কি প্রেস করে সক্রিয় করুন।',
      inGameSettingsEn: 'Default in-game layout.',
      inGameSettingsBn: 'ডিফল্ট ইন-গেম লেআউট।',
      developerGuideEn: 'JSON script stored in Macro Library.',
      developerGuideBn: 'JSON স্ক্রিপ্ট ম্যাক্রো লাইব্রেরিতে সংরক্ষিত।',
      codeScript: code,
      author: 'User Script Editor',
      version: 'v1.0',
      createdDate: new Date().toISOString().split('T')[0],
    };

    onCreateNewMacro(newMacroItem);
    showStatus(isBn ? '✅ ম্যাক্রো লাইব্রেরিতে সফলভাবে যুক্ত করা হয়েছে!' : '✅ Added to Macro Library!');
  };

  // Run dual-mode simulation
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationLogs([
      `[0.00s] Parsing script JSON structure: ${macroName}...`,
      `[0.02s] Binding Trigger Hotkey [${hotkey}]... OK`,
      `[0.05s] Initializing Bézier Humanizer curve points...`,
    ]);
    setMouseTrail([]);

    let step = 0;
    const simSteps = [
      `[0.10s] Thread pool spawned: 12ms cadence`,
      `[0.18s] Mouse Y-compensation delta: -3.2px`,
      `[0.26s] Sub-pixel micro-jitter applied (±1.1px)`,
      `[0.35s] Keypress trigger burst verified`,
      `[0.48s] Execution cycle completed: 100% SUCCESS`,
    ];

    const trailPoints: { x: number; y: number }[] = [];

    const interval = setInterval(() => {
      if (step < simSteps.length) {
        setSimulationLogs((prev) => [...prev, simSteps[step]]);
        // Generate simulated mouse recoil path
        trailPoints.push({
          x: 100 + Math.sin(step * 1.5) * 15 + Math.random() * 4,
          y: 40 + step * 18 + Math.random() * 4,
        });
        setMouseTrail([...trailPoints]);
        step++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 220);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabIds.filter((t) => t !== id);
    setOpenTabIds(remaining);
    if (activeTabId === id && remaining.length > 0) {
      onSelectMacro(remaining[remaining.length - 1]);
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* Save Notification */}
      {saveStatus && (
        <div className="p-3 rounded-xl bg-[#162b16] border border-[#39ff14] text-[#39ff14] text-xs font-bold flex items-center space-x-2 animate-bounce shadow-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Main Container: File Explorer Sidebar + Resizer + VS Code Editor Pane */}
      <div ref={editorContainerRef} className="rounded-2xl bg-[#0f1017] border-2 border-[#222436] overflow-hidden shadow-2xl flex h-[620px] relative">
        {/* Full-screen mouse capture overlay while resizing */}
        {isResizingPane && (
          <div className="fixed inset-0 z-[9999] cursor-col-resize select-none" />
        )}
        {/* FILE EXPLORER SIDEBAR */}
        <div
          style={{ width: `${sidebarWidth}px` }}
          className="bg-[#0b0c12] border-r border-[#1f2133] flex flex-col shrink-0"
        >
          {/* Explorer Header */}
          <div className="p-3 bg-[#13141f] border-b border-[#1f2133] flex items-center justify-between">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-[#39ff14]" />
              <span>PROJECT FILES</span>
            </span>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  const newM: MacroProfileItem = {
                    id: `macro_file_${Date.now()}`,
                    name: `Script_${macros.length + 1}.aim`,
                    category: 'combat',
                    hotkey: 'F8',
                    isEnabled: true,
                    isExecuted: false,
                    tags: ['Custom'],
                    executionLayers: ['DirectInput Pipe'],
                    descriptionEn: 'New custom macro file',
                    descriptionBn: 'নতুন কাস্টম ম্যাক্রো ফাইল',
                    usageGuideEn: '',
                    usageGuideBn: '',
                    inGameSettingsEn: '',
                    inGameSettingsBn: '',
                    developerGuideEn: '',
                    developerGuideBn: '',
                    codeScript: '{\n  "name": "New Macro",\n  "recoilY": 2.5\n}',
                  };
                  onCreateNewMacro(newM);
                }}
                className="p-1 rounded text-[#8892b0] hover:text-[#39ff14] hover:bg-[#1a202c] cursor-pointer"
                title="New File"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsAddingCategoryModal(true)}
                className="p-1 rounded text-[#8892b0] hover:text-[#00e5ff] hover:bg-[#1a202c] cursor-pointer"
                title="Add New Category Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* File Tree List */}
          <div
            onContextMenu={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault();
                setContextMenu({
                  x: e.clientX,
                  y: e.clientY,
                  targetId: 'root',
                  targetType: 'root',
                });
              }
            }}
            className="p-2 space-y-2 overflow-y-auto auto-hide-scrollbar flex-1 font-mono text-xs select-none"
          >
            {categories.map((cat) => {
              const catMacros = macros.filter((m) => m.category === cat);
              const isCollapsed = !!collapsedCategories[cat];

              return (
                <div key={cat} className="space-y-1">
                  {/* Folder Row */}
                  <div
                    onClick={() => {
                      setCollapsedCategories((prev) => ({
                        ...prev,
                        [cat]: !prev[cat],
                      }));
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setContextMenu({
                        x: e.clientX,
                        y: e.clientY,
                        targetId: cat,
                        targetType: 'folder',
                        targetCategory: cat,
                      });
                    }}
                    className="flex items-center justify-between text-[11px] font-bold text-[#cbd5e1] hover:text-white px-2 py-1.5 rounded bg-[#13141f]/90 border border-[#1d1e2e] cursor-pointer transition-colors group"
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-[#8892b0] group-hover:text-white transition-transform" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-[#8892b0] group-hover:text-white transition-transform" />
                      )}
                      <Folder className="w-3.5 h-3.5 text-[#ffd600] shrink-0" />
                      <span className="truncate uppercase font-sans tracking-wide">{cat}</span>
                    </span>
                    <span className="text-[10px] text-[#64748b] font-mono shrink-0">({catMacros.length})</span>
                  </div>

                  {/* Folder Children Files */}
                  {!isCollapsed && (
                    <div className="space-y-0.5">
                      {catMacros.length === 0 ? (
                        <div className="pl-7 py-1 text-[10px] text-[#475569] italic">
                          (empty folder)
                        </div>
                      ) : (
                        catMacros.map((m) => {
                          const isSelected = m.id === activeMacroId;
                          return (
                            <div
                              key={m.id}
                              onClick={() => {
                                onSelectMacro(m.id);
                                if (!openTabIds.includes(m.id)) {
                                  setOpenTabIds((prev) => [...prev, m.id]);
                                }
                              }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setContextMenu({
                                  x: e.clientX,
                                  y: e.clientY,
                                  targetId: m.id,
                                  targetType: 'file',
                                  targetCategory: cat,
                                });
                              }}
                              className={`pl-7 pr-2 py-1.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer text-xs truncate ${
                                isSelected
                                  ? 'bg-[#162b16] text-[#39ff14] font-bold border border-[#39ff14]/40 shadow-[0_0_8px_rgba(57,255,20,0.15)]'
                                  : 'text-[#cbd5e1] hover:bg-[#151724] hover:text-white'
                              }`}
                            >
                              <span className="truncate flex items-center gap-1.5">
                                <FileCode className="w-3.5 h-3.5 text-[#00e5ff] shrink-0" />
                                <span className="truncate">{m.name}</span>
                              </span>
                              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#1e2030] text-[#94a3b8]">
                                {m.hotkey}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RESIZABLE SPLIT PANE BORDER */}
        <div
          onMouseDown={() => setIsResizingPane(true)}
          className="w-1.5 bg-[#1f2133] hover:bg-[#39ff14] cursor-col-resize transition-colors shrink-0"
          title="Drag to resize File Explorer panel"
        />

        {/* EDITOR & TEST CONSOLE MAIN PANE */}
        <div className="flex-1 flex flex-col bg-[#0f1017] min-w-0">
          {/* HORIZONTAL TAB BAR */}
          <div className="h-10 bg-[#12131d] border-b border-[#1f2133] flex items-center overflow-x-auto px-2 space-x-1 shrink-0">
            {openTabIds.map((tid) => {
              const tabMacro = macros.find((m) => m.id === tid);
              if (!tabMacro) return null;
              const isActive = tid === activeMacroId;
              return (
                <div
                  key={tid}
                  onClick={() => onSelectMacro(tid)}
                  className={`h-8 px-3 rounded-t-lg font-mono text-xs flex items-center space-x-2 border-t-2 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#0f1017] text-[#39ff14] border-[#39ff14] font-bold border-x border-[#1f2133]'
                      : 'bg-[#171826] text-[#8892b0] hover:text-white border-transparent'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>{tabMacro.name}</span>
                  <button
                    onClick={(e) => handleCloseTab(tid, e)}
                    className="p-0.5 rounded hover:bg-[#25283d] text-[#64748b] hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* EDITOR TOOLBAR */}
          <div className="px-4 py-2 bg-[#141522] border-b border-[#1f2133] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={macroName}
                onChange={(e) => setMacroName(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-[#0a0b10] text-white text-xs font-bold border border-[#26283d] outline-none focus:border-[#39ff14]"
              />

              {/* Category Select */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-8 px-2 rounded-lg bg-[#0a0b10] text-[#00e5ff] text-xs font-mono border border-[#26283d] outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-[#0f1017] text-white">
                    {c.toUpperCase()}
                  </option>
                ))}
              </select>

              {/* Hotkey Input */}
              <input
                type="text"
                value={hotkey}
                onChange={(e) => setHotkey(e.target.value.toUpperCase())}
                className="h-8 w-16 px-1.5 rounded-lg bg-[#0a0b10] text-[#ffd600] text-xs font-mono font-bold border border-[#26283d] text-center uppercase"
                placeholder="F6"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleFormatJson}
                className="h-8 px-3 rounded-lg bg-[#1b1d2e] hover:bg-[#262940] text-[#8892b0] hover:text-white text-xs font-bold border border-[#2a2d45]"
              >
                Format JSON
              </button>

              <button
                onClick={handleSave}
                className="h-8 px-4 rounded-lg bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] font-black text-xs flex items-center space-x-1.5 cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.2)]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* MAIN CODE EDIT AREA + DUAL SIMULATION TEST CONSOLE */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">
            {/* TEXTAREA CODE EDITOR (7 COLS) */}
            <div className="lg:col-span-7 p-3 bg-[#0a0b10] font-mono text-xs flex flex-col relative overflow-hidden">
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                spellCheck={false}
                className="w-full flex-1 bg-transparent text-[#e2e8f0] outline-none resize-none font-mono leading-relaxed p-2 selection:bg-[#39ff14]/30"
              />

              {parseError && (
                <div className="p-2 bg-[#2a1416] border border-[#ff4444] text-[#ff4444] text-[11px] font-mono rounded mt-2">
                  ❌ {parseError}
                </div>
              )}
            </div>

            {/* DUAL MODE SIMULATION & TEST CONSOLE (5 COLS) */}
            <div className="lg:col-span-5 border-l border-[#1f2133] bg-[#0c0d14] p-3 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-3">
                {/* Console Mode Switcher Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#1e2030]">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#00e5ff]" />
                    <span>TEST &amp; SIMULATION CONSOLE</span>
                  </span>

                  {/* Mode Toggle Pills */}
                  <div className="flex items-center rounded-lg bg-[#141624] p-0.5 border border-[#262940]">
                    <button
                      onClick={() => setSimulationMode('text')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        simulationMode === 'text' ? 'bg-[#00e5ff] text-black' : 'text-[#8892b0]'
                      }`}
                    >
                      Text Log
                    </button>
                    <button
                      onClick={() => setSimulationMode('graphic')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        simulationMode === 'graphic' ? 'bg-[#39ff14] text-black' : 'text-[#8892b0]'
                      }`}
                    >
                      Visual Canvas
                    </button>
                  </div>
                </div>

                {/* SIMULATION MODE DISPLAY */}
                {simulationMode === 'text' ? (
                  <div className="h-44 rounded-xl bg-[#06070a] p-3 border border-[#1a1c2b] font-mono text-[11px] text-[#39ff14] overflow-y-auto space-y-1">
                    {simulationLogs.length > 0 ? (
                      simulationLogs.map((log, i) => <div key={i}>{log}</div>)
                    ) : (
                      <div className="text-[#64748b] italic">
                        Click &quot;Run Test Simulation&quot; to execute real-time test.
                      </div>
                    )}
                  </div>
                ) : (
                  /* VISUAL GRAPHIC SIMULATION CANVAS */
                  <div className="h-44 rounded-xl bg-[#06070a] border border-[#1a1c2b] relative overflow-hidden flex items-center justify-center">
                    {/* Simulated Target Grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-40" />

                    {/* Target Crosshair Circle */}
                    <div className="w-12 h-12 rounded-full border border-[#00e5ff]/40 flex items-center justify-center relative">
                      <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-ping" />
                    </div>

                    {/* Animated Recoil Trajectory Path */}
                    {mouseTrail.length > 0 && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <polyline
                          fill="none"
                          stroke="#39ff14"
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          points={mouseTrail.map((p) => `${p.x},${p.y}`).join(' ')}
                        />
                        {mouseTrail.map((p, idx) => (
                          <circle key={idx} cx={p.x} cy={p.y} r="2.5" fill="#ffd600" />
                        ))}
                      </svg>
                    )}

                    {isSimulating && (
                      <div className="absolute top-2 left-2 text-[10px] font-mono text-[#39ff14] bg-black/60 px-2 py-0.5 rounded border border-[#39ff14]/40 animate-pulse">
                        ● EXECUTING BEZIER RECOIL SIMULATION...
                      </div>
                    )}
                  </div>
                )}

                {/* Simulation Trigger Button */}
                <button
                  onClick={handleRunSimulation}
                  disabled={isSimulating}
                  className="w-full h-10 rounded-xl bg-[#1a1c2e] hover:bg-[#252842] text-[#00e5ff] border border-[#00e5ff]/50 font-bold text-xs flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSimulating ? 'Simulating...' : 'Run Test Simulation'}</span>
                </button>
              </div>

              {/* CRITICAL FEATURE: ADD TO MACRO LIBRARY BUTTON */}
              <div className="pt-3 border-t border-[#1e2030] mt-3">
                <button
                  id="btn-add-to-macro-library"
                  onClick={handleExportToMacroLibrary}
                  className="w-full h-11 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border-2 border-[#39ff14] font-black text-xs flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(57,255,20,0.3)] cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{isBn ? '➕ ম্যাক্রো লাইব্রেরিতে যুক্ত করুন' : '➕ Add to Macro Library'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD CATEGORY MODAL */}
      {isAddingCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f1017] border-2 border-[#00e5ff] p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-[#00e5ff]" />
              <span>{isBn ? 'নতুন কাস্টম ক্যাটাগরি ফোল্ডার' : 'New Category Folder'}</span>
            </h3>

            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. shotgun, auto_tap, vehicle"
              className="w-full h-10 px-3 rounded-xl bg-[#161824] text-white text-xs border border-[#2e3146] outline-none focus:border-[#00e5ff]"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsAddingCategoryModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#8892b0] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-1.5 rounded-lg bg-[#00e5ff] text-black font-black text-xs cursor-pointer"
              >
                Add Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME MODAL */}
      {renamingTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#0f1017] border-2 border-[#39ff14] p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-[#39ff14]" />
              <span>{isBn ? 'পুনরায় নামকরণ করুন' : 'Rename File / Folder'}</span>
            </h3>

            <input
              type="text"
              defaultValue={renamingTarget.name}
              onChange={(e) => setRenameInputValue(e.target.value)}
              placeholder="Enter new name..."
              className="w-full h-10 px-3 rounded-xl bg-[#161824] text-white text-xs border border-[#2e3146] outline-none focus:border-[#39ff14]"
              autoFocus
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRenamingTarget(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#8892b0] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (renameInputValue.trim()) {
                    if (renamingTarget.type === 'file') {
                      const targetM = macros.find((m) => m.id === renamingTarget.id);
                      if (targetM) {
                        onSaveMacro({ ...targetM, name: renameInputValue.trim() });
                      }
                    } else if (renamingTarget.type === 'folder') {
                      setCategories((prev) =>
                        prev.map((c) => (c === renamingTarget.id ? renameInputValue.trim() : c))
                      );
                    }
                    showStatus(isBn ? 'নাম সফলভাবে আপডেট করা হয়েছে!' : 'Renamed successfully!');
                  }
                  setRenamingTarget(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-[#39ff14] text-black font-black text-xs cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.3)]"
              >
                Save Name
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VS CODE STYLE RIGHT-CLICK CONTEXT MENU OVERLAY */}
      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-[999] w-56 rounded-xl bg-[#11121c] border border-[#27293d] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-xs text-[#cbd5e1] space-y-0.5 animate-in fade-in zoom-in-95 duration-100 font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.targetType === 'file' && (
            <>
              <button
                onClick={() => {
                  const m = macros.find((item) => item.id === contextMenu.targetId);
                  if (m) onExecuteMacro(m);
                  setContextMenu(null);
                }}
                className="w-full px-2.5 py-1.5 rounded hover:bg-[#1a1c2e] hover:text-[#39ff14] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-[#39ff14]" />
                  <span>{isBn ? 'কোড রান করুন' : 'Run Code'}</span>
                </span>
                <span className="text-[10px] font-mono text-[#64748b]">F5</span>
              </button>
              <div className="h-[1px] bg-[#1e2032] my-1" />
            </>
          )}

          {(contextMenu.targetType === 'folder' || contextMenu.targetType === 'root') && (
            <>
              <button
                onClick={() => {
                  setContextMenu(null);
                  const newM: MacroProfileItem = {
                    id: `macro_file_${Date.now()}`,
                    name: `Script_${macros.length + 1}.aim`,
                    category: (contextMenu.targetCategory || category) as any,
                    hotkey: 'F8',
                    isEnabled: true,
                    isExecuted: false,
                    tags: ['Custom'],
                    executionLayers: ['Macro Engine'],
                    descriptionEn: 'New custom macro file',
                    descriptionBn: 'নতুন কাস্টম ম্যাক্রো ফাইল',
                    usageGuideEn: '',
                    usageGuideBn: '',
                    inGameSettingsEn: '',
                    inGameSettingsBn: '',
                    developerGuideEn: '',
                    developerGuideBn: '',
                    codeScript: '{\n  "name": "New Script",\n  "recoilY": 2.0\n}',
                  };
                  onCreateNewMacro(newM);
                }}
                className="w-full px-2.5 py-1.5 rounded hover:bg-[#1a1c2e] hover:text-[#00e5ff] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FilePlus className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>{isBn ? 'নতুন ফাইল...' : 'New File...'}</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setContextMenu(null);
                  setIsAddingCategoryModal(true);
                }}
                className="w-full px-2.5 py-1.5 rounded hover:bg-[#1a1c2e] hover:text-[#ffd600] flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FolderPlus className="w-3.5 h-3.5 text-[#ffd600]" />
                  <span>{isBn ? 'নতুন ফোল্ডার...' : 'New Folder...'}</span>
                </span>
              </button>
              <div className="h-[1px] bg-[#1e2032] my-1" />
            </>
          )}

          <button
            onClick={() => {
              const path =
                contextMenu.targetType === 'file'
                  ? `C:\\OptiGamer\\Macros\\${contextMenu.targetCategory || 'combat'}\\${macros.find((m) => m.id === contextMenu.targetId)?.name || 'script.aim'}`
                  : `C:\\OptiGamer\\Macros\\${contextMenu.targetId}`;
              navigator.clipboard?.writeText(path);
              showStatus(isBn ? `এক্সপ্লোরার লোকেশন: ${path}` : `Revealed in File Explorer: ${path}`);
              setContextMenu(null);
            }}
            className="w-full px-2.5 py-1.5 rounded hover:bg-[#1a1c2e] hover:text-white flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span>{isBn ? 'ফাইল এক্সপ্লোরারে দেখুন' : 'Reveal in File Explorer'}</span>
            </span>
            <span className="text-[9px] font-mono text-[#64748b]">Shift+Alt+R</span>
          </button>

          <button
            onClick={() => {
              const path = `C:\\OptiGamer\\Macros\\${contextMenu.targetCategory || 'combat'}\\${macros.find((m) => m.id === contextMenu.targetId)?.name || 'script.aim'}`;
              navigator.clipboard?.writeText(path);
              showStatus(isBn ? 'পাথ কপি করা হয়েছে!' : 'Path copied to clipboard!');
              setContextMenu(null);
            }}
            className="w-full px-2.5 py-1.5 rounded hover:bg-[#1a1c2e] hover:text-white flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Copy className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span>{isBn ? 'কপি পাথ' : 'Copy Path'}</span>
            </span>
            <span className="text-[9px] font-mono text-[#64748b]">Shift+Alt+C</span>
          </button>

          <button
            onClick={() => {
              const relPath = `src/macros/${contextMenu.targetCategory || 'combat'}/${macros.find((m) => m.id === contextMenu.targetId)?.name || 'script.aim'}`;
              navigator.clipboard?.writeText(relPath);
              showStatus(isBn ? 'আপেক্ষিক পাথ কপি করা হয়েছে!' : 'Relative path copied!');
              setContextMenu(null);
            }}
            className="w-full px-2.5 py-1.5 rounded hover:bg-[#1a1c2e] hover:text-white flex items-center justify-between transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-[#94a3b8]" />
              <span>{isBn ? 'কপি রিলেটিভ পাথ' : 'Copy Relative Path'}</span>
            </span>
          </button>

          {contextMenu.targetType !== 'root' && (
            <>
              <div className="h-[1px] bg-[#1e2032] my-1" />
              <button
                onClick={() => {
                  const name =
                    contextMenu.targetType === 'file'
                      ? macros.find((m) => m.id === contextMenu.targetId)?.name || ''
                      : contextMenu.targetId;
                  setRenamingTarget({ id: contextMenu.targetId, name, type: contextMenu.targetType as 'file' | 'folder' });
                  setContextMenu(null);
                }}
                className="w-full px-2.5 py-1.5 rounded hover:bg-[#1a1c2e] hover:text-white flex items-center justify-between transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Edit2 className="w-3.5 h-3.5 text-[#00e5ff]" />
                  <span>{isBn ? 'নাম পরিবর্তন...' : 'Rename...'}</span>
                </span>
                <span className="text-[9px] font-mono text-[#64748b]">F2</span>
              </button>

              <button
                onClick={() => {
                  if (contextMenu.targetType === 'file') {
                    onDeleteMacro(contextMenu.targetId);
                    showStatus(isBn ? 'ফাইল ডিলিট করা হয়েছে' : 'File deleted');
                  } else if (contextMenu.targetType === 'folder') {
                    setCategories((prev) => prev.filter((c) => c !== contextMenu.targetId));
                    showStatus(isBn ? 'ফোল্ডার ডিলিট করা হয়েছে' : 'Folder deleted');
                  }
                  setContextMenu(null);
                }}
                className="w-full px-2.5 py-1.5 rounded hover:bg-[#381a1d] hover:text-[#ff4444] flex items-center justify-between transition-colors text-[#ff4444] cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ডিলিট করুন' : 'Delete'}</span>
                </span>
                <span className="text-[9px] font-mono text-[#64748b]">Del</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
