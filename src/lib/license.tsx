import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { addToSyncQueue } from "../services/sync.service";

const LICENSE_KEY = "malirTonight_license";
const PASSPHRASE = "MT-2026-AES-SEC-KEY";

interface License {
  id: string;
  type: "basic" | "premium";
  status: "active" | "expired" | "disabled";
  activatedAt: string;
  expiresAt: string | null;
  signature: string;
  version: number;
  hmac: string;
}

interface LicenseContextType {
  license: License;
  isPremium: boolean;
  activateLicense: (token: string) => Promise<{ success: boolean; error?: string }>;
  deactivateLicense: () => Promise<void>;
  refreshLicense: () => void;
  validateLicense: () => boolean;
}

const LicenseContext = createContext<LicenseContextType | null>(null);

async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("malir-tonight-salt-v2"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function aesEncrypt(plaintext: string): Promise<string> {
  const key = await deriveKey(PASSPHRASE);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function aesDecrypt(ciphertext: string): Promise<string> {
  const key = await deriveKey(PASSPHRASE);
  const data = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );
  return new TextDecoder().decode(decrypted);
}

function generateSignature(license: License): string {
  const payload = `${license.id}|${license.type}|${license.status}|${license.activatedAt}|${license.expiresAt || "none"}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `sig_${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

function verifySignature(license: License): boolean {
  const expected = generateSignature(license);
  return license.signature === expected;
}

function generateHmac(licenseId: string, activatedAt: string): string {
  const data = `${licenseId}:${activatedAt}:${PASSPHRASE}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `hmac_${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

function verifyHmac(license: License): boolean {
  return license.hmac === generateHmac(license.id, license.activatedAt);
}

function loadLicenseSync(): License {
  try {
    const plainKey = "malirTonight_license_plain";
    const plainRaw = localStorage.getItem(plainKey);
    if (plainRaw) {
      const license: License = JSON.parse(plainRaw);
      if (!verifySignature(license) || !verifyHmac(license)) return createBasicLicense();
      if (license.expiresAt && new Date(license.expiresAt) < new Date()) {
        license.status = "expired";
      }
      return license;
    }
    return createBasicLicense();
  } catch {
    return createBasicLicense();
  }
}

function createBasicLicense(): License {
  return { id: "", type: "basic", status: "active", activatedAt: "", expiresAt: null, signature: "", version: 1, hmac: "" };
}

async function saveLicenseEncrypted(license: License): Promise<void> {
  license.signature = generateSignature(license);
  license.hmac = generateHmac(license.id, license.activatedAt);
  const encrypted = await aesEncrypt(JSON.stringify(license));
  localStorage.setItem(LICENSE_KEY, encrypted);
  localStorage.setItem("malirTonight_license_plain", JSON.stringify(license));
}

function validateTokenFormat(token: string): boolean {
  if (token.length < 20) return false;
  const parts = token.split("-");
  if (parts.length < 3) return false;
  if (parts[0].length !== 8) return false;
  return true;
}

function verifyTokenIntegrity(token: string): { valid: boolean; expiry?: Date; licenseId?: string } {
  const parts = token.split("-");
  const licenseId = parts[0];
  const expiryPart = parts.slice(1, -1).join("-");
  try {
    const decoded = atob(expiryPart);
    const timestamp = parseInt(decoded, 10);
    if (!isNaN(timestamp)) {
      const expiry = new Date(timestamp * 1000);
      if (expiry < new Date()) {
        return { valid: false, expiry };
      }
      return { valid: true, expiry, licenseId };
    }
  } catch {
    // No expiry = perpetual license
  }
  return { valid: true, licenseId };
}

export function LicenseProvider({ children }: { children: ReactNode }) {
  const [license, setLicense] = useState<License>(loadLicenseSync);

  const refreshLicense = useCallback(() => {
    setLicense(loadLicenseSync());
  }, []);

  const isPremium = license.type === "premium" && license.status === "active";

  const validateLicense = useCallback((): boolean => {
    if (!isPremium) return false;
    if (license.expiresAt && new Date(license.expiresAt) < new Date()) return false;
    return verifySignature(license) && verifyHmac(license);
  }, [isPremium, license]);

  const activateLicense = useCallback(async (token: string): Promise<{ success: boolean; error?: string }> => {
    if (!validateTokenFormat(token)) {
      return { success: false, error: "Invalid token format. Please check your activation code." };
    }

    const verification = verifyTokenIntegrity(token);
    if (!verification.valid) {
      return { success: false, error: "This license has expired or is invalid." };
    }

    const newLicense: License = {
      id: verification.licenseId || token.slice(0, 8),
      type: "premium",
      status: "active",
      activatedAt: new Date().toISOString(),
      expiresAt: verification.expiry?.toISOString() || null,
      signature: "",
      version: 1,
      hmac: "",
    };

    await saveLicenseEncrypted(newLicense);
    setLicense(newLicense);

    addToSyncQueue("audit_log", String(Date.now()), "create", {
      action: "LICENSE_ACTIVATED",
      licenseId: newLicense.id,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }, []);

  const deactivateLicense = useCallback(async () => {
    const basicLicense = createBasicLicense();
    await saveLicenseEncrypted(basicLicense);
    setLicense(basicLicense);
  }, []);

  return (
    <LicenseContext.Provider value={{ license, isPremium, activateLicense, deactivateLicense, refreshLicense, validateLicense }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const ctx = useContext(LicenseContext);
  if (!ctx) throw new Error("useLicense must be used within LicenseProvider");
  return ctx;
}
