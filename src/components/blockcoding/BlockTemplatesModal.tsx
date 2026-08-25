import React from 'react';
import {
  Sparkles,
  X,
  Crosshair,
  Zap,
  Smartphone,
  Repeat,
  ShieldAlert,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { BlockNode } from '../../types';
import { BLOCK_CATALOG, createBlockInstance } from '../../data/blockCatalog';

interface TemplateOption {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  generateBlocks: () => BlockNode[];
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'tpl_aim_trigger',
    name: 'Aim Assist & Triggerbot',
    category: 'Vision & Input',
    description: 'Scans target visual bounding box for target color and executes humanized micro-click.',
    icon: <Crosshair className="w-5 h-5 text-emerald-400" />,
    color: '#00e676',
    generateBlocks: () => [
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'event_start')!),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'condition_color_found')!, {
        regionX: 860,
        regionY: 440,
        width: 200,
        height: 200,
        color: '#39FF14',
      }),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'action_human_click')!, {
        button: 'left',
        jitterRadius: 2,
      }),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'timing_delay')!, {
        durationMs: 45,
        jitterMs: 12,
      }),
    ],
  },
  {
    id: 'tpl_rapid_fire',
    name: 'Jitter Rapid Fire Clicker',
    category: 'Input & Combat',
    description: 'High-speed jitterized click burst loop with anti-detection randomized interval timing.',
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    color: '#ffd600',
    generateBlocks: () => [
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'event_key_pressed')!, { key: 'F6' }),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'loop_repeat_count')!, {
        count: 20,
        counterVar: 'burst',
      }),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'action_human_click')!, {
        button: 'left',
        jitterRadius: 3,
      }),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'timing_delay')!, {
        durationMs: 25,
        jitterMs: 8,
      }),
    ],
  },
  {
    id: 'tpl_adb_farming',
    name: 'Android Emulator ADB Auto-Farmer',
    category: 'Mobile / ADB',
    description: 'Sequenced tap and swipe gestures sent over ADB daemon for auto-battles and farming.',
    icon: <Smartphone className="w-5 h-5 text-cyan-400" />,
    color: '#00e5ff',
    generateBlocks: () => [
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'event_start')!),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'adb_tap')!, { x: 960, y: 540 }),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'timing_delay')!, { durationMs: 800 }),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'adb_swipe')!, {
        startX: 500,
        startY: 800,
        endX: 500,
        endY: 300,
        durationMs: 350,
      }),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'action_log_message')!, {
        message: 'Farming round completed successfully',
      }),
    ],
  },
  {
    id: 'tpl_anti_afk',
    name: 'Anti-AFK Smart Wanderer',
    category: 'Automation',
    description: 'Performs realistic mouse curves and subtle keyboard pulses to prevent disconnects.',
    icon: <Repeat className="w-5 h-5 text-purple-400" />,
    color: '#d500f9',
    generateBlocks: () => [
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'event_start')!),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'loop_repeat_count')!, { count: 50 }),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'action_move_mouse')!, {
        x: 960,
        y: 540,
        smooth: true,
      }),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'action_press_key')!, {
        key: 'W',
        durationMs: 80,
      }),
      createBlockInstance(BLOCK_CATALOG.find((b) => b.type === 'timing_delay')!, {
        durationMs: 1500,
        jitterMs: 400,
      }),
    ],
  },
];

interface BlockTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (blocks: BlockNode[], templateName: string) => void;
}

export const BlockTemplatesModal: React.FC<BlockTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0e17] rounded-3xl border-2 border-[#1f283d] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#1b2538] flex items-center justify-between bg-[#0e121e]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Starter Block Templates</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Ready-to-Use
                </span>
              </h2>
              <p className="text-xs text-[#8892b0]">
                Choose an editable macro template to populate your Block Coding workspace immediately.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8892b0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of templates */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                const generated = tpl.generateBlocks();
                onSelectTemplate(generated, tpl.name);
                onClose();
              }}
              style={{ borderColor: `${tpl.color}40` }}
              className="p-4 rounded-2xl bg-[#0e1322] hover:bg-[#151c30] border-2 transition-all cursor-pointer group hover:scale-[1.02] flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-md"
                    style={{
                      backgroundColor: `${tpl.color}15`,
                      borderColor: `${tpl.color}40`,
                    }}
                  >
                    {tpl.icon}
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-black"
                    style={{ backgroundColor: tpl.color }}
                  >
                    {tpl.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-[#39ff14] transition-colors">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-[#8892b0] leading-relaxed mt-1">
                    {tpl.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#1b2538] text-xs font-bold text-[#00e5ff] group-hover:translate-x-1 transition-transform">
                <span>Load & Customize Stack</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1b2538] flex items-center justify-end bg-[#080b12]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1f283d] text-xs font-bold text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
