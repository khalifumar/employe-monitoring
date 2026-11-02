'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Moon,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '@/lib/context';

export default function SettingsPage() {
  const { t } = useApp();

  const [quietHoursStart, setQuietHoursStart] = useState('18:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('08:00');
  const [weekendPause, setWeekendPause] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-ink-dark">
          {t.settings.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Pengaturan berhasil diperbarui.</span>
        </div>
      )}

      {/* Card 1: k-Anonymity Threshold (Locked) */}
      <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-teal" />
              <h2 className="text-base font-bold text-ink dark:text-ink-dark">
                {t.settings.kAnonymityLabel}
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t.settings.kAnonymityHelp}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-mono font-bold text-gray-700 dark:text-gray-200 border border-border-light dark:border-border-dark">
            <Lock className="w-3.5 h-3.5 text-coral" />
            <span>k = 5 (Minimum Mutlak)</span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark text-xs text-gray-600 dark:text-gray-300">
          Aturan $k$-anonymity ditegakkan di level database view PostgreSQL (`HAVING COUNT(DISTINCT user_id) &gt;= 5`). Tidak ada pengaturan manajer atau admin yang dapat menurunkan nilai ini.
        </div>
      </div>

      {/* Card 2: Quiet Hours */}
      <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <Moon className="w-5 h-5 text-primary-indigo" />
          <h2 className="text-base font-bold text-ink dark:text-ink-dark">
            {t.settings.quietHoursTitle}
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          {t.settings.quietHoursDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
              Mulai Jam Tenang (Malam)
            </label>
            <input
              type="time"
              value={quietHoursStart}
              onChange={(e) => setQuietHoursStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
              Selesai Jam Tenang (Pagi)
            </label>
            <input
              type="time"
              value={quietHoursEnd}
              onChange={(e) => setQuietHoursEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark"
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Otomatis Nonaktifkan Pemantauan di Akhir Pekan (Sabtu &amp; Minggu)
          </span>
          <button
            onClick={() => setWeekendPause(!weekendPause)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              weekendPause ? 'bg-primary-teal' : 'bg-gray-300 dark:bg-gray-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                weekendPause ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Card 3: Data Retention Policy */}
      <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-emerald-500" />
          <h2 className="text-base font-bold text-ink dark:text-ink-dark">
            {t.settings.orgPoliciesTitle}
          </h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t.settings.orgRetentionDesc}
        </p>

        <div className="p-4 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-500">Masa Simpan Data Menit Mentah</span>
            <span className="font-semibold font-mono">90 Hari</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Mekanisme Pembersihan</span>
            <span className="font-semibold font-mono">PostgreSQL pg_cron (Pukul 03.00 UTC)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Penyimpanan Metrik Agregat Bulanan</span>
            <span className="font-semibold font-mono">12 Bulan (Tanpa ID Pengguna)</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-primary-teal text-white hover:opacity-90 shadow-soft transition-all"
        >
          {t.common.saveChanges}
        </button>
      </div>
    </div>
  );
}
