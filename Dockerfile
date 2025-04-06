FROM oven/bun:1.2 as base

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock bunfig.toml ./
COPY apps/mail/package.json ./apps/mail/
COPY packages/db/package.json ./packages/db/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/tailwind-config/package.json ./packages/tailwind-config/
COPY packages/tsconfig/package.json ./packages/tsconfig/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Setup database
RUN cd packages/db && bun install

# Build the application
RUN bun run build

# Start the application
CMD ["bun", "run", "start"]

# Expose port
EXPOSE 3000 