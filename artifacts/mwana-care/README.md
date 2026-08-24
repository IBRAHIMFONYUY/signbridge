# MWANA CARE

**Nurturing Parents. Including Every Child.**

MWANA CARE is an inclusive digital platform designed to scale Cameroon's Positive Parenting Programme beyond face-to-face sessions. It transforms validated parenting content into personalized micro-learning, practical coaching, and measurable engagement.

## Features

- **MWANA Learn**: 8 core parenting lessons with interactive content
- **MWANA Coach**: AI-powered personalized guidance
- **MWANA Practice**: Interactive scenarios to test knowledge
- **Progress Tracking**: Visual progress dashboard with streaks
- **SignBridge Integration**: Sign-language accessibility for deaf families
- **Multi-language Support**: English and French

## Getting Started

### Important: Monorepo Structure

This project is part of a monorepo. The workspace contains:
- **`artifacts/mwana-care`** (this folder) - The MWANA CARE app (parenting platform)
- **`artifacts/signbridge`** - The original SignBridge app (accessibility technology)
- **`artifacts/api-server`** - Shared backend API

**MWANA CARE is the main app you want to run.** It's a standalone React Native/Expo app that integrates SignBridge's accessibility features.

### Installation

From the **workspace root** (signbridge folder):
```bash
pnpm install
```

This installs dependencies for all packages in the monorepo.

### Running MWANA CARE

Navigate to the mwana-care directory and run:
```bash
cd artifacts/mwana-care
pnpm dev
```

Or from the workspace root:
```bash
pnpm --filter @workspace/mwana-care dev
```

The app will start on `http://localhost:19002` (or the port specified in your environment).

### Running the Backend API (Optional)

The app works with local storage by default, but you can also run the backend:

```bash
cd artifacts/api-server
pnpm dev
```

The API will run on `http://localhost:3001`.

### Build

```bash
cd artifacts/mwana-care
pnpm build
```

### Type Check

```bash
cd artifacts/mwana-care
pnpm typecheck
```

### Environment Variables

Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Key variables:
- `EXPO_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3001/api)

## Project Structure

```
mwana-care/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   ├── lesson/            # Lesson detail screens
│   ├── onboarding.tsx     # Onboarding flow
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── context/              # React Context for state management
├── hooks/                # Custom React hooks
├── constants/            # Constants (colors, etc.)
├── content/              # Content management (lessons, scenarios)
└── utils/                # Utility functions
```

## Tech Stack

- **Framework**: React Native + Expo
- **Navigation**: Expo Router
- **State**: React Context + AsyncStorage
- **Styling**: Custom components with theme support
- **Icons**: Feather Icons via @expo/vector-icons

## Content Management

Lessons and scenarios are defined in TypeScript files in the `content/` directory:

- `lessons.ts`: Core parenting lessons with categories, content, and interactive questions
- Future: Add scenarios.ts for practice scenarios

## Accessibility

MWANA CARE includes SignBridge integration for sign-language accessibility. The app supports:

- Large text mode
- High contrast mode
- Dark mode
- Sign-language video support (placeholder for future implementation)

## License

MIT
