#!/usr/bin/env bash
set -e
# Directorio donde está este script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Proyecto = padre de scripts/
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Fichero .env en la carpeta del proyecto
ENV_FILE="$PROJECT_ROOT/.env.test"

IMAGE="sincronizador-facturador"
CONTAINER="sync-facturador"
NETWORK="proxynet"
PORT="3000:3000"
VOLUME="/root/smart1/storage/app/tenancy:/root/smart1/storage/app/tenancy:ro"

# Reconstruye la imagen usando el Dockerfile en proyecto raíz
docker build -t $IMAGE "$PROJECT_ROOT"

#  Elimina el contenedor anterior si existe
# Borra el contenedor anterior si existe
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  docker rm -f "$CONTAINER"
fi
#  Arranca en background con env-file absoluto
docker run -d \
  --name $CONTAINER \
  --network $NETWORK \
  -p $PORT \
  --env-file "$ENV_FILE" \
  -v $VOLUME \
  $IMAGE:latest
