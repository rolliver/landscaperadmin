# Use the official Node.js image from the Docker Hub
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the React app will run on
EXPOSE 3000

# Command to run the React app
CMD ["npm", "start"]

