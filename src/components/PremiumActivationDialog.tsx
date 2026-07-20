import { useState } from "react";
import { useLicense } from "../lib/license";
import { useToast } from "./Toast";
import { X, Star, Lock, CheckCircle } from "lucide-react";

interface PremiumActivationDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function PremiumActivationDialog({ open, onClose }: PremiumActivationDialogProps) {
  const { activateLicense } = useLicense();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleActivate = async () => {
    if (!token.trim()) {
      setError("Please enter an activation token.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await activateLicense(token.trim());
      setLoading(false);

      if (result.success) {
        toast({ title: "Premium Activated!", description: "You now have access to all premium features.", variant: "success" });
        setToken("");
        onClose();
      } else {
        setError(result.error || "Activation failed. Please try again.");
      }
    } catch {
      setLoading(false);
      setError("Activation failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-slate-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Premium Activation</h2>
          <p className="text-sm text-slate-500 mt-2">Enter your activation token to unlock all premium features.</p>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-medium text-amber-800 mb-2">Premium features include:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {["Analytics", "Cloud Sync", "Advanced Reports", "Role Management", "Notifications", "Multi-user"].map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-xs text-amber-700">
                  <CheckCircle className="h-3 w-3" /> {f}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Activation Token</label>
            <input
              type="text"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={token}
              onChange={(e) => { setToken(e.target.value); setError(""); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 font-mono"
            />
            {error && <p className="text-xs text-rose-500 mt-1.5">{error}</p>}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700">
              Cancel
            </button>
            <button
              onClick={handleActivate}
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {loading ? "Activating..." : "Activate"}
            </button>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
