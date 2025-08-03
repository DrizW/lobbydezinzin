#!/bin/bash

echo "🚀 Déploiement DNS Nigeria..."


COUNTRY_NAME="Nigeria"
COUNTRY_CODE="NG"
PRIMARY_DNS="8.8.8.8"
SECONDARY_DNS="8.8.4.4"


cat > .env << EOF
COUNTRY_NAME=$COUNTRY_NAME
COUNTRY_CODE=$COUNTRY_CODE
PRIMARY_DNS=$PRIMARY_DNS
SECONDARY_DNS=$SECONDARY_DNS
EOF


if ! command -v docker &> /dev/null; then
    echo "📦 Installation Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi


if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installation Docker Compose..."
    sudo apt update
    sudo apt install docker-compose-plugin -y
fi


cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  powerdns:
    image: pschiffe/pdns-mysql
    container_name: powerdns-nigeria
    ports:
      - "53:53/tcp"
      - "53:53/udp"
    environment:
      - MYSQL_HOST=mysql
      - MYSQL_USER=pdns
      - MYSQL_PASS=pdns
      - MYSQL_DB=pdns
    depends_on:
      - mysql
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    container_name: mysql-nigeria
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=pdns
      - MYSQL_USER=pdns
      - MYSQL_PASSWORD=pdns
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql_data:
EOF


echo "🚀 Démarrage des services..."
docker-compose up -d


echo "⏳ Attente du démarrage de MySQL..."
sleep 30


echo "🌐 Configuration des zones DNS..."


docker exec mysql-nigeria mysql -u pdns -ppdns pdns -e "
INSERT INTO domains (name, type) VALUES ('lobbydezinzin.com', 'MASTER');
INSERT INTO records (domain_id, name, type, content, ttl) VALUES 
(1, 'lobbydezinzin.com', 'SOA', 'ns1.lobbydezinzin.com admin.lobbydezinzin.com 2023120101 3600 1800 1209600 300', 300),
(1, 'lobbydezinzin.com', 'NS', 'ns1.lobbydezinzin.com', 300),
(1, 'ns1.lobbydezinzin.com', 'A', '$(hostname -I | awk '{print $1}')', 300);
"

echo "✅ Déploiement Nigeria terminé !"
echo "🌍 Pays: $COUNTRY_NAME"
echo "🔗 DNS Principal: $PRIMARY_DNS"
echo "🔗 DNS Secondaire: $SECONDARY_DNS"
echo "🌐 IP du serveur: $(hostname -I | awk '{print $1}')" 