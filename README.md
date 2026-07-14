![ieeecs-template-header](https://github.com/user-attachments/assets/c3c40c85-51a2-4a5e-82a4-c32a0223e336)

<h1 align="center">CICADA 2067 - Frontend</h1>

<h4 align="center">A futuristic sci-fi mission interface for an immersive cybersecurity challenge experience.</h4>

---

## Overview

CICADA 2067 is a story-driven cybersecurity challenge platform designed around a futuristic spacecraft operating system experience.

This repository contains the frontend application responsible for delivering an immersive user interface with:

- Mission dashboards
- Interactive challenge interfaces
- Story archives and recovered logs
- Terminal-style system interfaces
- Futuristic animations and visual effects

The goal is to provide participants with an engaging experience where they uncover mission data, solve challenges, and progress through the storyline.

---

## Architecture Overview

The frontend follows a modular React-based architecture.

Core components include:

- UI Components
- Pages and Routing
- Animation Modules
- API Integration Layer
- Asset Handling System

Data flow:

\`\`\`
User
  |
  v
React Components
  |
  v
Application State
  |
  v
API Services
  |
  v
Backend Services
\`\`\`

This repository only contains the frontend implementation. Backend services and APIs will be integrated separately.

---

## Tech Stack

| Layer      | Technology Used     |
|------------|----------------------|
| Frontend   | React + Vite         |
| Styling    | CSS / Tailwind CSS   |
| Animations | Framer Motion        |
| Icons      | Lucide React         |
| Language   | JavaScript           |
| Build Tool | Vite                 |

---

## Project Structure

\`\`\`bash
frontend/
├── public/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── assets/         # Static assets
│   ├── App.jsx         # Root application component
│   ├── main.jsx        # Application entry point
│   └── index.css       # Global styles
│
├── package.json
├── vite.config.js
└── README.md
\`\`\`

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd CICADA-Frontend
\`\`\`

### 2. Navigate to Frontend Directory

\`\`\`bash
cd frontend
\`\`\`

### 3. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at:

\`\`\`
http://localhost:5173/
\`\`\`

---

## Environment Variables

Create a \`.env\` file in the frontend directory when required.

Example:

\`\`\`env
VITE_API_URL=<backend-api-url>
\`\`\`

---

## Deployment

The frontend can be deployed on any platform supporting Vite applications.

Recommended:

- Vercel
- Netlify

Production build:

\`\`\`bash
npm run build
\`\`\`

Preview production build:

\`\`\`bash
npm run preview
\`\`\`

---

## Testing

Testing setup will be added as the project evolves.

---

## Project Status

🟢 In Development

---

## Contributors

Developed by IEEE Computer Society VIT