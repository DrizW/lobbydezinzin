import { NextRequest, NextResponse } from "next/server";

// Lightweight, computed stats per region (no DB change required)
const BASE_STATS: Record<string, {
  name: string;
  flag: string;
  kdRange: string;
  kdAverage: number;
  lobbiesTested: number;
  timezone: string;
}> = {
  'south-africa': { name: 'Afrique du Sud', flag: '🇿🇦', kdRange: '0.5-0.8', kdAverage: 0.65, lobbiesTested: 28, timezone: 'Africa/Johannesburg' },
  'nigeria': { name: 'Nigeria', flag: '🇳🇬', kdRange: '0.6-0.9', kdAverage: 0.75, lobbiesTested: 24, timezone: 'Africa/Lagos' },
  'taiwan': { name: 'Taiwan', flag: '🇹🇼', kdRange: '0.7-1.0', kdAverage: 0.85, lobbiesTested: 18, timezone: 'Asia/Taipei' },
  'morocco': { name: 'Maroc', flag: '🇲🇦', kdRange: '0.8-1.1', kdAverage: 0.95, lobbiesTested: 21, timezone: 'Africa/Casablanca' },
  'thailand': { name: 'Thaïlande', flag: '🇹🇭', kdRange: '0.8-1.2', kdAverage: 1.00, lobbiesTested: 15, timezone: 'Asia/Bangkok' },
  'kenya': { name: 'Kenya', flag: '🇰🇪', kdRange: '0.9-1.2', kdAverage: 1.05, lobbiesTested: 17, timezone: 'Africa/Nairobi' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = (searchParams.get('key') || 'south-africa').toLowerCase();

    const base = BASE_STATS[key] ?? BASE_STATS['south-africa'];

    // Small deterministic variation so values feel "alive" without DB
    const now = new Date();
    const minutes = now.getUTCMinutes();
    const jitter = ((minutes % 5) - 2) * 0.005; // -0.01 .. +0.01
    const kdAverage = Math.max(0.4, Math.min(1.5, +(base.kdAverage + jitter).toFixed(2)));

    const day = Math.floor(now.getTime() / (24 * 60 * 60 * 1000));
    const lobbiesTested = base.lobbiesTested + (day % 3); // small daily drift

    return NextResponse.json({
      key,
      name: base.name,
      flag: base.flag,
      kdRange: base.kdRange,
      kdAverage,
      lobbiesTested,
      timezone: base.timezone,
      localTime: new Intl.DateTimeFormat('fr-FR', { timeZone: base.timezone, hour: '2-digit', minute: '2-digit', hour12: false }).format(now),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
