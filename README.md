# 🌙 MoonMovement

**MoonMovement** is a next-gen platform for Indian founders, startup enthusiasts, and ecosystem enablers — inspired by Reddit, built for Bharat.

We are creating a collaborative, district-wise, data-rich, and AI-assisted space where builders can connect, share, learn, and scale.

> 🚀 "Reddit for Founders. LinkedIn for Builders. Crunchbase for Bharat."  

---

## 🧠 Vision

India is not just one startup hub—it's 750+ districts full of untapped potential. MoonMovement aims to democratize startup discovery, enable hyperlocal communities, and make the Indian startup ecosystem **more transparent, connected, and founder-first**.

---

## 💻 Tech Stack

### Backend
- **Node.js** + **Express.js** — RESTful API
- **PostgreSQL** — Relational database
- **Prisma ORM** — Type-safe database access
- **JWT** — Authentication
- **Redis** — Caching & session storage *(planned)*

### Frontend *(coming soon)*
- **Next.js** + **React** — Dynamic SSR + SPA
- **TailwindCSS** — Rapid UI development
- **ShadCN/UI** — Beautiful, accessible components
- **Framer Motion** — Animations & microinteractions

### DevOps
- **AWS (EC2 + RDS + S3)** — Scalable infrastructure
- **Render (migration in progress)** — Early hosting
- **GitHub Actions** — CI/CD
- **Docker** *(planned)* — Containerization

---

## 🧩 Core Features

### ✅ MVP Features
- 🧵 Reddit-style posts & threaded comments
- 🌍 District-wise startup discovery map
- 🧑‍💼 Founder & startup profile pages
- 📰 Curated startup news + announcements
- 🏆 Hall of Fame: Top builders by region
- 🔍 Full-text search (PostgreSQL + Prisma)

### 🔜 Upcoming
- 📊 Startup analytics dashboard
- 🧠 AI tools: Pitch feedback, deck analysis, market research
- 💼 Job board for startups & talent
- 🧑‍🏫 Mentorship matchmaking engine
- 📍 State/district-level ecosystem reports
- 📅 Startup events aggregator
- 🏗️ Investor dashboards & startup due diligence tools
- 🧪 Gamification: Karma, badges, challenges

---

## 🛠️ Development Setup

```bash
# Clone the repo
git clone https://github.com/your-username/moonmovement.git
cd moonmovement

# Install backend dependencies
cd backend
npm install

# Setup environment variables
cp .env.example .env
# Add PostgreSQL credentials, JWT secret, etc.

# Run development server
npm run dev

