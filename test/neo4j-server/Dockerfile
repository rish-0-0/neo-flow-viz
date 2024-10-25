# Base image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port Fastify will run on
EXPOSE 3000

# Start the Fastify server
CMD ["npm", "start"]