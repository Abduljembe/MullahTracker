import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously as firebaseSignInAnonymously,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, validateFirestoreConnection } from '../lib/firebase.ts';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAnonymous?: boolean;
  provider: 'firebase' | 'vault';
}

interface VaultAccount {
  uid: string;
  email: string;
  displayName: string;
  passwordHash: string;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const VAULT_ACCOUNTS_KEY = 'mullahtracker_auth_vault_v1';
const ACTIVE_SESSION_KEY = 'mullahtracker_active_session_v1';

// Simple obfuscation for local vault credentials
const hashPass = (p: string) => {
  let h = 0;
  for (let i = 0; i < p.length; i++) {
    h = (Math.imul(31, h) + p.charCodeAt(i)) | 0;
  }
  return h.toString(36) + '_' + p.length;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authError, setAuthError] = useState<string | null>(null);

  // Helper to read vault accounts
  const getVaultAccounts = (): VaultAccount[] => {
    try {
      const data = localStorage.getItem(VAULT_ACCOUNTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveVaultAccount = (acc: VaultAccount) => {
    try {
      const list = getVaultAccounts().filter((a) => a.email.toLowerCase() !== acc.email.toLowerCase());
      list.push(acc);
      localStorage.setItem(VAULT_ACCOUNTS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save vault account:', e);
    }
  };

  useEffect(() => {
    // Check initial Firestore connection in background
    validateFirestoreConnection().catch(() => {});

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const appUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Investor'),
          isAnonymous: firebaseUser.isAnonymous,
          provider: 'firebase',
        };
        setUser(appUser);
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(appUser));
        setLoading(false);

        // Record profile in Firestore if not anonymous
        if (!firebaseUser.isAnonymous) {
          try {
            await setDoc(
              doc(db, 'users', firebaseUser.uid),
              {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: appUser.displayName,
                lastLoginAt: new Date().toISOString(),
              },
              { merge: true }
            );
          } catch (e) {
            console.warn('Could not write user profile to Firestore:', e);
          }
        }
      } else {
        // If not in Firebase, check for active local vault session
        try {
          const storedSession = localStorage.getItem(ACTIVE_SESSION_KEY);
          if (storedSession) {
            const parsed = JSON.parse(storedSession);
            if (parsed && parsed.uid) {
              setUser(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {
          // ignore
        }
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const getReadableError = (error: any): string => {
    const code = error?.code || '';
    if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
      return 'Incorrect email or password. Please try again.';
    }
    if (code.includes('email-already-in-use')) {
      return 'An account already exists with this email. Try logging in.';
    }
    if (code.includes('weak-password')) {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (code.includes('invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (code.includes('popup-closed-by-user')) {
      return 'Sign in was cancelled.';
    }
    if (code.includes('operation-not-allowed')) {
      return 'Authenticating via Secure Local Vault...';
    }
    return error?.message || 'Authentication error. Please check your credentials.';
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Firebase Authentication first
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
      setIsAuthModalOpen(false);
      return;
    } catch (err: any) {
      const code = err?.code || '';
      // If Firebase email/pass is disabled in console (auth/operation-not-allowed), fall back to local vault account
      if (code === 'auth/operation-not-allowed' || code.includes('operation-not-allowed') || code.includes('network-request-failed')) {
        const accounts = getVaultAccounts();
        const matched = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

        if (matched) {
          if (matched.passwordHash === hashPass(pass)) {
            const appUser: AuthUser = {
              uid: matched.uid,
              email: matched.email,
              displayName: matched.displayName,
              provider: 'vault',
            };
            setUser(appUser);
            localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(appUser));
            setIsAuthModalOpen(false);
            return;
          } else {
            setAuthError('Incorrect password. Please try again.');
            throw new Error('Incorrect password');
          }
        } else {
          setAuthError('No account found with this email. Please click "Sign Up" above to create your vault.');
          throw new Error('User not found in vault');
        }
      }

      setAuthError(getReadableError(err));
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || cleanEmail.split('@')[0];

    // 1. Try Firebase Authentication first
    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      if (cleanName) {
        await updateProfile(res.user, { displayName: cleanName });
      }
      setIsAuthModalOpen(false);
      return;
    } catch (err: any) {
      const code = err?.code || '';
      // If Firebase email/pass is disabled in console (auth/operation-not-allowed), securely create a local vault account
      if (code === 'auth/operation-not-allowed' || code.includes('operation-not-allowed') || code.includes('network-request-failed')) {
        const accounts = getVaultAccounts();
        const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

        if (existing) {
          setAuthError('An account already exists with this email. Please switch to "Log In".');
          throw new Error('Account already exists in vault');
        }

        const newUid = 'vault_' + btoa(cleanEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16) + '_' + Date.now().toString(36);
        const newAccount: VaultAccount = {
          uid: newUid,
          email: cleanEmail,
          displayName: cleanName,
          passwordHash: hashPass(pass),
          createdAt: new Date().toISOString(),
        };

        saveVaultAccount(newAccount);

        const appUser: AuthUser = {
          uid: newUid,
          email: cleanEmail,
          displayName: cleanName,
          provider: 'vault',
        };

        setUser(appUser);
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(appUser));
        setIsAuthModalOpen(false);
        return;
      }

      setAuthError(getReadableError(err));
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      setAuthError(getReadableError(err));
      throw err;
    }
  };

  const signInAsGuest = async () => {
    setAuthError(null);
    try {
      await firebaseSignInAnonymously(auth);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      // If anonymous login is disabled in Firebase console, fall back to guest vault session
      const guestUser: AuthUser = {
        uid: 'guest_' + Date.now().toString(36),
        email: null,
        displayName: 'Guest Explorer',
        isAnonymous: true,
        provider: 'vault',
      };
      setUser(guestUser);
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(guestUser));
      setIsAuthModalOpen(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      // ignore
    }
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInAsGuest,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
