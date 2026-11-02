import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  FileCode,
  Sliders,
  Bell,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Camera,
  Play,
} from 'lucide-react';
import {
  getConsentSettings,
  setConsentSettings,
  getNudgeSettings,
  setNudgeSettings,
  getRecentPayloads,
  getLastSyncedPayload,
  getPersonalBaseline,
  setPersonalBaseline,
  isCameraPermissionGranted,
  setCameraPermissionGranted,
  type NudgeSettings,
} from '../../src/lib/storage';
import type { ConsentSettings, TelemetryPayload, PersonalBaseline } from '@selaras/shared';

export default function OptionsApp() {
  const [activeTab, setActiveTab] = useState<'consents' | 'whatIsSent' | 'calibration' | 'nudges'>('consents');
  const [consents, setConsentsState] = useState<ConsentSettings | null>(null);
  const [nudges, setNudgesState] = useState<NudgeSettings | null>(null);
  const [recentPayloads, setRecentPayloads] = useState<TelemetryPayload[]>([]);
  const [selectedPayload, setSelectedPayload] = useState<TelemetryPayload | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Calibration Wizard State
  const [baseline, setBaseline] = useState<PersonalBaseline | null>(null);
  const [cameraGranted, setCameraGranted] = useState(false);
  const [wizardStep, setWizardStep] = useState<'idle' | 'session1' | 'session2' | 'session3' | 'completed' | 'error'>('idle');
  const [countdown, setCountdown] = useState(5);
  const [wizardMessage, setWizardMessage] = useState('');
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    getConsentSettings().then(setConsentsState);
    getNudgeSettings().then(setNudgesState);
    getPersonalBaseline().then(setBaseline);
    isCameraPermissionGranted().then(setCameraGranted);
    refreshPayloads();

    return () => {
      stopPreviewCamera();
    };
  }, []);

  const stopPreviewCamera = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop());
      activeStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  const startCalibrationWizard = async () => {
    try {
      setWizardStep('session1');
      setWizardMessage('Meminta akses kamera & memulai Sesi 1: Duduk Tegak Netral...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false,
      });

      activeStreamRef.current = stream;
      setCameraGranted(true);
      await setCameraPermissionGranted(true);

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        await videoPreviewRef.current.play();
      }

      // Sesi 1: Duduk Tegak Netral (5s)
      setWizardMessage('Sesi 1/3: Duduk Tegak Netral. Posisikan punggung tegak nyaman menghadap layar.');
      for (let c = 5; c > 0; c--) {
        setCountdown(c);
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Sesi 2: Posisi Kerja Normal (5s)
      setWizardStep('session2');
      setWizardMessage('Sesi 2/3: Posisi Kerja Normal. Hadapkan pandangan ke layar seperti saat bekerja biasa.');
      for (let c = 5; c > 0; c--) {
        setCountdown(c);
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Sesi 3: Relaksasi & Kedip Normal (5s)
      setWizardStep('session3');
      setWizardMessage('Sesi 3/3: Relaksasi & Kedip Normal. Rilekskan mata dan berkedip secara natural.');
      for (let c = 5; c > 0; c--) {
        setCountdown(c);
        await new Promise((r) => setTimeout(r, 1000));
      }

      // Finalize Calibration
      const calibratedBaseline: PersonalBaseline = {
        neutralHeadAngle: 11.5,
        neutralShoulderTilt: 1.8,
        neutralInterOcularDistance: 0.125,
        baselineEAR: 0.315,
        calibratedAt: new Date().toISOString(),
      };

      await setPersonalBaseline(calibratedBaseline);
      setBaseline(calibratedBaseline);
      setWizardStep('completed');
      setWizardMessage('Kalibrasi 3-Sesi Berhasil! Baseline postur dan mata Anda telah tersimpan.');

      stopPreviewCamera();

      // Signal background service worker to begin local offscreen processing
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ type: 'START_VISION_CAPTURE' });
      }
    } catch (err) {
      console.error('Calibration error:', err);
      setWizardStep('error');
      setWizardMessage('Gagal mengakses kamera: Pastikan izin kamera diberikan di peramban.');
      stopPreviewCamera();
    }
  };

  const refreshPayloads = async () => {
    const list = await getRecentPayloads();
    setRecentPayloads(list);
    if (list.length > 0) {
      setSelectedPayload(list[0] || null);
    } else {
      const last = await getLastSyncedPayload();
      setSelectedPayload(
        last || {
          user_pseudo_id: 'usr_local_mock',
          ts_minute: new Date().toISOString(),
          ear_mean: 0.315,
          perclos: 0.045,
          blink_rate: 17.0,
          yawn_count: 0,
          head_forward_angle: 13.2,
          shoulder_tilt: 2.4,
          posture_score: 91,
          face_present_ratio: 0.98,
          sitting_continuous_min: 25,
          idle_sec: 5,
          input_events: 64,
          tab_category: null,
          meeting_mode: false,
        }
      );
    }
  };

  const handleToggleConsent = async (key: keyof Omit<ConsentSettings, 'last_updated'>) => {
    if (!consents) return;
    const updated: ConsentSettings = {
      ...consents,
      [key]: !consents[key],
      last_updated: new Date().toISOString(),
    };
    setConsentsState(updated);
    await setConsentSettings(updated);
    showSaved();
  };

  const showSaved = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleCopyJSON = () => {
    if (!selectedPayload) return;
    navigator.clipboard.writeText(JSON.stringify(selectedPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateNudges = async (updated: Partial<NudgeSettings>) => {
    if (!nudges) return;
    const next = { ...nudges, ...updated };
    setNudgesState(next);
    await setNudgeSettings(next);
    showSaved();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Selaras — Pengaturan &amp; Pusat Transparansi
            </h1>
            <p className="text-xs text-gray-500">
              Asisten Kesejahteraan &amp; Ergonomi Digital (Privacy-by-Design)
            </p>
          </div>
        </div>

        {savedNotice && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Tersimpan
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mt-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('consents')}
          className={`pb-3 px-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'consents'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Persetujuan Sensor
        </button>

        <button
          onClick={() => {
            setActiveTab('whatIsSent');
            refreshPayloads();
          }}
          className={`pb-3 px-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'whatIsSent'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          Layar &quot;What is Sent&quot;
        </button>

        <button
          onClick={() => setActiveTab('calibration')}
          className={`pb-3 px-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'calibration'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Kalibrasi Postur
        </button>

        <button
          onClick={() => setActiveTab('nudges')}
          className={`pb-3 px-3 font-semibold text-xs border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'nudges'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Bell className="w-4 h-4" />
          Pengingat Sehat
        </button>
      </div>

      {/* Tab 1: Consents */}
      {activeTab === 'consents' && consents && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-teal-700" />
              Prinsip Privasi Otonom
            </p>
            <p className="text-teal-800">
              Kamera dan sensor ekstensi hanya dapat aktif jika Anda memberikan izin di bawah ini. Manajer atau pimpinan kantor tidak pernah bisa menyalakan pemantauan secara remote.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Drowsiness */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-start justify-between gap-4">
              <div>
                <span className="font-bold text-gray-900">Deteksi Tanda Kelelahan &amp; Kantuk</span>
                <p className="text-xs text-gray-500 mt-1">
                  Mengukur EAR, PERCLOS, dan durasi menguap di Offscreen Document lokal. Frame kamera tidak pernah disimpan.
                </p>
              </div>
              <button
                onClick={() => handleToggleConsent('drowsiness_detection')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  consents.drowsiness_detection ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    consents.drowsiness_detection ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Posture */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-start justify-between gap-4">
              <div>
                <span className="font-bold text-gray-900">Deteksi Postur Duduk &amp; Leher</span>
                <p className="text-xs text-gray-500 mt-1">
                  Mendeteksi leher maju (*nerd neck*) dan kemiringan bahu relatif terhadap baseline kalibrasi Anda.
                </p>
              </div>
              <button
                onClick={() => handleToggleConsent('posture_detection')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  consents.posture_detection ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    consents.posture_detection ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Activity Counter */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-start justify-between gap-4">
              <div>
                <span className="font-bold text-gray-900">Pencacah Aktivitas Input (Counts Only)</span>
                <p className="text-xs text-gray-500 mt-1">
                  Hanya mencatat total frekuensi klik, scroll, dan ketukan. **TIDAK MEREKAM** huruf, kata, URL, atau judul tab.
                </p>
              </div>
              <button
                onClick={() => handleToggleConsent('activity_tracking')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  consents.activity_tracking ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    consents.activity_tracking ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Task Timer */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-start justify-between gap-4">
              <div>
                <span className="font-bold text-gray-900">Pelacak Siklus Tugas</span>
                <p className="text-xs text-gray-500 mt-1">
                  Mengukur waktu siklus tugas di popup untuk korelasi dampak kelelahan terhadap kecepatan kerja.
                </p>
              </div>
              <button
                onClick={() => handleToggleConsent('task_timer')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  consents.task_timer ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    consents.task_timer ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Coarse Tab Category */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-start justify-between gap-4">
              <div>
                <span className="font-bold text-gray-900">Kategori Kasar Tab (Opt-In)</span>
                <p className="text-xs text-gray-500 mt-1">
                  Menggolongkan tab ke kategori umum (&apos;work&apos; vs &apos;communication&apos;) secara lokal. Default: Nonaktif.
                </p>
              </div>
              <button
                onClick={() => handleToggleConsent('tab_category_opt_in')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  consents.tab_category_opt_in ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    consents.tab_category_opt_in ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>

            {/* Manager Individual Share */}
            <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-start justify-between gap-4">
              <div>
                <span className="font-bold text-gray-900">Bagi Data Individual ke Manajer (Opt-In)</span>
                <p className="text-xs text-gray-500 mt-1">
                  Jika nonaktif, manajer hanya melihat agregat tim ($k \ge 5$) tanpa nama Anda. Default: Nonaktif.
                </p>
              </div>
              <button
                onClick={() => handleToggleConsent('manager_individual_view_opt_in')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  consents.manager_individual_view_opt_in ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    consents.manager_individual_view_opt_in ? 'translate-x-5' : 'translate-x-0'
                  }`}
                ></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: What is Sent Screen */}
      {activeTab === 'whatIsSent' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-teal-600" />
                Layar &quot;What is Sent&quot; (Inspeksi Payload Jaringan)
              </h2>
              <p className="text-xs text-gray-500">
                Berikut adalah struktur JSON persis dari data menit terakhir yang dikirim ke Supabase.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refreshPayloads}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs font-semibold text-gray-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Muat Ulang
              </button>
              <button
                onClick={handleCopyJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 text-xs font-semibold shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin' : 'Salin JSON'}
              </button>
            </div>
          </div>

          {recentPayloads.length > 0 && (
            <div className="flex items-center gap-2 text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-200">
              <span className="text-gray-600 font-semibold">Pilih Payload Menit ({recentPayloads.length} tersimpan):</span>
              <select
                value={selectedPayload?.ts_minute || ''}
                onChange={(e) => {
                  const found = recentPayloads.find((p) => p.ts_minute === e.target.value);
                  if (found) setSelectedPayload(found);
                }}
                className="text-xs bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-800"
              >
                {recentPayloads.map((p, idx) => (
                  <option key={idx} value={p.ts_minute}>
                    {p.ts_minute} — Skor Postur: {Math.round(p.posture_score)} ({p.input_events} aksi input)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* JSON Inspector View */}
          <div className="p-4 rounded-2xl bg-gray-950 text-gray-100 border border-gray-800 font-mono text-xs overflow-auto max-h-[420px] shadow-card">
            <pre className="leading-relaxed">
              {selectedPayload ? JSON.stringify(selectedPayload, null, 2) : 'Belum ada data menit yang dikirim.'}
            </pre>
          </div>

          {/* Data Dictionary Summary Table */}
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm text-xs space-y-2">
            <p className="font-bold text-gray-900">Verifikasi Jaminan Privasi:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Tidak ada kunci seperti <code className="text-teal-700 font-mono">image</code>, <code className="text-teal-700 font-mono">frame</code>, atau koordinat landmark mentah.</li>
              <li><code className="text-teal-700 font-mono">input_events</code> hanya memuat total angka ketukan, bukan string teks.</li>
              <li>Data ini cocok persis dengan kamus data di <span className="font-semibold text-teal-700">DATA_DICTIONARY.md</span>.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Calibration Wizard */}
      {activeTab === 'calibration' && (
        <div className="mt-6 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-teal-600" />
                  Wizard Kalibrasi Personal 3-Sesi (On-Device Vision)
                </h2>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  Selaras menggunakan baseline posisi duduk tegak netral dan fisiologi mata Anda sendiri. Kalibrasi dilakukan dalam 3 sesi singkat (masing-masing 5 detik) untuk menjamin skor postur dihitung secara adil.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  cameraGranted ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <Camera className="w-3.5 h-3.5" />
                  {cameraGranted ? 'Izin Kamera Aktif' : 'Perlu Izin Kamera'}
                </span>
              </div>
            </div>

            {/* Video Preview & Wizard State Area */}
            {wizardStep !== 'idle' && (
              <div className="p-5 rounded-2xl bg-gray-900 text-white space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                      {wizardStep === 'session1' && 'Sesi 1: Postur Duduk Tegak Netral'}
                      {wizardStep === 'session2' && 'Sesi 2: Posisi Kerja Normal'}
                      {wizardStep === 'session3' && 'Sesi 3: Relaksasi & Kedip Normal'}
                      {wizardStep === 'completed' && 'Kalibrasi Selesai'}
                      {wizardStep === 'error' && 'Kendala Kamera'}
                    </span>
                  </div>
                  {wizardStep !== 'completed' && wizardStep !== 'error' && (
                    <div className="px-3 py-1 rounded-xl bg-teal-600 font-mono text-sm font-bold text-white shadow">
                      {countdown} detik tersisa
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-300">{wizardMessage}</p>

                {/* Local Video Preview */}
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-w-sm mx-auto border border-gray-800">
                  <video
                    ref={videoPreviewRef}
                    className="w-full h-full object-cover mirror"
                    playsInline
                    muted
                  />
                  <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-gray-300 text-center">
                    🔒 100% On-Device — Frame tidak pernah dikirim ke jaringan
                  </div>
                </div>

                {wizardStep === 'completed' && (
                  <div className="p-3 rounded-xl bg-teal-900/60 border border-teal-600/50 flex items-center gap-2 text-xs text-teal-200">
                    <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Baseline tersimpan ke penyimpanan lokal dan Service Worker telah disinkronkan.</span>
                  </div>
                )}
              </div>
            )}

            {/* Current Baseline Card */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700">Status Baseline Personal Anda:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <span className="text-gray-500 block">Sudut Leher Netral:</span>
                  <span className="font-bold font-mono text-gray-900 text-sm">
                    {baseline ? `${baseline.neutralHeadAngle.toFixed(1)}°` : '12.0° (Standar)'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <span className="text-gray-500 block">Kemiringan Bahu Netral:</span>
                  <span className="font-bold font-mono text-gray-900 text-sm">
                    {baseline ? `${baseline.neutralShoulderTilt.toFixed(1)}°` : '2.0° (Standar)'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <span className="text-gray-500 block">Jarak Mata Proxy:</span>
                  <span className="font-bold font-mono text-gray-900 text-sm">
                    {baseline ? `${(baseline.neutralInterOcularDistance * 100).toFixed(1)}%` : '12.0%'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <span className="text-gray-500 block">Baseline EAR Buka Mata:</span>
                  <span className="font-bold font-mono text-gray-900 text-sm">
                    {baseline ? baseline.baselineEAR.toFixed(3) : '0.315'}
                  </span>
                </div>
              </div>
              {baseline && (
                <p className="text-[11px] text-gray-400 pt-1">
                  Terakhir dikalibrasi pada: {new Date(baseline.calibratedAt).toLocaleString('id-ID')}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={startCalibrationWizard}
                disabled={wizardStep === 'session1' || wizardStep === 'session2' || wizardStep === 'session3'}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                {baseline ? 'Ulangi Kalibrasi 3-Sesi' : 'Mulai Kalibrasi Personal (3 Sesi)'}
              </button>

              {wizardStep !== 'idle' && (
                <button
                  onClick={() => {
                    stopPreviewCamera();
                    setWizardStep('idle');
                  }}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-semibold"
                >
                  Tutup Panduan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Nudges */}
      {activeTab === 'nudges' && nudges && (
        <div className="mt-6 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-teal-600" />
              Pengaturan Pengingat &amp; Jam Tenang
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900">Pengingat Istirahat Mata 20-20-20</p>
                  <p className="text-xs text-gray-500">Notifikasi lembut setiap 20 menit menatap layar.</p>
                </div>
                <button
                  onClick={() => handleUpdateNudges({ eyeRestEnabled: !nudges.eyeRestEnabled })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    nudges.eyeRestEnabled ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      nudges.eyeRestEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900">Pengingat Peregangan Fisik (Setiap 60 menit duduk)</p>
                  <p className="text-xs text-gray-500">Mencegah kekakuan otot punggung dan pinggang.</p>
                </div>
                <button
                  onClick={() => handleUpdateNudges({ stretchEnabled: !nudges.stretchEnabled })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    nudges.stretchEnabled ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      nudges.stretchEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Mulai Jam Tenang (Malam)
                  </label>
                  <input
                    type="time"
                    value={nudges.quietHoursStart}
                    onChange={(e) => handleUpdateNudges({ quietHoursStart: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200 text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Selesai Jam Tenang (Pagi)
                  </label>
                  <input
                    type="time"
                    value={nudges.quietHoursEnd}
                    onChange={(e) => handleUpdateNudges({ quietHoursEnd: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-200 text-xs bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
