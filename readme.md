# servicio-sincronizador 🚀

## 1. Descripción  
Servicio encargado de sincronizar información de facturación del sistema Facturación Smart con el Portal Jadal Facturacion.

## 2. Tecnologías y Requisitos  

- **Node.js** (v20.x)  
- **npm** o **Yarn**  
- **TypeScript** (v4.x)  
- **Docker**  
- **Bash shell** (GNU bash)  

> **Importante:** Todas estas herramientas deben estar instaladas en el **mismo servidor** donde está desplegado el servicio de facturación que se desea sincronizar.

## 3. Estructura de Carpetas  

```bash
servicio-sincronizador/
├── logs/
├── scripts/
│   └── docker.sh
├── src/
│   ├── config/
│   ├── mappers/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── index.ts
├── .env.development
├── .env.test
├── .env.production
├── .example.env
├── .gitignore
├── Dockerfile
├── dockerignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── readme.md
```
> *Nota:* Las variables de entorno se definen en los archivos `.env.*` y deben cargarse antes de ejecutar el servicio.

## 4. Variables de Entorno  

Duplica el archivo de ejemplo y adapta cada entorno:
```bash
cp .example.env .env.development
cp .example.env .env.test
cp .example.env .env.production
```

| Variable                | Descripción                                      |
|-------------------------|--------------------------------------------------|
| `DB_HOST`               | Host de la base de datos                         |
| `DB_PORT`               | Puerto de conexión de la base de datos           |
| `DB_USER`               | Usuario de la base de datos                      |
| `DB_PASSWORD`           | Contraseña de la base de datos                   |
| `DB_PRINCIPAL_DATABASE` | Nombre de la base de datos principal             |
| `PROJECT_BASE_PATH`     | Ruta base del proyecto en el servidor            |
| `SYNC_INTERVAL_CRON`    | Intervalo de sincronización en formato cron      |
| `EXTERNAL_API_URL`      | URL de la API externa a consumir                 |

## 5. Instalación Local (Desarrollo)  

1. Clonar el repositorio  
   ```bash
   git clone https://tu-repo.git servicio-sincronizador
   cd servicio-sincronizador
   ```
2. Instalar dependencias  
   ```bash
   npm install
   # o con yarn:
   # yarn install
   ```
3. Levantar en modo desarrollo  
   ```bash
   npm run start:dev
   ```
   - Recarga automática con `ts-node-dev`  
   - Escucha en `http://localhost:3000` por defecto

## 6. Uso de Docker  

Archivos relacionados: `Dockerfile` y `scripts/docker.sh`

```bash
# 1. Construir la imagen
docker build -t sincronizador-facturador .

# 2. Eliminar contenedor previo (si existe)
docker rm -f sync-facturador || true

# 3. Ejecutar el contenedor
./scripts/docker.sh
```

*Los detalles de flags y configuración están en* `scripts/docker.sh`.

## 7. Despliegue en Producción  

Asegúrate de tener instaladas las herramientas y de configurar `.env.production`, luego:

```bash
chmod +x scripts/docker.sh
./scripts/docker.sh
```

Para supervisar la ejecución:

```bash
docker logs -f sync-facturador
```


