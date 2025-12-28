import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const ensureConfig = () => {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  }
};

const createFirebaseApp = () => {
  ensureConfig();
  if (getApps().length) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
};

export const firebaseApp = createFirebaseApp();
export const firebaseAuth = getAuth(firebaseApp);

firebaseAuth.useDeviceLanguage();

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface GoogleSignInResult {
  user: FirebaseUser;
  idToken: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

export const signInWithGoogle = async (): Promise<GoogleSignInResult> => {
  const result = await signInWithPopup(firebaseAuth, googleProvider);
  const idToken = await result.user.getIdToken();
  
  return {
    user: result.user,
    idToken,
    email: result.user.email,
    name: result.user.displayName,
    picture: result.user.photoURL,
  };
};

export const signOutFirebase = () => signOut(firebaseAuth).catch(() => undefined);

