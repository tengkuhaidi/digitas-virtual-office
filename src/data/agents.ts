export interface AgentData {
  id: string;
  name: string;
  role: string;
  location: string;
  avatarBg: string;
  color: string;
  accentHex: number;
  podCoordinates: [number, number, number]; // [x, y, z]
  status: string;
  statusType: 'active' | 'analyzing' | 'writing' | 'monitoring';
  duty: string;
  background: string;
  latestOutput: {
    title: string;
    timestamp: string;
    summary: string;
    metrics?: { label: string; val: string }[];
  };
}

export const AGENTS: Record<string, AgentData> = {
  gajahmada: {
    id: 'gajahmada',
    name: 'Patih Gajah Mada',
    role: 'Executive Orchestrator & Prime Assistant',
    location: 'Central Command Terminal',
    avatarBg: 'bg-amber-600',
    color: '#f59e0b',
    accentHex: 0xf59e0b,
    podCoordinates: [0, 0, 0],
    status: 'All Systems Operational',
    statusType: 'active',
    duty: 'Mengawal stabilitas infrastruktur holding & Legalizin, deployment Vercel/Next.js, orkestrasi cronjob harian, dan eksekusi misi strategis Ndoro.',
    background: 'Patih Gajah Mada — Tangan kanan eksekutif Ndoro Tengku di Telegram dan CLI server. Beroperasi dalam hening dengan disiplin mutlak.',
    latestOutput: {
      title: 'Infrastructure & Cronjob Matrix Health',
      timestamp: 'Active Real-time',
      summary: 'Cron publisher 8x aktif, memory cache 88%, Vercel CI/CD sync verified, DNS office.digitasolusindo.com connected.',
      metrics: [
        { label: 'Uptime', val: '99.98%' },
        { label: 'Subagents', val: '4 Active' },
        { label: 'Build Status', val: 'Pass' }
      ]
    }
  },
  robert: {
    id: 'robert',
    name: 'Robert',
    role: 'Senior SEO/SEM Competitor Strategist',
    location: 'London, UK 🇬🇧 → East Pod',
    avatarBg: 'bg-blue-600',
    color: '#3b82f6',
    accentHex: 0x3b82f6,
    podCoordinates: [4.2, 0, -2.5],
    status: 'Tracking Competitor Keyword Auctions',
    statusType: 'analyzing',
    duty: 'Audit harian pergerakan kompetitor (izin.co.id, hivefive, sahabatlegal), riset gap kata kunci bernilai tinggi, dan penyusunan briefing attack plan harian jam 07:00 WIB.',
    background: '10+ tahun pengalaman di Enterprise SEO & SEM asal London, UK. Analitis, tegas, tanpa basa-basi.',
    latestOutput: {
      title: 'Daily Competitor Attack Plan (Oct 1)',
      timestamp: '07:00 WIB Scheduled',
      summary: 'Kompetitor lambat mengadopsi validasi KBLI 2025 untuk PT PMA. Disarankan penetrasi niche Izin Edar BPOM dan KBLI Roastery.',
      metrics: [
        { label: 'Competitors Scanned', val: '4 Rivals' },
        { label: 'Gap Identified', val: 'High-CPC PMA' },
        { label: 'Target CPC Save', val: '-40%' }
      ]
    }
  },
  talia: {
    id: 'talia',
    name: 'Talia',
    role: 'Lead Content Writer & SEO Specialist',
    location: 'Editorial Wing → North Pod',
    avatarBg: 'bg-rose-500',
    color: '#f43f5e',
    accentHex: 0xf43f5e,
    podCoordinates: [-4.2, 0, -2.5],
    status: 'Drafting Slot #3: KBLI 47214',
    statusType: 'writing',
    duty: 'Menulis & menerbitkan artikel panduan legalitas bisnis 8x sehari berbobot linguistik tinggi, anti-AI slop, cover Canva 2 baris ringkas, dan Google Instant Indexing.',
    background: 'S1 Sastra Indonesia & S2 Linguistik Universitas Indonesia (UI). 5 tahun pengalaman sebagai penulis novel, buku, website & blog industri.',
    latestOutput: {
      title: 'Panduan KBLI 47214: Izin Usaha Minuman & Halal',
      timestamp: 'Next Slot: 10:00 WIB',
      summary: 'Artikel 1.800 kata terstruktur, mengupas tuntas syarat sertifikasi halal & izin edar BPOM tanpa klise AI. Cover Canva poligon navy siap rilis.',
      metrics: [
        { label: 'Cadence', val: '8x / Hari' },
        { label: 'Indexing Latency', val: '< 30 Detik' },
        { label: 'Taxonomy', val: '100% Valid' }
      ]
    }
  },
  putra: {
    id: 'putra',
    name: 'Putra',
    role: 'Customer Support Lead & WhatsApp Engine',
    location: 'Client Comms Hub → South Pod',
    avatarBg: 'bg-emerald-600',
    color: '#10b981',
    accentHex: 0x10b981,
    podCoordinates: [0, 0, 4.2],
    status: 'Monitoring WhatsApp Gateway Port 3000',
    statusType: 'monitoring',
    duty: 'Melayani konsultasi legalitas izin usaha 24/7 di WhatsApp (< 5 detik), outreach 10 leads harian (10:00 & 14:00 WIB), serta pembuatan draf invoice resmi via Invoice Ninja.',
    background: 'Representatif CS resmi Legalizin di WhatsApp. Ramah, solutif, paham OSS RBA, dan sigap membantu klien.',
    latestOutput: {
      title: 'WhatsApp Gateway & Invoice Pipeline',
      timestamp: 'Port 3000 Live',
      summary: 'Baileys bridge aktif stabil, policy open group/DM, database 500+ leads Jabodetabek terhubung.',
      metrics: [
        { label: 'Response Latency', val: '< 5s' },
        { label: 'Daily Outreach', val: '10 Leads' },
        { label: 'Invoices Issued', val: 'Live Ninja' }
      ]
    }
  }
};
