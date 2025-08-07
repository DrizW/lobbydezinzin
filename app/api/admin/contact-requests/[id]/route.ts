import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { status } = await request.json();
    const { id } = params;

    const updatedRequest = await prisma.contactRequest.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Erreur mise à jour demande contact:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}