const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../config/wireguard.conf');

class WireGuardManager {
  static install() {
    try {
      console.log('Installing WireGuard...');
      execSync('sudo apt-get update && sudo apt-get install -y wireguard');
      return true;
    } catch (error) {
      console.error('WireGuard installation failed:', error);
      return false;
    }
  }

  static generateKeys() {
    try {
      const privateKey = execSync('wg genkey').toString().trim();
      const publicKey = execSync(`echo "${privateKey}" | wg pubkey`).toString().trim();
      
      return { privateKey, publicKey };
    } catch (error) {
      console.error('Key generation failed:', error);
      return null;
    }
  }

  static generateClientConfig(clientName = 'client1') {
    const keys = this.generateKeys();
    if (!keys) return null;

    const serverConfig = fs.existsSync(configPath) 
      ? fs.readFileSync(configPath, 'utf-8') 
      : null;

    if (!serverConfig) {
      console.error('Server config not found. Please setup server first.');
      return null;
    }

    const clientConfig = `[Interface]
PrivateKey = ${keys.privateKey}
Address = 10.0.0.2/32
DNS = 1.1.1.1

[Peer]
PublicKey = ${serverConfig.match(/PublicKey = (.+)/)[1]}
AllowedIPs = 0.0.0.0/0
Endpoint = your.server.ip:51820
PersistentKeepalive = 25`;

    fs.writeFileSync(`config/${clientName}.conf`, clientConfig);
    return clientConfig;
  }

  static start() {
    try {
      execSync('sudo systemctl start wg-quick@wg0');
      return true;
    } catch (error) {
      console.error('Failed to start WireGuard:', error);
      return false;
    }
  }
}

module.exports = WireGuardManager;
