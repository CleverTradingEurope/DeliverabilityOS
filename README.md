# Deliverability OS

A Real-Time Deliverability Intelligence Center platform for verifying and cleaning email lists securely and efficiently.

## ⚠️ Limitaciones de la Validación SMTP
**Importante:** La validación mediante SMTP **no garantiza al 100% que un buzón exista**. Muchos proveedores de correo modernos (como Google Workspace, Microsoft 365 y otros) implementan políticas de "Catch-All" o devuelven silenciosamente respuestas positivas falsas (250 OK) para evitar la recolección de correos (Directory Harvest Attacks). Si el sistema no puede estar completamente seguro, clasificará el correo como `unknown` (desconocido).

## 🛠️ Requisitos del Servidor (VPS)
* Ubuntu 24.04 (o similar)
* Docker y Docker Compose instalados
* 2 vCPU y 8 GB RAM recomendados
* **Puerto 25 (Salida) ABIERTO**: Necesario para el handshake SMTP.

## 💻 Desarrollo Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar variables de entorno copiando el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
3. Iniciar el entorno de desarrollo:
   ```bash
   npm run dev
   ```

## 🐳 Despliegue en Producción (Docker)

Esta aplicación está optimizada para ejecutarse en contenedores Docker de forma segura.

### 1. Variables de Entorno
Crea un archivo `.env` en la raíz de tu proyecto en el VPS:
```env
PORT=3000
NODE_ENV=production
APP_URL=https://mi-dominio.com
GEMINI_API_KEY=tu_clave_api_aqui
```
**ADVERTENCIA**: NUNCA publiques o subas tu archivo `.env` o la `GEMINI_API_KEY` a un repositorio público como GitHub.

### 2. Construcción y Ejecución
Ejecuta el siguiente comando para levantar la aplicación:
```bash
docker-compose up -d --build
```

### 3. Proxy Inverso y HTTPS Automatizado (Caddy)
El archivo `docker-compose.yml` ya incluye un servicio de [Caddy](https://caddyserver.com/) configurado para actuar como Proxy Inverso automatizado. 
Caddy obtendrá y renovará automáticamente los certificados SSL (HTTPS) de Let's Encrypt para tu dominio.

Asegúrate de definir la variable `DOMAIN=mi-dominio.com` en tu archivo `.env`.

*Nota:* Si necesitas acceder a la aplicación localmente sin pasar por Caddy, el puerto `3080` está mapeado al `127.0.0.1` en tu VPS (ej. `curl http://127.0.0.1:3080/health`).

### 4. Monitoreo y Actualizaciones
Puedes comprobar que la aplicación está viva con el endpoint de salud:
```bash
curl http://localhost:3000/health
```

**Para actualizar el contenedor con nuevos cambios sin perder configuración:**
```bash
git pull origin main  # o como descargues tu código
docker-compose up -d --build
```
Esto reconstruirá la imagen utilizando la nueva versión del código de forma ininterrumpida.
