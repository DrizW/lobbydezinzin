import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Essayer de récupérer l'IP depuis les headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfIP = request.headers.get('cf-connecting-ip'); // Cloudflare
    
    let clientIP = '127.0.0.1'; // fallback
    
    if (forwarded) {
      // x-forwarded-for peut contenir plusieurs IPs séparées par des virgules
      clientIP = forwarded.split(',')[0].trim();
    } else if (realIP) {
      clientIP = realIP;
    } else if (cfIP) {
      clientIP = cfIP;
    } else {
      // Fallback vers l'IP de connexion
      const ip = request.ip || '127.0.0.1';
      clientIP = ip;
    }

    // Nettoyer l'IP (enlever le port si présent)
    if (clientIP.includes(':')) {
      clientIP = clientIP.split(':')[0];
    }

    // Si c'est une IP locale (développement), essayer de récupérer l'IP publique
    if (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('192.168.') || clientIP.startsWith('10.')) {
      try {
        // En développement, utiliser un service externe pour obtenir l'IP publique
        const response = await fetch('https://api.ipify.org?format=json', {
          timeout: 3000
        });
        if (response.ok) {
          const data = await response.json();
          clientIP = data.ip;
        }
      } catch (error) {
        console.log('Erreur récupération IP publique:', error);
        // Garder l'IP locale pour le développement
      }
    }

    console.log(`🎯 IP détectée: ${clientIP}`);

    return NextResponse.json({ 
      ip: clientIP,
      headers: {
        forwarded,
        realIP,
        cfIP
      }
    });
    
  } catch (error) {
    console.error('Erreur récupération IP client:', error);
    return NextResponse.json({ 
      ip: '127.0.0.1',
      error: 'Erreur récupération IP' 
    }, { status: 500 });
  }
}