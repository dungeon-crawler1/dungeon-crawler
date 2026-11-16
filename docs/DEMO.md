# Guía de demo y acceso remoto

> Esta guía asume que el proyecto se ejecuta en una PC “anfitriona” y que las demás PCs
> (Kubuntu o Windows 10) sólo necesitan un navegador.

## 1. Decisión de red: leé esto primero

Hay dos situaciones distintas:

| Situación | ¿Se puede acceder desde otra red? | Solución |
|---|---|---|
| **El lugar NO tiene internet** | **No** por internet. Es físicamente imposible. | Todas las PCs en la **misma red local**: hotspot del celular, hotspot de la notebook o un router/switch. |
| **El lugar SÍ tiene internet** | Sí | Túnel (Cloudflare/ngrok) o deploy en la nube. |

La app ya está preparada para funcionar en **LAN sin internet**:
- Los frontends usan `/api` (misma origen) y Vite hace proxy al backend.
- Los backends escuchan en `0.0.0.0`.
- Las fuentes medievales están **self-hosted** (no dependen de Google Fonts).
- No hace falta `VITE_API_URL`.

## 2. Escenario A — Sin internet: misma red/hotspot (recomendado)

### 2.1 Preparar la PC anfitriona (esta PC)

1. Verificá que exista `.env` en la raíz (no se versiona):
   ```bash
   cp .env.example .env
   # editá POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB y JWT_SECRET
   ```
2. Arrancá base y backends. Con Docker:
   ```bash
   docker compose up -d --build
   ```
   En este entorno de desarrollo ya están corriendo en los puertos 3000 (Express),
   8000 (FastAPI) y 5432 (PostgreSQL local).
3. Arrancá los frontends (desde la raíz del repo):
   ```bash
   cd frontend-react
   npm ci
   npm run dev -- --host 0.0.0.0 --port 5173

   cd ../frontend-vue
   npm ci
   npm run dev -- --host 0.0.0.0 --port 5174
   ```
   No hace falta `VITE_API_URL`: `/api` se proxya al backend Express (`localhost:3000`).
   Si querés usar FastAPI como backend:
   ```bash
   VITE_API_TARGET=http://localhost:8000 npm run dev -- --host 0.0.0.0 --port 5173
   ```
4. Obtené la IP de la PC anfitriona:
   ```bash
   ip -4 addr show | grep "inet " | grep -v 127.0.0.1
   # ejemplo actual: 192.168.1.146
   ```
5. Abrí el firewall (si `ufw` está activo):
   ```bash
   sudo ufw allow 3000/tcp
   sudo ufw allow 5173/tcp
   sudo ufw allow 5174/tcp
   # opcional para Swagger de FastAPI
   sudo ufw allow 8000/tcp
   ```
   **No abras 5432**: PostgreSQL debe quedar en `127.0.0.1`.

### 2.2 Crear una red local sin internet

Elegí una de estas:

- **Hotspot del celular sin datos**: el celular crea la Wi-Fi; conectá la PC anfitriona y las
  PCs que miran. No hace falta datos móviles para que se vean entre sí.
- **Hotspot de la notebook anfitriona** (si tiene Wi-Fi):
  ```bash
  nmcli device wifi hotspot ifname <interfaz-wifi> ssid MazmorraDemo password "unaClaveLarga"
  ```
  En Windows: Configuración → Red e Internet → Zona con cobertura inalámbrica móvil.
- **Router/switch portátil**: todas las PCs al mismo router, sin salida a internet.

### 2.3 Abrir desde las otras PCs

En Kubuntu o Windows 10, sólo abrí el navegador:

- React: `http://<IP_DEL_HOST>:5173`
- Vue: `http://<IP_DEL_HOST>:5174`

Ejemplo con la IP actual: `http://192.168.1.146:5173`.

No instales Node, Docker ni nada en las PCs que sólo miran.

## 3. Escenario B — Con internet y otra red: túnel

El frontend y la API comparten origen (`/api`), así que **un solo túnel al puerto 5173**
expone toda la aplicación React. Para Vue, otro túnel al 5174.

### Cloudflare Tunnel rápido (URL temporal)

```bash
# instalar cloudflared en la PC anfitriona
# https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
cloudflared tunnel --url http://localhost:5173
```

Te devuelve una URL `https://algo.trycloudflare.com`. Esa URL funciona desde cualquier red.
Para una URL fija hace falta una cuenta de Cloudflare y un túnel nombrado.

> El túnel requiere internet en la PC anfitriona **y** en las PCs que miran. Si el lugar no
> tiene internet, usá el Escenario A.

### Deploy alternativo

- Frontends: Vercel/Netlify (build estático).
- Backends: Render/Railway + PostgreSQL gestionado.
- Configurá `VITE_API_URL` con la URL pública del backend o un reverse proxy `/api`.
- Si usás FastAPI directo, definí `CORS_ORIGINS` con el dominio del frontend.

## 4. Escenario C — Ejecutar en otra Kubuntu/Windows 10

### Kubuntu

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2 git
sudo usermod -aG docker $USER   # cerrar sesión y volver a entrar

git clone git@github.com:dungeon-crawler1/dungeon-crawler.git
cd dungeon-crawler
cp .env.example .env
# editar .env
docker compose up -d --build

# Frontends (Node 20+)
cd frontend-react && npm ci && npm run dev -- --host 0.0.0.0 --port 5173
cd ../frontend-vue && npm ci && npm run dev -- --host 0.0.0.0 --port 5174
```

### Windows 10

1. Instalá **Docker Desktop** (WSL2), **Node.js 20** y **Git**.
2. En PowerShell:
   ```powershell
   git clone git@github.com:dungeon-crawler1/dungeon-crawler.git
   cd dungeon-crawler
   copy .env.example .env
   notepad .env
   docker compose up -d --build

   cd frontend-react
   npm ci
   npm run dev -- --host 0.0.0.0 --port 5173

   cd ..\frontend-vue
   npm ci
   npm run dev -- --host 0.0.0.0 --port 5174
   ```
3. Permitir 5173, 5174 y 3000 en el Firewall de Windows para redes privadas.

El `docker-compose.yml` actual levanta base y backends; los frontends se corren con Node.
Una mejora pendiente es agregar los frontends al compose con Nginx.

## 5. Problemas frecuentes

| Síntoma | Causa / solución |
|---|---|
| La página carga pero el login falla | El frontend no está usando `/api` o el proxy no llega al backend. Verificá `http://<host>:5173/api/game/leaderboard`. |
| `ERR_CONNECTION_REFUSED` desde otra PC | Firewall del host, IP equivocada o PCs en redes distintas. |
| Funciona en localhost pero no por IP | Vite debe arrancar con `--host 0.0.0.0` (ya está configurado). |
| Se ve la UI sin fuentes medievales | Las fuentes son locales; si no cargan, revisá que `src/styles/fonts/*.woff2` esté en el clon. |
| CORS bloqueado usando FastAPI directo | Definí `CORS_ORIGINS` o usá el proxy `/api` de Vite. |
| Pantalla en blanco tras un cambio | `Ctrl+Shift+R` para saltar caché. |
| Se pierde la sesión | El JWT está en `localStorage`; no borres datos del navegador. |

## 6. Checklist de demo

- [ ] `.env` creado y con `JWT_SECRET`.
- [ ] Base inicializada con `init.sql`.
- [ ] Backends en 3000/8000 y PostgreSQL en 5432.
- [ ] Frontends en 5173/5174 con `--host 0.0.0.0`.
- [ ] `/api` responde a través de 5173.
- [ ] Firewall permite 3000/5173/5174.
- [ ] PCs en la misma red/hotspot (sin internet) o túnel activo (con internet).
- [ ] Cuenta con partidas para “Mis Partidas” y el modal.
- [ ] Probado desde otra PC antes de presentar.
- [ ] No exponer PostgreSQL a la red.
