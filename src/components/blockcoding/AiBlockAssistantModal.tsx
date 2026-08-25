import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Bug,
  HelpCircle,
  X,
  Play,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { BlockNode, MacroVariable, RuntimeErrorModel } from '../../types';

interface AiBlockAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBlocks: BlockNode[];
  currentVariables: MacroVariable[];
  onInsertGeneratedBlocks: (blocks: BlockNode[], variables?: MacroVariable[]) => void;
  lastRuntimeError?: RuntimeErrorModel | null;
  executionTrace?: any[];
}

export const AiBlockAssistantModal: React.FC<AiBlockAssistantModalProps> = ({
  isOpen,
  onClose,
  currentBlocks,
  currentVariables,
  onInsertGeneratedBlocks,
  lastRuntimeError,
  executionTrace,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'validate' | 'explain' | 'debug'>('generate');
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [explanationText, setExplanationText] = useState<string>('');
  const [debugResult, setDebugResult] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerateBlocks = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setStatusMessage('Querying Gemini API & synthesizing block graph...');

    try {
      const response = await fetch('/api/gemini/macro-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate_blocks',
          prompt,
          currentVariables,
        }),
      });

      const data = await response.json();
      if (data.success && data.blocks) {
        setGeneratedResult(data);
        setStatusMessage('Blocks generated successfully! Review below before inserting.');
      } else {
        setStatusMessage(data.error || 'Failed to generate blocks.');
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateMacro = async () => {
    setIsLoading(true);
    setStatusMessage('Validating macro logic & control flow...');

    try {
      const response = await fetch('/api/gemini/macro-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'validate_macro',
          currentBlocks,
          currentVariables,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setValidationResult(data);
        setStatusMessage('Validation analysis complete.');
      }
    } catch (err: any) {
      setStatusMessage(`Validation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainMacro = async () => {
    setIsLoading(true);
    setStatusMessage('Generating human-readable macro documentation...');

    try {
      const response = await fetch('/api/gemini/macro-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explain_macro',
          currentBlocks,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setExplanationText(data.explanation || 'No explanation generated.');
        setStatusMessage('Explanation generated.');
      }
    } catch (err: any) {
      setStatusMessage(`Failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugAssistant = async () => {
    setIsLoading(true);
    setStatusMessage('Diagnosing runtime error stack...');

    try {
      const response = await fetch('/api/gemini/macro-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'debug_assist',
          errorContext: lastRuntimeError,
          executionTrace,
          currentBlocks,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setDebugResult(data);
        setStatusMessage('Diagnostic complete.');
      }
    } catch (err: any) {
      setStatusMessage(`Debug analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0e17] rounded-3xl border-2 border-purple-500/50 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#1b2538] flex items-center justify-between bg-[#0e121e]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-black text-white">Gemini Macro AI Studio</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Model: gemini-2.5-flash
                </span>
              </div>
              <p className="text-xs text-[#8892b0]">
                Natural Language generation, deep macro validation, step-by-step logic explanation, and automated debugging
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8892b0] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1b2538] bg-[#070a12] px-4 space-x-2">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-3 text-xs font-black flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'generate'
                ? 'border-purple-400 text-purple-300 bg-purple-500/10'
                : 'border-transparent text-[#8892b0] hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Blocks</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('validate');
              handleValidateMacro();
            }}
            className={`px-4 py-3 text-xs font-black flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'validate'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-[#8892b0] hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Logic Validator</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('explain');
              handleExplainMacro();
            }}
            className={`px-4 py-3 text-xs font-black flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'explain'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-[#8892b0] hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Explain Macro</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('debug');
              handleDebugAssistant();
            }}
            className={`px-4 py-3 text-xs font-black flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'debug'
                ? 'border-rose-400 text-rose-300 bg-rose-500/10'
                : 'border-transparent text-[#8892b0] hover:text-white'
            }`}
          >
            <Bug className="w-4 h-4" />
            <span>Debug Assistant</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#05070e] space-y-4">
          {/* Status Message */}
          {statusMessage && (
            <div className="p-2.5 rounded-xl bg-[#0e1322] border border-[#1e2942] text-xs text-cyan-300 flex items-center space-x-2">
              <Zap className="w-3.5 h-3.5 text-[#39ff14]" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* TAB 1: GENERATE BLOCKS */}
          {activeTab === 'generate' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#8892b0] uppercase tracking-wider mb-2">
                  Describe what you want the macro to do in plain English:
                </label>
                <div className="flex gap-2">
                  <textarea
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Move mouse to center, click 5 times with a 200ms delay, and then check if health is below 50"
                    className="flex-1 px-4 py-3 rounded-2xl bg-[#090d18] border border-[#1b2538] text-white text-xs placeholder-[#4e5d78] focus:outline-none focus:border-purple-400 leading-relaxed resize-none"
                  />
                  <button
                    onClick={handleGenerateBlocks}
                    disabled={isLoading || !prompt.trim()}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-xs flex flex-col items-center justify-center space-y-1 shadow-lg cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Suggestions Chips */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] text-[#8892b0] font-bold py-1">Quick Prompts:</span>
                {[
                  'Click center screen 3 times with 150ms delay',
                  'Repeat 10 times: press key R, delay 500ms, and beep',
                  'If ammoCount is greater than 0, human click left; else press R',
                  'ADB tap at (500, 800) and swipe up to (500, 300)',
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(s)}
                    className="px-2.5 py-1 rounded-lg bg-[#0e1322] hover:bg-[#182136] text-[11px] text-[#8892b0] hover:text-white border border-[#1b2538] transition-colors cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Review Generated Result */}
              {generatedResult && (
                <div className="p-4 rounded-2xl bg-[#090d18] border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center space-x-2">
                      <Bot className="w-4 h-4" />
                      <span>Synthesized Block Sequence ({generatedResult.blocks?.length || 0} blocks)</span>
                    </h3>
                    <button
                      onClick={() => {
                        onInsertGeneratedBlocks(generatedResult.blocks, generatedResult.suggestedVariables);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#39ff14] text-black font-black text-xs shadow-lg flex items-center space-x-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Insert into Workspace</span>
                    </button>
                  </div>

                  <p className="text-xs text-white bg-[#05070e] p-3 rounded-xl border border-[#1b2538] leading-relaxed">
                    {generatedResult.explanation}
                  </p>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {generatedResult.blocks?.map((b: BlockNode, i: number) => (
                      <div
                        key={b.id || i}
                        className="p-2.5 rounded-xl bg-[#05070e] border border-[#1b2538] flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono font-black flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-xs font-bold text-white">{b.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#131b2e] text-[#8892b0]">
                            {b.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#8892b0] truncate max-w-xs">
                          {JSON.stringify(b.parameters)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VALIDATE MACRO */}
          {activeTab === 'validate' && (
            <div className="space-y-4">
              {validationResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#090d18] border border-[#1b2538] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black uppercase text-[#8892b0]">Overall Health Status</div>
                      <div className="text-base font-black flex items-center space-x-2 mt-1">
                        {validationResult.isValid ? (
                          <span className="text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Valid & Production Ready</span>
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1.5">
                            <AlertTriangle className="w-5 h-5" />
                            <span>Issues Detected</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black uppercase text-[#8892b0]">Complexity Score</div>
                      <div className="text-lg font-black text-cyan-400 mt-1">
                        {validationResult.complexityScore ?? 35} / 100
                      </div>
                    </div>
                  </div>

                  {/* Warnings & Suggestions */}
                  {validationResult.warnings?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                      <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Warnings</span>
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-amber-200">
                        {validationResult.warnings.map((w: string, i: number) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.suggestions?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
                      <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        <span>Optimization Suggestions</span>
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-xs text-cyan-200">
                        {validationResult.suggestions.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-[#8892b0] text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                  <span>Validating block stack...</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPLAIN MACRO */}
          {activeTab === 'explain' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-[#090d18] border border-[#1b2538] space-y-3">
                <h3 className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center space-x-2">
                  <FileCode className="w-4 h-4" />
                  <span>Step-by-Step Logic Walkthrough</span>
                </h3>
                <div className="text-xs text-[#cfd7e6] whitespace-pre-wrap leading-relaxed bg-[#05070e] p-4 rounded-xl border border-[#1b2538]">
                  {explanationText || 'Analyzing macro blocks...'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEBUG ASSISTANT */}
          {activeTab === 'debug' && (
            <div className="space-y-4">
              {debugResult ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                    <h4 className="text-xs font-black text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Bug className="w-4 h-4" />
                      <span>Root Cause Diagnosis</span>
                    </h4>
                    <p className="text-xs text-rose-200 font-bold">{debugResult.errorSummary}</p>
                    <p className="text-xs text-[#cfd7e6]">{debugResult.rootCause}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <h4 className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Recommended Fix</span>
                    </h4>
                    <p className="text-xs text-emerald-200">{debugResult.suggestedFix}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-[#8892b0] text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-400" />
                  <span>Diagnosing runtime trace and recent errors...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
