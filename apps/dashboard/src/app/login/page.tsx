'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Users,
  User,
  ShieldCheck,
  ArrowRight,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { useApp, PREDEFINED_USERS } from '@/lib/context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  const [customEmail, setCustomEmail] = useState('');
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

  const handleQuickLogin = (email: string, targetPath: string) => {
    setLoadingEmail(email);
    setTimeout(() => {
      login(email);
      router.push(targetPath);
    }, 300);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;

    setLoadingEmail(customEmail);
    setTimeout(() => {
      const user = login(customEmail);
      if (user.role === 'manager') {
        router.push('/');
      } else {
        router.push('/my-wellbeing');
      }
    }, 300);
  };

  const managerUser = PREDEFINED_USERS['khalifumardev@gmail.com']!;
  const employeeUser = PREDEFINED_USERS['khalifumar.al@gmail.com']!;

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-14 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-teal/10 text-primary-teal dark:text-teal-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sistem Autentikasi Berbasis Peran (Role-Based Access)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink dark:text-ink-dark">
          Masuk ke Portal Selaras
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          Pilih akun peran untuk langsung mengakses halaman analitik yang sesuai dengan wewenang Anda.
        </p>
      </div>

      {/* Two Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Manager Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-light dark:bg-surface-dark border-2 border-primary-indigo/30 dark:border-primary-indigo/40 shadow-card flex flex-col justify-between hover:shadow-hover transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 text-primary-indigo flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950/80 text-primary-indigo border border-indigo-200 dark:border-indigo-800">
                ROLE: MANAJER
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-ink dark:text-ink-dark group-hover:text-primary-indigo transition-colors">
                Akun Manajer Tim
              </h2>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                {managerUser.email}
              </p>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Melihat **Ringkasan Agregat Tim**, Peta Jam Berisiko (*Heatmap*), Rekomendasi Tindakan Dini, dan penegakan batas privasi $k \ge 5$.
            </p>

            <div className="pt-2 border-t border-border-light dark:border-border-dark space-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Halaman Utama: <strong>Ringkasan Tim (/)</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Wawasan Tambahan: <strong>Wawasan Tim (/insights)</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => handleQuickLogin(managerUser.email, '/')}
              disabled={loadingEmail !== null}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-primary-indigo to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>{loadingEmail === managerUser.email ? 'Memuat Sesi...' : 'Masuk sebagai Manajer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Employee Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-light dark:bg-surface-dark border-2 border-primary-teal/30 dark:border-primary-teal/40 shadow-card flex flex-col justify-between hover:shadow-hover transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/40 text-primary-teal flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/80 text-primary-teal border border-teal-200 dark:border-teal-800">
                ROLE: KARYAWAN
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-ink dark:text-ink-dark group-hover:text-primary-teal transition-colors">
                Akun Karyawan
              </h2>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                {employeeUser.email}
              </p>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Melihat **Linimasa Ergonomi Pribadi**, skor kestabilan postur, kendali sakelar persetujuan data, serta hak ekspor atau penghapusan data mandiri.
            </p>

            <div className="pt-2 border-t border-border-light dark:border-border-dark space-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                <span>Halaman Utama: <strong>Kesejahteraan Saya (/my-wellbeing)</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                <span>Kontrol Penuh: <strong>Pusat Privasi (/privacy)</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => handleQuickLogin(employeeUser.email, '/my-wellbeing')}
              disabled={loadingEmail !== null}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-primary-teal to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>{loadingEmail === employeeUser.email ? 'Memuat Sesi...' : 'Masuk sebagai Karyawan'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Email Input Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft space-y-4 max-w-xl mx-auto">
        <h3 className="text-sm font-bold text-ink dark:text-ink-dark flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary-teal" />
          Atau Masuk dengan Email Lain
        </h3>
        <form onSubmit={handleCustomSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="email"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            placeholder="Masukkan email Anda..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-gray-50 dark:bg-gray-800/80 text-xs text-ink dark:text-ink-dark focus:outline-none focus:ring-2 focus:ring-primary-teal"
          />
          <button
            type="submit"
            disabled={!customEmail.trim() || loadingEmail !== null}
            className="px-5 py-2.5 rounded-xl bg-ink dark:bg-white text-white dark:text-ink font-semibold text-xs disabled:opacity-50 transition-opacity"
          >
            Masuk
          </button>
        </form>
        <p className="text-[11px] text-gray-400">
          Tip: Gunakan email <code className="font-mono text-teal-600">khalifumardev@gmail.com</code> untuk Manager atau <code className="font-mono text-teal-600">khalifumar.al@gmail.com</code> untuk Karyawan.
        </p>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-center text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center justify-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Prinsip Keamanan &amp; Privasi Selaras</span>
        </div>
        <p>
          Manajer hanya melihat ringkasan agregat tim ($k \ge 5$). Karyawan memegang hak penuh atas data pribadi dan izin webcam on-device.
        </p>
      </div>
    </div>
  );
}
