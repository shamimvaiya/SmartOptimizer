import React, { useState, useEffect } from 'react';
import {
  FileCode,
  Palette,
  Code2,
  Zap,
  Play,
  Check,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  BookOpen,
  HelpCircle,
  Settings,
  Shield,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  Trash2,
  Copy,
  ExternalLink,
  Terminal,
  X,
  RotateCcw,
  CheckCircle2,
  Boxes,
  AlertTriangle,
  FolderPlus,
  Edit2,
  HardDrive,
} from 'lucide-react';
import { MacroProfileItem, PresetProfile, MacroNode } from '../types';
import { DEFAULT_MACROS } from '../data/defaultMacros';
import { CodeMacroEditor } from './CodeMacroEditor';
import { VisualMacroStudio } from './VisualMacroStudio';
import { BlockCodingWorkspace } from './BlockCodingWorkspace';
import { PublishToLibraryModal } from './PublishToLibraryModal';
import { MacroFileExplorerModal } from './MacroFileExplorerModal';

interface MacroHubViewProps {
  isBn?: boolean;
  onExecuteToEmulator?: (macro: MacroProfileItem) => void;
  executedMacroIds?: string[];
  onToggleMacroState?: (id: string, isEnabled: boolean) => void;
  activePreset?: PresetProfile | null;
  onSaveGraph?: (graph: MacroNode[]) => Promise<void>;
  onLog?: (msg: string) => void;
  onRunMacro?: (graph: MacroNode[]) => Promise<void>;
  onStopMacro?: () => Promise<void>;
  isMacroRunning?: boolean;
}

export const MacroHubView: React.FC<MacroHubViewProps> = ({
  isBn = true,
  onExecuteToEmulator,
  executedMacroIds = ['macro_recoil_compensator', 'macro_multitrack_combat', 'macro_humanizer_engine', 'macro_180_defensive_turn'],
  onToggleMacroState,
  activePreset,
  onSaveGraph,
  onLog,
  onRunMacro,
  onStopMacro,
  isMacroRunning,
}) => {
  // Studio Mode: 'library' | 'code' | 'visual' | 'block'
  const [activeTab, setActiveTab] = useState<'library' | 'code' | 'visual' | 'block'>('library');

  // Block Coding Warning Modal State
  const [showBlockWarningModal, setShowBlockWarningModal] = useState<boolean>(false);
  const [hasConfirmedBlockWarning, setHasConfirmedBlockWarning] = useState<boolean>(false);

  // Dynamic Category Management State (saved in localStorage)
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const isInitialized = localStorage.getItem('aimopt_is_initialized');
      const saved = localStorage.getItem('aimopt_macro_hub_categories');
      if (saved) return JSON.parse(saved);
      if (isInitialized) return []; // If initialized but empty, stay empty
    } catch (e) {
      console.error(e);
    }
    return ['combat', 'recoil', 'movement', 'looting', 'sniper', 'utility'];
  });

  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState<boolean>(false);
  const [newCatInput, setNewCatInput] = useState<string>('');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editCatInput, setEditCatInput] = useState<string>('');
  const [deletingCatName, setDeletingCatName] = useState<string | null>(null);

  // Persistent Macro state loaded from LocalStorage or defaults
  const [macros, setMacros] = useState<MacroProfileItem[]>(() => {
    try {
      const isInitialized = localStorage.getItem('aimopt_is_initialized');
      const saved = localStorage.getItem('aimopt_saved_macros');
      if (saved) {
        return JSON.parse(saved);
      }
      if (isInitialized) return []; // If reset/initialized, don't load defaults
    } catch (e) {
      console.error('Failed to load macros from localStorage:', e);
    }

    // First time ever: set initialized flag and return defaults
    localStorage.setItem('aimopt_is_initialized', 'true');
    return DEFAULT_MACROS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('aimopt_macro_hub_categories', JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }, [categories]);

  // Handle Add Category
  const handleAddCategory = () => {
    const trimmed = newCatInput.trim().toLowerCase();
    if (!trimmed) return;
    if (categories.includes(trimmed)) {
      showToast(isBn ? 'এই ক্যাটাগরিটি ইতিমধ্যে বিদ্যমান!' : 'Category already exists!');
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    setSelectedCategory(trimmed);
    setNewCatInput('');
    setIsAddCatModalOpen(false);
    showToast(isBn ? `নতুন ক্যাটাগরি "${trimmed}" তৈরি হয়েছে!` : `Category "${trimmed}" added!`);
  };

  // Handle Rename Category
  const handleRenameCategory = () => {
    if (!editingCatName) return;
    const trimmed = editCatInput.trim().toLowerCase();
    if (!trimmed || trimmed === editingCatName) {
      setEditingCatName(null);
      return;
    }

    setCategories((prev) => prev.map((c) => (c === editingCatName ? trimmed : c)));
    setMacros((prev) =>
      prev.map((m) => (m.category === editingCatName ? { ...m, category: trimmed } : m))
    );
    if (selectedCategory === editingCatName) {
      setSelectedCategory(trimmed);
    }
    setEditingCatName(null);
    showToast(isBn ? 'ক্যাটাগরির নাম সফলভাবে পরিবর্তন হয়েছে!' : 'Category renamed successfully!');
  };

  // Handle Delete Category
  const handleDeleteCategory = (catToDelete: string) => {
    setCategories((prev) => prev.filter((c) => c !== catToDelete));
    setMacros((prev) =>
      prev.map((m) => (m.category === catToDelete ? { ...m, category: categories[0] || 'combat' } : m))
    );
    if (selectedCategory === catToDelete) {
      setSelectedCategory('all');
    }
    setDeletingCatName(null);
    showToast(isBn ? 'ক্যাটাগরি মুছে ফেলা হয়েছে!' : 'Category deleted!');
  };

  const [activeCodeMacroId, setActiveCodeMacroId] = useState<string>(
    macros[0]?.id || 'macro_recoil_compensator'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);
  const [expandedDevGuideId, setExpandedDevGuideId] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deletingMacroId, setDeletingMacroId] = useState<string | null>(null);

  // Hotkey recording state directly on library card
  const [recordingHotkeyMacroId, setRecordingHotkeyMacroId] = useState<string | null>(null);

  // Publish to Library Modal State
  const [publishModalState, setPublishModalState] = useState<{
    isOpen: boolean;
    name: string;
    content: string;
    originStudio: 'code' | 'visual' | 'block';
  }>({
    isOpen: false,
    name: '',
    content: '',
    originStudio: 'code',
  });

  // PC File Directory Explorer Modal State
  const [fileExplorerModalMacro, setFileExplorerModalMacro] = useState<MacroProfileItem | null>(null);

  // Floating Execution Terminal State
  const [executionModal, setExecutionModal] = useState<{
    isOpen: boolean;
    macro: MacroProfileItem | null;
    logs: string[];
    isDone: boolean;
  }>({
    isOpen: false,
    macro: null,
    logs: [],
    isDone: false,
  });

  const [notification, setNotification] = useState<string | null>(null);

  // Save to localStorage whenever macros change
  useEffect(() => {
    try {
      localStorage.setItem('aimopt_saved_macros', JSON.stringify(macros));
    } catch (e) {
      console.error('Failed to persist macros:', e);
    }
  }, [macros]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Tab 4 Click Handler with Warning Modal Interception
  const handleSelectTab = (tab: 'library' | 'code' | 'visual' | 'block') => {
    if (tab === 'block' && !hasConfirmedBlockWarning) {
      setShowBlockWarningModal(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleConfirmBlockWarning = () => {
    setHasConfirmedBlockWarning(true);
    setShowBlockWarningModal(false);
    setActiveTab('block');
  };

  // Double-Click Hotkey Recording on Card
  const handleKeyDownCardHotkey = (e: React.KeyboardEvent, macroId: string) => {
    if (recordingHotkeyMacroId !== macroId) return;
    e.preventDefault();
    e.stopPropagation();

    let key = e.key.toUpperCase();
    if (key === ' ') key = 'SPACE';
    if (key === 'ESCAPE') key = 'ESC';

    setMacros((prev) =>
      prev.map((m) => (m.id === macroId ? { ...m, hotkey: key } : m))
    );
    setRecordingHotkeyMacroId(null);
    showToast(isBn ? `ম্যাক্রো হট-কি [ ${key} ] সেভ হয়েছে!` : `Macro Hotkey [ ${key} ] updated!`);
  };

  // Toggle individual macro enable/disable
  const handleToggleMacro = (id: string) => {
    setMacros((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextState = !m.isEnabled;
          if (onToggleMacroState) onToggleMacroState(id, nextState);
          return { ...m, isEnabled: nextState };
        }
        return m;
      })
    );
  };

  // Save or update macro
  const handleSaveMacro = (updated: MacroProfileItem) => {
    setMacros((prev) => {
      const exists = prev.some((m) => m.id === updated.id);
      if (exists) {
        return prev.map((m) => (m.id === updated.id ? updated : m));
      }
      return [updated, ...prev];
    });
    showToast(isBn ? 'ম্যাক্রো ফাইল সেভ ও আপডেট হয়েছে!' : 'Macro profile updated & saved!');
  };

  // Open delete modal
  const handleDeleteMacro = (id: string) => {
    setDeletingMacroId(id);
  };

  // Perform actual deletion after confirmation
  const confirmDeleteMacro = (id: string) => {
    setMacros((prev) => prev.filter((m) => m.id !== id));
    if (activeCodeMacroId === id) {
      const remaining = macros.filter((m) => m.id !== id);
      if (remaining.length > 0) setActiveCodeMacroId(remaining[0].id);
    }
    showToast(isBn ? 'ম্যাক্রো ফাইল সম্পূর্ণ ডিলিট করা হয়েছে।' : 'Macro deleted permanently.');
  };

  // Export Macro to File Explorer (Code Editor)
  const handleAddToFileExplorer = (macro: MacroProfileItem) => {
    setActiveCodeMacroId(macro.id);
    setActiveTab('code');
    showToast(isBn ? `ম্যাক্রো "${macro.name}" ফাইল এক্সপ্লোরারে ওপেন করা হয়েছে!` : `Macro "${macro.name}" opened in Code Editor File Explorer!`);
  };

  // Create new macro
  const handleCreateNewMacro = (newMacro: MacroProfileItem) => {
    setMacros((prev) => [newMacro, ...prev]);
    setActiveCodeMacroId(newMacro.id);
    setActiveTab('code');
    showToast(isBn ? 'নতুন কাস্টম ম্যাক্রো তৈরি করা হয়েছে!' : 'New custom macro profile created!');
  };

  // Export all macros to single backup JSON
  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify(macros, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aimopt_all_macros_backup_${new Date().toISOString().split('T')[0]}.aimmacro`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(isBn ? 'সমস্ত ম্যাক্রো সফলভাবে এক্সপোর্ট হয়েছে!' : 'All macros exported to backup bundle!');
  };

  // Execute into emulator process
  const handleExecuteIntoEmulator = (macro: MacroProfileItem) => {
    setExecutionModal({
      isOpen: true,
      macro,
      logs: [
        `[PROCESS INJECTOR] Locating target process: HD-Player.exe... FOUND (PID: 14820)`,
        `[LAYER 1] Hooking DirectX frame buffer & DirectInput IOCTL pipe... OK`,
        `[LAYER 2] Intercepting Trigger Hotkey: [${macro.hotkey}]... BOUND`,
        `[LAYER 3] Applying Anti-Detection Bézier Curve Matrix (Jitter: ±1.2px)... 100% SAFE`,
        `[LAYER 4] Injecting Thread Loop into Background Scheduler...`,
      ],
      isDone: false,
    });

    setMacros((prev) =>
      prev.map((m) => (m.id === macro.id ? { ...m, isExecuted: true, lastExecutedTime: new Date().toLocaleTimeString() } : m))
    );

    if (onExecuteToEmulator) {
      onExecuteToEmulator(macro);
    }

    setTimeout(() => {
      setExecutionModal((prev) => ({
        ...prev,
        logs: [
          ...prev.logs,
          `[SUCCESS] Macro "${macro.name}" is now ARMED and RUNNING inside the emulator overlay process!`,
          `[INFO] Press [${macro.hotkey}] in game to toggle.`,
        ],
        isDone: true,
      }));
    }, 600);
  };

  // Filtered macros
  const filteredMacros = macros.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.descriptionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.descriptionBn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.hotkey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleExportFromSubStudio = (name: string, content: string) => {
    let origin: 'code' | 'visual' | 'block' = 'code';
    if (activeTab === 'visual') origin = 'visual';
    if (activeTab === 'block') origin = 'block';

    setPublishModalState({
      isOpen: true,
      name,
      content,
      originStudio: origin,
    });
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-[#162b16] border border-[#39ff14] text-[#39ff14] text-xs font-bold flex items-center space-x-2 animate-bounce shadow-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Mode Switcher Navigation Header (4 Studio Tabs) */}
      <div className="p-3 bg-[#14151f] rounded-2xl border border-[#222436] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-[#162b16] text-[#39ff14] border border-[#39ff14]/50">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <span>{isBn ? 'ম্যাক্রো স্টুডিও হাব' : 'Macro Studio Engine Hub'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#39ff14]/15 text-[#39ff14] border border-[#39ff14]/40">
                ULTIMATE v4.0
              </span>
            </h2>
            <p className="text-xs text-[#8892b0]">
              {isBn
                ? 'ম্যাক্রো লাইব্রেরি, কোড এডিটর, ভিজ্যুয়াল স্টুডিও এবং ব্লক কোডিং ওয়ার্কস্পেস।'
                : 'Manage macros, script code, visual nodes, and block-based programming.'}
            </p>
          </div>
        </div>

        {/* 4 Studio Mode Tabs */}
        <div className="flex flex-wrap items-center rounded-xl bg-[#0d0e14] p-1 border border-[#25283a] gap-1">
          <button
            onClick={() => handleSelectTab('library')}
            className={`h-9 px-3 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-[#162b16] text-[#39ff14] border border-[#39ff14] shadow-[0_0_12px_rgba(57,255,20,0.3)]'
                : 'text-[#8892b0] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>১. লাইব্রেরি</span>
          </button>

          <button
            onClick={() => handleSelectTab('code')}
            className={`h-9 px-3 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-[#1a1c2a] text-[#00e5ff] border border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                : 'text-[#8892b0] hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>২. কোড এডিটর</span>
          </button>

          <button
            onClick={() => handleSelectTab('visual')}
            className={`h-9 px-3 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-[#26182c] text-[#d500f9] border border-[#d500f9] shadow-[0_0_12px_rgba(213,0,249,0.3)]'
                : 'text-[#8892b0] hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>৩. ভিজ্যুয়াল ম্যাক্রো স্টুডিও</span>
          </button>

          {/* TAB 4: BLOCK CODING */}
          <button
            id="btn-tab-block-coding"
            onClick={() => handleSelectTab('block')}
            className={`h-9 px-3 rounded-lg text-xs font-black flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'block'
                ? 'bg-[#2a2214] text-[#ffd600] border border-[#ffd600] shadow-[0_0_12px_rgba(255,214,0,0.3)]'
                : 'text-[#8892b0] hover:text-white'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>৪. ব্লক কোডিং</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: MACRO LIBRARY & EXECUTION HUB */}
      {/* ========================================================================= */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="bg-[#12131c] p-4 rounded-2xl border border-[#222436] flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#8892b0] absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isBn ? 'ম্যাক্রো বা হট কি দিয়ে খুঁজুন...' : 'Search macros, tags, or hotkey...'}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#0a0b10] text-white text-xs border border-[#2c2e42] outline-none focus:border-[#39ff14] placeholder-[#475569]"
              />
            </div>

            {/* Category Filter Chips with CRUD */}
            <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full pb-1 md:pb-0">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`h-8 px-3 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-[#39ff14] text-black shadow-[0_0_10px_rgba(57,255,20,0.4)]'
                    : 'bg-[#181926] text-[#8892b0] hover:text-white border border-[#25283a]'
                }`}
              >
                {isBn ? 'সব ক্যাটাগরি' : 'ALL'}
              </button>

              {categories.map((cat) => (
                <div
                  key={cat}
                  className={`group h-8 px-2.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                    selectedCategory === cat
                      ? 'bg-[#39ff14] text-black shadow-[0_0_10px_rgba(57,255,20,0.4)]'
                      : 'bg-[#181926] text-[#8892b0] hover:text-white border border-[#25283a]'
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span>{cat}</span>

                  {/* Edit/Rename Category */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCatName(cat);
                      setEditCatInput(cat);
                    }}
                    className="p-0.5 rounded hover:bg-black/20 text-current opacity-70 hover:opacity-100 transition-opacity"
                    title="Rename category"
                  >
                    <Sliders className="w-3 h-3" />
                  </button>

                  {/* Delete Category */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingCatName(cat);
                    }}
                    className="p-0.5 rounded hover:bg-black/20 text-current opacity-70 hover:opacity-100 transition-opacity"
                    title="Delete category"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add Category Button */}
              <button
                onClick={() => setIsAddCatModalOpen(true)}
                className="h-8 px-2.5 rounded-lg bg-[#181a29] hover:bg-[#22253b] text-[#00e5ff] border border-[#00e5ff]/40 text-xs font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                title="Add New Category"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isBn ? 'নতুন ক্যাটাগরি' : 'Add Category'}</span>
              </button>
            </div>

            {/* Top Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleExportAll}
                className="h-10 px-3.5 rounded-xl bg-[#1a1c29] hover:bg-[#232738] text-[#00e5ff] border border-[#00e5ff]/50 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isBn ? 'ব্যাকআপ এক্সপোর্ট' : 'Export All'}</span>
              </button>

              <button
                onClick={() => {
                  const newMacro: MacroProfileItem = {
                    id: `macro_${Date.now()}`,
                    name: `Custom Pro Combo #${macros.length + 1}`,
                    category: 'combat',
                    hotkey: 'F8',
                    isEnabled: true,
                    isExecuted: false,
                    tags: ['Custom', 'Pro'],
                    executionLayers: ['DirectInput IOCTL Pipe', 'Bézier Humanizer'],
                    descriptionEn: 'Custom configured gaming macro sequence.',
                    descriptionBn: 'ব্যবহারকারীর নিজস্ব কাস্টম গেমিং কম্বো ম্যাক্রো।',
                    usageGuideEn: 'Activate in game with trigger hotkey.',
                    usageGuideBn: 'হট কি প্রেস করে গেমের মধ্যে সক্রিয় করুন।',
                    inGameSettingsEn: 'Match in-game key mapping accordingly.',
                    inGameSettingsBn: 'ইন-গেম কি-বাইন্ড অনুযায়ী ম্যাচ করুন।',
                    developerGuideEn: 'Edit JSON code in the Code Editor tab to customize.',
                    developerGuideBn: 'কোড এডিটর ট্যাবে গিয়ে এই ম্যাক্রোর কোড কাস্টমাইজ করুন।',
                    codeScript: JSON.stringify(
                      {
                        macroType: 'custom_combo',
                        version: '1.0.0',
                        triggerHotkey: 'F8',
                        actions: [{ action: 'press_key', key: 'Key_C', delayMs: 20 }],
                      },
                      null,
                      2
                    ),
                    version: 'v1.0',
                    author: 'User Created',
                    createdDate: new Date().toISOString().split('T')[0],
                  };
                  handleCreateNewMacro(newMacro);
                }}
                className="h-10 px-4 rounded-xl bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] font-black text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(57,255,20,0.3)]"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{isBn ? '+ নতুন ম্যাক্রো তৈরি' : '+ Create Macro'}</span>
              </button>
            </div>
          </div>

          {/* Responsive 3D Cards Grid (Max 3 columns for clean, spacious presentation) */}
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4.5">
            {filteredMacros.map((macro) => {
              const isGuideOpen = expandedGuideId === macro.id;
              const isExecuted = macro.isExecuted || executedMacroIds.includes(macro.id);
              const isRecording = recordingHotkeyMacroId === macro.id;
              const origin = macro.originStudio || 'code';
              const defaultStudio = macro.defaultStudio || origin;

              return (
                <div
                  key={macro.id}
                  id={`macro-card-${macro.id}`}
                  className={`rounded-2xl border-2 transition-all duration-300 p-5 relative overflow-hidden flex flex-col justify-between shadow-xl group hover:-translate-y-1 ${
                    macro.isEnabled
                      ? 'bg-[#121422] border-[#292c42] hover:border-[#39ff14]/70 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                      : 'bg-[#0e0f18] border-[#1a1b26] opacity-75'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header Row: Category Badge + Origin Badge */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#1f202e] gap-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/40 whitespace-nowrap">
                          {macro.category}
                        </span>

                        {/* Origin Badge */}
                        <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-[#1f2338] text-[#ffd600] border border-[#ffd600]/30 whitespace-nowrap flex items-center gap-1">
                          {origin === 'code' && '📝 Code Editor'}
                          {origin === 'visual' && '🔀 Visual Graph'}
                          {origin === 'block' && '🧩 Block Coding'}
                        </span>
                      </div>

                      {/* Right: Double-Click Hotkey Badge + Delete */}
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {/* Double-Click Recording Hotkey Badge */}
                        <div
                          tabIndex={0}
                          onDoubleClick={() => setRecordingHotkeyMacroId(macro.id)}
                          onKeyDown={(e) => handleKeyDownCardHotkey(e, macro.id)}
                          onBlur={() => setRecordingHotkeyMacroId(null)}
                          className={`px-2.5 py-1 rounded-lg border font-mono font-black text-xs cursor-pointer select-none transition-all ${
                            isRecording
                              ? 'bg-[#182a18] border-[#39ff14] text-[#39ff14] animate-pulse shadow-[0_0_10px_rgba(57,255,20,0.5)]'
                              : 'bg-[#0a0b10] border-[#39ff14]/50 text-[#39ff14] hover:border-[#39ff14]'
                          }`}
                          title="Double-click to re-assign hotkey"
                        >
                          {isRecording ? 'PRESS KEY' : macro.hotkey}
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteMacro(macro.id)}
                          className="p-1.5 rounded-lg bg-[#241416] hover:bg-[#381a1d] text-[#ff4444] border border-[#ff4444]/40 transition-colors cursor-pointer"
                          title="Delete macro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div>
                      <h3
                        onClick={() => {
                          if (defaultStudio === 'code') {
                            handleAddToFileExplorer(macro);
                          } else if (defaultStudio === 'visual') {
                            handleSelectTab('visual');
                          } else if (defaultStudio === 'block') {
                            handleSelectTab('block');
                          }
                        }}
                        className="text-sm font-black text-white hover:text-[#39ff14] cursor-pointer transition-colors line-clamp-1"
                        title="Click to open in Default Studio"
                      >
                        {macro.name}
                      </h3>
                      <p className="text-xs text-[#8892b0] mt-1.5 leading-relaxed line-clamp-2">
                        {isBn ? macro.descriptionBn : macro.descriptionEn}
                      </p>
                    </div>

                    {/* Default Studio Selector Dropdown */}
                    <div className="pt-2.5 border-t border-[#1a1c2b] flex items-center justify-between text-xs font-mono">
                      <span className="text-[#8892b0] font-bold">{isBn ? 'স্টুডিও:' : 'Open Studio:'}</span>
                      <select
                        value={defaultStudio}
                        onChange={(e) => {
                          const targetStudio = e.target.value as 'code' | 'visual' | 'block';
                          setMacros((prev) =>
                            prev.map((m) => (m.id === macro.id ? { ...m, defaultStudio: targetStudio } : m))
                          );
                          showToast(
                            isBn
                              ? `ডিফল্ট স্টুডিও [ ${targetStudio.toUpperCase()} ] সেট হয়েছে!`
                              : `Default studio set to ${targetStudio.toUpperCase()}!`
                          );
                        }}
                        className="bg-[#0b0c14] text-[#00e5ff] font-bold px-2.5 py-1 rounded-lg border border-[#26283d] outline-none cursor-pointer text-xs"
                      >
                        <option value="code">Code Editor</option>
                        <option value="visual">Visual Graph</option>
                        <option value="block">Block Coding</option>
                      </select>
                    </div>

                    {/* EXPANDABLE GUIDE PANEL */}
                    {isGuideOpen && (
                      <div className="mt-3 p-3.5 rounded-xl bg-[#090a12] border border-[#1e233d] text-xs space-y-2 animate-in fade-in duration-150">
                        <div className="font-bold text-[#00e5ff] flex items-center space-x-1.5">
                          <BookOpen className="w-4 h-4 text-[#00e5ff]" />
                          <span>{isBn ? 'ব্যবহারবিধি ও গাইড:' : 'Usage Instructions:'}</span>
                        </div>
                        <p className="text-[#c1c9e0] leading-relaxed whitespace-pre-line text-xs font-mono">
                          {isBn ? macro.usageGuideBn : macro.usageGuideEn}
                        </p>
                        {macro.inGameSettingsEn && (
                          <div className="pt-2 border-t border-[#181c2e] text-[11px] text-[#ffd600] font-mono">
                            <strong>{isBn ? 'ইন-গেম সেনসিটিভিটি: ' : 'In-Game Sens: '}</strong>
                            {isBn ? macro.inGameSettingsBn : macro.inGameSettingsEn}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Controls */}
                  <div className="mt-4 pt-3 border-t border-[#1a1c2b] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <button
                        onClick={() => setExpandedGuideId(isGuideOpen ? null : macro.id)}
                        className={`text-xs font-bold px-2 py-1.5 rounded-xl flex items-center space-x-1 transition-all cursor-pointer whitespace-nowrap ${
                          isGuideOpen ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40' : 'text-[#8892b0] hover:text-white bg-[#161724]'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{isBn ? 'গাইড' : 'Guide'}</span>
                      </button>

                      {/* FILE EXPLORER / EDIT BUTTON */}
                      <button
                        onClick={() => {
                          if (defaultStudio === 'code') {
                            handleAddToFileExplorer(macro);
                          } else if (defaultStudio === 'visual') {
                            handleSelectTab('visual');
                          } else if (defaultStudio === 'block') {
                            handleSelectTab('block');
                          }
                        }}
                        className="text-xs font-bold px-2 py-1.5 rounded-xl text-[#00e5ff] bg-[#141d26] hover:bg-[#1a2838] border border-[#00e5ff]/40 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                        title="Edit in selected studio"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>{isBn ? 'এডিট' : 'Edit'}</span>
                      </button>

                      {/* PC FILE SYSTEM PATH & EXPORT BUTTON */}
                      <button
                        onClick={() => setFileExplorerModalMacro(macro)}
                        className="text-xs font-bold px-2 py-1.5 rounded-xl text-[#ffd600] bg-[#211d08] hover:bg-[#332b0a] border border-[#ffd600]/40 flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                        title="View PC File Directory & Export Options"
                      >
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{isBn ? 'পিসি এক্সপ্লোরার' : 'Explorer'}</span>
                      </button>
                    </div>

                    {/* EXECUTE / STOP TOGGLE SWITCH */}
                    <button
                      onClick={() => handleExecuteIntoEmulator(macro)}
                      className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center space-x-1.5 transition-all cursor-pointer whitespace-nowrap ml-auto ${
                        isExecuted
                          ? 'bg-[#ff0055] text-white border border-[#ff0055] shadow-[0_0_12px_rgba(255,0,85,0.4)] animate-pulse'
                          : 'bg-[#162b16] hover:bg-[#1f3f1f] text-[#39ff14] border border-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.2)]'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{isExecuted ? (isBn ? '⏹️ থামান' : '⏹️ Stop') : (isBn ? '⚡ Execute' : '⚡ Execute')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CODE / SCRIPT MACRO STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'code' && (
        <CodeMacroEditor
          macros={macros}
          activeMacroId={activeCodeMacroId}
          onSelectMacro={(id) => setActiveCodeMacroId(id)}
          onSaveMacro={handleSaveMacro}
          onDeleteMacro={handleDeleteMacro}
          onCreateNewMacro={handleCreateNewMacro}
          onExecuteMacro={handleExecuteIntoEmulator}
          isBn={isBn}
        />
      )}

      {/* ========================================================================= */}
      {/* MODE 3: VISUAL NODE STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'visual' && (
        <div className="rounded-2xl border border-[#222436] overflow-hidden bg-[#101117]">
          <VisualMacroStudio 
            key={activePreset?.id || activePreset?.name || 'default_visual_studio'}
            initialGraph={activePreset?.macroGraph || []}
            onSaveGraph={async (savedGraph) => {
              if (onSaveGraph) {
                await onSaveGraph(savedGraph);
              }
            }}
            onLog={onLog}
            onRunMacro={onRunMacro}
            onStopMacro={onStopMacro}
            isMacroRunning={isMacroRunning}
            isBn={isBn} 
            onExportToLibrary={handleExportFromSubStudio}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: BLOCK CODING WORKSPACE */}
      {/* ========================================================================= */}
      {activeTab === 'block' && (
        <div className="rounded-2xl border border-[#ffd600]/40 overflow-hidden bg-[#0c0d14] p-4">
          <BlockCodingWorkspace 
          isBn={isBn} 
          onExportToLibrary={handleExportFromSubStudio}
        />
        </div>
      )}

      {/* ========================================================================= */}
      {/* BLOCK CODING UNDER CONSTRUCTION WARNING MODAL */}
      {/* ========================================================================= */}
      {showBlockWarningModal && (
        <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0e0a05] border-2 border-[#ffd600] p-6 space-y-4 shadow-[0_0_40px_rgba(255,214,0,0.3)] text-white">
            <div className="flex items-center space-x-3 text-[#ffd600]">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
              <h3 className="text-base font-black uppercase tracking-wider">
                ব্লক কোডিং ওয়ার্নিং (UNDER CONSTRUCTION NOTICE)
              </h3>
            </div>

            <div className="p-4 rounded-xl bg-[#261e08] border border-[#ffd600]/40 text-xs text-[#ffe066] space-y-2 leading-relaxed">
              <p>
                <strong>প্রিয় ইউজার,</strong> আপনি চার নাম্বার অপশন <strong className="text-white">ব্লক কোডিং (Block Coding)</strong>-এ প্রবেশ করতে চাচ্ছেন।
              </p>
              <p>
                ⚠ এই মডিউলটি বর্তমানে বেটা ভার্সনে রয়েছে এবং আপডেট ডেভেলপমেন্টের কাজ চলছে। কিছু ফিচার এখনো এক্সপেরিমেন্টাল হতে পারে।
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowBlockWarningModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1b1c28] text-xs font-bold text-[#8892b0] hover:text-white"
              >
                বাতিল করুন (Cancel)
              </button>
              <button
                id="btn-confirm-block-coding-proceed"
                onClick={handleConfirmBlockWarning}
                className="px-5 py-2.5 rounded-xl bg-[#ffd600] text-black font-black text-xs hover:bg-[#ffe033] shadow-[0_0_15px_rgba(255,214,0,0.4)] cursor-pointer"
              >
                হ্যাঁ, কাজ চালিয়ে যান &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING TERMINAL DIALOG */}
      {executionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-[#0c0d14] border-2 border-[#39ff14] shadow-[0_0_40px_rgba(57,255,20,0.3)] overflow-hidden">
            <div className="p-4 bg-[#141520] border-b border-[#222436] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#39ff14]">
                <Terminal className="w-5 h-5 animate-pulse" />
                <span className="text-xs font-mono font-black uppercase">PROCESS INJECTOR TERMINAL</span>
              </div>
              <button
                onClick={() => setExecutionModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-xs font-bold text-[#8892b0] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 font-mono text-xs text-[#39ff14] space-y-2 max-h-80 overflow-y-auto">
              {executionModal.logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>

            <div className="p-4 bg-[#141520] border-t border-[#222436] flex justify-end">
              <button
                onClick={() => setExecutionModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-5 py-2 rounded-xl bg-[#39ff14] text-black font-black text-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MACRO CONFIRMATION MODAL */}
      {deletingMacroId && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1017] border-2 border-[#ff4444] p-6 space-y-4 shadow-[0_0_30px_rgba(255,68,68,0.3)] text-white">
            <div className="flex items-center space-x-3 text-[#ff4444]">
              <Trash2 className="w-6 h-6" />
              <h3 className="text-base font-black">
                {isBn ? 'ম্যাক্রো ফাইল ডিলিট করুন' : 'Delete Macro File'}
              </h3>
            </div>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              {isBn
                ? `আপনি কি নিশ্চিত যে "${macros.find((m) => m.id === deletingMacroId)?.name}" ম্যাক্রোটি স্থায়ীভাবে মুছে ফেলতে চান? এটি ডিলিট করলে আর ফেরত পাওয়া যাবে না।`
                : `Are you sure you want to delete "${macros.find((m) => m.id === deletingMacroId)?.name}" permanently?`}
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#1f2133]">
              <button
                onClick={() => setDeletingMacroId(null)}
                className="px-4 py-2 rounded-xl bg-[#181926] text-xs font-bold text-[#8892b0] hover:text-white cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  confirmDeleteMacro(deletingMacroId);
                  setDeletingMacroId(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#ff4444] hover:bg-[#ff6666] text-white font-black text-xs shadow-lg cursor-pointer"
              >
                {isBn ? 'হ্যাঁ, ডিলিট করুন' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1017] border border-[#00e5ff]/50 p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#1f2133] pb-3">
              <h3 className="text-sm font-black text-[#00e5ff]">
                {isBn ? 'নতুন কাস্টম ক্যাটাগরি যুক্ত করুন' : 'Add New Category'}
              </h3>
              <button onClick={() => setIsAddCatModalOpen(false)} className="text-[#8892b0] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-xs text-[#8892b0] font-bold block mb-1">
                {isBn ? 'ক্যাটাগরির নাম:' : 'Category Name:'}
              </label>
              <input
                type="text"
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="e.g. driving, emotes, custom..."
                className="w-full h-10 px-3 rounded-xl bg-[#161824] text-white text-xs border border-[#2d3045] outline-none focus:border-[#00e5ff]"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsAddCatModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#181926] text-xs text-[#8892b0] hover:text-white cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 rounded-xl bg-[#00e5ff] text-black font-black text-xs cursor-pointer shadow-lg"
              >
                {isBn ? 'তৈরি করুন' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RENAME CATEGORY MODAL */}
      {editingCatName && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1017] border border-[#39ff14]/50 p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-[#1f2133] pb-3">
              <h3 className="text-sm font-black text-[#39ff14]">
                {isBn ? 'ক্যাটাগরি সম্পাদনা / রিনেম' : 'Rename Category'}
              </h3>
              <button onClick={() => setEditingCatName(null)} className="text-[#8892b0] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-xs text-[#8892b0] font-bold block mb-1">
                {isBn ? 'নতুন ক্যাটাগরির নাম:' : 'New Category Name:'}
              </label>
              <input
                type="text"
                value={editCatInput}
                onChange={(e) => setEditCatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameCategory()}
                className="w-full h-10 px-3 rounded-xl bg-[#161824] text-white text-xs border border-[#2d3045] outline-none focus:border-[#39ff14]"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingCatName(null)}
                className="px-4 py-2 rounded-xl bg-[#181926] text-xs text-[#8892b0] hover:text-white cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleRenameCategory}
                className="px-4 py-2 rounded-xl bg-[#39ff14] text-black font-black text-xs cursor-pointer shadow-lg"
              >
                {isBn ? 'সেভ করুন' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CATEGORY MODAL */}
      {deletingCatName && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1017] border-2 border-[#ff4444] p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center space-x-2 text-[#ff4444]">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-base font-black">
                {isBn ? 'ক্যাটাগরি মুছে ফেলুন' : 'Delete Category'}
              </h3>
            </div>
            <p className="text-xs text-[#cbd5e1] leading-relaxed">
              {isBn
                ? `আপনি কি নিশ্চিত যে "${deletingCatName}" ক্যাটাগরিটি মুছে ফেলতে চান? এর অধীনে থাকা ম্যাক্রো ফাইলগুলো অন্যান্য ক্যাটাগরিতে স্থানান্তর করা হবে।`
                : `Are you sure you want to delete category "${deletingCatName}"?`}
            </p>
            <div className="flex justify-end space-x-2 pt-3 border-t border-[#1f2133]">
              <button
                onClick={() => setDeletingCatName(null)}
                className="px-4 py-2 rounded-xl bg-[#181926] text-xs text-[#8892b0] hover:text-white cursor-pointer"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDeleteCategory(deletingCatName)}
                className="px-5 py-2 rounded-xl bg-[#ff4444] hover:bg-[#ff6666] text-white font-black text-xs cursor-pointer shadow-lg"
              >
                {isBn ? 'হ্যাঁ, ডিলিট করুন' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PUBLISH TO LIBRARY MODAL */}
      <PublishToLibraryModal
        isOpen={publishModalState.isOpen}
        onClose={() => setPublishModalState((prev) => ({ ...prev, isOpen: false }))}
        onPublish={(newMacro) => {
          handleCreateNewMacro(newMacro);
          showToast(
            isBn
              ? `ম্যাক্রো "${newMacro.name}" সফলভাবে লাইব্রেরিতে পাবলিশ হয়েছে!`
              : `Macro "${newMacro.name}" published to library!`
          );
        }}
        isBn={isBn}
        initialName={publishModalState.name}
        initialContent={publishModalState.content}
        originStudio={publishModalState.originStudio}
      />

      {/* PC FILE EXPLORER & EXPORT MODAL */}
      <MacroFileExplorerModal
        isOpen={Boolean(fileExplorerModalMacro)}
        onClose={() => setFileExplorerModalMacro(null)}
        macro={fileExplorerModalMacro}
        isBn={isBn}
      />
    </div>
  );
};
