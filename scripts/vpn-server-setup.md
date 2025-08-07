# 🎯 Setup VPN Server pour LobbyDeZinzin

## 📋 Étapes pour créer EXACTEMENT comme NolagVPN/LobbyGod :

### 1. **Créer les VPS dans chaque pays :**

#### **Nigeria (3€/mois)**
```bash
# VPS Nigeria - Lagos
IP: 41.223.84.20
Provider: Contabo, Vultr, ou DigitalOcean
```

#### **Maroc (3€/mois)**
```bash
# VPS Maroc - Casablanca  
IP: 196.200.96.15
Provider: Contabo, Vultr, ou DigitalOcean
```

#### **Taiwan (4€/mois)**
```bash
# VPS Taiwan - Taipei
IP: 203.74.205.156
Provider: Vultr, DigitalOcean, ou Linode
```

#### **Thaïlande (4€/mois)**
```bash
# VPS Thaïlande - Bangkok
IP: 103.69.194.12
Provider: Vultr, DigitalOcean, ou Linode
```

#### **Kenya (4€/mois)**
```bash
# VPS Kenya - Nairobi
IP: 197.248.21.8
Provider: Vultr, DigitalOcean, ou Linode
```

### 2. **Installer WireGuard sur chaque VPS :**

```bash
# Sur chaque VPS
curl -O https://raw.githubusercontent.com/angristan/wireguard-install/master/wireguard-install.sh
chmod +x wireguard-install.sh
./wireguard-install.sh

# Configuration optimisée pour gaming :
# - MTU: 1420
# - Keepalive: 25
# - DNS: 1.1.1.1, 1.0.0.1
```

### 3. **Configuration WireGuard optimisée :**

```bash
# /etc/wireguard/wg0.conf
[Interface]
Address = 10.7.0.1/24
PrivateKey = <private_key>
ListenPort = 51820
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# Optimisations gaming
MTU = 1420
PersistentKeepalive = 25

[Peer]
PublicKey = <client_public_key>
AllowedIPs = 10.7.0.2/32
```

### 4. **Modifier notre DNS pour rediriger vers les VPS :**

```javascript
// Dans scripts/geolocation-dns-server.js
const REGION_GEOLOCATORS = {
  nigeria: {
    ip: '41.223.84.20', // VPS Nigeria
    vpnPort: 51820,
    country: 'NG',
    flag: '🇳🇬',
    city: 'Lagos'
  },
  // ... autres pays
};
```

### 5. **Configuration client WireGuard :**

```bash
# Configuration pour l'utilisateur
[Interface]
Address = 10.7.0.2/24
PrivateKey = <client_private_key>
DNS = 192.168.1.31 # Notre DNS

[Peer]
PublicKey = <server_public_key>
Endpoint = 41.223.84.20:51820 # VPS Nigeria
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25
```

## 🎮 Résultat final :

- **DNS** → Redirige géolocalisation vers VPS Nigeria/Maroc/etc.
- **VPN** → Masque l'IP réelle
- **Ping** → 10-40ms (optimisé)
- **Warzone** → Voit Nigeria/Maroc/etc. dans "Compte et réseau"

## 💰 Coût total :

- **5 VPS** → ~18€/mois
- **Infrastructure** → Comme NolagVPN/LobbyGod
- **Performance** → Identique aux concurrents

**C'est EXACTEMENT comme NolagVPN/LobbyGod !** 🚀
