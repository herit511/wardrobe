# Wardrobe AI & Advisor — Project Handover

Welcome to the Wardrobe AI project! This document outlines everything you need to know to take over development, maintain, and run this codebase.

## 🏗 Architecture & Stack
This is a full-stack MERN application using Vite for the frontend build.
- **Frontend**: React (Vite), React Router, Lucide Icons, Vanilla CSS (Custom Design System).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose schemas for `User`, `Item`, `Outfit`).
- **File Storage**: Cloudinary (for avatar and clothing image uploads).
- **AI Integration**: NVIDIA NIM Cloud API (`meta/llama-3.2-90b-vision-instruct`) for computer vision clothing analysis.

## 🧠 The "AI Intelligence" Engines
The magic of the application lies entirely within the local logic engines. No external LLMs generate the outfit combinations—it is 100% deterministic and controlled locally to guarantee high fashion standards.

- **`fashionEngineV3.js`**
  The core logic brain. This handles color theory (contrasts, complementary colors), occasion validation, formality checks, and item taxonomy.
- **`fashionStylingEngine.js`**
  The styling brain. This sits on top of V3 and assigns "Outfit Personalities" (e.g., "Quiet Authority", "Elevated Athleisure"), generates micro-styling tips (e.g., "Roll the jeans hem once..."), and tracks current 2024-2025 trends.

*(Note: `fashionEngine.js` was the V1 prototype and has been permanently removed to avoid confusion).*

## 🔌 External Integrations & Setup
To run the project locally or deploy it, you need the following environment variables mapped in your `.env` file (or Render dashboard):

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster/wardrobeDB
JWT_SECRET=your_super_secret_jwt_key

# Cloudinary - Used in /api/users and /api/items routes for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

# NVIDIA NIM Vision API - Used in /api/items/analyze for auto-detecting item details
KIMI_API_KEY=nvapi-your-nvidia-nim-token

# OTP Email (Forgot Password)
# Production: RESEND_API_KEY + RESEND_FROM or RESEND_FROM_EMAIL
# Fallback SMTP: SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_SERVICE, SMTP_FROM
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM="Wardrobe AI <no-reply@yourdomain.com>"
RESEND_FROM_EMAIL="Wardrobe AI <no-reply@yourdomain.com>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password_or_app_password
SMTP_FROM="Wardrobe AI <your_smtp_username>"
```
*(Note: We originally explored Gemini and local Python ML scripts, but transitioned exclusively to NVIDIA NIM for speed and accuracy. The local `ml_service` python backend has been completely decommissioned and deleted).*

## 🚀 Running the App
The app serves frontend static files from the backend in production to save hosting costs.

**Development:**
Run `npm run dev` in the root folder. This concurrently boots the Vite dev server (port 5173) and the Express API (port 3000).

**Production / Deployment:**
We use a single-server deployment strategy.
1. Run `npm run build` — this runs Vite build inside the `client` folder.
2. Run `npm start` — this boots Express, which automatically serves `client/dist` statically alongside the API routes. 

## 🗺 Code Navigation Guide
- **`app.js`**: Express server entry point.
- **`routes/`**: Express routes. Pay attention to `itemRoutes.js` (contains the NVIDIA vision API logic) and `outfitRoutes.js` (interfaces with the styling engines).
- **`client/src/pages/`**: React components. The most complex logic lives in `Closet.jsx` (filtering), `AddItem.jsx` (Web APIs and scanning UI), and `Suggestions.jsx` (where the styling engine output is rendered).
- **`client/src/index.css` & `variables.css`**: The core source of truth for the app's aesthetic design system. No tailwind.

Enjoy building the future of digital fashion!
