import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <p className="text-8xl font-extrabold text-muted-foreground">404</p>
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      <button onClick={() => navigate("/")} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </button>
    </div>
  );
}
