'use client';

import React, { useState } from 'react';
import {
  Eye,
  Coffee,
  CheckCircle2,
  Lock,
  Compass,
  Bell,
  Video,
  Sliders,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '@/lib/context';
import { DEMO_PERSONAL_TIMELINE } from '@/lib/demo-data';

export default function MyWellbeingPage() {
  const { t, currentUser } = useApp();

  // Nudge local settings state
  const [eyeRestNudge, setEyeRestNudge] = useState(true);
  const [stretchNudge, setStretchNudge] = useState(true);
  const [meetingMode, setMeetingMode] = useState(false);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with Privacy Reassurance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Lock className="w-3 h-3" />
              Ruang Privat Anda
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Profil: {currentUser?.name || 'Khalif Umar Al Faruq'} ({currentUser?.email || 'khalifumar.al@gmail.com'})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-ink-dark mt-2">
            {t.myWellbeing.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.myWellbeing.subtitle}
          </p>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Postur Hari Ini */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Skor Postur Hari Ini</span>
            <Compass className="w-4 h-4 text-primary-teal" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-ink dark:text-ink-dark">
              88
            </span>
            <span className="text-xs text-gray-400">/ 100</span>
            <span className="ml-auto text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Tegak Stabil
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
            Deviasi leher hanya 4° dari kalibrasi
          </p>
        </div>

        {/* Card 2: Kesegaran Mata */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Indikator Kesegaran Mata</span>
            <Eye className="w-4 h-4 text-primary-indigo" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-ink dark:text-ink-dark">
              5.2%
            </span>
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Rileks & Terjaga
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
            PERCLOS rata-rata sesi kerja hari ini
          </p>
        </div>

        {/* Card 3: Break Streak */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>{t.myWellbeing.breakStreakTitle}</span>
            <Coffee className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-ink dark:text-ink-dark">
              4 Jeda
            </span>
            <span className="ml-auto text-xs text-emerald-600 font-semibold">
              Terjaga
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
            {t.myWellbeing.breakStreakDesc}
          </p>
        </div>

        {/* Card 4: Baseline Status */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Status Kalibrasi Diri</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-ink dark:text-ink-dark">
              Aktif & Valid
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
            Basis postur netral terdaftar
          </p>
        </div>
      </div>

      {/* Row 2: Today's Timeline Chart */}
      <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-ink dark:text-ink-dark">
              {t.myWellbeing.todayTimeline}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pemantauan perubahan postur dan pemulihan setelah jeda istirahat
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-teal"></span>
              Skor Postur
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              Titik Jeda Sehat
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMO_PERSONAL_TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="personalPosture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#8C97A7" fontSize={11} tickLine={false} />
              <YAxis domain={[50, 100]} stroke="#8C97A7" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(24, 28, 36, 0.95)',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="postureScore" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#personalPosture)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline Log Highlights */}
        <div className="mt-6 pt-4 border-t border-border-light dark:border-border-dark">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Catatan Peristiwa Hari Ini
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {DEMO_PERSONAL_TIMELINE.filter((p) => p.isBreak).map((b, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-xs flex items-center gap-2.5"
              >
                <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-amber-900 dark:text-amber-200">{b.time}</div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 truncate">{b.state}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Nudge Settings & Calibration Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nudge Preferences */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary-teal" />
            <h2 className="text-base font-bold text-ink dark:text-ink-dark">
              {t.myWellbeing.nudgeSettingsTitle}
            </h2>
          </div>

          <div className="space-y-4">
            {/* Eye rest */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark">
              <div>
                <p className="text-xs font-semibold text-ink dark:text-ink-dark">
                  {t.myWellbeing.nudgeEyeRest}
                </p>
                <p className="text-[11px] text-gray-500">
                  Setiap 20 menit, alihkan pandangan ke objek 20 kaki (6m) selama 20 detik.
                </p>
              </div>
              <button
                onClick={() => setEyeRestNudge(!eyeRestNudge)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  eyeRestNudge ? 'bg-primary-teal' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    eyeRestNudge ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Stretch Nudge */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark">
              <div>
                <p className="text-xs font-semibold text-ink dark:text-ink-dark">
                  {t.myWellbeing.nudgeStretch}
                </p>
                <p className="text-[11px] text-gray-500">
                  Pengingat berdiri dan meregangkan punggung setelah duduk terus-menerus.
                </p>
              </div>
              <button
                onClick={() => setStretchNudge(!stretchNudge)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  stretchNudge ? 'bg-primary-teal' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    stretchNudge ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Meeting Mode */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-primary-indigo" />
                <div>
                  <p className="text-xs font-semibold text-ink dark:text-ink-dark">
                    {t.myWellbeing.meetingModeLabel}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Kamera vision dijeda sementara, waktu idle tanpa ketikan tidak dipenalti.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMeetingMode(!meetingMode)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  meetingMode ? 'bg-primary-indigo' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    meetingMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Calibration Baseline Card */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sliders className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-ink dark:text-ink-dark">
                {t.myWellbeing.personalBaselineTitle}
              </h2>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {t.myWellbeing.personalBaselineDesc}
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border-light dark:border-border-dark">
                <span className="text-gray-500">Sudut Leher Netral</span>
                <span className="font-semibold font-mono">12.0° relatif vertikal</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border-light dark:border-border-dark">
                <span className="text-gray-500">Kemiringan Bahu Netral</span>
                <span className="font-semibold font-mono">2.0° horizontal</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border-light dark:border-border-dark">
                <span className="text-gray-500">Jarak Mata ke Layar (Proxy)</span>
                <span className="font-semibold font-mono">45.0 px (Jarak Ideal ~50–70cm)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">EAR Buka Mata Netral</span>
                <span className="font-semibold font-mono">0.32</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-xs">
            <span className="text-gray-500">Kalibrasi ulang di ekstensi</span>
            <button className="text-xs font-semibold text-primary-teal hover:underline">
              Buka Wizard Kalibrasi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
