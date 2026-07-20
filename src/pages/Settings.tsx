import { useState } from "react";
import { Settings as SettingsIcon, User, Bell, Palette, Shield } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [restaurantName, setRestaurantName] = useState("Malir Tonight");
  const [currency, setCurrency] = useState("PKR");
  const [taxRate, setTaxRate] = useState("5");
  const [darkMode, setDarkMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "general", label: "General", icon: SettingsIcon },
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="flex gap-2">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium ${activeTab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === "general" && (
        <div className="rounded-lg border bg-card p-6 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold">General Settings</h2>
          <div>
            <label className="text-sm font-medium">Restaurant Name</label>
            <input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm mt-1">
              <option value="PKR">PKR - Pakistani Rupee</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Tax Rate (%)</label>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm mt-1" />
          </div>
          <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="rounded-lg border bg-card p-6 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold">Admin Profile</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium">First Name</label><input defaultValue="Admin" className="w-full border rounded-md px-3 py-2 text-sm mt-1" /></div>
            <div><label className="text-sm font-medium">Last Name</label><input defaultValue="User" className="w-full border rounded-md px-3 py-2 text-sm mt-1" /></div>
          </div>
          <div><label className="text-sm font-medium">Email</label><input defaultValue="admin@malir-tonight.com" className="w-full border rounded-md px-3 py-2 text-sm mt-1" /></div>
          <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="rounded-lg border bg-card p-6 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold">Notification Preferences</h2>
          {["Email notifications", "Leave request alerts", "Attendance alerts", "Expense alerts"].map((item) => (
            <label key={item} className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">{item}</span>
            </label>
          ))}
          <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      )}

      {activeTab === "appearance" && (
        <div className="rounded-lg border bg-card p-6 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold">Appearance</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="rounded" />
            <span className="text-sm">Dark Mode</span>
          </label>
          <p className="text-xs text-muted-foreground">Dark mode toggle will apply when the feature is fully implemented.</p>
        </div>
      )}

      {activeTab === "security" && (
        <div className="rounded-lg border bg-card p-6 space-y-4 max-w-lg">
          <h2 className="text-lg font-semibold">Security</h2>
          <div><label className="text-sm font-medium">Current Password</label><input type="password" className="w-full border rounded-md px-3 py-2 text-sm mt-1" /></div>
          <div><label className="text-sm font-medium">New Password</label><input type="password" className="w-full border rounded-md px-3 py-2 text-sm mt-1" /></div>
          <div><label className="text-sm font-medium">Confirm Password</label><input type="password" className="w-full border rounded-md px-3 py-2 text-sm mt-1" /></div>
          <button onClick={handleSave} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90">
            {saved ? "Saved!" : "Update Password"}
          </button>
        </div>
      )}
    </div>
  );
}
