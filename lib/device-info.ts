export interface DeviceInfo {
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
  ip?: string;
  location?: string;
}

export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();
  
  // Détecter le navigateur
  let browser = 'Inconnu';
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';
  
  // Détecter le système d'exploitation
  let os = 'Inconnu';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('linux')) os = 'Linux';
  
  // Détecter le type d'appareil
  let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
  if (ua.includes('mobile')) deviceType = 'mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) deviceType = 'tablet';
  
  // Générer un nom d'appareil
  let deviceName = 'Appareil inconnu';
  if (ua.includes('iphone')) deviceName = 'iPhone';
  else if (ua.includes('ipad')) deviceName = 'iPad';
  else if (ua.includes('android')) {
    if (ua.includes('mobile')) deviceName = 'Android Mobile';
    else deviceName = 'Android Tablet';
  } else if (ua.includes('windows')) deviceName = 'PC Windows';
  else if (ua.includes('mac os')) deviceName = 'Mac';
  else if (ua.includes('linux')) deviceName = 'PC Linux';
  
  // Ajouter le navigateur au nom de l'appareil
  deviceName += ` - ${browser}`;
  
  return {
    deviceName,
    deviceType,
    browser,
    os
  };
}

export function getDeviceInfoFromRequest(request: any): DeviceInfo {
  // Valeurs par défaut si request est undefined
  if (!request) {
    return {
      deviceName: 'Appareil inconnu',
      deviceType: 'desktop',
      browser: 'Inconnu',
      os: 'Inconnu',
      ip: undefined
    };
  }

  // Essayer différentes façons d'accéder aux headers selon le contexte
  let userAgent = '';
  let ip = undefined;

  try {
    // Si c'est un objet Request standard
    if (request.headers && typeof request.headers.get === 'function') {
      userAgent = request.headers.get('user-agent') || '';
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      ip = realIp || forwardedFor?.split(',')[0] || undefined;
    }
    // Si c'est un objet avec headers comme propriété
    else if (request.headers && typeof request.headers === 'object') {
      userAgent = request.headers['user-agent'] || '';
      const forwardedFor = request.headers['x-forwarded-for'];
      const realIp = request.headers['x-real-ip'];
      ip = realIp || forwardedFor?.split(',')[0] || undefined;
    }
    // Si c'est un objet avec user-agent directement
    else if (request['user-agent']) {
      userAgent = request['user-agent'];
    }
  } catch (error) {
    console.error('Erreur lors de l\'extraction des informations de device:', error);
  }
  
  const deviceInfo = parseUserAgent(userAgent);
  
  return {
    ...deviceInfo,
    ip
  };
}
