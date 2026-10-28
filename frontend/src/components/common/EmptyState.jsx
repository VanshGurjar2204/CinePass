import { Film } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
  icon: Icon = Film,
  title = "No results found",
  description = "Try adjusting your search or filters to find what you're looking for.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#0e1626]/80 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl transition-colors">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

