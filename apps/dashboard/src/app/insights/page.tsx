'use client';

import React from 'react';
import Link from 'next/link';
import {
  Brain,
  TrendingDown,
  TrendingUp,
  ScatterChart as ScatterIcon,
  Sparkles,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '@/lib/context';
import {
  DEMO_SHAP_FACTORS,
  DEMO_CORRELATION_POINTS,
  DEMO_TEAMS,
} from '@/lib/demo-data';

export default function InsightsPage() {
  const { activeTeamId, activeRole, currentUser, t } = useApp();

  if (activeRole === 'employee') {
    return (
      <div className="py-12 sm:py-20 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-900/40 text-primary-indigo flex items-center justify-center mx-auto shadow-card">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-ink-dark">
            Halaman Khusus Manajer Tim
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Wawasan faktor risiko tim diperuntukkan bagi manajer. Anda sedang masuk sebagai <strong>{currentUser?.name || 'Karyawan'}</strong> ({currentUser?.email}).
            Silakan akses data pribadi Anda di menu <strong>Kesejahteraan Saya</strong>.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/my-wellbeing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-indigo hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Buka Kesejahteraan Saya
          </Link>
        </div>
      </div>
    );
  }

  const currentTeam = DEMO_TEAMS.find((tm) => tm.id === activeTeamId) || DEMO_TEAMS[0]!;

  if (!currentTeam.meetsKAnonymity) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-surface-light dark:bg-surface-dark border border-coral/30 shadow-card text-center max-w-xl mx-auto my-12">
        <h2 className="text-xl font-bold text-ink dark:text-ink-dark">
          {t.common.kAnonymityWarning}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Analisis faktor Machine Learning disembunyikan untuk menjaga privasi anggota tim &lt; 5.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-indigo/10 text-primary-indigo dark:text-indigo-400">
            Explainable AI (XAI)
          </span>
          <span className="text-xs text-gray-400 font-mono">Model v1: XGBoost + TreeSHAP</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-ink-dark mt-2">
          {t.insights.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.insights.subtitle}
        </p>
      </div>

      {/* Row 1: SHAP Factor Attribution */}
      <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-ink dark:text-ink-dark flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-teal" />
              {t.insights.topFactorsTitle}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Pengaruh rata-rata masing-masing sinyal numerik terhadap probabilitas kelelahan
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-coral font-medium">
              <span className="w-2.5 h-2.5 rounded bg-coral"></span>
              Pendorong Risiko
            </span>
            <span className="flex items-center gap-1 text-primary-teal font-medium">
              <span className="w-2.5 h-2.5 rounded bg-primary-teal"></span>
              Faktor Protektif
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {DEMO_SHAP_FACTORS.map((item, idx) => {
            const isProtective = item.impact < 0;
            const barWidth = Math.abs(item.impact) * 200; // normalized to %

            return (
              <div key={idx} className="p-3.5 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink dark:text-ink-dark">
                      {item.factor}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {item.category}
                    </span>
                  </div>
                  <span
                    className={`font-mono font-bold ${
                      isProtective ? 'text-primary-teal' : 'text-coral'
                    }`}
                  >
                    {isProtective ? '' : '+'}
                    {item.impact.toFixed(2)} SHAP
                  </span>
                </div>

                {/* Magnitude Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-700 ${
                      isProtective ? 'bg-primary-teal' : 'bg-coral'
                    }`}
                    style={{ width: `${Math.min(100, barWidth)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2: Correlation View (Fatigue vs Task Cycle Time) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-ink dark:text-ink-dark flex items-center gap-2">
                <ScatterIcon className="w-4 h-4 text-primary-indigo" />
                {t.insights.correlationTitle}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.insights.correlationSubtitle}
              </p>
            </div>
            <span className="text-xs font-mono text-primary-indigo font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-1 rounded-lg">
              r = +0.72 (Korelasi Kuat)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
                <XAxis
                  type="number"
                  dataKey="fatigueIndex"
                  name="Indeks Kelelahan"
                  unit="%"
                  domain={[0, 100]}
                  stroke="#8C97A7"
                  fontSize={11}
                />
                <YAxis
                  type="number"
                  dataKey="cycleTimeMin"
                  name="Waktu Siklus"
                  unit="m"
                  stroke="#8C97A7"
                  fontSize={11}
                />
                <ZAxis range={[60, 60]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: 'rgba(24, 28, 36, 0.95)',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Scatter name="Tugas Selesai" data={DEMO_CORRELATION_POINTS} fill="#4F46E5" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Insight: Saat skor kelelahan melebihi 60%, durasi rata-rata pengerjaan tugas meningkat hingga ~35%. Memberikan jeda 10 menit terbukti mengembalikan kecepatan siklus normal.
          </p>
        </div>

        {/* Model Methodology Card */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary-indigo" />
              <h2 className="text-base font-bold text-ink dark:text-ink-dark">
                Metodologi Model AI
              </h2>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              Model dilatih menggunakan metode validasi ilmiah <strong>Leave-One-Subject-Out Cross-Validation (LOSO-CV)</strong> terhadap ground-truth label Karolinska Sleepiness Scale (KSS).
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border-light dark:border-border-dark">
                <span className="text-gray-500">Algoritma</span>
                <span className="font-semibold font-mono">XGBoost Classifier</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border-light dark:border-border-dark">
                <span className="text-gray-500">F1-Score Makro</span>
                <span className="font-semibold font-mono text-emerald-600">0.86</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border-light dark:border-border-dark">
                <span className="text-gray-500">ROC-AUC</span>
                <span className="font-semibold font-mono text-emerald-600">0.89</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Metode Explainability</span>
                <span className="font-semibold font-mono">TreeSHAP Local/Global</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border-light dark:border-border-dark text-[11px] text-gray-400">
            Scoring batch dieksekusi terjadwal tanpa biaya server melalui GitHub Actions.
          </div>
        </div>
      </div>

      {/* Row 3: Weekly Comparison */}
      <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
        <h2 className="text-base font-bold text-ink dark:text-ink-dark mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary-teal" />
          {t.insights.weeklyCompTitle}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-subtle-light dark:bg-surface-subtle-dark text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Metrik Kesejahteraan</th>
                <th className="p-3">Pekan Ini (27 Okt - 02 Nov)</th>
                <th className="p-3">Pekan Lalu (20 - 26 Okt)</th>
                <th className="p-3 rounded-r-xl">Perubahan Tren</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              <tr>
                <td className="p-3 font-semibold">Indeks Kesejahteraan Tim</td>
                <td className="p-3 font-mono font-bold">84 / 100</td>
                <td className="p-3 font-mono text-gray-500">80 / 100</td>
                <td className="p-3 text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +5.0% (Membaik)
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Rata-rata PERCLOS Harian</td>
                <td className="p-3 font-mono">0.066</td>
                <td className="p-3 font-mono text-gray-500">0.078</td>
                <td className="p-3 text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> -15.4% (Kelelahan Menurun)
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Skor Postur Duduk Netral</td>
                <td className="p-3 font-mono">85 / 100</td>
                <td className="p-3 font-mono text-gray-500">82 / 100</td>
                <td className="p-3 text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +3.6% (Lebih Tegak)
                </td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Rata-rata Frekuensi Jeda Istirahat</td>
                <td className="p-3 font-mono">3.8 jeda/hari</td>
                <td className="p-3 font-mono text-gray-500">2.9 jeda/hari</td>
                <td className="p-3 text-emerald-600 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +31% (Peningkatan Peregangan)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
