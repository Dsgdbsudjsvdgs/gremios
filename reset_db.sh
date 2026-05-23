#!/usr/bin/env bash
# =============================================================================
# 🚀 Script: Reset total do banco Grêmio v5
# =============================================================================
# Uso: bash reset_db.sh
# Executa o SQL supabase_v5.sql no Supabase via API REST
# =============================================================================

set -euo pipefail

SUPABASE_URL="https://wearihgeytywbhhtvwlg.supabase.co"
# Pegar a SERVICE_ROLE_KEY do ambiente ou ask
SERVICE_KEY="${SUPABASE_SERVICE_KEY:-}"

if [ -z "$SERVICE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_KEY não setada"
  echo "   Exporta antes: export SUPABASE_SERVICE_KEY=sua_key_aqui"
  echo ""
  echo "   Ou acha em: https://supabase.com/dashboard → Settings → API → service_role key"
  exit 1
fi

SQL_FILE="$(dirname "$0")/supabase_v5.sql"

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ Arquivo $SQL_FILE não encontrado"
  exit 1
fi

echo "🚀 Executando reset total do banco..."
echo "   URL: $SUPABASE_URL"
echo "   SQL: $SQL_FILE"
echo ""

# Lê o SQL e envia via API REST do Supabase
SQL_CONTENT=$(cat "$SQL_FILE")

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${SUPABASE_URL}/rest/v1/rpc/pgmeta" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$SQL_CONTENT" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))')}" \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "204" ]; then
  echo ""
  echo "✅ Banco resetado com sucesso!"
  echo "⚠️  IMPORTANTE: Faz login de novo no app pra atualizar o localStorage"
else
  echo ""
  echo "❌ Falha no reset. Executa o SQL manualmente no SQL Editor do Supabase Dashboard"
  echo "   Arquivo: $SQL_FILE"
fi
