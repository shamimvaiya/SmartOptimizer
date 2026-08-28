import React, { useState } from 'react';
import {
  Sparkles,
  X,
  FileCode,
  Shield,
  Zap,
  Sliders,
  CheckCircle2,
  BookOpen,
  FolderPlus,
} from 'lucide-react';
import { MacroProfileItem } from '../types';

interface PublishToLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (macro: MacroProfileItem) => void;
  isBn?: boolean;
  initialName?: string;
  initialContent?: string;
  originStudio?: 'code' | 'visual' | 'block';
}

export const PublishToLibraryModal: React.FC<PublishToLibraryModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  isBn = true,
  initialName = 'New Custom Macro',
  initialContent = '',
  originStudio = 'code',
}) => {
  const [name, setName] = useState<string>(initialName);
  const [category, setCategory] = useState<'combat' | 'movement' | 'recoil' | 'utility' | 'custom'>('combat');
  const [version, setVersion] = useState<string>('v1.0');
  const [hotkey, setHotkey] = useState<string>('F10');
  const [defaultStudio, setDefaultStudio] = useState<'code' | 'visual' | 'block'>(originStudio);
  const [useAutoGuide, setUseAutoGuide] = useState<boolean>(true);
  const [customGuideEn, setCustomGuideEn] = useState<string>('');
  const [customGuideBn, setCustomGuideBn] = useState<string>('');
  const [inGameSens, setInGameSens] = useState<string>('Sens: 45%, Recoil Scale: 1.25x');

  if (!isOpen) return null;

  const handleConfirmPublish = () => {
    const finalName = name.trim() || 'Untitled Macro';

    // Auto-generate guide if enabled or blank
    const autoEn = `1. Trigger Key: Hold or press [ ${hotkey} ] in game.\n2. In-Game Settings: ${inGameSens}.\n3. Anti-Detection: Dynamic Bézier Curve Smoothing matrix enabled.`;
    const autoBn = `১. ট্রিগার কি: গেমের ভেতর [ ${hotkey} ] প্রেস করে হোল্ড রাখুন।\n২. ইন-গেম সেনসিটিভিটি: ${inGameSens}।\n৩. অ্যান্টি-ডিটেকশন: ডাইনামিক বেজিয়ার কার্ভ স্মুথিং ম্যাট্রিক্স সক্রিয় রয়েছে।`;

    const newMacro: MacroProfileItem = {
      id: `macro_pub_${Date.now()}`,
      name: finalName,
      category,
      hotkey,
      isEnabled: true,
      isExecuted: false,
      tags: ['Published', originStudio.toUpperCase(), category.toUpperCase()],
      executionLayers: ['DirectInput IOCTL Pipe', 'Bézier Humanizer'],
      descriptionEn: `Custom ${category} macro published from ${originStudio} studio.`,
      descriptionBn: `${originStudio} স্টুডিও থেকে পাবলিশ করা কাস্টম ${category} ম্যাক্রো।`,
      usageGuideEn: useAutoGuide || !customGuideEn ? autoEn : customGuideEn,
      usageGuideBn: useAutoGuide || !customGuideBn ? autoBn : customGuideBn,
      inGameSettingsEn: inGameSens,
      inGameSettingsBn: inGameSens,
      developerGuideEn: `Script generated in ${originStudio} editor.`,
      developerGuideBn: `${originStudio} এডিটরে স্ক্রিপ্ট তৈরি হয়েছে।`,
      codeScript: initialContent || '// Custom Macro Logic Script',
      version,
      author: 'User Author',
      createdDate: new Date().toISOString().split('T')[0],
      originStudio,
      defaultStudio,
    };

    onPublish(newMacro);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#0b0c16] border-2 border-[#39ff14] p-6 space-y-5 shadow-[0_0_50px_rgba(57,255,20,0.3)] text-white relative overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1f2135]">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#162b16] text-[#39ff14] border border-[#39ff14]/50">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide">
                {isBn ? '🚀 পাবলিশ টু ম্যাক্রো লাইব্রেরি (Publish Modal)' : '🚀 Publish to Macro Library'}
              </h3>
              <p className="text-xs text-[#8892b0]">
                {isBn
                  ? 'লাইব্রেরিতে যুক্ত করার আগে ম্যাক্রোর গাইড ও কনফিগারেশন সেট করুন'
                  : 'Configure macro parameters before saving to shared library'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#161726] hover:bg-[#25283f] text-[#8892b0] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs Form */}
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 no-scrollbar text-xs">
          {/* Row 1: Name & Version */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <label className="font-bold text-[#8892b0] uppercase tracking-wider text-[10px]">
                {isBn ? 'ম্যাক্রোর নাম (Macro Name)' : 'Macro Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. AKM Super Recoil Lock"
                className="w-full px-3 py-2 rounded-xl bg-[#121320] border border-[#23263b] text-white focus:border-[#39ff14] outline-none font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-[#8892b0] uppercase tracking-wider text-[10px]">
                {isBn ? 'ভার্সন' : 'Version'}
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#121320] border border-[#23263b] text-[#00e5ff] font-mono font-bold outline-none"
              />
            </div>
          </div>

          {/* Row 2: Category, Hotkey & Default Open Studio */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-[#8892b0] uppercase tracking-wider text-[10px]">
                {isBn ? 'ক্যাটাগরি' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#121320] border border-[#23263b] text-white outline-none cursor-pointer"
              >
                <option value="combat">Combat (কমব্যাট)</option>
                <option value="recoil">Recoil (রিকয়েল)</option>
                <option value="movement">Movement (মুভমেন্ট)</option>
                <option value="utility">Utility (ইউটিলিটি)</option>
                <option value="custom">Custom (কাস্টম)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#8892b0] uppercase tracking-wider text-[10px]">
                {isBn ? 'ট্রিগার হটকি' : 'Trigger Hotkey'}
              </label>
              <input
                type="text"
                value={hotkey}
                onChange={(e) => setHotkey(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-[#121320] border border-[#23263b] text-[#39ff14] font-mono font-black uppercase outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#8892b0] uppercase tracking-wider text-[10px]">
                {isBn ? 'ডিফল্ট স্টুডিও' : 'Default Studio'}
              </label>
              <select
                value={defaultStudio}
                onChange={(e) => setDefaultStudio(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-[#121320] border border-[#23263b] text-[#ffd600] font-bold outline-none cursor-pointer"
              >
                <option value="code">📝 Code Editor</option>
                <option value="visual">🔀 Visual Graph</option>
                <option value="block">🧩 Block Coding</option>
              </select>
            </div>
          </div>

          {/* Row 3: In-Game Recommended Sensitivity */}
          <div className="space-y-1">
            <label className="font-bold text-[#8892b0] uppercase tracking-wider text-[10px]">
              {isBn ? 'ইন-গেম সেনসিটিভিটি টিউনিং' : 'In-Game Sensitivity Recommendation'}
            </label>
            <input
              type="text"
              value={inGameSens}
              onChange={(e) => setInGameSens(e.target.value)}
              placeholder="e.g. Red Dot: 40%, Vertical Multiplier: 1.2x"
              className="w-full px-3 py-2 rounded-xl bg-[#121320] border border-[#23263b] text-[#00e5ff] font-mono text-xs outline-none"
            />
          </div>

          {/* Auto Guide Generator Toggle */}
          <div className="p-3 rounded-xl bg-[#151726] border border-[#262840] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#ffd600] animate-pulse" />
              <div>
                <span className="font-bold text-white block">
                  {isBn ? 'স্মার্ট অটো-গাইড জেনারেটর (Smart Auto Guide)' : 'Smart Auto-Guide Generator'}
                </span>
                <span className="text-[10px] text-[#8892b0]">
                  {isBn ? 'হটকি এবং সেনসিটিভিটির ওপর ভিত্তি করে গাইড স্বয়ংক্রিয় তৈরি হবে' : 'Automatically builds usage guide instructions'}
                </span>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useAutoGuide}
                onChange={(e) => setUseAutoGuide(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#272a3d] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#39ff14]"></div>
            </label>
          </div>

          {/* Manual Usage Guide Textarea if Auto Guide is OFF */}
          {!useAutoGuide && (
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="font-bold text-[#8892b0] text-[10px]">
                  {isBn ? 'কাস্টম ব্যবহার বিধি (বাংলা)' : 'Custom Usage Guide (Bengali)'}
                </label>
                <textarea
                  rows={2}
                  value={customGuideBn}
                  onChange={(e) => setCustomGuideBn(e.target.value)}
                  placeholder="গেমের নিয়মাবলী লিখুন..."
                  className="w-full p-2.5 rounded-xl bg-[#121320] border border-[#23263b] text-white text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#8892b0] text-[10px]">
                  {isBn ? 'Custom Usage Guide (English)' : 'Custom Usage Guide (English)'}
                </label>
                <textarea
                  rows={2}
                  value={customGuideEn}
                  onChange={(e) => setCustomGuideEn(e.target.value)}
                  placeholder="Write step by step usage instructions..."
                  className="w-full p-2.5 rounded-xl bg-[#121320] border border-[#23263b] text-white text-xs outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#1f2135]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#161726] text-xs font-bold text-[#8892b0] hover:text-white cursor-pointer"
          >
            {isBn ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            onClick={handleConfirmPublish}
            className="px-5 py-2 rounded-xl bg-[#39ff14] hover:bg-[#2de00b] text-black font-black text-xs flex items-center space-x-1.5 cursor-pointer shadow-[0_0_15px_rgba(57,255,20,0.4)]"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isBn ? 'পাবলিশ করুন (Publish)' : 'Publish Macro'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
