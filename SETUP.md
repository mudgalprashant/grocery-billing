# Grocery Billing — Setup Guide

Follow these steps in order. Takes about 20–30 minutes.

---

## Step 1 — Get the code running locally

```bash
# In VS Code terminal, navigate to wherever you want the project
cd ~/Documents   # or wherever you like

# Copy the project folder here, then:
cd grocery-billing
npm install
```

---

## Step 2 — Create a GitHub repo

1. Go to [github.com](https://github.com) → **New repository**
2. Name it exactly: `grocery-billing`
3. Set to **Public** (required for free GitHub Pages)
4. Do NOT initialize with README (we already have files)
5. Click **Create repository**

```bash
# In VS Code terminal inside the project folder:
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/grocery-billing.git
git push -u origin main
```

### Enable GitHub Pages:
1. GitHub repo → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Save

---

## Step 3 — Firebase setup (15 min)

### 3a. Create project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. **Add project** → name it `grocery-billing` → Continue
3. Disable Google Analytics (not needed) → **Create project**

### 3b. Enable Google Authentication
1. Left sidebar → **Authentication** → **Get started**
2. **Sign-in method** tab → **Google** → Enable → add your support email → **Save**

### 3c. Create Firestore database
1. Left sidebar → **Firestore Database** → **Create database**
2. Choose **Start in production mode**
3. Select region: `asia-south1` (Mumbai — closest for India)
4. **Enable**

### 3d. Deploy Firestore security rules
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (in project folder)
firebase init firestore

# Select your project when prompted
# When asked about rules file: type firestore.rules (already exists)
# When asked about indexes file: press Enter for default

# Deploy rules
firebase deploy --only firestore:rules
```

### 3e. Get your Firebase config
1. Firebase Console → **Project Settings** (gear icon) → **Your apps**
2. Click **</>** (Web app) → Register app → name: `grocery-billing-web`
3. Copy the config object — you'll need these values:
   ```
   apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId
   ```

### 3f. Add your domain to Firebase Auth
1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add: `YOUR_USERNAME.github.io`

---

## Step 4 — Cloudinary setup (5 min)

1. Go to [cloudinary.com](https://cloudinary.com) → Sign up (free, no card)
2. After signup, note your **Cloud name** from the dashboard
3. Go to **Settings** → **Upload** → scroll to **Upload presets**
4. Click **Add upload preset**:
   - Signing mode: **Unsigned**
   - Preset name: `grocery-billing-uploads`
   - Folder: `grocery-billing`
5. **Save**

---

## Step 5 — Generate PWA icons

```bash
# Install canvas temporarily just for icon generation
npm install canvas

# Generate icons
node generate-icons.mjs

# Uninstall canvas (not needed after this)
npm uninstall canvas
```

Or use [realfavicongenerator.net](https://realfavicongenerator.net) to make proper icons from a logo image.

---

## Step 6 — Local development

```bash
# Create your .env file
cp .env.example .env
```

Open `.env` and fill in all values from Steps 3e and 4:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=grocery-billing-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=grocery-billing-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=grocery-billing-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=grocery-billing-uploads
```

```bash
# Run locally
npm run dev
```

Open [http://localhost:5173/grocery-billing/](http://localhost:5173/grocery-billing/)

Sign in with Google — **the first account to sign in becomes Admin automatically.**

---

## Step 7 — Deploy to GitHub Pages

Add your secrets to GitHub so the deploy workflow can build with your keys:

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** for each of these:

| Secret name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | from .env |
| `VITE_FIREBASE_AUTH_DOMAIN` | from .env |
| `VITE_FIREBASE_PROJECT_ID` | from .env |
| `VITE_FIREBASE_STORAGE_BUCKET` | from .env |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from .env |
| `VITE_FIREBASE_APP_ID` | from .env |
| `VITE_CLOUDINARY_CLOUD_NAME` | from .env |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | from .env |

Then push to trigger deploy:

```bash
git add .
git commit -m "Add PWA icons and env"
git push
```

GitHub Actions will build and deploy automatically. Check progress:
**GitHub repo → Actions tab**

Your app will be live at:
`https://YOUR_USERNAME.github.io/grocery-billing/`

---

## Step 8 — Install on Android (PWA)

1. Open the URL in Chrome on your phone
2. Tap the **⋮ menu** → **Add to Home screen**
3. The app installs like a native app — no Play Store needed

---

## Future updates (your ongoing workflow)

```bash
# Make changes in VS Code
git add .
git commit -m "describe your change"
git push
# GitHub Actions auto-deploys in ~1 minute
# Users get a background update + soft banner next time they open the app
```

---

## Project structure recap

```
src/
├── types/index.ts              # All TypeScript interfaces
├── services/
│   ├── interfaces/             # I*Service contracts (Dependency Inversion)
│   ├── firebase/               # Concrete Firebase implementations
│   ├── cloudinary/             # Concrete Cloudinary implementation
│   └── index.ts                # Service container (swap providers here)
├── context/
│   ├── AuthContext.tsx         # Current user + role
│   └── CartContext.tsx         # Active billing cart
├── hooks/index.ts              # Service-aware React hooks
├── components/
│   ├── ui/                     # Reusable primitives (Button, Card, etc.)
│   ├── layout/                 # AppShell, UpdateBanner
│   ├── auth/                   # ProtectedRoute
│   ├── billing/                # BillDetailModal
│   └── products/               # ProductFormModal
├── pages/                      # One file per screen
└── utils/                      # formatters, pdfGenerator
```

---

## Troubleshooting

**"Permission denied" on Firestore**
→ Check `firestore.rules` was deployed: `firebase deploy --only firestore:rules`

**Google sign-in popup blocked**
→ Make sure `YOUR_USERNAME.github.io` is in Firebase Auth → Authorized domains

**App shows blank page on GitHub Pages**
→ Check the `base` in `vite.config.ts` matches your repo name exactly

**Images not uploading**
→ Make sure Cloudinary upload preset is set to **Unsigned**
