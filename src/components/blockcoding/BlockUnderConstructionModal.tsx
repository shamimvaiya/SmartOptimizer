import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Construction,
  Grid,
  ShieldAlert,
  X,
} from 'lucide-react';

interface BlockUnderConstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAccess: () => void;
  lang?: 'en' | 'bn';
}

export const BlockUnderConstructionModal: React.FC<BlockUnderConstructionModalProps> = ({
  isOpen,
  onClose,
  onConfirmAccess,
  lang = 'bn',
}) => {
  const [step, setStep] = useState<number>(1);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else {
      setStep(1);
      onConfirmAccess();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-xl bg-[#0c0f17] border-2 border-red-500/70 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.35)] overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Construction Strip Top Bar */}
        <div className="h-3 w-full bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_15px,#0c0f17_15px,#0c0f17_30px)] animate-pulse" />

        {/* Modal Header */}
        <div className="p-5 pb-3 flex items-start justify-between border-b border-[#1f283d] bg-[#111624]/60">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/40 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]">
              {step === 1 && <Construction className="w-6 h-6 animate-bounce" />}
              {step === 2 && <AlertTriangle className="w-6 h-6 animate-pulse" />}
              {step === 3 && <ShieldAlert className="w-6 h-6 animate-pulse" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                  {lang === 'bn' ? `ওয়ার্নিং ধাপ ${step} / ৩` : `Warning Step ${step} of 3`}
                </span>
                <span className="text-[11px] font-mono text-amber-400 font-bold">
                  🚧 UNDER CONSTRUCTION
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1">
                {step === 1 && (lang === 'bn' ? 'ব্লক কোডিং এখনো আন্ডার কনস্ট্রাকশনে আছে' : 'Block Coding Under Active Construction')}
                {step === 2 && (lang === 'bn' ? 'সতর্কতা: এটি সম্পূর্ণ প্রস্তুত নয়' : 'Warning: Incomplete & Experimental')}
                {step === 3 && (lang === 'bn' ? 'চূড়ান্ত অনুমতি: ডেভেলপার প্রিভিউ মোড' : 'Final Step: Experimental Access')}
              </h3>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl bg-[#1a2236] hover:bg-[#25324e] text-[#8892b0] hover:text-white transition-all cursor-pointer"
            title="Close and return to Node Graph"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="px-6 py-2 bg-[#090c14] border-b border-[#1f283d] flex items-center justify-center gap-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                  step === s
                    ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)] scale-110'
                    : step > s
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#1b233a] text-[#8892b0]'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-1 rounded-full ${
                    step > s ? 'bg-emerald-500' : 'bg-[#1b233a]'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Modal Body Content depending on Step */}
        <div className="p-6 space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed">
                <p className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Construction className="w-4 h-4" />
                  <span>এটি এখনো সম্পূর্ণভাবে তৈরি করা হয়নি (কাজ চলমান):</span>
                </p>
                <p>
                  প্রিয় ব্যবহারকারী, ব্লক কোডিং মডিউলটি বর্তমানে ডেভেলপমেন্ট ও টেস্টিং পর্যায়ের মধ্যে রয়েছে। এর বিভিন্ন অংশ এবং ইন্টারঅ্যাকশন এখনো তৈরি করা হচ্ছে।
                </p>
                <p className="mt-2 text-amber-300/80 text-xs">
                  আপনার স্বাভাবিক ও স্থিতিশীল কাজের জন্য <strong>Node Graph</strong> মোডটি সম্পূর্ণরূপে প্রস্তুত ও সুরক্ষিত রয়েছে।
                </p>
              </div>

              <div className="bg-[#121724] p-3.5 rounded-xl border border-[#1f283d] text-xs text-[#a0aec0] space-y-1.5">
                <div className="flex items-center text-red-400 font-semibold gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>আপনি কি এই অসম্পূর্ণ ব্লক কোডিং অংশটি দেখতে চান?</span>
                </div>
                <p>
                  যদি না চান, তবে সরাসরি <strong>"ঠিক আছে, ফিরে যান"</strong> বাটনে ক্লিক করে Node Graph-এ কাজ চালিয়ে যেতে পারেন।
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs sm:text-sm leading-relaxed">
                <p className="font-bold text-red-300 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>দ্বিতীয় ধাপের সতর্কতা (Warning 2 of 3):</span>
                </p>
                <p>
                  এই ফিচারটি এখনো আন্ডার কনস্ট্রাকশনে থাকায় ব্লক সাজানো বা এক্সিকিউট করার সময় কিছু ফাংশন আশানুরূপ কাজ নাও করতে পারে অথবা কোনো অপ্রত্যাশিত আচরণ দেখা যেতে পারে।
                </p>
                <p className="mt-2 text-red-300/80 text-xs">
                  আপনি কি সত্যিই নিশ্চিত যে আপনি এই নির্মাণাধীন ইন্টারফেসে প্রবেশ করবেন?
                </p>
              </div>

              <div className="bg-[#121724] p-3.5 rounded-xl border border-[#1f283d] text-xs text-[#a0aec0] space-y-1">
                <p>
                  💡 <em>টিপ: যেকোনো সময় উপরে থাকা <strong>Node Graph</strong> বাটনে ক্লিক করে আপনি আবার নিরাপদ মোডে ফিরে আসতে পারবেন।</em>
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/80 via-red-900/60 to-red-950/80 border-2 border-red-500/60 text-red-100 text-xs sm:text-sm leading-relaxed">
                <p className="font-bold text-red-300 mb-1 flex items-center gap-1.5 text-sm sm:text-base">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span>চূড়ান্ত সতর্কতা (Final Confirmation 3 of 3):</span>
                </p>
                <p>
                  আপনি শেষ ধাপে পৌঁছেছেন। আপনি নিশ্চিত করলে আপনাকে <strong>আন্ডার কনস্ট্রাকশন ব্লক কোডিং</strong> পেইজে নিয়ে যাওয়া হবে।
                </p>
                <p className="mt-2 font-semibold text-amber-300 text-xs">
                  সেখানে উপরের অংশে একটি লাল রঙের ওয়ার্নিং ব্যানার প্রদর্শিত থাকবে যা মনে করিয়ে দেবে যে এটি এখনও কাজ চলমান অবস্থায় রয়েছে।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 sm:p-5 bg-[#090c14] border-t border-[#1f283d] flex items-center justify-between gap-3">
          {/* Back to Node Graph Button */}
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl bg-[#151c2c] hover:bg-[#1e2840] border border-[#2b3958] text-white font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-md hover:scale-105"
          >
            <Grid className="w-4 h-4 text-[#00e5ff]" />
            <span>
              {step === 1 ? 'ঠিক আছে, ফিরে যান (Node Graph)' : 'না, বাতিল করে ফিরে যান'}
            </span>
          </button>

          {/* Proceed Anyway Button */}
          <button
            onClick={handleNextStep}
            className={`px-4 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center space-x-2 transition-all cursor-pointer shadow-lg hover:scale-105 ${
              step === 3
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-400'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
            }`}
          >
            <span>
              {step === 1 && 'তবুও ব্যবহার করতে চাই (১/৩)'}
              {step === 2 && 'হ্যাঁ, আমি নিশ্চিত (২/৩)'}
              {step === 3 && '🔓 প্রবেশ করুন (Enter Under-Construction)'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
