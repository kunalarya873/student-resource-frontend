# AMU Student Resource Management System - Frontend 💻

[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000.svg?style=flat&logo=vercel&logoColor=white)](https://vercel.com)

A Google Drive-inspired cloud file and folder management client designed for educational institutions. Built with **React 19**, **Vite 8**, **Tailwind CSS**, and **TanStack React Query v5**.

---

## 🚀 Quickstart

### Prerequisites
- Node.js v18+ and `npm`

### Installation & Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server with hot-reload (http://localhost:5173)
npm run dev
```

---

## 🌐 Deploying to Vercel

This repository is pre-configured with [`vercel.json`](vercel.json) to support client-side Single Page Application (SPA) routing without 404 errors on browser page reload.

### Deployment Steps:
1. Push this repository to GitHub: `https://github.com/<your-username>/student-resource-frontend`.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New Project**.
3. Import your `student-resource-frontend` repository.
4. Framework Preset: **Vite**
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. **Environment Variables:** Add the following environment variable:
   - `VITE_API_BASE_URL`: The URL of your EC2 backend (e.g. `http://<EC2_PUBLIC_IP>:8000/api/v1` or `https://api.yourdomain.com/api/v1`).
8. Click **Deploy**. Vercel will build and deploy your frontend with automatic CI/CD on every push to `main`!

---

## 🛠️ Build & Lint Commands

```bash
# Type check and build production bundle
npm run build

# Run Oxlint
npm run lint

# Preview production build locally
npm run preview
```
