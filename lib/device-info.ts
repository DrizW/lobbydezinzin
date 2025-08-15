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
  
  // Détecter le navigateur avec plus de précision
  let browser = 'Inconnu';
  
  // Détection spéciale pour iOS
  if (ua.includes('iphone') || ua.includes('ipad')) {
    if (ua.includes('crios')) browser = 'Chrome';
    else if (ua.includes('fxios')) browser = 'Firefox';
    else if (ua.includes('edgios')) browser = 'Edge';
    else if (ua.includes('opios')) browser = 'Opera';
    else if (ua.includes('safari')) browser = 'Safari';
  }
  // Détection standard pour autres plateformes
  else {
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';
    else if (ua.includes('opera')) browser = 'Opera';
  }
  
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
  
  // Ajouter le navigateur au nom de l'appareil avec plus de précision
  if (ua.includes('iphone') || ua.includes('ipad')) {
    // Sur iOS, préciser que c'est le navigateur sur iOS
    deviceName += ` - ${browser} sur iOS`;
  } else {
    deviceName += ` - ${browser}`;
  }
  
  return {
    deviceName,
    deviceType,
    browser,
    os
  };
}

export function getDeviceInfoFromRequest(request: any): DeviceInfo {
  console.log('🔍 getDeviceInfoFromRequest - request:', JSON.stringify(request, null, 2));
  
  // Valeurs par défaut si request est undefined
  if (!request) {
    console.log('⚠️ Request est undefined, utilisation des valeurs par défaut');
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
    console.log('🔍 Headers disponibles:', Object.keys(request));
    
    // Si c'est un objet Request standard
    if (request.headers && typeof request.headers.get === 'function') {
      console.log('📱 Utilisation de request.headers.get()');
      userAgent = request.headers.get('user-agent') || '';
      const forwardedFor = request.headers.get('x-forwarded-for');
      const realIp = request.headers.get('x-real-ip');
      ip = realIp || forwardedFor?.split(',')[0] || undefined;
    }
    // Si c'est un objet avec headers comme propriété
    else if (request.headers && typeof request.headers === 'object') {
      console.log('📱 Utilisation de request.headers[]');
      userAgent = request.headers['user-agent'] || '';
      const forwardedFor = request.headers['x-forwarded-for'];
      const realIp = request.headers['x-real-ip'];
      ip = realIp || forwardedFor?.split(',')[0] || undefined;
    }
    // Si c'est un objet avec user-agent directement
    else if (request['user-agent']) {
      console.log('📱 Utilisation de request["user-agent"]');
      userAgent = request['user-agent'];
    }
    // Essayer d'autres propriétés possibles
    else if (request.userAgent) {
      console.log('📱 Utilisation de request.userAgent');
      userAgent = request.userAgent;
    }
    else if (request['User-Agent']) {
      console.log('📱 Utilisation de request["User-Agent"]');
      userAgent = request['User-Agent'];
    }
    else {
      console.log('⚠️ Aucune méthode trouvée pour extraire le user-agent');
    }
    
    console.log('📱 User-Agent extrait:', userAgent);
    console.log('🌐 IP extraite:', ip);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction des informations de device:', error);
  }
  
  const deviceInfo = parseUserAgent(userAgent);
  console.log('📱 Informations d\'appareil finales:', deviceInfo);
  
  return {
    ...deviceInfo,
    ip
  };
}
