# Usa uma imagem oficial do Node.js (Atualizada para a versão 20 exigida pelo Next.js)
FROM node:20-alpine

WORKDIR /app

# Copia os arquivos de dependências
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o resto do código do frontend
COPY . .

# Constrói a aplicação Next.js para produção
RUN npm run build

# Expõe a porta do frontend
EXPOSE 3000

# Inicia o servidor do Next.js
CMD ["npm", "start"]