# Use Node.js 18 como base
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar todo o código fonte
COPY . .

# Expor a porta 5173 (padrão do Vite)
EXPOSE 5173

# Comando para iniciar a aplicação em modo desenvolvimento
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]