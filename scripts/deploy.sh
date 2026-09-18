#!/usr/bin/env bash
# Deploy AlgoViz to this server.
#
# The app runs on loopback (127.0.0.1:8807) behind an Apache vhost. Two hostnames
# are configured: a syawqy.my.id subdomain that needs a DNS record adding at the
# registrar, and an sslip.io name that resolves to this server's IP automatically
# and therefore needs no DNS work. HTTPS is live on the latter.
#
# Run as a normal user with sudo available.
set -euo pipefail

APP_DIR="${APP_DIR:-$HOME/algoviz}"
PORT="${PORT:-8807}"
SSLP_HOST="algoviz.43.129.39.107.sslip.io"
NAMED_HOST="algoviz.syawqy.my.id"

export PATH="$HOME/.bun/bin:$PATH"

cd "$APP_DIR"

# 1. Build the frontend. The API serves web/dist, so a stale build here is what
#    users actually see.
bun install
bun test
bun run build

# 2. Restart the API. Matching on the entry point avoids killing this script,
#    which a wider pattern such as "bun.*server" would do.
pkill -f "server/index.ts" 2>/dev/null || true
sleep 1
nohup bun run server/index.ts > /tmp/algoviz.log 2>&1 &
sleep 3

curl -fsS "http://127.0.0.1:$PORT/api/health"
echo

# 3. Apache vhost, proxying both hostnames to the loopback port.
for host in "$SSLP_HOST" "$NAMED_HOST"; do
  sudo tee "/etc/apache2/sites-available/algoviz-$host.conf" >/dev/null <<EOF
<VirtualHost *:80>
    ServerName $host

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:$PORT/
    ProxyPassReverse / http://127.0.0.1:$PORT/

    ErrorLog \${APACHE_LOG_DIR}/algoviz-error.log
    CustomLog \${APACHE_LOG_DIR}/algoviz-access.log combined
</VirtualHost>
EOF
  sudo a2ensite "algoviz-$host" -q
done

sudo a2enmod proxy proxy_http -q 2>/dev/null || true
sudo apache2ctl configtest
sudo systemctl reload apache2

# 4. Certificates. The sslip.io name resolves already; the syawqy.my.id one
#    fails with NXDOMAIN until a DNS A record points it at this server.
sudo certbot --apache -d "$SSLP_HOST" --non-interactive --agree-tos --redirect \
  -m "${CERTBOT_EMAIL:-xfuadi@gmail.com}" || true

echo
echo "Public:  https://$SSLP_HOST"
echo "Named:   http://$NAMED_HOST  (needs a DNS A record -> $(curl -s -m 5 ifconfig.me))"
