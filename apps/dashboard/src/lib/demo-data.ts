/**
 * Realistic Synthetic Seed Data for Selaras Dashboard
 * All metrics explicitly labeled "DATA SINTETIS"
 */

export interface TeamOption {
  id: string;
  name: string;
  memberCount: number;
  meetsKAnonymity: boolean;
  participationRate: number;
}

export const DEMO_TEAMS: TeamOption[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Tim Frontend Engineering (k=6)',
    memberCount: 6,
    meetsKAnonymity: true,
    participationRate: 94,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'Tim Mobile App (k=3 — Di Bawah Batas)',
    memberCount: 3,
    meetsKAnonymity: false, // Fails k >= 5 rule to demonstrate privacy suppression
    participationRate: 100,
  },
];

// 7-Day Circadian Aggregate Trend
export const DEMO_WEEKLY_TREND = [
  { day: 'Sen', fullDate: '27 Okt', perclos: 0.052, postureScore: 89, focusScore: 86, sittingAvgMin: 52 },
  { day: 'Sel', fullDate: '28 Okt', perclos: 0.061, postureScore: 87, focusScore: 84, sittingAvgMin: 58 },
  { day: 'Rab', fullDate: '29 Okt', perclos: 0.078, postureScore: 82, focusScore: 81, sittingAvgMin: 74 },
  { day: 'Kam', fullDate: '30 Okt', perclos: 0.089, postureScore: 78, focusScore: 76, sittingAvgMin: 88 },
  { day: 'Jum', fullDate: '31 Okt', perclos: 0.074, postureScore: 84, focusScore: 82, sittingAvgMin: 62 },
  { day: 'Sab', fullDate: '01 Nov', perclos: 0.035, postureScore: 92, focusScore: 90, sittingAvgMin: 30 },
  { day: 'Min', fullDate: '02 Nov', perclos: 0.041, postureScore: 91, focusScore: 89, sittingAvgMin: 35 },
];

// 24-Hour Day x Hour Heatmap for Fatigue Intensity (0-100)
export const DAYS_OF_WEEK = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum'];
export const WORK_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

export interface HeatmapCell {
  day: string;
  hour: number;
  fatigueRisk: number; // 0 to 100
  sampleCount: number;
}

export const DEMO_HEATMAP_DATA: HeatmapCell[] = [
  // Sen
  { day: 'Sen', hour: 9, fatigueRisk: 15, sampleCount: 6 },
  { day: 'Sen', hour: 10, fatigueRisk: 22, sampleCount: 6 },
  { day: 'Sen', hour: 11, fatigueRisk: 38, sampleCount: 6 },
  { day: 'Sen', hour: 12, fatigueRisk: 10, sampleCount: 6 }, // lunch
  { day: 'Sen', hour: 13, fatigueRisk: 42, sampleCount: 6 },
  { day: 'Sen', hour: 14, fatigueRisk: 68, sampleCount: 6 }, // post lunch dip
  { day: 'Sen', hour: 15, fatigueRisk: 74, sampleCount: 6 }, // peak fatigue
  { day: 'Sen', hour: 16, fatigueRisk: 62, sampleCount: 6 },
  { day: 'Sen', hour: 17, fatigueRisk: 45, sampleCount: 6 },
  // Sel
  { day: 'Sel', hour: 9, fatigueRisk: 18, sampleCount: 6 },
  { day: 'Sel', hour: 10, fatigueRisk: 25, sampleCount: 6 },
  { day: 'Sel', hour: 11, fatigueRisk: 40, sampleCount: 6 },
  { day: 'Sel', hour: 12, fatigueRisk: 12, sampleCount: 6 },
  { day: 'Sel', hour: 13, fatigueRisk: 45, sampleCount: 6 },
  { day: 'Sel', hour: 14, fatigueRisk: 72, sampleCount: 6 },
  { day: 'Sel', hour: 15, fatigueRisk: 78, sampleCount: 6 }, // peak
  { day: 'Sel', hour: 16, fatigueRisk: 65, sampleCount: 6 },
  { day: 'Sel', hour: 17, fatigueRisk: 48, sampleCount: 6 },
  // Rab
  { day: 'Rab', hour: 9, fatigueRisk: 20, sampleCount: 6 },
  { day: 'Rab', hour: 10, fatigueRisk: 30, sampleCount: 6 },
  { day: 'Rab', hour: 11, fatigueRisk: 45, sampleCount: 6 },
  { day: 'Rab', hour: 12, fatigueRisk: 15, sampleCount: 6 },
  { day: 'Rab', hour: 13, fatigueRisk: 52, sampleCount: 6 },
  { day: 'Rab', hour: 14, fatigueRisk: 75, sampleCount: 6 },
  { day: 'Rab', hour: 15, fatigueRisk: 82, sampleCount: 6 }, // high fatigue
  { day: 'Rab', hour: 16, fatigueRisk: 70, sampleCount: 6 },
  { day: 'Rab', hour: 17, fatigueRisk: 55, sampleCount: 6 },
  // Kam
  { day: 'Kam', hour: 9, fatigueRisk: 25, sampleCount: 6 },
  { day: 'Kam', hour: 10, fatigueRisk: 35, sampleCount: 6 },
  { day: 'Kam', hour: 11, fatigueRisk: 50, sampleCount: 6 },
  { day: 'Kam', hour: 12, fatigueRisk: 18, sampleCount: 6 },
  { day: 'Kam', hour: 13, fatigueRisk: 60, sampleCount: 6 },
  { day: 'Kam', hour: 14, fatigueRisk: 80, sampleCount: 6 },
  { day: 'Kam', hour: 15, fatigueRisk: 86, sampleCount: 6 }, // highest
  { day: 'Kam', hour: 16, fatigueRisk: 74, sampleCount: 6 },
  { day: 'Kam', hour: 17, fatigueRisk: 60, sampleCount: 6 },
  // Jum
  { day: 'Jum', hour: 9, fatigueRisk: 18, sampleCount: 6 },
  { day: 'Jum', hour: 10, fatigueRisk: 28, sampleCount: 6 },
  { day: 'Jum', hour: 11, fatigueRisk: 42, sampleCount: 6 },
  { day: 'Jum', hour: 12, fatigueRisk: 15, sampleCount: 6 },
  { day: 'Jum', hour: 13, fatigueRisk: 38, sampleCount: 6 },
  { day: 'Jum', hour: 14, fatigueRisk: 55, sampleCount: 6 },
  { day: 'Jum', hour: 15, fatigueRisk: 62, sampleCount: 6 },
  { day: 'Jum', hour: 16, fatigueRisk: 48, sampleCount: 6 },
  { day: 'Jum', hour: 17, fatigueRisk: 35, sampleCount: 6 },
];

// Workload NASA-TLX Distribution
export const DEMO_WORKLOAD_DIST = [
  { level: '1 (Sangat Ringan)', percentage: 12, count: 6 },
  { level: '2 (Ringan)', percentage: 24, count: 12 },
  { level: '3 (Sedang)', percentage: 42, count: 21 },
  { level: '4 (Berat)', percentage: 16, count: 8 },
  { level: '5 (Sangat Berat)', percentage: 6, count: 3 },
];

// Task Cycle Time Distribution
export const DEMO_CYCLE_TIME_DIST = [
  { bucket: '< 30 menit', tasksCount: 22, avgFatigue: 24 },
  { bucket: '30 - 60 menit', tasksCount: 36, avgFatigue: 38 },
  { bucket: '60 - 90 menit', tasksCount: 18, avgFatigue: 58 },
  { bucket: '> 90 menit', tasksCount: 8, avgFatigue: 76 },
];

// SHAP Contributing Factors
export const DEMO_SHAP_FACTORS = [
  { factor: 'Durasi Duduk Kontinu > 80 Menit', impact: 0.42, direction: 'increase', category: 'Ergonomi' },
  { factor: 'Lonjakan PERCLOS Pasca Pukul 14.00', impact: 0.35, direction: 'increase', category: 'Kelelahan' },
  { factor: 'Deviasi Sudut Leher Maju (Nerd Neck)', impact: 0.28, direction: 'increase', category: 'Postur' },
  { factor: 'Jeda Mata Teratur (Aturan 20-20-20)', impact: -0.31, direction: 'decrease', category: 'Protektif' },
  { factor: 'Kemiringan Bahu Asimetris', impact: 0.19, direction: 'increase', category: 'Postur' },
  { factor: 'Tingkat Kedipan Mata Normal', impact: -0.22, direction: 'decrease', category: 'Protektif' },
];

// Fatigue vs Cycle Time Scatter Correlation
export const DEMO_CORRELATION_POINTS = [
  { taskId: 1, fatigueIndex: 18, cycleTimeMin: 25 },
  { taskId: 2, fatigueIndex: 22, cycleTimeMin: 32 },
  { taskId: 3, fatigueIndex: 28, cycleTimeMin: 28 },
  { taskId: 4, fatigueIndex: 35, cycleTimeMin: 44 },
  { taskId: 5, fatigueIndex: 40, cycleTimeMin: 48 },
  { taskId: 6, fatigueIndex: 48, cycleTimeMin: 55 },
  { taskId: 7, fatigueIndex: 55, cycleTimeMin: 62 },
  { taskId: 8, fatigueIndex: 62, cycleTimeMin: 78 },
  { taskId: 9, fatigueIndex: 70, cycleTimeMin: 85 },
  { taskId: 10, fatigueIndex: 78, cycleTimeMin: 104 },
  { taskId: 11, fatigueIndex: 82, cycleTimeMin: 115 },
  { taskId: 12, fatigueIndex: 88, cycleTimeMin: 120 },
];

// Personal Timeline Data (Employee View - Citra Dewi)
export const DEMO_PERSONAL_TIMELINE = [
  { time: '09:00', perclos: 0.04, postureScore: 95, focusScore: 92, state: 'Fokus Optimal', isBreak: false },
  { time: '09:30', perclos: 0.04, postureScore: 92, focusScore: 90, state: 'Fokus Optimal', isBreak: false },
  { time: '10:00', perclos: 0.05, postureScore: 90, focusScore: 88, state: 'Fokus Optimal', isBreak: false },
  { time: '10:30', perclos: 0.06, postureScore: 86, focusScore: 85, state: 'Stabil', isBreak: false },
  { time: '10:45', perclos: 0.00, postureScore: 100, focusScore: 95, state: 'Jeda Peregangan 10m', isBreak: true },
  { time: '11:15', perclos: 0.05, postureScore: 92, focusScore: 89, state: 'Fokus Optimal', isBreak: false },
  { time: '11:45', perclos: 0.08, postureScore: 82, focusScore: 80, state: 'Mulai Lelah', isBreak: false },
  { time: '12:00', perclos: 0.00, postureScore: 100, focusScore: 100, state: 'Istirahat Makan Siang', isBreak: true },
  { time: '13:00', perclos: 0.06, postureScore: 88, focusScore: 84, state: 'Fokus Stabil', isBreak: false },
  { time: '13:30', perclos: 0.11, postureScore: 78, focusScore: 78, state: 'Penurunan Ritme', isBreak: false },
  { time: '14:00', perclos: 0.15, postureScore: 72, focusScore: 72, state: 'Tanda Kelelahan', isBreak: false },
  { time: '14:30', perclos: 0.18, postureScore: 68, focusScore: 68, state: 'Perlu Jeda Istirahat', isBreak: false },
  { time: '14:45', perclos: 0.00, postureScore: 100, focusScore: 95, state: 'Jeda Kopi & Peregangan 15m', isBreak: true },
  { time: '15:15', perclos: 0.09, postureScore: 85, focusScore: 82, state: 'Pemulihan Fokus', isBreak: false },
  { time: '15:45', perclos: 0.12, postureScore: 80, focusScore: 78, state: 'Fokus Menurun', isBreak: false },
  { time: '16:15', perclos: 0.16, postureScore: 74, focusScore: 70, state: 'Kelelahan Akhir Kerja', isBreak: false },
  { time: '16:45', perclos: 0.19, postureScore: 70, focusScore: 66, state: 'Waktu Menyudahi Hari', isBreak: false },
];

// Transparency Matrix
export const TRANSPARENCY_MATRIX = [
  { dataCategory: 'Frame Video / Citra Webcam', employee: 'Hanya Diproses di RAM', manager: 'TIDAK PERNAH', admin: 'TIDAK PERNAH' },
  { dataCategory: 'Konten Ketikan / Teks Keyboard', employee: 'TIDAK PERNAH', manager: 'TIDAK PERNAH', admin: 'TIDAK PERNAH' },
  { dataCategory: 'URL Website / Judul Halaman', employee: 'TIDAK PERNAH', manager: 'TIDAK PERNAH', admin: 'TIDAK PERNAH' },
  { dataCategory: 'Linimasa Kelelahan & Postur Pribadi', employee: 'Akses Penuh', manager: 'Hanya Jika Karyawan Opt-In', admin: 'Tidak Bisa' },
  { dataCategory: 'Ringkasan Agregat Tim (k >= 5)', employee: 'Dapat Melihat', manager: 'Dapat Melihat', admin: 'Dapat Melihat' },
  { dataCategory: 'Saran Kesejahteraan Tim', employee: 'Dapat Melihat', manager: 'Dapat Melihat', admin: 'Dapat Melihat' },
];
