import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({
                success: false,
                error: 'Non authentifié'
            }, { status: 401 });
        }

        const body = await request.json();
        const { region } = body;

        if (!region) {
            return NextResponse.json({
                success: false,
                error: 'Région requise'
            }, { status: 400 });
        }

        // Appeler l'API DNS sur le VPS
        const dnsApiUrl = 'http://139.84.240.209:5001/api/dns/change-region';
        
        const response = await fetch(dnsApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Forwarded-For': request.headers.get('x-forwarded-for') || 'unknown',
                'User-Agent': request.headers.get('user-agent') || 'unknown'
            },
            body: JSON.stringify({ region })
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: result.error || 'Erreur lors du changement de région'
            }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            message: `Région changée vers ${result.data.region_name}`,
            data: {
                region: result.data.region,
                region_name: result.data.region_name,
                dns_server: result.data.dns_server,
                coordinates: result.data.coordinates,
                timezone: result.data.timezone
            }
        });

    } catch (error) {
        console.error('Erreur lors du changement de région DNS:', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur interne du serveur'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({
                success: false,
                error: 'Non authentifié'
            }, { status: 401 });
        }

        // Récupérer la région actuelle
        const dnsApiUrl = 'http://139.84.240.209:5001/api/dns/current-region';
        
        const response = await fetch(dnsApiUrl, {
            method: 'GET',
                    headers: {
            'X-Forwarded-For': request.headers.get('x-forwarded-for') || 'unknown',
            'User-Agent': request.headers.get('user-agent') || 'unknown'
        }
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json({
                success: false,
                error: result.error || 'Erreur lors de la récupération de la région'
            }, { status: response.status });
        }

        return NextResponse.json({
            success: true,
            data: result.data
        });

    } catch (error) {
        console.error('Erreur lors de la récupération de la région DNS:', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur interne du serveur'
        }, { status: 500 });
    }
}
