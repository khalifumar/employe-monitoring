'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  TrendingUp,
  Activity,
  HeartPulse,
  Users,
  Lightbulb,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useApp } from '@/lib/context';
import {
  DEMO_TEAMS,
  DEMO_WEEKLY_TREND,
  DEMO_HEATMAP_DATA,
  DEMO_WORKLOAD_DIST,
  DEMO_CYCLE_TIME_DIST,
  DAYS_OF_WEEK,
  WORK_HOURS,
} from '@/lib/demo-data';
import { LiveSessionPanel } from '@/components/overview/LiveSessionPanel';

export default function OverviewPage() {
  const { activeTeamId, activeRole, currentUser, t } = useApp();

  if (activeRole === 'employee') {
    return (
      <div className="py-12 sm:py-20 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-900/40 text-primary-teal flex items-center justify-center mx-auto shadow-card">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-ink-dark">
            Halaman Khusus Manajer Tim
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Anda sedang masuk dengan akun Karyawan (<strong>{currentUser?.email || 'khalifumar.al@gmail.com'}</strong>).
            Sesuai prinsip Privacy-by-Design, ringkasan agregat tim diperuntukkan bagi manajer.
            Silakan akses linimasa dan kontrol ergonomi pribadi Anda di menu <strong>Kesejahteraan Saya</strong>.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/my-wellbeing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-teal hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Buka Kesejahteraan Saya
          </Link>
        </div>
      </div>
    );
  }

  const currentTeam = DEMO_TEAMS.find((tm) => tm.id === activeTeamId) || DEMO_TEAMS[0]!;

  // Enforce k-anonymity (k >= 5)
  if (!currentTeam.meetsKAnonymity) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-ink-dark">
            {t.overview.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {currentTeam.name}
          </p>
        </div>

        {/* k-Anonymity Privacy Shield Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-surface-light dark:bg-surface-dark border border-coral/30 shadow-card flex flex-col items-center text-center max-w-2xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-coral-light dark:bg-coral-dark/50 flex items-center justify-center text-coral mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-ink dark:text-ink-dark">
            {t.common.kAnonymityWarning}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
            Sistem Selaras menerapkan aturan privasi teknis di mana data ringkasan kesehatan hanya dapat ditampilkan bila sebuah tim beranggotakan minimal <span className="font-semibold text-primary-teal">5 orang</span>. Tim ini saat ini memiliki <span className="font-semibold text-coral">{currentTeam.memberCount} orang</span>.
          </p>
          <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-border-light dark:border-border-dark text-xs text-gray-500 text-left w-full space-y-1">
            <p className="font-semibold text-gray-700 dark:text-gray-300">Mengapa aturan ini ada?</p>
            <p>
              Pada tim kecil (&lt; 5), data agregat rata-rata jam kerja rentan digunakan untuk merekonstruksi dan menebak kebiasaan satu orang individu tertentu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-ink-dark">
            {t.overview.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t.overview.subtitle} — <span className="font-semibold text-primary-teal">{currentTeam.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.common.kAnonymityNotice} ({currentTeam.memberCount} Anggota)
          </span>
        </div>
      </div>

      {/* Live Working Session Control Panel */}
      <LiveSessionPanel teamId={currentTeam.id} teamName={currentTeam.name} />

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Team Wellbeing Index */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>{t.overview.teamIndexTitle}</span>
            <HeartPulse className="w-4 h-4 text-primary-teal" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
              84
            </span>
            <span className="text-xs text-gray-400">/ 100</span>
            <span className="ml-auto inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +4%
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
            {t.overview.teamIndexDesc}
          </p>
        </div>

        {/* Card 2: Rata-rata PERCLOS */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Rata-rata PERCLOS Tim</span>
            <Activity className="w-4 h-4 text-primary-indigo" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
              7.1%
            </span>
            <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Optimal (&lt; 15%)
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
            Proporsi mata tertutup dalam jendela 60s
          </p>
        </div>

        {/* Card 3: Skor Postur Rata-rata */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>Skor Postur Ergonomis</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
              85
            </span>
            <span className="text-xs text-gray-400">/ 100</span>
            <span className="ml-auto inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Stabil
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
            Deviasi leher & bahu terkendali
          </p>
        </div>

        {/* Card 4: Trust Metric */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft hover:shadow-card transition-shadow">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span>{t.common.trustMetric}</span>
            <Users className="w-4 h-4 text-primary-teal" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
              {currentTeam.participationRate}%
            </span>
            <span className="ml-auto text-xs text-gray-400">
              5 dari 6 Karyawan
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate">
            Partisipasi sukarela tanpa paksaan
          </p>
        </div>
      </div>

      {/* Row 2: 7-Day Circadian Fatigue Trend */}
      <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-ink dark:text-ink-dark">
              {t.overview.fatigueTrend}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rata-rata kelelahan mata dan skor postur tim selama 7 hari kerja terakhir
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-teal"></span>
              Skor Postur
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-indigo"></span>
              Indikator Fokus
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMO_WEEKLY_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="postureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#8C97A7" fontSize={11} tickLine={false} />
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
              <Area type="monotone" dataKey="postureScore" stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#postureGradient)" />
              <Area type="monotone" dataKey="focusScore" stroke="#4F46E5" strokeWidth={2} strokeDasharray="3 3" fillOpacity={1} fill="url(#focusGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Risky Hours Heatmap & Early Warning Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-ink dark:text-ink-dark">
                {t.overview.heatmapTitle}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.overview.heatmapSubtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span>Segar</span>
              <span className="w-3 h-3 rounded bg-teal-100 dark:bg-teal-950"></span>
              <span className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-900"></span>
              <span className="w-3 h-3 rounded bg-coral/80"></span>
              <span>Lelah</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[480px]">
              {/* Hours Header */}
              <div className="grid grid-cols-10 gap-1.5 text-center text-[10px] text-gray-400 font-mono mb-2">
                <div></div>
                {WORK_HOURS.map((h) => (
                  <div key={h}>{h}:00</div>
                ))}
              </div>

              {/* Day Rows */}
              {DAYS_OF_WEEK.map((d) => (
                <div key={d} className="grid grid-cols-10 gap-1.5 items-center mb-1.5">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">{d}</div>
                  {WORK_HOURS.map((h) => {
                    const cell = DEMO_HEATMAP_DATA.find((item) => item.day === d && item.hour === h);
                    const risk = cell?.fatigueRisk || 0;

                    // Color based on risk (Calm Tech palette: teal -> amber -> soft coral)
                    let bgClass = 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300';
                    if (risk >= 70) {
                      bgClass = 'bg-coral text-white font-bold shadow-sm';
                    } else if (risk >= 45) {
                      bgClass = 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200';
                    } else if (risk >= 25) {
                      bgClass = 'bg-teal-100/70 dark:bg-teal-900/40 text-teal-900 dark:text-teal-200';
                    }

                    return (
                      <div
                        key={h}
                        className={`h-9 rounded-lg flex items-center justify-center text-xs transition-transform hover:scale-105 cursor-pointer ${bgClass}`}
                        title={`${d} Pukul ${h}:00 — Indeks Kelelahan: ${risk}%`}
                      >
                        {risk > 0 ? `${risk}%` : '-'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Early Warning Cards (1 col) */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-bold text-ink dark:text-ink-dark">
                {t.overview.earlyWarningsTitle}
              </h2>
            </div>

            <div className="space-y-3.5">
              {/* Suggestion 1 */}
              <div className="p-3.5 rounded-xl border border-coral/30 bg-coral-light/60 dark:bg-coral-dark/20 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-coral mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{t.overview.suggestion1Title}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t.overview.suggestion1Desc}
                </p>
              </div>

              {/* Suggestion 2 */}
              <div className="p-3.5 rounded-xl border border-primary-teal/30 bg-teal-50/60 dark:bg-teal-950/20 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-primary-teal mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.overview.suggestion2Title}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t.overview.suggestion2Desc}
                </p>
              </div>

              {/* Suggestion 3 */}
              <div className="p-3.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-subtle-light dark:bg-surface-subtle-dark text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.overview.suggestion3Title}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t.overview.suggestion3Desc}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark text-[11px] text-gray-500">
            Saran aksi dihasilkan otomatis dari aturan ergonomis dan pola SHAP tim.
          </div>
        </div>
      </div>

      {/* Row 4: Workload & Cycle Time Distribution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
          <h2 className="text-base font-bold text-ink dark:text-ink-dark mb-1">
            {t.overview.workloadDistribution}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Survei mikro mandiri 2x sehari (Skala NASA-TLX 1–5)
          </p>
          <div className="space-y-2.5">
            {DEMO_WORKLOAD_DIST.map((w) => (
              <div key={w.level} className="text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-300 mb-1">
                  <span>{w.level}</span>
                  <span className="font-semibold">{w.percentage}% ({w.count} respons)</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary-teal h-2 rounded-full transition-all duration-500"
                    style={{ width: `${w.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
          <h2 className="text-base font-bold text-ink dark:text-ink-dark mb-1">
            {t.overview.cycleTimeDistribution}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Distribusi durasi pengerjaan tugas dari popup task timer
          </p>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEMO_CYCLE_TIME_DIST}>
                <XAxis dataKey="bucket" stroke="#8C97A7" fontSize={11} tickLine={false} />
                <YAxis stroke="#8C97A7" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(24, 28, 36, 0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="tasksCount" fill="#4F46E5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
