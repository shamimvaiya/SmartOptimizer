import React, { useState, useRef, useEffect } from 'react';
import {
  Circle,
  Square,
  Play,
  ArrowRight,
  X,
  Clock,
  MousePointer,
  Keyboard,
  Move,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BlockNode } from '../../types';
import { BlockMacroRecorder, RecordedActionRaw } from '../../utils/blockMacroRecorder';

interface MacroRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertRecordedBlocks: (blocks: BlockNode[]) => void;
}

export const MacroRecorderModal: React.FC<MacroRecorderModalProps> = ({
  isOpen,
  onClose,
  onInsertRecordedBlocks,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedActions, setRecordedActions] = useState<RecordedActionRaw[]>([]);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const recorderRef = useRef<BlockMacroRecorder>(new BlockMacroRecorder());
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordedActions([]);
    setElapsedSec(0);

    recorderRef.current.start((action) => {
      setRecordedActions((prev) => [...prev, action]);
    });

    timerRef.current = setInterval(() => {
      setElapsedSec((s) => s + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleInsertBlocks = () => {
    const blocks = recorderRef.current.convertActionsToBlocks(recordedActions);
    onInsertRecordedBlocks(blocks);
    onClose();
  };

  // Capture interactions within the capture stage
  const handleStageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isRecording) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    recorderRef.current.recordClick(x, y, e.button === 2 ? 'right' : 'left');
  };

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isRecording) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    recorderRef.current.recordMove(x, y);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isRecording) return;
    if (e.key === 'Escape') return;
    recorderRef.current.recordKeyPress(e.key);
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in outline-none"
    >
      <div className="bg-[#0b0e17] rounded-3xl border-2 border-red-500/50 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#1b2538] flex items-center justify-between bg-[#0e121e]">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
                isRecording
                  ? 'bg-red-600 animate-pulse'
                  : 'bg-gradient-to-br from-red-500 to-rose-700'
              }`}
            >
              {isRecording ? <Circle className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-white">Live Block Macro Recorder</h2>
                {isRecording && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                    RECORDING LIVE ({elapsedSec}s)
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8892b0]">
                Capture mouse clicks, path trajectories, keystrokes, and delays — automatically converts into puzzle blocks.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg flex items-center space-x-1.5 cursor-pointer"
              >
                <Circle className="w-3.5 h-3.5 fill-white" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg flex items-center space-x-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-black" />
                <span>Stop Recording</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8892b0] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Capture Stage */}
          <div className="flex-1 p-4 flex flex-col bg-[#05070d]">
            <div className="text-[11px] font-black text-[#8892b0] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Interactive Capture Pad (Click or type inside to record)</span>
              <span className="text-cyan-400">{recordedActions.length} actions captured</span>
            </div>

            <div
              onMouseDown={handleStageClick}
              onMouseMove={handleStageMouseMove}
              onContextMenu={(e) => {
                e.preventDefault();
                handleStageClick(e);
              }}
              className={`flex-1 rounded-2xl border-2 border-dashed relative overflow-hidden flex flex-col items-center justify-center transition-all select-none cursor-crosshair ${
                isRecording
                  ? 'border-red-500/60 bg-red-950/10'
                  : 'border-[#1e2942] bg-[#080c18]'
              }`}
            >
              {isRecording ? (
                <div className="text-center space-y-2 pointer-events-none">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto animate-ping">
                    <MousePointer className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">Recording Active</p>
                  <p className="text-[11px] text-[#8892b0]">
                    Move mouse, click buttons, or press keys to capture actions
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#141b2c] text-[#8892b0] flex items-center justify-center mx-auto">
                    <Play className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-white">Capture Pad Idle</p>
                  <p className="text-[11px] text-[#8892b0]">
                    Press "Start Recording" above to begin capturing actions
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Timeline */}
          <div className="w-80 border-l border-[#1b2538] bg-[#080b14] flex flex-col p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Captured Stream
              </span>
              <span className="text-[10px] text-[#8892b0] font-mono font-bold">
                {elapsedSec}s elapsed
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {recordedActions.length === 0 ? (
                <div className="text-center py-16 text-[#4e5d78] text-xs">
                  No actions recorded yet.
                </div>
              ) : (
                recordedActions.map((act, i) => (
                  <div
                    key={act.id || i}
                    className="p-2.5 rounded-xl bg-[#0e1322] border border-[#1b2538] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-[#19233a] flex items-center justify-center text-[#00e5ff]">
                        {act.type === 'click' && <MousePointer className="w-3.5 h-3.5" />}
                        {act.type === 'move' && <Move className="w-3.5 h-3.5" />}
                        {act.type === 'key' && <Keyboard className="w-3.5 h-3.5" />}
                        {act.type === 'delay' && <Clock className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-white capitalize">{act.type}</div>
                        <div className="text-[10px] text-[#8892b0]">
                          {act.type === 'click' && `(${act.data.x}, ${act.data.y}) [${act.data.button}]`}
                          {act.type === 'move' && `(${act.data.x}, ${act.data.y})`}
                          {act.type === 'key' && `[${act.data.key}]`}
                          {act.type === 'delay' && `${act.data.durationMs}ms`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Insert Button */}
            <div className="pt-3 border-t border-[#1b2538]">
              <button
                onClick={handleInsertBlocks}
                disabled={recordedActions.length === 0 || isRecording}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#39ff14] disabled:opacity-40 text-black font-black text-xs shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Convert to Blocks & Insert</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
