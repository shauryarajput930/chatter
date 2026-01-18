# Chatter - Real-Time Chat Application

A modern, feature-rich chat application built with cutting-edge web technologies. Connect with others through direct messages, group chats, video calls, and rich media sharing.

## Features

- **Direct Messaging** - One-on-one conversations with real-time message delivery
- **Group Chats** - Create and manage group conversations
- **Video Calling** - High-quality peer-to-peer video calls
- **Media Sharing** - Upload and share files, images, and documents
- **Message Reactions** - React to messages with emoji
- **Typing Indicators** - See when someone is typing
- **Message Status** - Delivered and read receipts
- **Dark Mode** - Toggle between light and dark themes
- **User Profiles** - Customize your profile and avatar
- **Authentication** - Secure login and signup system

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn-ui
- **Backend**: Supabase (PostgreSQL)
- **State Management**: Custom React Hooks
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or bun package manager

### Installation

```sh
# Clone the repository
git clone <repository-url>
cd Chatter

# Install dependencies
npm install
# or
bun install

# Start the development server
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── chat/         # Chat-related components
│   ├── call/         # Video call components
│   ├── layout/       # Layout components
│   └── ui/           # shadcn-ui components
├── hooks/            # Custom React hooks
├── integrations/     # External service integrations
├── pages/            # Page components
└── lib/              # Utility functions
```

## Development

The project uses Vite for fast development with hot module replacement (HMR).

```sh
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Author

Created as part of Full Stack Development coursework at PSIT (Pranveer Singh Institute of Technology).

---

**Status**: Active Development
