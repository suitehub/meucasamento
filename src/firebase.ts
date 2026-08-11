import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  User,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AppState } from './types';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with Database ID from configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Operation types for detailed Firestore error tracking
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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection to Firestore
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is restricted.');
    } else {
      console.log('Firebase connection test completed.');
    }
    return false;
  }
}

// Execute initial connection check
testConnection();

// Auth Helpers
export async function signInWithCredentials(username: string, pass: string): Promise<User | null> {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const userAccount = cleanUsername || 'casamento';
  const email = `${userAccount}@meucasamento.app`;
  let password = pass.trim() || '261223';
  if (password.length < 6) {
    password = password.padEnd(6, '0');
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (err: any) {
    console.warn('signInWithEmailAndPassword failed, creating account...', err?.code || err);
    try {
      const createRes = await createUserWithEmailAndPassword(auth, email, password);
      return createRes.user;
    } catch (createErr: any) {
      console.warn('createUserWithEmailAndPassword failed:', createErr?.code || createErr);
      if (createErr.code === 'auth/email-already-in-use') {
        try {
          const retryRes = await signInWithEmailAndPassword(auth, email, password);
          return retryRes.user;
        } catch (retryErr) {
          console.error('Retry sign in failed:', retryErr);
          alert('Senha incorreta para a conta "' + userAccount + '".');
          return null;
        }
      }
    }
    // Fallback if Email/Password provider is disabled in Firebase console
    try {
      const anonRes = await signInAnonymously(auth);
      return anonRes.user;
    } catch (anonErr) {
      console.error('Erro de login:', anonErr);
      alert('Não foi possível realizar o login. Tente novamente.');
      return null;
    }
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Erro ao fazer login com Google:', error);
    alert('Não foi possível concluir o login com o Google. Tente novamente.');
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
}

// Firestore Sync for Wedding App State
export async function saveWeddingToFirestore(userId: string, state: AppState): Promise<void> {
  const docPath = `weddings/${userId}`;
  try {
    await setDoc(doc(db, 'weddings', userId), {
      userId,
      config: state.config,
      entries: state.entries || {},
      budgets: state.budgets || [],
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function getWeddingFromFirestore(userId: string): Promise<AppState | null> {
  const docRef = doc(db, 'weddings', userId);
  try {
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      if (data && data.config) {
        return {
          config: data.config,
          entries: data.entries || {},
          budgets: Array.isArray(data.budgets) ? data.budgets : [],
        };
      }
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `weddings/${userId}`);
    return null;
  }
}

export function subscribeToWedding(
  userId: string,
  onData: (state: AppState, exists: boolean) => void,
  onError?: (err: unknown) => void
): () => void {
  const docRef = doc(db, 'weddings', userId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && data.config) {
          onData(
            {
              config: data.config,
              entries: data.entries || {},
              budgets: Array.isArray(data.budgets) ? data.budgets : [],
            },
            true
          );
        } else {
          onData(
            {
              config: data.config || ({} as any),
              entries: {},
              budgets: [],
            },
            false
          );
        }
      } else {
        onData(
          {
            config: {} as any,
            entries: {},
            budgets: [],
          },
          false
        );
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `weddings/${userId}`);
      if (onError) onError(error);
    }
  );
}
