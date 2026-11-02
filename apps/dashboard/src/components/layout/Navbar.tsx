'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sun,
  Moon,
  Users,
  Menu,
  X,
  Sparkles,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { DEMO_TEAMS } from '@/lib/demo-data';

export function Navbar() {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
    activeRole,
    activeTeamId,
    setActiveTeamId,
    currentUser,
    logout,
    t,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const allNavLinks = [
    { href: '/', label: t.nav.overview, role: 'manager' },
    { href: '/insights', label: t.nav.insights, role: 'manager' },
    { href: '/my-wellbeing', label: t.nav.myWellbeing, role: 'all' },
    { href: '/privacy', label: t.nav.privacyCenter, role: 'all' },
    { href: '/settings', label: t.nav.settings, role: 'all' },
    { href: '/onboarding', label: t.nav.onboarding, role: 'all' },
  ];

  const visibleNavLinks = allNavLinks.filter(
    (link) => link.role === 'all' || link.role === activeRole
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-border-light dark:border-border-dark">
      {/* Simulation Banner */}
      <div className="bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-teal-500/10 border-b border-teal-500/20 px-4 py-1 text-xs text-center flex items-center justify-center gap-2 text-teal-800 dark:text-teal-200">
        <span className="px-1.5 py-0.5 rounded font-mono font-bold bg-teal-600 text-white text-[10px]">
          {t.demoMode}
        </span>
        <span className="truncate">{t.demoNotice}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href={activeRole === 'manager' ? '/' : '/my-wellbeing'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-teal to-primary-indigo flex items-center justify-center shadow-soft text-white transition-transform group-hover:scale-105">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-teal to-primary-indigo bg-clip-text text-transparent">
              {t.brand}
            </span>
            <span className="hidden sm:block text-[11px] text-gray-500 dark:text-gray-400 -mt-1">
              Wellbeing Assistant
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {visibleNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-teal/10 text-primary-teal dark:text-teal-400 font-semibold shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/60'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Team Switcher (Only visible for Manager role to test k>=5 vs k<5) */}
          {activeRole === 'manager' && (
            <div className="hidden lg:flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/80 px-2 py-1 rounded-xl text-xs">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <select
                aria-label="Pilih Tim"
                value={activeTeamId}
                onChange={(e) => setActiveTeamId(e.target.value)}
                className="bg-transparent border-none text-xs font-medium focus:ring-0 cursor-pointer pr-1"
              >
                {DEMO_TEAMS.map((tm) => (
                  <option key={tm.id} value={tm.id} className="dark:bg-gray-900">
                    {tm.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* User Account / Role Badge */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-2.5 py-1 rounded-xl shadow-soft text-xs">
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] text-white ${
                currentUser.role === 'manager' ? 'bg-primary-indigo' : 'bg-primary-teal'
              }`}>
                {currentUser.role === 'manager' ? 'M' : 'K'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-semibold block text-[11px] leading-tight text-ink dark:text-ink-dark">
                  {currentUser.role === 'manager' ? 'Manajer' : 'Karyawan'}
                </span>
                <span className="text-[10px] text-gray-400 block font-mono truncate max-w-[120px]">
                  {currentUser.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar / Ganti Akun"
                className="ml-1 p-1 rounded-lg text-gray-400 hover:text-coral hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-teal hover:bg-teal-700 text-white text-xs font-bold shadow-soft transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </Link>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Language"
            aria-label="Ganti Bahasa"
          >
            <span className="text-xs font-bold font-mono uppercase">{language}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Theme"
            aria-label="Ganti Tema"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-4 space-y-2">
          {visibleNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-base font-medium ${
                  isActive
                    ? 'bg-primary-teal/10 text-primary-teal font-semibold'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {activeRole === 'manager' && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
              <label className="text-xs text-gray-500 block mb-1">Simulasi Tim:</label>
              <select
                aria-label="Pilih Tim Mobile"
                value={activeTeamId}
                onChange={(e) => setActiveTeamId(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border-none"
              >
                {DEMO_TEAMS.map((tm) => (
                  <option key={tm.id} value={tm.id} className="dark:bg-gray-900">
                    {tm.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-500">{currentUser?.email}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-coral font-semibold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
