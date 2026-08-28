import React, { useState } from 'react';
import {
  Folder,
  FileCode,
  Download,
  Copy,
  Check,
  X,
  Laptop,
  Smartphone,
  ShieldCheck,
  Hash,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { MacroProfileItem } from '../types';

interface MacroFileExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  macro: MacroProfileItem | null;
  isBn?: boolean;
}

export const MacroFileExplorerModal: React.FC<MacroFileExplorerModalProps> = ({
  isOpen,
  onClose,
  macro,
  isBn = true,
}) => {
  const [copiedPath, setCopiedPath] = useState<boolean>(false);
  const [selectedOS, setSelectedOS] = useState<'windows' | 'android'>('windows');
  const [exportFormat, setExportFormat] = useState<'aim' | 'json' | 'lua' | 'cs'>('aim');

  if (!isOpen || !macro) return null;

  const winPath = `C:\\ProgramData\\SmartOptimizer\\v3.5\\Macros\\${macro.id}.aimscript`;
  const androidPath = `/sdcard/Android/data/com.smartoptimizer/files/macros/${macro.id}.json`;
  const currentPath = selectedOS === 'windows' ? winPath : androidPath;

  const handleCopyPath = () => {
    navigator.clipboard.writeText(currentPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleDownloadFile = () => {
    let content = macro.codeScript || '// Macro Script';
    let filename = `${macro.name.toLowerCase().replace(/\s+/g, '_')}.${exportFormat}`;

    if (exportFormat === 'json') {
      content = JSON.stringify(macro, null, 2);
    } else if (exportFormat === 'cs') {
      content = `// C# Roslyn Script for ${macro.name}\nusing System;\nusing SmartOptimizer.Input;\n\npublic class MacroScript {\n  public static void Run() {\n    // Code:\n    ${macro.codeScript}\n  }\n}`;
    } else if (exportFormat === 'lua') {
      content = `-- Lua Script for ${macro.name}\n-- Target: ${macro.inGameSettingsEn || 'Default'}\nfunction OnEvent(event, arg)\n    if event == "PROFILE_ACTIVATED" then\n        EnablePrimaryRecoil()\n    end\nend\n\n${macro.codeScript}`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate deterministic mock hash
  const mockHash = `sha256_${macro.id.slice(-6)}${macro.name.length}e9f4a18b7c3d2e1`;
  const fileSizeKb = (Math.max(1.2, (macro.codeScript?.length || 500) / 1024)).toFixed(2);

  return (
    <div className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#090b14] border-2 border-[#00e5ff] p-6 space-y-5 shadow-[0_0_50px_rgba(0,229,255,0.25)] text-white relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#181c2e]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#0d2836] text-[#00e5ff] border border-[#00e5ff]/40">
              <HardDrive className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wide flex items-center gap-2">
                <span>{macro.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#162136] text-[#00e5ff] border border-[#00e5ff]/30">
                  {macro.version || 'v1.0'}
                </span>
              </h3>
              <p className="text-xs text-[#8892b0]">
                {isBn
                  ? 'লোকাল পিসি/ডিভাইস ফাইল ডিরেক্টরি এবং এক্সপোর্ট ম্যানেজার'
                  : 'Local PC/Device File Directory & Export Manager'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#161829] hover:bg-[#252a45] text-[#8892b0] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* OS Selector Tabs */}
        <div className="flex items-center space-x-2 bg-[#101322] p-1.5 rounded-xl border border-[#1e233d]">
          <button
            onClick={() => setSelectedOS('windows')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              selectedOS === 'windows'
                ? 'bg-[#00e5ff] text-black shadow-md'
                : 'text-[#8892b0] hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Windows PC (P-Invoke Kernel)</span>
          </button>
          <button
            onClick={() => setSelectedOS('android')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              selectedOS === 'android'
                ? 'bg-[#39ff14] text-black shadow-md'
                : 'text-[#8892b0] hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android ADB (Direct IOCTL)</span>
          </button>
        </div>

        {/* File Directory Path Card */}
        <div className="p-3.5 rounded-xl bg-[#0f1220] border border-[#1f2640] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#8892b0]">
            <span className="flex items-center space-x-1.5">
              <Folder className="w-3.5 h-3.5 text-[#ffd600]" />
              <span>{isBn ? 'ইনস্টলড ফাইল লোকেশন (File Directory Path)' : 'Installed File Directory Path'}</span>
            </span>
            <button
              onClick={handleCopyPath}
              className="px-2 py-0.5 rounded bg-[#1c223a] hover:bg-[#2c355c] text-[#00e5ff] text-[10px] flex items-center space-x-1 cursor-pointer"
            >
              {copiedPath ? <Check className="w-3 h-3 text-[#39ff14]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedPath ? (isBn ? 'কপি হয়েছে!' : 'Copied!') : isBn ? 'পাথ কপি করুন' : 'Copy Path'}</span>
            </button>
          </div>

          <div className="p-2.5 rounded-lg bg-[#070912] font-mono text-xs text-[#39ff14] break-all border border-[#182138] select-all">
            {currentPath}
          </div>
        </div>

        {/* Metadata Specs Grid */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0d101c] border border-[#1d233d]">
            <span className="text-[10px] text-[#8892b0] block font-bold uppercase">
              {isBn ? 'ফাইল সাইজ' : 'File Size'}
            </span>
            <span className="font-mono font-black text-white">{fileSizeKb} KB</span>
          </div>

          <div className="p-3 rounded-xl bg-[#0d101c] border border-[#1d233d]">
            <span className="text-[10px] text-[#8892b0] block font-bold uppercase">
              {isBn ? 'অরিজিন স্টুডিও' : 'Origin Studio'}
            </span>
            <span className="font-bold text-[#ffd600] capitalize">
              {macro.originStudio || 'Code Editor'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0d101c] border border-[#1d233d]">
            <span className="text-[10px] text-[#8892b0] block font-bold uppercase">
              {isBn ? 'অ্যান্টি-চিট হ্যাশ' : 'Integrity Hash'}
            </span>
            <span className="font-mono text-[10px] text-[#39ff14] truncate block">{mockHash}</span>
          </div>
        </div>

        {/* Export & Download Section */}
        <div className="p-4 rounded-xl bg-[#101424] border border-[#202845] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <FileCode className="w-4 h-4 text-[#00e5ff]" />
              <span>{isBn ? 'পিসি এক্সপোর্ট ফরমেট সিলেক্ট করুন:' : 'Select Export File Extension:'}</span>
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'aim', label: '.aimscript (AimScript DSL)' },
              { id: 'json', label: '.json (Full Profile)' },
              { id: 'lua', label: '.lua (Logitech/Razer)' },
              { id: 'cs', label: '.cs (Roslyn C#)' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setExportFormat(fmt.id as any)}
                className={`py-2 px-2 rounded-xl text-[11px] font-bold font-mono transition-all cursor-pointer border ${
                  exportFormat === fmt.id
                    ? 'bg-[#00e5ff] text-black border-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                    : 'bg-[#151a2e] text-[#8892b0] border-[#202744] hover:text-white'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadFile}
            className="w-full py-2.5 rounded-xl bg-[#39ff14] hover:bg-[#32e010] text-black font-black text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(57,255,20,0.3)] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>
              {isBn
                ? `কম্পিউটারে এক্সপোর্ট ডাউনলোড করুন (${exportFormat.toUpperCase()})`
                : `Export File to Device (${exportFormat.toUpperCase()})`}
            </span>
          </button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-[#8892b0] pt-2 border-t border-[#181c2e]">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#39ff14]" />
            <span>{isBn ? 'ভার্চুয়াল ইনপুট স্প্রেড এনক্রিপ্টেড' : 'Protected by Kernel IOCTL Driver'}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#181c2e] hover:bg-[#252d4a] text-white font-bold cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
