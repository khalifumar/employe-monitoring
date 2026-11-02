'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  Trash2,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import { TRANSPARENCY_MATRIX } from '@/lib/demo-data';

export default function PrivacyCenterPage() {
  const { t } = useApp();

  // Granular consent state
  const [consents, setConsents] = useState({
    drowsiness: true,
    posture: true,
    activity: true,
    taskTimer: true,
    tabCategory: false, // OFF by default
    managerIndividualView: false, // OFF by default
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const toggleConsent = (key: keyof typeof consents) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(
        {
          export_timestamp: new Date().toISOString(),
          user_pseudo_id: 'citra-dewi-pseudo-002',
          data_dictionary_version: '1.0.0',
          records_count: 480,
          sample_minute_payload: {
            ear_mean: 0.31,
            perclos: 0.05,
            blink_rate: 18,
            posture_score: 90,
            sitting_continuous_min: 35,
            input_events: 64,
            meeting_mode: false,
          },
        },
        null,
        2
      )
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'selaras_telemetri_pribadi.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ts_minute,ear_mean,perclos,blink_rate,yawn_count,posture_score,sitting_min,input_events\n' +
      '2026-11-02T09:00:00Z,0.32,0.04,16,0,95,0,84\n' +
      '2026-11-02T10:00:00Z,0.31,0.05,18,0,92,60,78\n' +
      '2026-11-02T11:00:00Z,0.29,0.07,17,0,88,120,65\n' +
      '2026-11-02T14:00:00Z,0.27,0.12,19,1,78,60,45\n' +
      '2026-11-02T15:00:00Z,0.26,0.15,18,1,72,120,38\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'selaras_telemetri_pribadi.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDeleteData = () => {
    setDeleteSuccess(true);
    setDeleteModalOpen(false);
    setTimeout(() => setDeleteSuccess(false), 5000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Privacy-by-Design
          </span>
          <span className="text-xs text-gray-400 font-mono">UU PDP &amp; GDPR Compliant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-ink-dark mt-2">
          {t.privacy.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.privacy.subtitle}
        </p>
      </div>

      {deleteSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>Permintaan penghapusan data berhasil diproses. Seluruh riwayat telemetri pribadi Anda telah dihapus permanen dari basis data.</span>
        </div>
      )}

      {/* Row 1: Transparency Matrix */}
      <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
        <h2 className="text-base font-bold text-ink dark:text-ink-dark mb-2 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary-teal" />
          {t.privacy.matrixTitle}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Tabel hak akses yang ditegakkan secara permanen di tingkat arsitektur dan Row Level Security (RLS).
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-subtle-light dark:bg-surface-subtle-dark text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Kategori Data</th>
                <th className="p-3">Karyawan Pemilik</th>
                <th className="p-3">Manajer Tim</th>
                <th className="p-3 rounded-r-xl">Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light dark:divide-border-dark">
              {TRANSPARENCY_MATRIX.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                  <td className="p-3 font-semibold text-ink dark:text-ink-dark">
                    {row.dataCategory}
                  </td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {row.employee}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        row.manager.includes('TIDAK')
                          ? 'text-gray-400 dark:text-gray-500'
                          : row.manager.includes('Opt-In')
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-primary-teal'
                      }`}
                    >
                      {row.manager.includes('TIDAK') && <EyeOff className="w-3.5 h-3.5" />}
                      {row.manager}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        row.admin.includes('TIDAK') || row.admin.includes('Tidak Bisa')
                          ? 'text-gray-400 dark:text-gray-500'
                          : 'text-primary-teal'
                      }`}
                    >
                      {row.admin}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 2: Granular Consent Controls */}
      <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
        <h2 className="text-base font-bold text-ink dark:text-ink-dark mb-1">
          {t.privacy.consentTogglesTitle}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Anda memegang kendali penuh. Pemantauan hanya aktif untuk sinyal yang Anda izinkan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Drowsiness */}
          <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-subtle-light dark:bg-surface-subtle-dark flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-ink dark:text-ink-dark">
                {t.privacy.drowsinessConsent}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Mengukur EAR, PERCLOS, dan durasi menguap secara lokal di browser Anda.
              </p>
            </div>
            <button
              onClick={() => toggleConsent('drowsiness')}
              className={`w-11 h-6 flex-shrink-0 flex items-center rounded-full p-1 transition-colors ${
                consents.drowsiness ? 'bg-primary-teal' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  consents.drowsiness ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          {/* Posture */}
          <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-subtle-light dark:bg-surface-subtle-dark flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-ink dark:text-ink-dark">
                {t.privacy.postureConsent}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Mengukur sudut condong leher dan kemiringan bahu terhadap baseline tegak.
              </p>
            </div>
            <button
              onClick={() => toggleConsent('posture')}
              className={`w-11 h-6 flex-shrink-0 flex items-center rounded-full p-1 transition-colors ${
                consents.posture ? 'bg-primary-teal' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  consents.posture ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          {/* Activity Counter */}
          <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-subtle-light dark:bg-surface-subtle-dark flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-ink dark:text-ink-dark">
                {t.privacy.activityConsent}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Hanya menghitung total klik dan ketukan (tanpa mencatat huruf/isi teks).
              </p>
            </div>
            <button
              onClick={() => toggleConsent('activity')}
              className={`w-11 h-6 flex-shrink-0 flex items-center rounded-full p-1 transition-colors ${
                consents.activity ? 'bg-primary-teal' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  consents.activity ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          {/* Task Timer */}
          <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-subtle-light dark:bg-surface-subtle-dark flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-ink dark:text-ink-dark">
                {t.privacy.taskTimerConsent}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Mencatat waktu siklus tugas untuk korelasi jeda kerja.
              </p>
            </div>
            <button
              onClick={() => toggleConsent('taskTimer')}
              className={`w-11 h-6 flex-shrink-0 flex items-center rounded-full p-1 transition-colors ${
                consents.taskTimer ? 'bg-primary-teal' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  consents.taskTimer ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          {/* Tab Category Opt-in (Default OFF) */}
          <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-subtle-light dark:bg-surface-subtle-dark flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-ink dark:text-ink-dark">
                {t.privacy.tabCategoryConsent}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Kategori domain tingkat tinggi tanpa menyimpan URL atau judul tab.
              </p>
            </div>
            <button
              onClick={() => toggleConsent('tabCategory')}
              className={`w-11 h-6 flex-shrink-0 flex items-center rounded-full p-1 transition-colors ${
                consents.tabCategory ? 'bg-primary-teal' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  consents.tabCategory ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          {/* Manager Individual Share Opt-in (Default OFF) */}
          <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-subtle-light dark:bg-surface-subtle-dark flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-ink dark:text-ink-dark">
                {t.privacy.managerShareConsent}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Mengizinkan manajer melihat data mentah Anda. Default: Dinonaktifkan.
              </p>
            </div>
            <button
              onClick={() => toggleConsent('managerIndividualView')}
              className={`w-11 h-6 flex-shrink-0 flex items-center rounded-full p-1 transition-colors ${
                consents.managerIndividualView ? 'bg-primary-teal' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  consents.managerIndividualView ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Data Subject Rights (Export & Delete) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Data */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-5 h-5 text-primary-teal" />
            <h2 className="text-base font-bold text-ink dark:text-ink-dark">
              Portabilitas Data (Export Data)
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {t.privacy.exportDesc}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-ink dark:text-ink-dark transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Download CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-ink dark:text-ink-dark transition-colors"
            >
              <FileCode className="w-4 h-4 text-primary-indigo" />
              Download JSON
            </button>
          </div>
        </div>

        {/* Delete Data */}
        <div className="p-6 rounded-2xl bg-surface-light dark:bg-surface-dark border border-coral/30 shadow-soft">
          <div className="flex items-center gap-2 mb-2 text-coral">
            <Trash2 className="w-5 h-5" />
            <h2 className="text-base font-bold">
              Hak untuk Dilupakan (Right to Erasure)
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            {t.privacy.deleteDesc}
          </p>

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-coral-light/70 dark:bg-coral-dark/50 text-coral hover:bg-coral hover:text-white transition-colors border border-coral/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {t.common.deleteData}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-3xl max-w-md w-full border border-border-light dark:border-border-dark shadow-float">
            <div className="w-12 h-12 rounded-2xl bg-coral-light dark:bg-coral-dark/50 flex items-center justify-center text-coral mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-ink dark:text-ink-dark">
              Hapus Seluruh Data Saya?
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">
              Tindakan ini permanen. Seluruh data menit telemetri, log tugas, dan survei mikro Anda akan dihapus langsung dari database Supabase sesuai hak UU PDP.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDeleteData}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-coral text-white hover:opacity-90 shadow-sm"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
