# 🛡️ jelba.ma — Frontend

A modern landing page for a B2C vaccination tracking app built for the Moroccan National Immunization Program (PNI).

## Tech Stack

- **React 19** + TypeScript
- **Vite 7** (bundler & dev server)
- **Tailwind CSS 4** (styling)
- **Framer Motion** (animations)
- **Lucide React** (icons)

## Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) **v18+** (LTS recommended)
- npm (comes with Node.js)

Check your versions:

```bash
node -v
npm -v
```

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd Vaccination_solution/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

The app will start at **http://localhost:5173** (or the next available port).

### 4. Build for production (optional)

```bash
npm run build
```

Output will be in the `dist/` folder.

### 5. Preview production build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Navigation.tsx   # Fixed navbar with mobile menu
│   │   ├── Hero.tsx         # Hero section with CTAs
│   │   ├── Features.tsx     # 3 feature cards grid
│   │   ├── HowItWorks.tsx   # 4-step onboarding flow
│   │   ├── Testimonials.tsx # Reviews + stats
│   │   └── Footer.tsx       # Footer with ElevenLabs credit
│   ├── App.tsx          # Main app (assembles all sections)
│   ├── App.css          # Tailwind CSS import
│   ├── main.tsx         # React entry point
│   └── index.css        # Global Tailwind import
├── index.html           # HTML entry point
├── vite.config.ts       # Vite + Tailwind plugin config
├── tsconfig.json        # TypeScript config
└── package.json         # Dependencies & scripts
```

## Available Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start development server           |
| `npm run build`    | Build for production               |
| `npm run preview`  | Preview production build           |
| `npm run lint`     | Run ESLint                         |

## Notes

- Voice reminders are **powered by ElevenLabs**.
- The app follows the **PNI** (Programme National d'Immunisation) schedule.
- Fully responsive — works on mobile, tablet, and desktop.
