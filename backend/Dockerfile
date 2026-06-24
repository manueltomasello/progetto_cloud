FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache python3 make g++
# Copia prima i package files (ottimizza la cache di Docker)
COPY package*.json ./

# Installa le dipendenze di produzione
RUN npm install 

COPY . .

RUN npm rebuild bcrypt --build-from-source
# Copia il resto del codice

RUN npm run build

EXPOSE 3000

# Avvio in produzione (non npm run dev)
CMD ["npm", "start"]
