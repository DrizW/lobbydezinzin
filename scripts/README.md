# 🚀 Scripts LobbyDeZinzin

Collection de scripts pour déployer et gérer le Smart DNS LobbyDeZinzin sur différentes plateformes.

---

## 📁 **Structure des Scripts**

```
scripts/
├── 🌐 deploy-oracle-free.sh      # Déploiement Oracle Cloud Free (RECOMMANDÉ)
├── 🔧 deploy-smart-dns.sh        # Déploiement générique VPS Ubuntu/Debian  
├── 🧪 test-oracle-deployment.sh  # Tests validation Oracle Cloud
├── 🗄️ smart-dns-server.js        # Serveur Smart DNS Node.js
├── 📊 create-admin.ts             # Création comptes admin/test
├── 🌍 seed-countries.ts           # Population base de données pays/DNS
├── 🚀 deploy-free-dns.sh          # Déploiement DNS gratuits (dépréci)
└── 📖 README.md                   # Ce fichier
```

---

## 🎯 **Déploiement Recommandé : Oracle Cloud Free**

### **Pourquoi Oracle Cloud Free ?**
✅ **0€/mois** - Free Tier permanent  
✅ **6GB RAM + 1 vCPU** - Parfait pour Smart DNS  
✅ **IP publique incluse** - Pas de NAT à configurer  
✅ **Port 53 UDP disponible** - Idéal pour DNS  
✅ **10TB bande passante/mois** - Largement suffisant  

### **Déploiement en 1 commande:**
```bash
# Sur votre VM Oracle Cloud (Ubuntu 22.04)
curl -fsSL https://raw.githubusercontent.com/DrizW/lobbydezinzin/main/scripts/deploy-oracle-free.sh | bash
```

### **Ou téléchargement manuel:**
```bash
wget https://raw.githubusercontent.com/DrizW/lobbydezinzin/main/scripts/deploy-oracle-free.sh
chmod +x deploy-oracle-free.sh
sudo ./deploy-oracle-free.sh
```

---

## 🧪 **Tests & Validation**

### **Test complet du déploiement:**
```bash
# Après déploiement Oracle
chmod +x scripts/test-oracle-deployment.sh  
./scripts/test-oracle-deployment.sh
```

### **Tests manuels:**
```bash
# Test Smart DNS
dig @VOTRE_IP_ORACLE google.com

# Test application web
curl http://VOTRE_IP_ORACLE:3000

# Monitoring système
/usr/local/bin/oracle-monitor.sh
```

---

## 🔧 **Déploiement Alternatif : VPS Générique**

### **Pour Ubuntu/Debian sur n'importe quel VPS:**
```bash
# VPS classique avec IP publique
wget https://raw.githubusercontent.com/DrizW/lobbydezinzin/main/scripts/deploy-smart-dns.sh
chmod +x deploy-smart-dns.sh  
sudo ./deploy-smart-dns.sh votre-domaine.com
```

### **Requirements VPS:**
- Ubuntu 20.04+ ou Debian 11+
- 2GB RAM minimum (4GB recommandé)
- IP publique fixe
- Ports 53/UDP et 3000/TCP ouverts

---

## 🗄️ **Scripts Base de Données**

### **Création des comptes admin:**
```bash
npm run create-admin
# Crée: admin@lobbydezinzin.com / Admin123!
# Crée: test@lobbydezinzin.com / Test123!
```

### **Population des pays/DNS:**
```bash
npm run seed
# Ajoute Nigeria, Taiwan, Israël, etc. avec leurs DNS
```

---

## 🌐 **Configuration Smart DNS**

### **Serveur Smart DNS (Node.js)**
Le fichier `smart-dns-server.js` contient le cœur du système :

- **Interception** des domaines Call of Duty/Warzone
- **Identification** utilisateur par IP publique  
- **Redirection** vers DNS régionaux selon préférences web
- **Logging** de toute l'activité en base de données

### **Domaines interceptés:**
- `prod.demonware.net` (Serveurs principaux COD)
- `activision.com` (Services Activision)
- `callofduty.com` (Matchmaking)  
- `atvi-prod.net` (Infrastructure)

### **DNS régionaux utilisés:**
- 🇳🇬 Nigeria: `196.216.2.1` (MTN) - Lobbies très faciles
- 🇹🇼 Taiwan: `168.95.1.1` (CHT) - Lobbies faciles
- 🇮🇱 Israël: `199.203.56.1` (Bezeq) - Lobbies modérés
- 🇸🇬 Singapour: `165.21.83.88` (SingTel) - Lobbies asiatiques

---

## 📊 **Monitoring & Maintenance**

### **Commandes de service:**
```bash
# Status des services
systemctl status lobbydezinzin-dns
systemctl status lobbydezinzin-web

# Logs en temps réel
journalctl -u lobbydezinzin-dns -f
journalctl -u lobbydezinzin-web -f

# Restart des services
sudo systemctl restart lobbydezinzin-dns
sudo systemctl restart lobbydezinzin-web
```

### **Monitoring automatique (Oracle):**
```bash
# Script créé automatiquement
/usr/local/bin/oracle-monitor.sh

# Exemple de sortie:
=== Oracle Cloud Free - LobbyDeZinzin Monitor ===
CPU: 15.2%
RAM: Used: 3.2G/5.7G (56.1%)
Smart DNS: active
Web App: active
```

---

## 🔐 **Sécurité & Configuration**

### **Firewall (UFW) configuré automatiquement:**
```bash
Port 22/TCP   → SSH
Port 53/UDP   → Smart DNS  
Port 3000/TCP → Next.js App
Port 80/TCP   → HTTP Nginx
Port 443/TCP  → HTTPS (futur)
```

### **Oracle Cloud Security Lists requis:**
```
Ingress Rules à ajouter manuellement:
├── 0.0.0.0/0 → Port 53/UDP → Smart DNS
├── 0.0.0.0/0 → Port 3000/TCP → Web App  
├── 0.0.0.0/0 → Port 80/TCP → HTTP
└── 0.0.0.0/0 → Port 443/TCP → HTTPS
```

---

## 🎮 **Configuration Gaming**

### **Console/PC Setup:**
```
DNS Primaire: VOTRE_IP_ORACLE
DNS Secondaire: 8.8.8.8
```

### **Interface Web:**
- **Dashboard**: Sélection de région en 1 clic
- **Admin Panel**: Gestion IPs autorisées & monitoring
- **Logs temps réel**: Activité DNS par utilisateur

---

## 💰 **Économies vs Concurrence**

### **Notre solution (Oracle Free):**
- Infrastructure: **0€/mois**
- Prix client: 15-20€/mois
- Marge: **100% profit**

### **NolagVPN (concurrent):**
- Abonnement: $50/mois
- Infrastructure: Coûteuse
- Marge: Inconnue mais réduite

---

## 🚀 **Prochaines Étapes**

### **Après déploiement réussi:**

1. **Configurer Oracle Security Lists** (critique!)
2. **Tester DNS**: `dig @VOTRE_IP google.com`  
3. **Créer compte admin**: `npm run create-admin`
4. **Ajouter votre IP** via `/admin/ip-management`
5. **Tester Warzone** avec nouveau DNS
6. **Profiter des lobbies faciles** ! 🎯

---

## 📞 **Support & Ressources**

- **Repo principal**: https://github.com/DrizW/lobbydezinzin
- **Guide Oracle Cloud**: `ORACLE_CLOUD_GUIDE.md`
- **Guide Smart DNS**: `SMART_DNS_GUIDE.md`
- **Issues GitHub**: Pour bug reports et questions

---

**🎮 LobbyDeZinzin - Votre avantage concurrentiel dans Warzone !**