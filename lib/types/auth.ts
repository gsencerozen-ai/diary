import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthError {
  code: string;
  message: string;
}

export type AuthState = 
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated'; user: null }
  | { status: 'loading'; user: null };
