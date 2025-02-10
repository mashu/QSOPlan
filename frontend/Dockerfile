# Use Node 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR ./

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
