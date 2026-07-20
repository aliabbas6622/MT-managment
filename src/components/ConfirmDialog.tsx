import { useEffect, useRef, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
      }
    },
    [open, onCancel, onConfirm]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) {
      setTimeout(() => cancelBtnRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={onCancel}
      />
      <div
        ref={dialogRef}
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 fade-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            {destructive && (
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3
                id="confirm-dialog-title"
                className="text-lg font-semibold text-slate-800"
              >
                {title}
              </h3>
              <p
                id="confirm-dialog-desc"
                className="text-sm text-slate-600 mt-2"
              >
                {description}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 ${
              destructive
                ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-300"
                : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
