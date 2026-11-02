'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, type Language } from './i18n';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'manager' | 'employee';
  teamId: string;
  teamName: string;
}

export const PREDEFINED_USERS: Record<string, UserSession> = {
  'khalifumardev@gmail.com': {
    id: '10000000-0000-0000-0000-000000000001',
    email: 'khalifumardev@gmail.com',
    name: 'Khalif Umar (Manager)',
    role: 'manager',
    teamId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    teamName: 'Tim Frontend Engineering (k=6)',
  },
  'khalifumar.al@gmail': {
    id: '10000000-0000-0000-0000-000000000002',
    email: 'khalifumar.al@gmail.com',
    name: 'Khalif Umar Al Faruq (Karyawan)',
    role: 'employee',
    teamId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    teamName: 'Tim Frontend Engineering (k=6)',
  },
  'khalifumar.al@gmail.com': {
    id: '10000000-0000-0000-0000-000000000002',
    email: 'khalifumar.al@gmail.com',
    name: 'Khalif Umar Al Faruq (Karyawan)',
    role: 'employee',
    teamId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    teamName: 'Tim Frontend Engineering (k=6)',
  },
};

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  activeRole: 'manager' | 'employee';
  setActiveRole: (role: 'manager' | 'employee') => void;
  activeTeamId: string;
  setActiveTeamId: (teamId: string) => void;
  currentUser: UserSession | null;
  login: (email: string) => UserSession;
  logout: () => void;
  t: (typeof translations)[Language];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('id');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [demoMode, setDemoMode] = useState(true);
  
  // Default to Manager account
  const defaultUser = PREDEFINED_USERS['khalifumardev@gmail.com']!;
  const [currentUser, setCurrentUser] = useState<UserSession | null>(defaultUser);
  const [activeRole, setActiveRole] = useState<'manager' | 'employee'>('manager');
  const [activeTeamId, setActiveTeamId] = useState('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

  useEffect(() => {
    // Check initial dark mode from DOM or localStorage
    const savedTheme = localStorage.getItem('selaras_theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    const savedLang = localStorage.getItem('selaras_lang') as Language | null;
    if (savedLang) {
      setLanguage(savedLang);
    }
    const savedEmail = localStorage.getItem('selaras_user_email');
    if (savedEmail && PREDEFINED_USERS[savedEmail]) {
      const user = PREDEFINED_USERS[savedEmail]!;
      setCurrentUser(user);
      setActiveRole(user.role);
      setActiveTeamId(user.teamId);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('selaras_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('selaras_lang', lang);
  };

  const login = (email: string): UserSession => {
    const normalized = email.trim().toLowerCase();
    const matched = PREDEFINED_USERS[normalized];
    
    const user: UserSession = matched || {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: normalized,
      name: normalized.startsWith('manager') || normalized.includes('dev') ? 'User Manajer' : 'Karyawan',
      role: normalized.startsWith('manager') || normalized.includes('dev') ? 'manager' : 'employee',
      teamId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      teamName: 'Tim Frontend Engineering (k=6)',
    };

    setCurrentUser(user);
    setActiveRole(user.role);
    setActiveTeamId(user.teamId);
    localStorage.setItem('selaras_user_email', user.email);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('selaras_user_email');
  };

  const t = translations[language];

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        theme,
        toggleTheme,
        demoMode,
        setDemoMode,
        activeRole,
        setActiveRole: (role) => {
          setActiveRole(role);
          if (currentUser) {
            setCurrentUser({ ...currentUser, role });
          }
        },
        activeTeamId,
        setActiveTeamId,
        currentUser,
        login,
        logout,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
