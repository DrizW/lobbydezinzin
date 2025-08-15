import { NextRequest, NextResponse } from 'next/server';
import { getDeviceInfoFromRequest } from '@/lib/device-info';

export async function POST(request: NextRequest) {
  try {
    const deviceInfo = getDeviceInfoFromRequest(request);
    
    // Retourner les informations d'appareil
    return NextResponse.json({ 
      success: true, 
      deviceInfo 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations d\'appareil:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erreur lors de la récupération des informations d\'appareil' 
    }, { status: 500 });
  }
}
