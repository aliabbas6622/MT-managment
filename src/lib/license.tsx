import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { addToSyncQueue } from "../services/sync.service";

const LICENSE_KEY = "malirTonight_license";
const APP_KEY = "MT-2026-SEC";

interface License {
  id: string;
  type: "basic" | "premium";
  status: "active" | "expired" | "disabled";
  activatedAt: string;
  expiresAt: string | null;
}

interface LicenseContextType {
  license: License;
  isPremium: boolean;
  activateLicense: (token: string) => { success: boolean; error?: string };
  deactivateLicense: () => void;
  refreshLicense: () => void;
}

const LicenseContext = createContext<LicenseContextType | null>(null);

function xorEncrypt(text: string, key: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result);
}

function xorDecrypt(encoded: string, key: string): string {
  const text = atob(encoded);
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

function loadLicense(): License {
  try {
    const raw = localStorage.getItem(LICENSE_KEY);
    if (!raw) return { id: "", type: "basic", status: "active", activatedAt: "", expiresAt: null };
    const decrypted = xorDecrypt(raw, APP_KEY);
    return JSON.parse(decrypted);
  } catch {
    return { id: "", type: "basic", status: "active", activatedAt: "", expiresAt: null };
  }
}

function saveLicense(license: License) {
  const encrypted = xorEncrypt(JSON.stringify(license), APP_KEY);
  localStorage.setItem(LICENSE_KEY, encrypted);
}

function validateTokenFormat(token: string): boolean {
  if (token.length < 20) return false;
  const parts = token.split("-");
  if (parts.length < 3) return false;
  if (parts[0].length !== 8) return false;
  return true;
}

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [license, setLicense] = useState<License>(loadLicense);

  const refreshLicense = useCallback(() => {
    setLicense(loadLicense());
  }, []);

  const isPremium = license.type === "premium" && license.status === "active";

  const activateLicense = useCallback((token: string): { success: boolean; error?: string } => {
    if (!validateTokenFormat(token)) {
      return { success: false, error: "Invalid token format. Please check your activation code." };
    }

    const id = token.slice(0, 8);
    const expiryPart = token.split("-").slice(1, -1).join("-");
    let expiresAt: string | null = null;

    try {
      const decoded = atob(expiryPart);
      const timestamp = parseInt(decoded, 10);
      if (!isNaN(timestamp)) {
        expiresAt = new Date(timestamp * 1000).toISOString();
        if (new Date(expiresAt) < new Date()) {
          return { success: false, error: "This license has expired." };
        }
      }
    } catch {
      // No expiry = perpetual license
    }

    const newLicense: License = {
      id,
      type: "premium",
      status: "active",
      activatedAt: new Date().toISOString(),
      expiresAt,
    };

    saveLicense(newLicense);
    setLicense(newLicense);

    addToSyncQueue("audit_log", Date.now(), "create", {
      action: "LICENSE_ACTIVATED",
      licenseId: id,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }, []);

  const deactivateLicense = useCallback(() => {
    const basicLicense: License = { id: "", type: "basic", status: "active", activatedAt: "", expiresAt: null };
    saveLicense(basicLicense);
    setLicense(basicLicense);
  }, []);

  return (
    <LicenseContext.Provider value={{ license, isPremium, activateLicense, deactivateLicense, refreshLicense }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const ctx = useContext(LicenseContext);
  if (!ctx) throw new Error("useLicense must be used within LicenseProvider");
  return ctx;
}
