# 🌿 EcoTrack – AI-Powered Carbon Footprint Calculator

> An educational web application for the **Circular Economy for Sustainable Development** course.

EcoTrack helps users estimate their carbon footprint from electricity, transportation, and waste activities. It provides personalized AI-powered sustainability recommendations, waste tracking, eco challenges, and SDG awareness — all built with a clean, modern interface.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧮 Carbon Footprint Calculator | Multi-step calculator for electricity, transport, and waste |
| 📊 Interactive Dashboard | Pie charts, bar charts, and detailed emission breakdowns |
| 🤖 AI Recommendations | Google Gemini AI-powered sustainability suggestions |
| 💬 EcoBot Chatbot | Floating AI chatbot for sustainability Q&A |
| ♻️ Waste & Recycling Tracker | Track waste by category with recycling guidance |
| 🔄 What-If Calculator | Simulate habit changes and see estimated impact |
| 🏆 Eco Challenges | 7 sustainability challenges with LocalStorage tracking |
| 🌍 My SDG Impact | Interactive lifestyle assessment, AI recommendations & Action Roadmap |
| 📈 Progress Tracker | Save and compare assessments over time |

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | CSS (custom, no framework) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js + Express.js |
| AI | Google Gemini API (`@google/generative-ai`) |
| Storage | Browser LocalStorage |

---

## 📁 Project Structure

```
AI Carbon Footprint Calculator/
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ChatBot.jsx      # Floating EcoBot
│   │   │   ├── EcoChallenges.jsx
│   │   │   ├── ProgressTracker.jsx
│   │   │   └── HowItWorks.jsx
│   │   ├── pages/               # Page-level components
│   │   │   ├── HomePage.jsx
│   │   │   ├── CalculatorPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── WasteTrackerPage.jsx
│   │   │   ├── AIChatPage.jsx
│   │   │   ├── SDGPage.jsx
│   │   │   └── AboutPage.jsx
│   │   ├── data/
│   │   │   └── emissionFactors.js  # All emission factors & constants
│   │   ├── utils/
│   │   │   ├── calculations.js     # Pure CO₂ calculation functions
│   │   │   ├── storage.js          # LocalStorage helpers
│   │   │   └── api.js              # Backend API calls
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Node.js + Express backend
│   ├── routes/
│   │   └── aiRoutes.js          # AI API route handlers
│   ├── services/
│   │   └── geminiService.js     # Google Gemini integration
│   ├── server.js                # Express app entry point
│   ├── .env.example             # Environment variable template
│   └── package.json
│
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** v18 or higher ([download](https://nodejs.org))
- **npm** v9 or higher (comes with Node.js)
- A **Google Gemini API key** ([get one free](https://aistudio.google.com/app/apikey))

---

### Step 1 – Clone / Open the Project

If you received this as a zip, extract it. Then open a terminal in the project folder.

---

### Step 2 – Set Up the Backend

```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# Create your .env file from the example
copy .env.example .env
```

Now open `server/.env` in any text editor and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-1.5-flash
PORT=5000
FRONTEND_URL=http://localhost:5173
```

> **Where to get your free API key:** Visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey), sign in with a Google account, and click "Create API Key".

---

### Step 3 – Set Up the Frontend

Open a **new terminal** (keep the server terminal open):

```bash
# Navigate to the client folder
cd client

# Install dependencies
npm install
```

---

### Step 4 – Run the Application

You need **two terminals** running simultaneously:

**Terminal 1 – Backend Server:**
```bash
cd server
npm run dev
```
You should see: `EcoTrack server running on port 5000`

**Terminal 2 – Frontend:**
```bash
cd client
npm run dev
```
You should see: `Local: http://localhost:5173/`

Open your browser and go to **http://localhost:5173**

---

## 🧮 Emission Factors Used

All factors are simplified for educational purposes. See `client/src/data/emissionFactors.js`.

| Activity | Factor | Unit |
|---|---|---|
| Electricity | 0.7 | kg CO₂/kWh |
| Car travel | 0.12 | kg CO₂/km |
| Bike/Two-wheeler | 0.05 | kg CO₂/km |
| Public transport | 0.04 | kg CO₂/passenger-km |
| Waste (approx.) | 0.5 | kg CO₂/kg waste/month |

> ⚠️ These are illustrative educational approximations. Actual values depend on your country's energy mix, vehicle type, and local waste management practices.

---

## 📐 Calculation Method

```
Monthly CO₂ = Electricity CO₂ + Car CO₂ + Bike CO₂ + Public Transport CO₂ + Waste CO₂

Where:
  Electricity CO₂        = kWh × 0.7
  Car CO₂                = km × 0.12
  Bike CO₂               = km × 0.05
  Public Transport CO₂   = km × 0.04
  Waste CO₂              = (weekly_kg × 4) × 0.5

Annual CO₂ = Monthly CO₂ × 12
Recycling Rate = (recycled ÷ total) × 100
```

> **Important:** This is a **partial educational estimate**, not a complete certified carbon footprint.

---

## 🌍 My SDG Journey (Complete 17 UN SDGs Integration)

EcoTrack features a comprehensive, interactive Sustainable Development Goals system covering **all 17 United Nations SDGs** structured across the official **5 Ps**:

- **People (SDGs 1–5):** No Poverty, Zero Hunger, Good Health & Well-being, Quality Education, Gender Equality.
- **Planet (SDGs 6, 12–15):** Clean Water & Sanitation, Responsible Consumption & Production, Climate Action, Life Below Water, Life on Land.
- **Prosperity (SDGs 7–11):** Affordable & Clean Energy, Decent Work & Economic Growth, Industry Innovation & Infrastructure, Reduced Inequalities, Sustainable Cities & Communities.
- **Peace (SDG 16):** Peace, Justice and Strong Institutions.
- **Partnerships (SDG 17):** Partnerships for the Goals.

### Key Capabilities
1. **Interactive 17-SDG Lifestyle Questionnaire:** 38 focused lifestyle questions with multi-option responses (*Yes, regularly*, *Sometimes*, *Not currently*, *Skip*).
2. **Transparent 17-SDG Dashboard:** Live evaluation categorizing each goal into *Supporting*, *Opportunity to Improve*, or *Not Yet Assessed*.
3. **Dedicated 17 SDGs Explorer:** Search by keywords or filter by 5 Ps, with an interactive modal displaying goal targets, personal alignment, and 1-click action additions.
4. **AI-Powered Recommendations:** Gemini 3.5 generates personalized analysis, identifying what the student is already doing, gaps to improve, and 3 practical low-cost actions per goal (with full 17-SDG offline fallback).
5. **My Sustainable Action Plan:** Track commitments, mark completion ($X/Y$), and filter across all 17 goals.
6. **Academic 4-Stage Impact Pipeline:**
   $$\text{User Habit} \longrightarrow \text{Relevant SDG} \longrightarrow \text{Improvement Opportunity} \longrightarrow \text{Recommended Action}$$

---

## 🌐 Deployment Guide

### Option A: Unified 1-Click Deployment on Render (Recommended)
You can deploy both the React frontend and Node.js backend together as a single free Web Service on [Render](https://render.com):

1. Push this project to your GitHub repository (see [GitHub Setup](#-pushing-to-github)).
2. Go to **[dashboard.render.com](https://dashboard.render.com)** $\rightarrow$ click **New +** $\rightarrow$ **Web Service**.
3. Select your GitHub repository.
4. Set the following settings:
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(your Google Gemini API key)*
   - `GEMINI_MODEL`: `gemini-3.5-flash-lite`
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**. Render will automatically build the client, bundle static assets, and serve the entire website on a live HTTPS URL!

---

### Option B: Vercel (Frontend) + Render (Backend)
If you prefer hosting the React client separately on Vercel:
1. **Deploy Backend on Render:**
   - Root directory: `server`
   - Build command: `npm install`
   - Start command: `node server.js`
   - Environment variables: `GEMINI_API_KEY`
2. **Deploy Frontend on Vercel:**
   - Root directory: `client`
   - Framework preset: `Vite`
   - Environment variable: `VITE_API_BASE_URL` = `https://your-backend.onrender.com`

---

### 🐙 Pushing to GitHub
To push this project to your GitHub account:

```bash
# 1. Stage all tracked files
git add .

# 2. Commit the changes
git commit -m "Initial commit: EcoTrack fullstack application with 17 SDGs and AI"

# 3. Create a new repository on https://github.com/new (do NOT check 'Initialize with README')
# 4. Link your remote repository and push:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

---

## ⚠️ Important Disclaimers

1. Results are educational estimates, not certified carbon footprints.
2. Emission factors are simplified illustrative values.
3. AI recommendations are informational and educational, not scientifically verified.
4. Waste CO₂ factor is a rough approximation; actual emissions depend on waste composition.
5. Completing eco challenges is a positive habit; specific CO₂ savings are not calculated.
6. SDG connections are thematic, not official progress indicators.

---

## 🛠️ Modifying Emission Factors

All emission factors are in one place:
```
client/src/data/emissionFactors.js
```

To update a factor, simply change the `value` property. The entire application will use the new value automatically.

---

## 📝 Course Information

**Course:** Circular Economy for Sustainable Development (Open Elective)  
**Application:** EcoTrack – AI-Powered Carbon Footprint Calculator  
**Purpose:** Educational awareness of carbon footprints, waste management, and sustainable development goals.

---

## 🙏 Acknowledgements

- [Google Gemini AI](https://ai.google.dev/) – AI recommendations and chatbot
- [Recharts](https://recharts.org/) – Data visualization
- [Lucide React](https://lucide.dev/) – Icons
- [United Nations SDGs](https://sdgs.un.org/goals) – SDG framework
