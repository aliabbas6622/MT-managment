import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <p className="text-8xl font-extrabold text-slate-200">404</p>
      <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
      <p className="text-slate-500">The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate("/")} className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors shadow-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>
    </div>
  );
}
