import { useState } from "react";
import { useAuth, type Role } from "../lib/auth";
import { Shield, UserPlus, Mail, Lock, Eye, EyeOff, Trash2, X, CheckCircle } from "lucide-react";

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-red-50 text-red-700 border-red-200",
  manager: "bg-blue-50 text-blue-700 border-blue-200",
  hr: "bg-purple-50 text-purple-700 border-purple-200",
  viewer: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function Users() {
  const { user, getUsers, addUser, deleteUser, changePassword } = useAuth();
  const allUsers = getUsers();

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newRole, setNewRole] = useState<Role>("viewer");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetPasswordVal, setResetPasswordVal] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  const handleCreateUser = () => {
    setFormError("");
    setFormSuccess("");
    const result = addUser({ name: newName, email: newEmail, role: newRole, password: newPassword, username: newUsername || undefined });
    if (result.success) {
      setFormSuccess(`User "${newName}" created as ${newRole}.`);
      setNewName("");
      setNewEmail("");
      setNewUsername("");
      setNewPassword("");
      setNewRole("viewer");
    } else {
      setFormError(result.error || "Failed to create user.");
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    const result = deleteUser(id);
    if (!result.success) alert(result.error);
  };

  const handleResetPassword = () => {
    if (!resetUserId || !resetPasswordVal) return;
    const result = changePassword(resetUserId, resetPasswordVal);
    if (result.success) {
      setFormSuccess("Password reset successfully.");
      setResetUserId(null);
      setResetPasswordVal("");
      setShowResetModal(false);
    } else {
      setFormError(result.error || "Failed to reset password.");
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-slate-700">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-1">Only admins can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <Shield className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-xs text-slate-500">Create and manage user accounts for your team</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <UserPlus className="h-4 w-4 text-emerald-500" /> Create New User
        </h3>
        <p className="text-xs text-slate-500 mb-4">Add a new team member. They will use their email and password to sign in.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Ahmed Khan"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setFormError(""); setFormSuccess(""); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setFormError(""); setFormSuccess(""); }}
                className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Username <span className="text-slate-400">(optional)</span></label>
            <input
              type="text"
              placeholder="Optional username"
              value={newUsername}
              onChange={(e) => { setNewUsername(e.target.value); setFormError(""); setFormSuccess(""); }}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
            >
              <option value="viewer">Viewer (read-only)</option>
              <option value="hr">HR</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Min 4 characters"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setFormError(""); setFormSuccess(""); }}
                className="w-full border border-slate-200 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {formError && <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 mt-3"><p className="text-xs text-rose-600">{formError}</p></div>}
        {formSuccess && <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mt-3"><p className="text-xs text-emerald-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {formSuccess}</p></div>}

        <button
          onClick={handleCreateUser}
          disabled={!newName.trim() || !newEmail.trim() || !newPassword.trim()}
          className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-40 flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" /> Create User
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-slate-400" /> Team Members ({allUsers.length})
        </h3>
        {allUsers.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No users yet. Create one above.</p>
        ) : (
          <div className="space-y-2">
            {allUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">
                  {u.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role]}`}>
                  {u.role}
                </span>
                <p className="text-[10px] text-slate-400 shrink-0">{new Date(u.createdAt).toLocaleDateString()}</p>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => { setResetUserId(u.id); setResetPasswordVal(""); setShowResetModal(true); }}
                    className="text-slate-400 hover:text-blue-500 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
                    title="Reset password"
                  >
                    <Lock className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u.id, u.name)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                    title="Delete user"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setResetUserId(null); setShowResetModal(false); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Reset Password</h3>
              <button onClick={() => { setResetUserId(null); setShowResetModal(false); }} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-xs text-slate-500">Set a new password for this user.</p>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="New password (min 4 chars)"
                value={resetPasswordVal}
                onChange={(e) => setResetPasswordVal(e.target.value)}
                className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setResetUserId(null); setShowResetModal(false); }} className="flex-1 px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700">Cancel</button>
              <button onClick={handleResetPassword} disabled={!resetPasswordVal.trim()} className="flex-1 px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
