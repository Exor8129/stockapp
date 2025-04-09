# Use the official Node.js image as a base
FROM node:18 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the Prisma folder explicitly
COPY prisma ./prisma

# Copy the entire project
COPY . .

# Run Prisma generate
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# Use the official Node.js image for the runtime
FROM node:18

# Set the working directory for the runtime container
WORKDIR /app

# Copy the built app from the builder stage
COPY --from=builder /app /app

# Expose the port Next.js will run on
EXPOSE 3000

# Run the Next.js app
CMD ["npm", "start"]
