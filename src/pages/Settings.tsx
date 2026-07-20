import { useState } from "react";
import { useApp } from "../lib/store";
import { Settings as SettingsIcon, User, Bell, Palette, Shield } from "lucide-react";

export default function Settings() {
  const { settings, updateSettings } = useApp();
  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState({ ...settings });
  const [notifForm, setNotifForm] = useState({ ...settings.notifications });
  const [saved, setSaved] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const handleSave = () => { updateSettings({ ...form, notifications: notifForm }); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handlePassword = () => { if (!passwords.current || !passwords.new) return; if (passwords.new !== passwords.confirm) { alert("Passwords don't match"); return; } setPasswords({ current: "", new: "", confirm: "" }); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? "bg-emerald-500 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold text-slate-800">General Settings</h2>
          <div><label className="text-sm font-medium text-slate-700">Restaurant Name</label><input value={form.restaurantName} onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" /></div>
          <div><label className="text-sm font-medium text-slate-700">Currency</label><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"><option value="PKR">PKR - Pakistani Rupee</option><option value="USD">USD - US Dollar</option><option value="EUR">EUR - Euro</option></select></div>
          <div><label className="text-sm font-medium text-slate-700">Tax Rate (%)</label><input type="number" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" /></div>
          <button onClick={handleSave} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">{saved ? "Saved!" : "Save Changes"}</button>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold text-slate-800">Admin Profile</h2>
          <div><label className="text-sm font-medium text-slate-700">Full Name</label><input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" /></div>
          <div><label className="text-sm font-medium text-slate-700">Email</label><input type="email" value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" /></div>
          <button onClick={handleSave} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">{saved ? "Saved!" : "Save Changes"}</button>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold text-slate-800">Notification Preferences</h2>
          {([["email", "Email notifications"], ["leaveAlerts", "Leave request alerts"], ["attendanceAlerts", "Attendance alerts"], ["expenseAlerts", "Expense alerts"]] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={notifForm[key]} onChange={(e) => setNotifForm({ ...notifForm, [key]: e.target.checked })} className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/20" />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}
          <button onClick={handleSave} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">{saved ? "Saved!" : "Save Changes"}</button>
        </div>
      )}

      {activeTab === "appearance" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold text-slate-800">Appearance</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.darkMode} onChange={(e) => { setForm({ ...form, darkMode: e.target.checked }); updateSettings({ darkMode: e.target.checked }); }} className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500/20" />
            <span className="text-sm text-slate-700">Dark Mode</span>
          </label>
          <p className="text-xs text-slate-500">Dark mode toggle will apply when the feature is fully implemented.</p>
        </div>
      )}

      {activeTab === "security" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
          <div><label className="text-sm font-medium text-slate-700">Current Password</label><input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" /></div>
          <div><label className="text-sm font-medium text-slate-700">New Password</label><input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" /></div>
          <div><label className="text-sm font-medium text-slate-700">Confirm Password</label><input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" /></div>
          <button onClick={handlePassword} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors">{saved ? "Updated!" : "Update Password"}</button>
        </div>
      )}
    </div>
  );
}
