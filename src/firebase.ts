import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { Platform, Task, SavedTemplate, QuickNote } from './types';

// Import provisioned config statically from workspace root
// @ts-ignore
import firebaseConfigJson from '../firebase-applet-config.json';

const appletConfig: any = firebaseConfigJson;

// Read from Vite environment variables for Vercel, with fallback to AI Studio provisioned config
const finalConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig?.apiKey || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig?.authDomain || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig?.projectId || "",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || appletConfig?.firestoreDatabaseId || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig?.storageBucket || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig?.messagingSenderId || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig?.appId || ""
};

export const hasValidConfig = !!(finalConfig.apiKey && finalConfig.projectId);

let app: any = null;
let db: any = null;
let auth: any = null;
let googleProvider: any = null;

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(finalConfig) : getApp();
    
    // Initialize firestore with optional separate databaseId (if specified)
    if (finalConfig.firestoreDatabaseId) {
      db = getFirestore(app, finalConfig.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
    
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Error setting up Firebase Client SDK:", error);
  }
}

export { app, db, auth, googleProvider, finalConfig };

// --- STAGE 3 ERROR HANDLERS ASM RULES ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid || null,
      email: currentAuth?.currentUser?.email || null,
      emailVerified: currentAuth?.currentUser?.emailVerified || null,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || null,
      tenantId: currentAuth?.currentUser?.tenantId || null,
      providerInfo: currentAuth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Access Exception: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection Helper based on rules
export async function testFirestoreConnection() {
  if (!db) return false;
  try {
    const testDoc = doc(db, 'settings', 'config');
    await getDocFromServer(testDoc);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your database connectivity configuration.");
    }
    return false;
  }
}

// --- CLOUD INTERFACE DATA CONNECTORS ---

export async function uploadPlatformToCloud(item: Platform) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'platforms', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `platforms/${item.id}`);
  }
}

export async function deletePlatformFromCloud(id: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'platforms', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `platforms/${id}`);
  }
}

export async function uploadTaskToCloud(item: Task) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'tasks', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `tasks/${item.id}`);
  }
}

export async function deleteTaskFromCloud(id: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'tasks', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
  }
}

export async function uploadQuickNoteToCloud(item: QuickNote) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'quick_notes', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `quick_notes/${item.id}`);
  }
}

export async function deleteQuickNoteFromCloud(id: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'quick_notes', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `quick_notes/${id}`);
  }
}

export async function uploadTemplateToCloud(item: SavedTemplate) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'templates', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `templates/${item.id}`);
  }
}

export async function deleteTemplateFromCloud(id: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'templates', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `templates/${id}`);
  }
}

export async function uploadSettingsToCloud(officeName: string, defaultCommission: number) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'settings', 'config'), { officeName, defaultCommission });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'settings/config');
  }
}

// --- PULL / SYNC ENTIRE DATASETS FOR RESTORATION ---

export async function fetchPlatformsFromCloud(): Promise<Platform[]> {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, 'platforms'));
    const items: Platform[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as Platform);
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'platforms');
    return [];
  }
}

export async function fetchTasksFromCloud(): Promise<Task[]> {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, 'tasks'));
    const items: Task[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as Task);
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'tasks');
    return [];
  }
}

export async function fetchQuickNotesFromCloud(): Promise<QuickNote[]> {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, 'quick_notes'));
    const items: QuickNote[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as QuickNote);
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'quick_notes');
    return [];
  }
}

export async function fetchTemplatesFromCloud(): Promise<SavedTemplate[]> {
  if (!db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, 'templates'));
    const items: SavedTemplate[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as SavedTemplate);
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'templates');
    return [];
  }
}

export async function fetchSettingsFromCloud(): Promise<{ officeName: string; defaultCommission: number } | null> {
  if (!db) return null;
  try {
    const querySnapshot = await getDocs(collection(db, 'settings'));
    let settings: any = null;
    querySnapshot.forEach((doc) => {
      if (doc.id === 'config') {
        settings = doc.data();
      }
    });
    return settings;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'settings');
    return null;
  }
}

// --- QUOTES & SERVICE FEES CLOUD PERSISTENCE ---

export async function uploadQuoteToCloud(quote: any) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'quotes', quote.id), quote);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `quotes/${quote.id}`);
  }
}

export async function deleteQuoteFromCloud(id: string) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'quotes', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `quotes/${id}`);
  }
}

export async function fetchQuotesFromCloud(): Promise<any[]> {
  if (!db) return [];
  try {
    const qSnapshot = await getDocs(collection(db, 'quotes'));
    const list: any[] = [];
    qSnapshot.forEach((docItem) => {
      list.push(docItem.data());
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'quotes');
    return [];
  }
}

export async function uploadServiceFeeToCloud(item: any) {
  if (!db) return;
  try {
    await setDoc(doc(db, 'service_fees', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `service_fees/${item.id}`);
  }
}

export async function fetchServiceFeesFromCloud(): Promise<any[]> {
  if (!db) return [];
  try {
    const snap = await getDocs(collection(db, 'service_fees'));
    const list: any[] = [];
    snap.forEach((docItem) => {
      list.push(docItem.data());
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'service_fees');
    return [];
  }
}

export async function syncAllLocalToCloud(data: {
  platforms: Platform[];
  tasks: Task[];
  quickNotes: QuickNote[];
  templates: SavedTemplate[];
  officeName: string;
  defaultCommission: number;
}) {
  if (!db) throw new Error("Firebase lies uninitialized");
  
  // Update Settings
  await uploadSettingsToCloud(data.officeName, data.defaultCommission);
  
  // Upload Platforms
  for (const item of data.platforms) {
    await uploadPlatformToCloud(item);
  }
  
  // Upload Tasks
  for (const item of data.tasks) {
    await uploadTaskToCloud(item);
  }
  
  // Upload QuickNotes
  for (const item of data.quickNotes) {
    await uploadQuickNoteToCloud(item);
  }
  
  // Upload Templates
  for (const item of data.templates) {
    await uploadTemplateToCloud(item);
  }
}

