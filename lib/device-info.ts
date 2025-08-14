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

export function getDeviceInfoFromRequest(request: Request): DeviceInfo {
  const userAgent = request.headers.get('user-agent') || '';
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  const deviceInfo = parseUserAgent(userAgent);
  
  return {
    ...deviceInfo,
    ip: realIp || forwardedFor?.split(',')[0] || undefined
  };
}
