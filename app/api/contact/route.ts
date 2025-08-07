import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, priority } = await request.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Sauvegarder la demande de contact en base
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name,
        email,
        subject,
        message,
        priority: priority || 'normal',
        status: 'pending',
        createdAt: new Date()
      }
    });

    // Ici vous pourriez aussi envoyer un email de notification
    // await sendNotificationEmail(contactRequest);

    return NextResponse.json({
      success: true,
      message: 'Votre demande a été envoyée avec succès',
      id: contactRequest.id
    });

  } catch (error) {
    console.error('Erreur contact:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de votre demande' },
      { status: 500 }
    );
  }
}
