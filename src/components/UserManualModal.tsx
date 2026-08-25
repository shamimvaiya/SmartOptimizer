import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Keyboard,
  MousePointer,
  Sparkles,
  Layers,
  MapPin,
  FileCode,
  Zap,
  CheckCircle2,
  Cpu,
  Bookmark,
  Share2,
} from 'lucide-react';
import { Language } from '../i18n/translations';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  lang = 'bn',
}) => {
  const [activeSection, setActiveSection] = useState<'shortcuts' | 'canvas' | 'radar' | 'templates' | 'blocks' | 'faq'>('shortcuts');

  if (!isOpen) return null;

  const isBn = lang === 'bn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-[#0d1017] border-2 border-[#1f283d] rounded-2xl w-full max-w-4xl max-h-[88vh] shadow-[0_0_50px_rgba(57,255,20,0.2)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 px-6 bg-[#131622] border-b border-[#1f283d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#39ff14]/10 text-[#39ff14] border border-[#39ff14]/30 shadow-[0_0_12px_rgba(57,255,20,0.2)]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>{isBn ? 'ইউজার ম্যানুয়াল ও কীবোর্ড শর্টকাট গাইড' : 'User Manual & Shortcuts Guide'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#162b16] text-[#39ff14] border border-[#39ff14]/50 font-mono">
                  v3.0 PRO
                </span>
              </h3>
              <p className="text-xs text-[#8892b0]">
                {isBn
                  ? 'সব ধরণের শর্টকাট কি, গ্রাফ নেভিগেশন, রাডার মিনিম্যাপ ও টেমপ্লেট ব্যবহারের সহজ নির্দেশিকা।'
                  : 'Master all keyboard shortcuts, graph navigation, radar minimap controls, and template workflows.'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#1a1d2b] hover:bg-[#252a3d] text-[#8892b0] hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 bg-[#090b10] border-b border-[#1f283d] flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setActiveSection('shortcuts')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'shortcuts'
                ? 'bg-[#39ff14] text-black shadow-[0_0_10px_rgba(57,255,20,0.3)]'
                : 'bg-[#141824] text-[#8892b0] hover:text-white border border-[#1f283d]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{isBn ? 'কীবোর্ড ও মাউস শর্টকাট' : 'Shortcuts Matrix'}</span>
          </button>

          <button
            onClick={() => setActiveSection('canvas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'canvas'
                ? 'bg-[#00e5ff] text-black shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                : 'bg-[#141824] text-[#8892b0] hover:text-white border border-[#1f283d]'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>{isBn ? 'ক্যানভাস ও নোড গ্রাফ' : 'Canvas & Graph'}</span>
          </button>

          <button
            onClick={() => setActiveSection('radar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'radar'
                ? 'bg-[#d500f9] text-white shadow-[0_0_10px_rgba(213,0,249,0.3)]'
                : 'bg-[#141824] text-[#8892b0] hover:text-white border border-[#1f283d]'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{isBn ? 'রাডার মিনিম্যাপ নেভিগেশন' : 'Radar Minimap'}</span>
          </button>

          <button
            onClick={() => setActiveSection('templates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'templates'
                ? 'bg-[#ffd600] text-black shadow-[0_0_10px_rgba(255,214,0,0.3)]'
                : 'bg-[#141824] text-[#8892b0] hover:text-white border border-[#1f283d]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isBn ? 'কাস্টম টেমপ্লেট ও ব্যাকআপ' : 'Templates & Backup'}</span>
          </button>

          <button
            onClick={() => setActiveSection('blocks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'blocks'
                ? 'bg-[#ff007f] text-white shadow-[0_0_10px_rgba(255,0,127,0.3)]'
                : 'bg-[#141824] text-[#8892b0] hover:text-white border border-[#1f283d]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{isBn ? 'ব্লক কোডিং ও সি#' : 'Block Coding & C#'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm text-[#ccd6f6] bg-[#0c0e15]">
          {/* Section: Shortcuts Matrix */}
          {activeSection === 'shortcuts' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#39ff14]" />
                <span>{isBn ? 'গুরুত্বপূর্ণ কীবোর্ড শর্টকাট তালিকা' : 'Key Shortcuts Cheat-Sheet'}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    key: 'Ctrl + D',
                    label: isBn ? 'নোড ডুপ্লিকেট (Clone)' : 'Duplicate Node(s)',
                    desc: isBn
                      ? 'সিলেক্টেড নোডটি অবিকল ক্লোন করে ক্যানভাসে বসাবে।'
                      : 'Instantly clones and offsets selected node(s) with identical parameters.',
                    color: '#00e5ff',
                  },
                  {
                    key: 'Ctrl + Z',
                    label: isBn ? 'আনডু (Undo)' : 'Undo Action',
                    desc: isBn
                      ? 'ভুলবশত নোড মুছে গেলে বা কোনো ভুল হলে আগের অবস্থায় ফিরবে।'
                      : 'Reverts the previous node creation, wire deletion, or canvas change.',
                    color: '#39ff14',
                  },
                  {
                    key: 'Ctrl + Y / Ctrl+Shift+Z',
                    label: isBn ? 'রিডু (Redo)' : 'Redo Action',
                    desc: isBn
                      ? 'পূর্ববর্তী আনডু করা অ্যাকশন পুনরায় ফিরিয়ে আনবে।'
                      : 'Restores the next action state in your history stack.',
                    color: '#39ff14',
                  },
                  {
                    key: 'Delete / Backspace',
                    label: isBn ? 'নোড ডিলিট' : 'Delete Selected',
                    desc: isBn
                      ? 'সিলেক্ট করা নোড(গুলো) ক্যানভাস থেকে মুছে ফেলবে।'
                      : 'Permanently removes the selected nodes and connected links.',
                    color: '#ff4444',
                  },
                  {
                    key: isBn ? 'লেফট / রাইট ক্লিক ড্র্যাগ' : 'Left / Right Click Drag',
                    label: isBn ? 'ক্যানভাস মুভ (Pan)' : 'Canvas Pan Drag',
                    desc: isBn
                      ? 'ক্যানভাসের ফাঁকা অংশে যেকোনো বাটনে ক্লিক করে টেনে এদিক-সেদিক সরান।'
                      : 'Click and drag on any empty canvas area with left or right mouse button.',
                    color: '#ffd600',
                  },
                  {
                    key: 'Ctrl + Scroll',
                    label: isBn ? 'ক্যানভাস জুম (Zoom In/Out)' : 'Canvas Zoom',
                    desc: isBn
                      ? 'ক্যানভাস বড় বা ছোট (৩০% থেকে ২৫০% পর্যন্ত) জুম করতে পারবেন।'
                      : 'Zoom smoothly between 30% and 250% camera scale.',
                    color: '#d500f9',
                  },
                  {
                    key: 'HOME / ESC',
                    label: isBn ? 'ইন-গেম স্টিলথ HUD টগল' : 'Stealth HUD Overlay Hotkey',
                    desc: isBn
                      ? 'গেম খেলার সময় ব্যাকগ্রাউন্ড থেকে স্বচ্ছ ওভারলে চালু বা বন্ধ করা।'
                      : 'Toggles the frameless transparent HUD overlay on top of full-screen games.',
                    color: '#00e5ff',
                  },
                  {
                    key: 'Shift + Click',
                    label: isBn ? 'মাল্টি-সিলেকশন' : 'Multi-Node Selection',
                    desc: isBn
                      ? 'একসাথে একাধিক নোড সিলেক্ট করতে Shift চেপে ক্লিক করুন।'
                      : 'Select multiple action nodes simultaneously for batch move or clone.',
                    color: '#39ff14',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#141824] border border-[#1f283d] flex flex-col justify-between hover:border-[#39ff14]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-xs">{item.label}</span>
                      <kbd
                        className="px-2 py-0.5 rounded font-mono text-[11px] font-extrabold border"
                        style={{
                          backgroundColor: `${item.color}15`,
                          color: item.color,
                          borderColor: `${item.color}50`,
                        }}
                      >
                        {item.key}
                      </kbd>
                    </div>
                    <p className="text-xs text-[#8892b0]">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Canvas & Node Graph */}
          {activeSection === 'canvas' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-[#00e5ff]" />
                <span>{isBn ? 'ভিজুয়াল নোড গ্রাফ কিভাবে কাজ করে?' : 'How Visual Node Graph Works'}</span>
              </h4>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#141824] border border-[#1f283d] space-y-2">
                  <div className="font-bold text-[#00e5ff] text-xs uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
                    <span>{isBn ? '১. নোড যোগ ও প্যারামিটার সেট' : '1. Adding Nodes & Configuring Parameters'}</span>
                  </div>
                  <p className="text-xs text-[#8892b0] leading-relaxed">
                    {isBn
                      ? 'বাম পাশের অথবা উপরের অ্যাকশন প্যালেট থেকে যেকোনো নোড (যেমন: Search Color, Move Mouse, Click Mouse, Delay) ক্লিক করলে ক্যানভাসে নোড যুক্ত হবে। নোড কার্ডের ইনপুট ফিল্ডে সরাসরি সংখ্যা বা কালার কোড লিখুন।'
                      : 'Click any action block from the top/left palette to place it on canvas. Enter target coordinates, HEX color, delay duration, or keys directly into the node inputs.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141824] border border-[#1f283d] space-y-2">
                  <div className="font-bold text-[#00e5ff] text-xs uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
                    <span>{isBn ? '২. তার বা সংযোগ স্থাপন (Wiring Connections)' : '2. Connecting Wires Between Nodes'}</span>
                  </div>
                  <p className="text-xs text-[#8892b0] leading-relaxed">
                    {isBn
                      ? 'একটি নোড থেকে পরবর্তী নোডে এক্সিকিউশন অর্ডার তৈরি করতে টপ বারের Connect বাটন অথবা নোডের লিঙ্কিং আইকনে ক্লিক করে সোর্স নোড থেকে টার্গেট নোডটিতে ক্লিক করুন। নিয়ন সংযোগ রেখা তৈরি হবে।'
                      : 'Click the Link icon on a source node, then click the destination node to connect a neon execution wire.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#141824] border border-[#1f283d] space-y-2">
                  <div className="font-bold text-[#00e5ff] text-xs uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#39ff14]" />
                    <span>{isBn ? '৩. ফ্রি মুভ ও স্ন্যাপ গ্রিড' : '3. Free Movement & Snap-to-Grid'}</span>
                  </div>
                  <p className="text-xs text-[#8892b0] leading-relaxed">
                    {isBn
                      ? 'ক্যানভাসের যেকোনো ফাঁকা অংশে মাউসের রাইট বা লেফট ক্লিক করে টেনে ক্যানভাস সরান। Snap to Grid অপশন চালু রাখলে নোডগুলো সমান দূরত্বে সুন্দরভাবে বিন্যস্ত থাকবে।'
                      : 'Drag with left or right click on empty canvas to pan around. Toggle "Snap to Grid" for aligned wire routing.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Radar Minimap */}
          {activeSection === 'radar' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d500f9]" />
                <span>{isBn ? 'রাডার মিনিম্যাপ নেভিগেশন গাইড' : 'Interactive Radar Minimap Navigation'}</span>
              </h4>

              <div className="p-4 rounded-xl bg-[#141824] border border-[#1f283d] space-y-3">
                <p className="text-xs text-[#8892b0] leading-relaxed">
                  {isBn
                    ? 'ক্যানভাসের নিচে অবস্থিত রাডার মিনিম্যাপ আপনাকে পুরো গ্রাফের প্রতিটি নোড ও ক্যামেরা ভিউপোর্টের অবস্থান দেখায়।'
                    : 'The floating Radar HUD at the bottom-right of the graph tracks all nodes and the live viewport camera box in real time.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-[#0e111a] border border-[#1f283d]">
                    <div className="text-[#39ff14] font-bold text-xs mb-1">
                      {isBn ? 'এক ক্লিকে জাম্প' : 'Instant Click to Jump'}
                    </div>
                    <p className="text-[11px] text-[#8892b0]">
                      {isBn
                        ? 'রাডারের যেকোনো জায়গায় ক্লিক করলেই ক্যানভাসের ক্যামেরা সরাসরি সেখানে চলে যাবে।'
                        : 'Clicking anywhere inside the radar instantly shifts the main canvas viewport.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0e111a] border border-[#1f283d]">
                    <div className="text-[#00e5ff] font-bold text-xs mb-1">
                      {isBn ? 'ড্র্যাগ করে নেভিগেশন' : 'Drag to Pan Real-Time'}
                    </div>
                    <p className="text-[11px] text-[#8892b0]">
                      {isBn
                        ? 'রাডারের সবুজ ক্যামেরা বক্সে ক্লিক করে টেনে পুরো ক্যানভাস সহজে প্যান করতে পারবেন।'
                        : 'Click and drag on the green radar box to smoothly steer the canvas.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Templates & Backup */}
          {activeSection === 'templates' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#ffd600]" />
                <span>{isBn ? 'কাস্টম টেমপ্লেট সেভ, এক্সপোর্ট ও ইমপোর্ট' : 'Custom Templates & Backup Guide'}</span>
              </h4>

              <div className="p-4 rounded-xl bg-[#141824] border border-[#1f283d] space-y-3">
                <p className="text-xs text-[#8892b0] leading-relaxed">
                  {isBn
                    ? 'আপনি নিজের তৈরিকৃত যেকোনো গ্রাফ পরবর্তীতে ব্যবহারের জন্য অথবা বন্ধুদের সাথে শেয়ার করার জন্য টেমপ্লেট লাইব্রেরিতে সেভ বা এক্সপোর্ট করতে পারেন।'
                    : 'Save any customized node graph sequence to your local template library, or export as standalone JSON to share with teammates.'}
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-start space-x-2 text-xs text-[#ccd6f6]">
                    <span className="w-5 h-5 rounded-full bg-[#ffd600]/20 text-[#ffd600] font-mono font-bold flex items-center justify-center shrink-0">
                      1
                    </span>
                    <span>
                      {isBn
                        ? 'টপ টুলবারের Templates বাটনে ক্লিক করুন।'
                        : 'Click the "Templates" button on the top toolbar.'}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2 text-xs text-[#ccd6f6]">
                    <span className="w-5 h-5 rounded-full bg-[#ffd600]/20 text-[#ffd600] font-mono font-bold flex items-center justify-center shrink-0">
                      2
                    </span>
                    <span>
                      {isBn
                        ? '"+ বর্তমান গ্রাফ টেমপ্লেট হিসেবে সেভ করুন" বাটনে চাপ দিয়ে নাম ও ক্যাটাগরি লিখুন।'
                        : 'Click "+ Save Graph as Template", provide a title, category, and description.'}
                    </span>
                  </div>
                  <div className="flex items-start space-x-2 text-xs text-[#ccd6f6]">
                    <span className="w-5 h-5 rounded-full bg-[#ffd600]/20 text-[#ffd600] font-mono font-bold flex items-center justify-center shrink-0">
                      3
                    </span>
                    <span>
                      {isBn
                        ? 'প্রয়োজনমতো "Export All (.json)" অথবা ফাইল থেকে "Import (.json)" করতে পারবেন।'
                        : 'Use "Export All (.json)" for safe local backups or "Import Templates" to restore.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Block Coding & C# */}
          {activeSection === 'blocks' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#ff007f]" />
                <span>{isBn ? 'ব্লক কোডিং ও সি# ডটনেট ৮ কোড জেনারেশন' : 'Block Coding & Native C# Export'}</span>
              </h4>

              <div className="p-4 rounded-xl bg-[#141824] border border-[#1f283d] space-y-3 text-xs text-[#8892b0] leading-relaxed">
                <p>
                  {isBn
                    ? '১. Block Coding Mode: স্ক্র্যাচ (Scratch) স্টাইলের ড্র্যাগ-এন্ড-ড্রপ ব্লক দিয়ে কোড লিখুন। নোড গ্রাফ ও ব্লক কোড স্বয়ংক্রিয়ভাবে সিঙ্ক থাকে।'
                    : '1. Block Coding Mode provides a clean, Scratch-like linear workflow that stays in 1:1 real-time synchronization with the visual node graph.'}
                </p>
                <p>
                  {isBn
                    ? '২. C# .NET 8 Transpiled: আপনার সাজানো নোড গ্রাফ থেকে স্বয়ংক্রিয়ভাবে হাই-পারফরম্যান্স মাল্টি-থ্রেডেড C# কোড জেনারেট হয় যা Visual Studio বা Rider-এ কম্পাইল করা যায়।'
                    : '2. C# .NET 8 Transpiler produces production-ready WPF C# code with DirectWrite hardware acceleration, P/Invoke mouse events, and low-level kernel drivers.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#131622] border-t border-[#1f283d] flex items-center justify-between">
          <div className="text-xs text-[#8892b0]">
            {isBn ? 'সাহায্য প্রয়োজন হলে প্রশ্নবোধক (?) আইকনে ক্লিক করুন' : 'Click the (?) icon anytime to reopen this guide'}
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#39ff14] hover:bg-[#32e012] text-black font-extrabold text-xs transition-all cursor-pointer shadow-[0_0_12px_rgba(57,255,20,0.3)] hover:scale-105"
          >
            {isBn ? 'বুঝতে পেরেছি' : 'Got it!'}
          </button>
        </div>
      </div>
    </div>
  );
};
