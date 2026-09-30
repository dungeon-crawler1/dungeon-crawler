# Imagen base oficial de Node.js en Alpine (ligera)
FROM node:20-alpine

# Establecer directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias del proyecto
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Exponer el puerto
EXPOSE 3000

# Comando por defecto para iniciar la aplicación
CMD ["npm", "start"]