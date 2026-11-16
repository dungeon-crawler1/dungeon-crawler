# Guía de demo y acceso remoto

> Esta guía asume que el proyecto se ejecuta en una PC “anfitriona” y que las demás PCs
> (Kubuntu o Windows 10) sólo necesitan un navegador.

## 0. Ruta rápida: demo completa con un solo comando

Si sólo querés levantar todo para mostrar (sin instalar Node en la máquina anfitriona), usá el
compose de demo. Compila React y Vue, los sirve con Nginx y proxea `/api` al backend Express.
PostgreSQL y los backends quedan en la red interna de Docker.

```bash
git clone git@github.com:dungeon-crawler1/dungeon-crawler.git
cd dungeon-crawler

# Opcional: si no existe .env, se usan credenciales de demo.
cp .env.example .env

docker compose -f docker-compose.demo.yml up -d --build
```

Cuando termine:

| Aplicación | URL local | URL desde otra PC de la LAN |
|---|---|---|
| React | http://localhost:8080 | `http://<IP_DEL_HOST>:8080` |
| Vue | http://localhost:8081 | `http://<IP_DEL_HOST>:8081` |

Comandos útiles:

```bash
docker compose -f docker-compose.demo.yml ps        # estado y salud
docker compose -f docker-compose.demo.yml logs -f   # logs en vivo
docker compose -f docker-compose.demo.yml down       # apagar (conserva datos)
docker compose -f docker-compose.demo.yml down -v    # apagar y borrar datos
```

- Sólo se publican **8080** y **8081**. Cambialos con `DEMO_REACT_PORT` y `DEMO_VUE_PORT`.
- No se publican PostgreSQL (5432) ni los backends (3000/8000).
- Para permitir el acceso desde otras PCs, abrí 8080/8081 en el firewall del host.
- Los contenedores usan `restart: unless-stopped`: si Docker está habilitado, vuelven solos tras reiniciar la PC.
- Si cambiás código, volvé a ejecutar el mismo `up -d --build`.
- Para acceder **desde cualquier red con internet**, mirá la sección 3 (túnel de Cloudflare).

El resto de la guía explica la alternativa de desarrollo (Vite + Node), los escenarios de red y
el diagnóstico de problemas.

## 1. Decisión de red: leé esto primero

Hay dos situaciones distintas:

| Situación | ¿Se puede acceder desde otra red? | Solución |
|---|---|---|
| **El lugar NO tiene internet** | **No** por internet. Es físicamente imposible. | Todas las PCs en la **misma red local**: hotspot del celular, hotspot de la notebook o un router/switch. |
| **El lugar SÍ tiene internet** | Sí | Túnel (Cloudflare/ngrok) o deploy en la nube. |

La app ya está preparada para funcionar en **LAN sin internet**:
- Los frontends usan `/api` (misma origen) y **Nginx** (demo) o **Vite** (desarrollo) hacen proxy al backend.
- Los backends escuchan en `0.0.0.0`.
- Las fuentes medievales están **self-hosted** (no dependen de Google Fonts).
- No hace falta `VITE_API_URL`.

## 2. Escenario A — Sin internet: misma red/hotspot (recomendado)

### 2.1 Preparar la PC anfitriona (esta PC)

> Si usás el compose de demo de la sección 0, saltá directamente al paso 2.2. Los puertos a
> abrir son **8080** y **8081**, no 5173/5174.

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

- **Con el compose de demo:** React `http://<IP_DEL_HOST>:8080`, Vue `http://<IP_DEL_HOST>:8081`.
- **Con Vite en desarrollo:** React `http://<IP_DEL_HOST>:5173`, Vue `http://<IP_DEL_HOST>:5174`.

Ejemplo con la IP actual: `http://192.168.1.146:8080`.

No instales Node, Docker ni nada en las PCs que sólo miran.

## 3. Escenario B — Con internet y otra red: túnel

El frontend y la API comparten origen (`/api`), así que **un solo túnel** expone toda la
aplicación: al puerto **8080** si usás el compose de demo, o al **5173** si usás Vite en
desarrollo. Para Vue, repetí con el otro puerto (8081 o 5174).

### Cloudflare Tunnel rápido (URL temporal)

```bash
# instalar cloudflared en la PC anfitriona (una vez)
# https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

# Demo con Docker (recomendado)
cloudflared tunnel --url http://localhost:8080   # React
cloudflared tunnel --url http://localhost:8081   # Vue

# Alternativa con Vite en desarrollo
cloudflared tunnel --url http://localhost:5173
cloudflared tunnel --url http://localhost:5174
```

Cada comando devuelve una URL `https://algo.trycloudflare.com`. Esa URL funciona desde cualquier
red con internet, sin abrir puertos en el router ni tener IP pública. La URL **cambia cada vez que
reiniciás el túnel**; para una URL fija hace falta una cuenta de Cloudflare, un dominio propio y un
túnel nombrado.

> Requisitos: la PC anfitriona debe quedar encendida y con internet mientras dure la demo. Si el
> lugar no tiene internet, usá el Escenario A (misma LAN/hotspot).

> **Importante:** si la PC se suspende, el *quick tunnel* puede quedar inválido y la URL deja de
> funcionar aunque el proceso siga vivo. Desactivá la suspensión automática (inactividad y tapa)
> antes de la demo, o usá un túnel nombrado/Tailscale Funnel para una URL estable.

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
cp .env.example .env            # opcional: hay defaults de demo

# Demo completa (base + backends + frontends con Nginx)
docker compose -f docker-compose.demo.yml up -d --build
```

Abrí `http://localhost:8080` (React) y `http://localhost:8081` (Vue).

<details>
<summary>Alternativa de desarrollo con Vite (requiere Node 20+)</summary>

```bash
docker compose up -d --build
cd frontend-react && npm ci && npm run dev -- --host 0.0.0.0 --port 5173
cd ../frontend-vue && npm ci && npm run dev -- --host 0.0.0.0 --port 5174
```

</details>

### Windows 10

1. Instalá **Docker Desktop** (WSL2) y **Git**. Node 20 sólo hace falta para la alternativa de
   desarrollo con Vite.
2. En PowerShell:
   ```powershell
   git clone git@github.com:dungeon-crawler1/dungeon-crawler.git
   cd dungeon-crawler
   copy .env.example .env
   notepad .env

   # Demo completa (base + backends + frontends con Nginx)
   docker compose -f docker-compose.demo.yml up -d --build
   ```
3. Permitir **8080** y **8081** en el Firewall de Windows para redes privadas. Con la variante
   Vite, permitir 5173, 5174 y 3000.

El `docker-compose.yml` base levanta sólo base y backends. El `docker-compose.demo.yml` agrega los
dos frontends compilados y servidos por Nginx, con `/api` proxeado al backend Express y sin
publicar PostgreSQL ni los backends.

## 5. Problemas frecuentes

| Síntoma | Causa / solución |
|---|---|
| La página carga pero el login falla | El frontend no está usando `/api` o el proxy no llega al backend. Verificá `http://<host>:8080/api/game/leaderboard` (demo) o `:5173` (Vite). |
| `ERR_CONNECTION_REFUSED` desde otra PC | Firewall del host, IP equivocada o PCs en redes distintas. |
| Funciona en localhost pero no por IP | En demo, el puerto debe publicarse en `0.0.0.0`; en Vite, arrancar con `--host 0.0.0.0`. |
| El contenedor de un frontend no arranca | Mirá `docker compose -f docker-compose.demo.yml logs frontend-react`; suele ser un fallo del build. |
| Cambié código y no se refleja | El demo sirve archivos compilados: corré `up -d --build` de nuevo. |
| Se ve la UI sin fuentes medievales | Las fuentes son locales; si no cargan, revisá que `src/styles/fonts/*.woff2` esté en el clon. |
| CORS bloqueado usando FastAPI directo | Definí `CORS_ORIGINS` o usá el proxy `/api` de Nginx/Vite. |
| Pantalla en blanco tras un cambio | `Ctrl+Shift+R` para saltar caché. |
| Se pierde la sesión | El JWT está en `localStorage`; no borres datos del navegador. |

## 6. Checklist de demo

- [ ] `.env` creado y con `JWT_SECRET` (o defaults de demo aceptados).
- [ ] Base inicializada con `init.sql`.
- [ ] `docker compose -f docker-compose.demo.yml up -d --build` terminó sin errores.
- [ ] `docker compose -f docker-compose.demo.yml ps` muestra todo `healthy`/`running`.
- [ ] React responde en `http://<IP>:8080` y Vue en `http://<IP>:8081`.
- [ ] `/api` responde a través del frontend (`:8080/api/game/leaderboard`).
- [ ] Firewall permite 8080/8081.
- [ ] PCs en la misma red/hotspot (sin internet) o túnel activo (con internet).
- [ ] Cuenta con partidas para “Mis Partidas” y el modal.
- [ ] Probado desde otra PC antes de presentar.
- [ ] No exponer PostgreSQL a la red.
