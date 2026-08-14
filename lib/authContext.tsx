'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'operator';
  createdAt: string;
}

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isSiteAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'evchargers_admin_session';
const REGISTERED_USERS_KEY = 'evchargers_registered_admins';

// Helper to determine if an email belongs to a Super Admin (Unrestricted access)
export function checkIsSiteAdmin(email?: string, role?: string): boolean {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  return (
    clean === 'admin@evchargers.rw' ||
    clean.startsWith('admin@') ||
    clean.endsWith('@evchargers.rw') ||
    role === 'superadmin'
  );
}

// Pre-seeded Demo Accounts
const DEFAULT_SITE_ADMIN: AdminUser = {
  id: 'usr-admin-01',
  email: 'admin@evchargers.rw',
  name: 'Super Admin (Unrestricted)',
  role: 'superadmin',
  createdAt: new Date().toISOString(),
};

const DEFAULT_OPERATOR: AdminUser = {
  id: 'usr-operator-02',
  email: 'operator@kigalihub.rw',
  name: 'Kigali Hub Operator',
  role: 'operator',
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on mount
  useEffect(() => {
    async function initSession() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const email = session.user.email || 'operator@evchargers.rw';
            const isAdm = checkIsSiteAdmin(email);
            setUser({
              id: session.user.id,
              email,
              name: session.user.user_metadata?.name || (isAdm ? 'Site Admin' : 'Host Operator'),
              role: isAdm ? 'superadmin' : 'operator',
              createdAt: session.user.created_at,
            });
          }
        } else {
          // Zero-config local persistence
          const savedSession = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (savedSession) {
            setUser(JSON.parse(savedSession));
          }
        }
      } catch (err) {
        console.warn('Error restoring auth session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Supabase Connected
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const isAdm = checkIsSiteAdmin(data.user.email);
          const adminUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: data.user.user_metadata?.name || (isAdm ? 'Site Administrator' : 'Station Host'),
            role: isAdm ? 'superadmin' : 'operator',
            createdAt: data.user.created_at,
          };
          setUser(adminUser);
          setIsLoading(false);
          return { success: true };
        }
      }

      // 2. Zero-config Local Fallback Mode
      // Check pre-seeded site admin
      if (cleanEmail === 'admin@evchargers.rw' && password === 'Admin123!') {
        setUser(DEFAULT_SITE_ADMIN);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_ADMIN));
        setIsLoading(false);
        return { success: true };
      }

      // Check pre-seeded operator
      if (cleanEmail === 'operator@kigalihub.rw' && (password === 'Host123!' || password === 'Admin123!')) {
        setUser(DEFAULT_OPERATOR);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_OPERATOR));
        setIsLoading(false);
        return { success: true };
      }

      // Check registered accounts in localStorage
      const registeredJson = localStorage.getItem(REGISTERED_USERS_KEY);
      const registeredList: { user: AdminUser; pass: string }[] = registeredJson
        ? JSON.parse(registeredJson)
        : [];

      const found = registeredList.find(
        (u) => u.user.email === cleanEmail && u.pass === password
      );

      if (found) {
        setUser(found.user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(found.user));
        setIsLoading(false);
        return { success: true };
      }

      // Fallback for simple admin passwords in testing
      if (password.length >= 6 && cleanEmail.includes('@')) {
        const isAdm = checkIsSiteAdmin(cleanEmail);
        const adHocUser: AdminUser = {
          id: `usr-${Date.now()}`,
          email: cleanEmail,
          name: cleanEmail.split('@')[0].toUpperCase(),
          role: isAdm ? 'superadmin' : 'operator',
          createdAt: new Date().toISOString(),
        };
        setUser(adHocUser);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(adHocUser));
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return {
        success: false,
        error: 'Invalid email or password. Password must be at least 6 characters.',
      };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Login failed' };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        setIsLoading(false);
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (password.length < 6) {
        setIsLoading(false);
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      const isAdm = checkIsSiteAdmin(cleanEmail);

      // 1. Supabase Signup
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { name: name.trim() || (isAdm ? 'Site Admin' : 'Station Host') },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const adminUser: AdminUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: name.trim() || (isAdm ? 'Site Admin' : 'Station Host'),
            role: isAdm ? 'superadmin' : 'operator',
            createdAt: data.user.created_at,
          };
          setUser(adminUser);
          setIsLoading(false);
          return { success: true };
        }
      }

      // 2. Local Fallback Signup
      const newUser: AdminUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: name.trim() || cleanEmail.split('@')[0],
        role: isAdm ? 'superadmin' : 'operator',
        createdAt: new Date().toISOString(),
      };

      const registeredJson = localStorage.getItem(REGISTERED_USERS_KEY);
      const registeredList: { user: AdminUser; pass: string }[] = registeredJson
        ? JSON.parse(registeredJson)
        : [];

      // Check if already registered
      if (registeredList.some((r) => r.user.email === cleanEmail)) {
        setIsLoading(false);
        return { success: false, error: 'An account with this email already exists. Please sign in.' };
      }

      registeredList.push({ user: newUser, pass: password });
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredList));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUser));

      setUser(newUser);
      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Signup failed' };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const isSiteAdmin = Boolean(user && checkIsSiteAdmin(user.email, user.role));

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        isAuthenticated: !!user,
        isSiteAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
