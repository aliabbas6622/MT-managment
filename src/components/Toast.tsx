import { useState, useCallback, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

type ToastVariant = "default" | "success" | "error" | "warning";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  visible: boolean;
}

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
}

const MAX_TOASTS = 3;
const DISMISS_DELAY = 5000;

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: typeof CheckCircle }> = {
  default: {
    bg: "bg-slate-50 border-slate-200",
    border: "border-l-slate-500",
    icon: Info,
  },
  success: {
    bg: "bg-emerald-50 border-emerald-200",
    border: "border-l-emerald-500",
    icon: CheckCircle,
  },
  error: {
    bg: "bg-rose-50 border-rose-200",
    border: "border-l-rose-500",
    icon: AlertCircle,
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    border: "border-l-amber-500",
    icon: AlertTriangle,
  },
};

let toastListeners: Array<(toasts: Toast[]) => void> = [];
let currentToasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...currentToasts]));
}

function addToast(options: ToastOptions): string {
  const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const toast: Toast = {
    id,
    title: options.title,
    description: options.description,
    variant: options.variant || "default",
    visible: true,
  };

  currentToasts = [...currentToasts, toast].slice(-MAX_TOASTS);
  notifyListeners();

  setTimeout(() => dismissToast(id), DISMISS_DELAY);

  return id;
}

function dismissToast(id: string): void {
  currentToasts = currentToasts.map((t) => (t.id === id ? { ...t, visible: false } : t));
  notifyListeners();

  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    notifyListeners();
  }, 300);
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(currentToasts);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setToasts);
    };
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    return addToast(options);
  }, []);

  const dismiss = useCallback((id: string) => {
    dismissToast(id);
  }, []);

  return { toast, toasts, dismiss };
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const styles = variantStyles[t.variant];
        const Icon = styles.icon;

        return (
          <div
            key={t.id}
            className={`
              pointer-events-auto w-80 rounded-lg border-l-4 p-4 shadow-lg
              transform transition-all duration-300 ease-in-out
              ${styles.bg} ${styles.border}
              ${t.visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            `}
            role="alert"
          >
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 mt-0.5 shrink-0 text-slate-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-slate-600 mt-1">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
