# Imagen base liviana de Node.js basada en Alpine Linux
FROM node:20-alpine

# Establecer directorio de trabajo en la imagen
WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias en limpio
RUN npm install

# Copiar el código fuente
COPY . .

# Exponer el puerto configurado
EXPOSE 3000

# Comando de ejecución del servidor
CMD ["npm", "start"]