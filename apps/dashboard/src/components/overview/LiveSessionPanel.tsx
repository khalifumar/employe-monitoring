'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  Radio,
  Activity,
  RefreshCw,
} from 'lucide-react';
import {
  getActiveTeamSession,
  startTeamSession,
  stopTeamSession,
  getRecentSignalMinutes,
  type TeamSessionRecord,
  type SignalMinuteRecord,
} from '@/lib/supabase';

interface LiveSessionPanelProps {
  teamId: string;
  teamName: string;
}

export function LiveSessionPanel({ teamId, teamName }: LiveSessionPanelProps) {
  const [session, setSession] = useState<TeamSessionRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [recentSignals, setRecentSignals] = useState<SignalMinuteRecord[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<string>('');

  // 1. Initial fetch & poll active session
  const refreshStatus = async () => {
    const active = await getActiveTeamSession(teamId);
    setSession(active);
    const signals = await getRecentSignalMinutes(teamId, 8);
    setRecentSignals(signals);
    setLastFetchTime(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [teamId]);

  // 2. Timer counter while session is active
  useEffect(() => {
    if (!session || session.status !== 'active') {
      setElapsedSec(0);
      return;
    }

    const startTs = new Date(session.started_at).getTime();
    setElapsedSec(Math.max(0, Math.floor((Date.now() - startTs) / 1000)));

    const timer = setInterval(() => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - startTs) / 1000)));
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  const handleStart = async () => {
    setLoading(true);
    const newSession = await startTeamSession(teamId, `Sesi Kolaborasi ${teamName}`);
    setSession(newSession);
    setLoading(false);
  };

  const handleStop = async () => {
    if (!session) return;
    setLoading(true);
    await stopTeamSession(session.id);
    setSession(null);
    setLoading(false);
    refreshStatus();
  };

  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLive = session?.status === 'active';

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-surface-light via-white to-teal-50/40 dark:from-surface-dark dark:via-surface-dark dark:to-teal-950/20 border border-teal-500/30 shadow-card transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Info & Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isLive
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isLive ? 'animate-spin' : ''}`} />
              {isLive ? 'SESI KERJA TIM SEDANG BERJALAN' : 'SESI STANDBY / SIAP DIMULAI'}
            </span>

            <span className="text-xs text-gray-400">
              Sinkronisasi Cloud: <code className="text-teal-600 font-mono">Supabase Realtime</code>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-ink dark:text-ink-dark flex items-center gap-2">
            Kontrol Sesi Kerja Riil — {teamName}
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            {isLive
              ? 'Sinyal sesi aktif telah disiarkan ke cloud. Ekstensi Selaras di laptop karyawan yang aktif otomatis mengukur postur, kedipan mata, dan input secara on-device lalu mengirimkan telemetri agregat per menit.'
              : 'Klik tombol di samping untuk memulai sesi kerja tim. Begitu dimulai, ekstensi di browser laptop karyawan akan mendeteksi status sesi dan otomatis mulai memantau ergonomi kerja.'}
          </p>
        </div>

        {/* Right: Controls & Timer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isLive && (
            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-gray-800/80 border border-teal-500/40 shadow-sm flex flex-col items-center justify-center">
              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Durasi Berjalan</span>
              <span className="font-mono text-2xl font-extrabold text-primary-teal dark:text-teal-300">
                {formatTime(elapsedSec)}
              </span>
            </div>
          )}

          {isLive ? (
            <button
              onClick={handleStop}
              disabled={loading}
              className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>{loading ? 'Menghentikan...' : 'Hentikan Sesi Tim'}</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={loading}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{loading ? 'Menghubungkan...' : 'Mulai Sesi Kerja Tim (Start Real Data)'}</span>
            </button>
          )}

          <button
            onClick={refreshStatus}
            className="p-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            title="Muat Ulang Telemetri"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Ingestion Feed */}
      <div className="mt-6 pt-5 border-t border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-primary-teal" />
            Telemetri Riil Masuk (Signal Minutes):
          </span>
          <span className="text-[11px] text-gray-400 font-mono">
            {recentSignals.length} data diterima • Diperbarui: {lastFetchTime || 'baru saja'}
          </span>
        </div>

        {recentSignals.length === 0 ? (
          <div className="py-6 rounded-2xl bg-surface-light/60 dark:bg-gray-900/40 border border-dashed border-gray-200 dark:border-gray-800 text-center space-y-1.5">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              Belum ada data telemetri menit riil yang tersimpan di tabel <code>signal_minutes</code>.
            </p>
            <p className="text-[11px] text-gray-400">
              Jalankan ekstensi Selaras di laptop karyawan saat sesi dimulai. Telemetri 1 menit pertama akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentSignals.slice(0, 4).map((sig, idx) => (
              <div
                key={sig.id || idx}
                className="p-3.5 rounded-xl bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-xs space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-teal-600 font-bold">
                    {new Date(sig.ts_minute).toLocaleTimeString()}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600">
                    Postur: {sig.posture_score}/100
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="text-gray-400 block text-[9px]">PERCLOS</span>
                    <span className="font-semibold">{(sig.perclos * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px]">Kedipan</span>
                    <span className="font-semibold">{sig.blink_rate}/mnt</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px]">Sudut Leher</span>
                    <span className="font-semibold">{sig.head_forward_angle}°</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[9px]">Input Events</span>
                    <span className="font-semibold">{sig.input_events} ketukan</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
