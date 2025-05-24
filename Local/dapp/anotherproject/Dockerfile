FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy rest of the files
COPY . .

# Install Truffle globally
RUN npm install -g truffle

# Expose ports for HTTP and WebSocket
EXPOSE 8081
EXPOSE 8585
