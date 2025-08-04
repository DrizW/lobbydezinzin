# 🌍 Guide de Configuration des IP DNS

## 📋 Étapes pour mettre à jour vos serveurs DNS

### 1. Récupérer les IP publiques de vos VMs Oracle Cloud

Pour chaque région, connectez-vous à votre VM et récupérez l'IP publique :

```bash
# Sur chaque VM Oracle Cloud
curl -s ifconfig.me
# ou
curl -s ipinfo.io/ip
```

### 2. Mettre à jour le fichier de seed

Éditez `scripts/seed-countries.ts` et remplacez les `XXX.XXX` par vos vraies IP :

```typescript
// Exemple pour Israël (déjà fait)
dnsPrimary: "192.116.142.34", // ✅ IP réelle de votre VM Israël

// À faire pour les autres :
dnsPrimary: "129.213.XXX.XXX", // ❌ Remplacer par IP Nigeria
dnsPrimary: "140.238.XXX.XXX", // ❌ Remplacer par IP Taiwan  
dnsPrimary: "158.101.XXX.XXX", // ❌ Remplacer par IP Thaïlande
// etc...
```

### 3. Vérifier que PowerDNS fonctionne sur chaque VM

Pour chaque serveur, vérifiez que PowerDNS écoute sur le port 53 :

```bash
# Sur chaque VM
sudo netstat -tulpn | grep :53
docker-compose ps
```

### 4. Tester la résolution DNS

```bash
# Tester depuis un autre serveur
nslookup lobbydezinzin.com IP_DE_VOTRE_SERVEUR
dig @IP_DE_VOTRE_SERVEUR lobbydezinzin.com
```

### 5. Mettre à jour la base de données

```bash
# Une fois les IP mises à jour dans seed-countries.ts
npm run seed
```

## 🔧 Configuration des règles de firewall Oracle Cloud

Assurez-vous que le port 53 est ouvert :

```bash
# Sur chaque VM Oracle Cloud
sudo iptables -I INPUT -p udp --dport 53 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 53 -j ACCEPT
sudo iptables-save
```

Dans Oracle Cloud Console :
1. VCN → Security Lists
2. Ajouter Ingress Rule :
   - Source CIDR: 0.0.0.0/0
   - Destination Port: 53
   - Protocol: UDP + TCP

## 📊 Liste des IP par région (à compléter)

| Région | VM Oracle | IP Publique | Status |
|--------|-----------|-------------|---------|
| 🇮🇱 Israël | oracle-israel | 192.116.142.34 | ✅ Configuré |
| 🇳🇬 Nigeria | oracle-nigeria | 129.213.XXX.XXX | ❌ À configurer |
| 🇹🇼 Taiwan | oracle-taiwan | 140.238.XXX.XXX | ❌ À configurer |
| 🇹🇭 Thaïlande | oracle-thailand | 158.101.XXX.XXX | ❌ À configurer |
| 🇰🇭 Cambodge | oracle-cambodia | 140.238.XXX.XXX | ❌ À configurer |
| 🇲🇦 Maroc | oracle-morocco | 129.159.XXX.XXX | ❌ À configurer |
| 🇩🇿 Algérie | oracle-algeria | 129.159.XXX.XXX | ❌ À configurer |
| 🇹🇳 Tunisie | oracle-tunisia | 129.159.XXX.XXX | ❌ À configurer |
| 🇰🇪 Kenya | oracle-kenya | 129.213.XXX.XXX | ❌ À configurer |

## 🧪 Test final

Une fois tout configuré, testez depuis votre site :

1. Connectez-vous avec un compte test
2. Créez un abonnement factice
3. Vérifiez que les DNS s'affichent correctement
4. Testez la copie des IP DNS

## ⚠️ Notes importantes

- Les DNS secondaires restent des DNS publics pour la redondance
- Assurez-vous que vos VMs ont une IP publique statique
- Testez la latence depuis différentes régions
- Configurez la sauvegarde automatique des configurations PowerDNS