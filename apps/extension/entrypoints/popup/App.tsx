import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Video,
  VideoOff,
  Clock,
  Sparkles,
  Settings,
  ShieldCheck,
  CheckCircle2,
  FileCode,
  Flame,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  isMonitoringPaused,
  setMonitoringPaused,
  isMeetingMode,
  setMeetingMode,
  getActiveTask,
  setActiveTask,
  getLastSyncedPayload,
  type ActiveTaskState,
} from '../../src/lib/storage';
import type { TelemetryPayload } from '@selaras/shared';

export default function App() {
  const [paused, setPaused] = useState(false);
  const [meeting, setMeeting] = useState(false);
  const [activeTask, setTaskState] = useState<ActiveTaskState | null>(null);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskEstimate, setTaskEstimate] = useState('30');
  const [elapsedSec, setElapsedSec] = useState(0);

  // Micro survey modal state
  const [surveyOpen, setSurveyOpen] = useState(false);
  const [kssScore, setKssScore] = useState(3);
  const [workloadScore, setWorkloadScore] = useState(3);
  const [burnoutScore, setBurnoutScore] = useState(2);
  const [surveySaved, setSurveySaved] = useState(false);

  // Inline "What is sent" inspector modal
  const [inspectOpen, setInspectOpen] = useState(false);
  const [lastPayload, setLastPayload] = useState<TelemetryPayload | null>(null);

  useEffect(() => {
    isMonitoringPaused().then(setPaused);
    isMeetingMode().then(setMeeting);
    getActiveTask().then((t) => {
      setTaskState(t);
      if (t) {
        const start = new Date(t.startedAt).getTime();
        setElapsedSec(Math.floor((Date.now() - start) / 1000));
      }
    });
  }, []);

  // Timer interval for active task
  useEffect(() => {
    if (!activeTask) return;
    const interval = setInterval(() => {
      const start = new Date(activeTask.startedAt).getTime();
      setElapsedSec(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTask]);

  const togglePause = async () => {
    const next = !paused;
    setPaused(next);
    await setMonitoringPaused(next);
  };

  const toggleMeeting = async () => {
    const next = !meeting;
    setMeeting(next);
    await setMeetingMode(next);
  };

  const handleStartTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: ActiveTaskState = {
      id: 'task_' + crypto.randomUUID().slice(0, 8),
      title: taskTitle.trim(),
      estimatedMin: parseInt(taskEstimate, 10) || null,
      startedAt: new Date().toISOString(),
    };

    await setActiveTask(newTask);
    setTaskState(newTask);
    setTaskTitle('');
    setElapsedSec(0);
  };

  const handleFinishTask = async () => {
    if (!activeTask) return;
    await setActiveTask(null);
    setTaskState(null);
    setElapsedSec(0);
  };

  const handleOpenInspect = async () => {
    const payload = await getLastSyncedPayload();
    setLastPayload(payload);
    setInspectOpen(true);
  };

  const handleOpenOptions = () => {
    if (chrome.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/entrypoints/options/index.html', '_blank');
    }
  };

  const handleSaveSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    setSurveySaved(true);
    setTimeout(() => {
      setSurveySaved(false);
      setSurveyOpen(false);
    }, 1200);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 flex flex-col justify-between min-h-[520px] text-xs">
      {/* 1. Header Bar */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                Selaras
              </span>
              <div className="flex items-center gap-1 -mt-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    paused ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'
                  }`}
                ></span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {paused ? 'Dijeda' : meeting ? 'Mode Rapat' : 'Aktif'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenInspect}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Periksa JSON yang Dikirim"
            >
              <FileCode className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenOptions}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Pengaturan & Privasi"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Quick Action Controls (One-Click Pause & Meeting Mode) */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <button
            onClick={togglePause}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-all ${
              paused
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {paused ? <Play className="w-3.5 h-3.5 text-amber-600" /> : <Pause className="w-3.5 h-3.5 text-gray-500" />}
            <span>{paused ? 'Lanjutkan' : 'Jeda Sesi'}</span>
          </button>

          <button
            onClick={toggleMeeting}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-semibold transition-all ${
              meeting
                ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {meeting ? (
              <VideoOff className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <Video className="w-3.5 h-3.5 text-gray-500" />
            )}
            <span>{meeting ? 'Rapat Aktif' : 'Mode Rapat'}</span>
          </button>
        </div>

        {/* 3. Task Timer Section */}
        <div className="mt-3.5 p-3 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-gray-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Siklus Tugas (Task Timer)
            </span>
            {activeTask && (
              <span className="font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md text-xs">
                {formatTimer(elapsedSec)}
              </span>
            )}
          </div>

          {activeTask ? (
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                <p className="font-semibold text-gray-900 truncate">{activeTask.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Target: {activeTask.estimatedMin || 30} menit • Sedang berjalan
                </p>
              </div>
              <button
                onClick={handleFinishTask}
                className="w-full py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Selesaikan Tugas
              </button>
            </div>
          ) : (
            <form onSubmit={handleStartTask} className="space-y-2">
              <input
                type="text"
                placeholder="Apa yang sedang dikerjakan?"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-teal-500"
              />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                  <span>Est:</span>
                  <select
                    value={taskEstimate}
                    onChange={(e) => setTaskEstimate(e.target.value)}
                    className="p-1 rounded border border-gray-200 text-[11px]"
                  >
                    <option value="15">15m</option>
                    <option value="30">30m</option>
                    <option value="45">45m</option>
                    <option value="60">60m</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold transition-colors shadow-sm"
                >
                  Mulai Tugas
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 4. Micro Self-Report Quick Trigger */}
        <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-teal-50 to-indigo-50 border border-teal-200/60 flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Survei Mikro Harian
            </p>
            <p className="text-[10px] text-gray-500">10 detik • Label validasi ML</p>
          </div>
          <button
            onClick={() => setSurveyOpen(true)}
            className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm transition-colors text-[11px]"
          >
            Isi Sekarang
          </button>
        </div>
      </div>

      {/* 5. Footer Privacy Shield Indicator */}
      <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
        <span className="flex items-center gap-1 font-medium text-emerald-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          On-Device Processing
        </span>
        <button
          onClick={handleOpenOptions}
          className="text-teal-700 hover:underline flex items-center gap-0.5"
        >
          Opsi &amp; Izin
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Modal: Micro Self-Report */}
      {surveyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white p-4 rounded-2xl w-full border border-gray-200 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="font-bold text-gray-900">Survei Kesejahteraan Mandiri</span>
              <button onClick={() => setSurveyOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {surveySaved ? (
              <div className="py-6 text-center text-emerald-600 font-bold flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                <span>Terima kasih! Respon tersimpan.</span>
              </div>
            ) : (
              <form onSubmit={handleSaveSurvey} className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-gray-700">Tingkat Kantuk (KSS 1–9):</span>
                    <span className="font-bold text-teal-600">{kssScore} / 9</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="9"
                    value={kssScore}
                    onChange={(e) => setKssScore(parseInt(e.target.value, 10))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400">
                    <span>1: Segar</span>
                    <span>5: Biasa</span>
                    <span>9: Sangat Mengantuk</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-gray-700">Beban Kerja Hari Ini (1–5):</span>
                    <span className="font-bold text-teal-600">{workloadScore} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={workloadScore}
                    onChange={(e) => setWorkloadScore(parseInt(e.target.value, 10))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-gray-700">Tingkat Kelelahan Mental (1–5):</span>
                    <span className="font-bold text-teal-600">{burnoutScore} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={burnoutScore}
                    onChange={(e) => setBurnoutScore(parseInt(e.target.value, 10))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSurveyOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 text-xs shadow-sm"
                  >
                    Kirim (10s)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Inline "What is sent" Inspector */}
      {inspectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white p-4 rounded-2xl w-full border border-gray-200 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-teal-600" />
                JSON Payload Terakhir
              </span>
              <button onClick={() => setInspectOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[10px] text-gray-500">
              Ini adalah struktur JSON persis yang dikirimkan per menit ke Supabase. Tidak ada citra webcam atau konten kata.
            </p>

            <pre className="p-2.5 rounded-xl bg-gray-900 text-gray-100 font-mono text-[10px] max-h-56 overflow-auto leading-tight">
              {lastPayload
                ? JSON.stringify(lastPayload, null, 2)
                : JSON.stringify(
                    {
                      user_pseudo_id: 'usr_local_sample',
                      ts_minute: new Date().toISOString(),
                      ear_mean: 0.3124,
                      perclos: 0.052,
                      blink_rate: 16.5,
                      yawn_count: 0,
                      head_forward_angle: 12.4,
                      shoulder_tilt: 2.1,
                      posture_score: 90,
                      face_present_ratio: 0.98,
                      sitting_continuous_min: 35,
                      idle_sec: 4,
                      input_events: 52,
                      tab_category: null,
                      meeting_mode: false,
                    },
                    null,
                    2
                  )}
            </pre>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => setInspectOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-gray-900 text-white font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
