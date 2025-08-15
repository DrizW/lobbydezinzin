#!/usr/bin/env python3
"""
API DNS Smart pour LobbyDeZinzin
Gestion dynamique des zones géographiques pour Warzone SBMM bypass
"""

import os
import json
import subprocess
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# Configuration
DNS_SERVER_IP = "139.84.240.209"
ZONE_DIR = "/etc/bind/zones"
LOG_FILE = "/var/log/lobbydezinzin/dns_api.log"

# Créer le dossier de logs
os.makedirs("/var/log/lobbydezinzin", exist_ok=True)

# Configuration des logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

# Base de données pour les sessions DNS
def init_db():
    conn = sqlite3.connect('/var/lib/lobbydezinzin/dns_sessions.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS dns_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_ip TEXT NOT NULL,
            user_agent TEXT,
            region TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            active BOOLEAN DEFAULT 1
        )
    ''')
    conn.commit()
    conn.close()

# Régions disponibles avec leurs IPs
REGIONS = {
    "johannesburg": {
        "name": "Johannesburg, South Africa",
        "ip": "139.84.240.209",
        "coordinates": "-26.2041,28.0473",
        "timezone": "Africa/Johannesburg"
    },
    "london": {
        "name": "London, UK",
        "ip": "139.84.240.209",  # Même IP, différent routing
        "coordinates": "51.5074,-0.1278",
        "timezone": "Europe/London"
    },
    "frankfurt": {
        "name": "Frankfurt, Germany",
        "ip": "139.84.240.209",
        "coordinates": "50.1109,8.6821",
        "timezone": "Europe/Berlin"
    },
    "newyork": {
        "name": "New York, USA",
        "ip": "139.84.240.209",
        "coordinates": "40.7128,-74.0060",
        "timezone": "America/New_York"
    },
    "tokyo": {
        "name": "Tokyo, Japan",
        "ip": "139.84.240.209",
        "coordinates": "35.6762,139.6503",
        "timezone": "Asia/Tokyo"
    }
}

def get_client_ip():
    """Récupérer l'IP du client"""
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    return request.remote_addr

def update_zone_file(zone_name, region_data):
    """Mettre à jour un fichier de zone DNS"""
    zone_file = f"{ZONE_DIR}/{zone_name}.zone"
    
    # Template de zone avec la nouvelle région
    zone_content = f"""$TTL 300
@       IN      SOA     {zone_name}. admin.lobbydezinzin.com. (
                        {int(datetime.now().timestamp())}      ; Serial
                        300             ; Refresh
                        300             ; Retry
                        300             ; Expire
                        300             ; Minimum TTL
)

@       IN      NS      ns1.lobbydezinzin.com.
@       IN      A       {region_data['ip']}

; Géolocalisation pour {region_data['name']}
*.{zone_name}.    IN      A       {region_data['ip']}
geo.{zone_name}.  IN      A       {region_data['ip']}
match.{zone_name}. IN     A       {region_data['ip']}

; Enregistrements spécifiques Warzone
geo.demonware.net.    IN      A       {region_data['ip']}
match.demonware.net.  IN      A       {region_data['ip']}
geo.activision.com.   IN      A       {region_data['ip']}
geo.callofduty.com.   IN      A       {region_data['ip']}
"""
    
    # Écrire le fichier de zone
    with open(zone_file, 'w') as f:
        f.write(zone_content)
    
    # Vérifier la syntaxe
    result = subprocess.run(['named-checkzone', zone_name, zone_file], 
                          capture_output=True, text=True)
    
    if result.returncode != 0:
        raise Exception(f"Erreur de syntaxe zone {zone_name}: {result.stderr}")
    
    logging.info(f"Zone {zone_name} mise à jour pour {region_data['name']}")

def reload_dns():
    """Recharger la configuration DNS"""
    try:
        # Recharger BIND9
        subprocess.run(['systemctl', 'reload', 'bind9'], check=True)
        logging.info("Configuration DNS rechargée")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Erreur lors du rechargement DNS: {e}")
        return False

def log_dns_query(query_type, domain, client_ip, region):
    """Logger les requêtes DNS"""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "query_type": query_type,
        "domain": domain,
        "client_ip": client_ip,
        "region": region,
        "server_ip": DNS_SERVER_IP
    }
    
    with open("/var/log/lobbydezinzin/dns_queries.log", "a") as f:
        f.write(json.dumps(log_entry) + "\n")

@app.route('/api/dns/status', methods=['GET'])
def get_status():
    """Statut du serveur DNS"""
    try:
        # Vérifier si BIND9 fonctionne
        result = subprocess.run(['systemctl', 'is-active', 'bind9'], 
                              capture_output=True, text=True)
        bind9_status = result.stdout.strip() == "active"
        
        # Statistiques
        stats = {
            "server_ip": DNS_SERVER_IP,
            "bind9_status": bind9_status,
            "regions_available": list(REGIONS.keys()),
            "uptime": subprocess.run(['uptime'], capture_output=True, text=True).stdout.strip()
        }
        
        return jsonify({"success": True, "data": stats})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dns/change-region', methods=['POST'])
def change_region():
    """Changer la région DNS"""
    try:
        data = request.get_json()
        region = data.get('region')
        client_ip = get_client_ip()
        user_agent = request.headers.get('User-Agent', 'Unknown')
        
        if not region or region not in REGIONS:
            return jsonify({
                "success": False, 
                "error": f"Région invalide. Régions disponibles: {list(REGIONS.keys())}"
            }), 400
        
        region_data = REGIONS[region]
        
        # Enregistrer la session
        conn = sqlite3.connect('/var/lib/lobbydezinzin/dns_sessions.db')
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO dns_sessions (user_ip, user_agent, region, expires_at)
            VALUES (?, ?, ?, datetime('now', '+1 hour'))
        ''', (client_ip, user_agent, region))
        conn.commit()
        conn.close()
        
        # Mettre à jour les zones DNS
        zones_to_update = ['demonware.net', 'activision.com', 'callofduty.com']
        
        for zone in zones_to_update:
            update_zone_file(zone, region_data)
        
        # Recharger DNS
        if not reload_dns():
            return jsonify({"success": False, "error": "Erreur lors du rechargement DNS"}), 500
        
        # Logger l'action
        logging.info(f"Région changée vers {region_data['name']} pour {client_ip}")
        
        return jsonify({
            "success": True,
            "message": f"Région changée vers {region_data['name']}",
            "data": {
                "region": region,
                "region_name": region_data['name'],
                "dns_server": DNS_SERVER_IP,
                "coordinates": region_data['coordinates'],
                "timezone": region_data['timezone']
            }
        })
        
    except Exception as e:
        logging.error(f"Erreur lors du changement de région: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/dns/current-region', methods=['GET'])
def get_current_region():
    """Obtenir la région actuelle pour une IP"""
    client_ip = get_client_ip()
    
    conn = sqlite3.connect('/var/lib/lobbydezinzin/dns_sessions.db')
    cursor = conn.cursor()
    cursor.execute('''
        SELECT region, created_at FROM dns_sessions 
        WHERE user_ip = ? AND active = 1 AND expires_at > datetime('now')
        ORDER BY created_at DESC LIMIT 1
    ''', (client_ip,))
    
    result = cursor.fetchone()
    conn.close()
    
    if result:
        region, created_at = result
        return jsonify({
            "success": True,
            "data": {
                "region": region,
                "region_name": REGIONS[region]['name'],
                "created_at": created_at,
                "dns_server": DNS_SERVER_IP
            }
        })
    else:
        return jsonify({
            "success": True,
            "data": {
                "region": "default",
                "region_name": "Default (Johannesburg)",
                "dns_server": DNS_SERVER_IP
            }
        })

@app.route('/api/dns/logs', methods=['GET'])
def get_logs():
    """Obtenir les logs DNS récents"""
    try:
        # Logs BIND9
        with open('/var/log/bind/query.log', 'r') as f:
            bind9_logs = f.readlines()[-50:]  # 50 dernières lignes
        
        # Logs API
        with open(LOG_FILE, 'r') as f:
            api_logs = f.readlines()[-50:]
        
        return jsonify({
            "success": True,
            "data": {
                "bind9_logs": bind9_logs,
                "api_logs": api_logs
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    # Initialiser la base de données
    os.makedirs('/var/lib/lobbydezinzin', exist_ok=True)
    init_db()
    
    # Démarrer l'API
    app.run(host='0.0.0.0', port=5001, debug=False)
