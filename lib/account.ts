"use client";

import { useEffect, useState } from "react";

const ACCOUNT_KEY = "hhip-account";

export type AccountProfile = {
  name: string;
  email?: string;
};

function readAccount(): AccountProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AccountProfile>;
    if (!parsed.name?.trim()) return null;
    return {
      name: parsed.name.trim(),
      email: parsed.email?.trim() || undefined,
    };
  } catch {
    return null;
  }
}

/** Current signed-in account, or null until the user signs up. */
export function useAccount(): AccountProfile | null {
  const [account, setAccount] = useState<AccountProfile | null>(null);

  useEffect(() => {
    setAccount(readAccount());
    function onStorage(event: StorageEvent) {
      if (event.key === ACCOUNT_KEY) setAccount(readAccount());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return account;
}

export function accountInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
