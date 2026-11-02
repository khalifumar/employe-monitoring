'use client';

import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Building,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '@/lib/context';

export default function OnboardingPage() {
  const { t } = useApp();

  const [orgName, setOrgName] = useState('PT Nusantara Dinamika');
  const [teamName, setTeamName] = useState('Tim Frontend Engineering');
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const inviteLink = 'https://selaras.app/invite/team-frontend-77a8';

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteSent(true);
    setInviteEmail('');
    setTimeout(() => setInviteSent(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-teal to-primary-indigo text-white flex items-center justify-center mx-auto mb-3 shadow-soft">
          <Users className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-ink-dark">
          {t.nav.onboarding}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Daftarkan organisasi Anda, bentuk tim kerja, dan undang anggota tim untuk mulai mengaktifkan pendampingan kesejahteraan.
        </p>
      </div>

      {inviteSent && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500" />
          <span>Undangan berhasil dikirim. Anggota tim akan menerima tautan persetujuan privasi.</span>
        </div>
      )}

      {/* Card 1: Setup Organisasi & Tim */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft space-y-6">
        <h2 className="text-base font-bold text-ink dark:text-ink-dark flex items-center gap-2">
          <Building className="w-4 h-4 text-primary-teal" />
          Detail Organisasi &amp; Tim
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
              Nama Organisasi / Perusahaan
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark"
              placeholder="Contoh: PT Teknologi Maju Bersama"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
              Nama Tim
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark"
              placeholder="Contoh: Tim Product Design"
            />
          </div>
        </div>
      </div>

      {/* Card 2: Undangan Anggota Tim & Link Cepat */}
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark shadow-soft space-y-6">
        <h2 className="text-base font-bold text-ink dark:text-ink-dark flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary-indigo" />
          Undang Anggota Tim
        </h2>
        <p className="text-xs text-gray-500">
          Setiap anggota yang diundang akan memasang ekstensi peramban Selaras dan memilih persetujuan sensor mereka sendiri secara transparan.
        </p>

        {/* Invite by Email */}
        <form onSubmit={handleSendInvite} className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="nama.rekan@perusahaan.com"
            className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-primary-indigo text-white hover:opacity-90 transition-opacity"
          >
            Kirim Undangan
          </button>
        </form>

        {/* Quick Link Copy */}
        <div className="pt-4 border-t border-border-light dark:border-border-dark">
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5">
            Atau Bagikan Tautan Undangan Langsung:
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-surface-subtle-light dark:bg-surface-subtle-dark border border-border-light dark:border-border-dark">
            <span className="font-mono text-xs text-gray-600 dark:text-gray-300 px-2 flex-1 truncate">
              {inviteLink}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Privacy Commitment for New Members */}
      <div className="p-6 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-500/30 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-primary-teal">
          <ShieldCheck className="w-4 h-4" />
          <span>Komitmen Privasi Selaras untuk Anggota Baru</span>
        </div>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Saat anggota tim mengklik tautan undangan, mereka akan diperlihatkan layar transparan yang menjelaskan bahwa Selaras tidak merekam webcam, tidak mencatat isi tombol keyboard, dan tidak melacak riwayat situs web.
        </p>
      </div>
    </div>
  );
}
