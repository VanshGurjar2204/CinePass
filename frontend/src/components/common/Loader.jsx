import { Loader2 } from "lucide-react";

export default function Loader({ text = "Loading CinePass...", fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="relative mb-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md" />
        </div>
        <p className="text-sm font-bold text-slate-300 tracking-wide">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-6 gap-2.5 text-slate-400">
      <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

