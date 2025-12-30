#!/bin/bash

# Development Setup Script for KnowledgeBase Pro
echo "🦀 Setting up KnowledgeBase Pro development environment..."

# Install Rust if not present
if ! command -v rustc &> /dev/null; then
    echo "📥 Installing Rust toolchain..."
    curl --proto '=https://sh.rustup.rs' --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
    source "$HOME/.cargo/env"
    source "$HOME/.profile"
else
    echo "✅ Rust toolchain found"
fi

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    # Use Windows package manager if available
    if command -v npm &> /dev/null; then
        npm install -g npm
    elif command -v yarn &> /dev/null; then
        npm install -g yarn
    else
        echo "❌ Neither npm nor yarn found. Please install Node.js first."
        exit 1
    fi
else
    echo "✅ Node.js found: $(node --version)"
fi

# Navigate to correct project directory
echo "📁 Changing to project-structure directory..."
cd project-structure

# Install dependencies
echo "📦 Installing project dependencies..."
if command -v npm &> /dev/null; then
    npm install
elif command -v yarn &> /dev/null; then
    yarn install
else
    echo "❌ Package manager not found"
    exit 1
fi

# Setup environment
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
fi

echo "🚀 Development environment setup complete!"
echo "💡 Next steps:"
echo "   - Run: ./dev-setup.sh"
echo "   - Or: npm run tauri dev"