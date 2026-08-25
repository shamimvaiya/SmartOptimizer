import React from 'react';
import { AlertTriangle, Trash2, X, AlertCircle, Check, Info } from 'lucide-react';

export interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  subMessage?: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalConfig> = ({
  isOpen,
  title,
  message,
  subMessage,
  type = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancel = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case 'warning':
        return {
          border: 'border-[#ffd600]',
          headerBg: 'bg-[#2b2510]',
          glow: 'shadow-[0_0_30px_rgba(255,214,0,0.25)]',
          iconColor: 'text-[#ffd600]',
          btnBg: 'bg-[#ffd600] hover:bg-[#e6c200] text-black font-extrabold',
          icon: AlertTriangle,
        };
      case 'info':
        return {
          border: 'border-[#00e5ff]',
          headerBg: 'bg-[#10252e]',
          glow: 'shadow-[0_0_30px_rgba(0,229,255,0.25)]',
          iconColor: 'text-[#00e5ff]',
          btnBg: 'bg-[#00e5ff] hover:bg-[#00b8cc] text-black font-extrabold',
          icon: Info,
        };
      case 'danger':
      default:
        return {
          border: 'border-[#ff4444]',
          headerBg: 'bg-[#2a1414]',
          glow: 'shadow-[0_0_30px_rgba(255,68,68,0.25)]',
          iconColor: 'text-[#ff4444]',
          btnBg: 'bg-[#ff4444] hover:bg-[#e03333] text-white font-extrabold shadow-[0_0_15px_rgba(255,68,68,0.4)]',
          icon: Trash2,
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => onCancel && onCancel()}
    >
      <div
        className={`w-full max-w-md rounded-2xl bg-[#14141c] border-2 ${theme.border} ${theme.glow} overflow-hidden shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`h-14 px-6 ${theme.headerBg} border-b border-[#252733] flex items-center justify-between`}>
          <div className="flex items-center space-x-2.5">
            <div className={`p-1.5 rounded-lg bg-black/40 ${theme.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-white tracking-wide">{title}</h3>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="p-1 rounded-lg bg-[#20202e] text-[#8892b0] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-3">
          <p className="text-sm font-semibold text-white leading-relaxed">{message}</p>
          {subMessage && (
            <div className="p-3 rounded-xl bg-[#181824] border border-[#2d2d3d] text-xs text-[#8892b0] leading-relaxed">
              {subMessage}
            </div>
          )}
        </div>

        {/* Actions Bar */}
        <div className="px-6 py-4 bg-[#101017] border-t border-[#1f202b] flex items-center justify-end space-x-3">
          {showCancel && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl bg-[#1a1b24] hover:bg-[#252733] text-[#8892b0] hover:text-white font-bold text-xs transition-all cursor-pointer border border-[#2d2d3d]"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={async () => {
              await onConfirm();
            }}
            className={`px-5 py-2 rounded-xl text-xs transition-all cursor-pointer ${theme.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
