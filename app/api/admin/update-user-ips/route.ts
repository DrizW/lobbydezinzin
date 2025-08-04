import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const { userId, ips } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Valider les IPs (optionnel)
    if (ips) {
      const ipList = ips.split(',').map((ip: string) => ip.trim());
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      
      for (const ip of ipList) {
        if (ip && !ipRegex.test(ip)) {
          return NextResponse.json({ 
            error: `IP invalide: ${ip}` 
          }, { status: 400 });
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        allowedIPs: ips || null
      },
      select: {
        id: true,
        email: true,
        allowedIPs: true
      }
    });

    console.log(`🔧 IPs mises à jour pour ${updatedUser.email}: ${ips || 'SUPPRIMÉES'}`);

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });
    
  } catch (error: any) {
    console.error('Erreur mise à jour IPs utilisateur:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }
    
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}