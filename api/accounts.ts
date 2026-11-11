import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

const ACCOUNTS_FILE = path.join(process.cwd(), "user_accounts_store.json");

function getStoredAccounts() {
  if (fs.existsSync(ACCOUNTS_FILE)) {
    try {
      const content = fs.readFileSync(ACCOUNTS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      console.error("Error reading ACCOUNTS_FILE", e);
    }
  }
  return [
    {
      id: "usr-abdulmalik-838",
      username: "emp_838",
      displayName: "عبد الملك",
      password: "rs$BMjpy",
      role: "employee",
      workspaceName: "مساحة عبد الملك",
      workspaceId: "ws-emp-838",
      status: "active",
      createdAt: "١٢/١١/٢٠٢٦",
      notes: "موظف معتمد في المكتب",
      storagePolicy: "local_only",
      permissions: {
        canUseCalculator: true,
        canManageTasks: true,
        canUseAI: true,
        canViewPlatforms: true,
        canEditPlatforms: false,
        canUseScratchpad: true,
        canAccessSettings: false
      }
    }
  ];
}

function saveStoredAccounts(accounts: any[]) {
  try {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing ACCOUNTS_FILE", e);
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "GET") {
    res.status(200).json(getStoredAccounts());
    return;
  }

  if (req.method === "POST") {
    const account = req.body;
    if (!account || !account.username || !account.password) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const accounts = getStoredAccounts();
    const existingIdx = accounts.findIndex(
      (a: any) => a.id === account.id || a.username.toLowerCase() === account.username.toLowerCase()
    );
    if (existingIdx >= 0) {
      accounts[existingIdx] = { ...accounts[existingIdx], ...account };
    } else {
      accounts.unshift(account);
    }
    saveStoredAccounts(accounts);
    res.status(200).json({ success: true, account });
    return;
  }

  if (req.method === "DELETE") {
    const id = req.query.id as string;
    const accounts = getStoredAccounts();
    const filtered = accounts.filter((a: any) => a.id !== id && a.username !== id);
    saveStoredAccounts(filtered);
    res.status(200).json({ success: true, deletedId: id });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
}
