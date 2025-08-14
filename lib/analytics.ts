import { prisma } from './prisma';
import type { NextRequest } from 'next/server';

export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  req?: NextRequest | Request;
}

export async function recordAnalytics(params: AnalyticsEvent): Promise<void> {
  try {
    const { event, category, action, label, value, properties, userId, sessionId, req } = params;
    
    let ip: string | undefined;
    let userAgent: string | undefined;
    
    if (req) {
      const headers = (req as any)?.headers;
      ip = headers?.get?.('x-forwarded-for')?.split(',')[0]?.trim() 
        || headers?.get?.('x-real-ip') 
        || undefined;
      userAgent = headers?.get?.('user-agent') || undefined;
    }

    await prisma.analyticsEvent.create({
      data: {
        event,
        category,
        action,
        label,
        value,
        properties: properties ? (properties as any) : undefined,
        userId,
        sessionId,
        ip,
        userAgent
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement analytics:', error);
    // Ne pas bloquer l'application si l'analytics échoue
  }
}

// Fonctions utilitaires pour les événements courants
export const analytics = {
  // Événements utilisateur
  userRegistered: (userId: string, req?: NextRequest) => 
    recordAnalytics({
      event: 'user_registered',
      category: 'user',
      action: 'created',
      userId,
      req
    }),

  userLoggedIn: (userId: string, req?: NextRequest) => 
    recordAnalytics({
      event: 'user_logged_in',
      category: 'user',
      action: 'login',
      userId,
      req
    }),

  userLoggedOut: (userId: string, req?: NextRequest) => 
    recordAnalytics({
      event: 'user_logged_out',
      category: 'user',
      action: 'logout',
      userId,
      req
    }),

  // Événements d'abonnement
  subscriptionCreated: (userId: string, plan: string, req?: NextRequest) => 
    recordAnalytics({
      event: 'subscription_created',
      category: 'subscription',
      action: 'created',
      label: plan,
      userId,
      req
    }),

  subscriptionCancelled: (userId: string, reason?: string, req?: NextRequest) => 
    recordAnalytics({
      event: 'subscription_cancelled',
      category: 'subscription',
      action: 'cancelled',
      label: reason,
      userId,
      req
    }),

  subscriptionExpired: (userId: string, req?: NextRequest) => 
    recordAnalytics({
      event: 'subscription_expired',
      category: 'subscription',
      action: 'expired',
      userId,
      req
    }),

  // Événements de région
  regionChanged: (userId: string, oldRegion: string, newRegion: string, req?: NextRequest) => 
    recordAnalytics({
      event: 'region_changed',
      category: 'region',
      action: 'changed',
      label: `${oldRegion} → ${newRegion}`,
      userId,
      req
    }),

  // Événements de churn
  userChurned: (userId: string, reason?: string, req?: NextRequest) => 
    recordAnalytics({
      event: 'user_churned',
      category: 'user',
      action: 'churned',
      label: reason,
      userId,
      req
    }),

  // Événements de sécurité
  twoFactorEnabled: (userId: string, req?: NextRequest) => 
    recordAnalytics({
      event: '2fa_enabled',
      category: 'security',
      action: 'enabled',
      userId,
      req
    }),

  twoFactorDisabled: (userId: string, req?: NextRequest) => 
    recordAnalytics({
      event: '2fa_disabled',
      category: 'security',
      action: 'disabled',
      userId,
      req
    }),

  // Événements de page
  pageViewed: (page: string, userId?: string, sessionId?: string, req?: NextRequest) => 
    recordAnalytics({
      event: 'page_viewed',
      category: 'navigation',
      action: 'viewed',
      label: page,
      userId,
      sessionId,
      req
    }),

  // Événements de conversion
  conversion: (type: string, value?: number, userId?: string, sessionId?: string, req?: NextRequest) => 
    recordAnalytics({
      event: 'conversion',
      category: 'business',
      action: type,
      value,
      userId,
      sessionId,
      req
    })
};
