#!/bin/bash
# Mata qualquer processo na porta 3000 e sobe o dev server limpo
echo "Limpando porta 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 1
echo "Iniciando Next.js..."
npm run dev
