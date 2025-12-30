# EventConnect

A community-driven platform for organizing and discovering local events while connecting with like-minded people.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy)

---

## 🎯 What is EventConnect?

EventConnect combines **event management**, **social networking**, and **gamification** to help people discover local events and build meaningful connections with others who share their interests.

### Key Features

- 🎉 **Event Management** - Create and manage events within interest-based groups
- 👥 **Social Networking** - Connect with like-minded people through intelligent matching
- 🏆 **Gamification** - Earn reputation points and achievement badges
- 💬 **Real-time Communication** - Live comments and instant notifications
- 💳 **Premium Subscriptions** - Unlock advanced features via PayFast integration

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or later
- **npm** or **yarn** or **pnpm**
- A **Supabase** account (free tier works)
- **PayFast** account (optional, for payments)

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd eventconnect

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Then edit .env.local with your credentials

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the migrations in `supabase/migrations/` in order:
   - `20240101000000_initial_schema.sql`
   - `20240102000000_add_rls_policies.sql`
   - `20240103000000_add_functions.sql`
   - `20240104000000_add_storage_buckets.sql`
   - `seed.sql` (optional - adds sample badges)

---

## 📚 Documentation

| Document                                   | Purpose                                |
| ------------------------------------------ | -------------------------------------- |
| **[SETUP.md](SETUP.md)**                   | Detailed setup and configuration guide |
| **[SPEC.md](SPEC.md)**                     | Complete technical specification       |
| **[ROADMAP.md](ROADMAP.md)**               | Development roadmap and task list      |
| **[NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md)** | Production deployment guide            |

---

## 🛠️ Tech Stack

| Layer                | Technology               |
| -------------------- | ------------------------ |
| **Framework**        | Next.js 14+ (App Router) |
| **Language**         | TypeScript 5+            |
| **Styling**          | Tailwind CSS + shadcn/ui |
| **Database**         | PostgreSQL via Supabase  |
| **Authentication**   | Supabase Auth            |
| **Storage**          | Supabase Storage         |
| **Payments**         | PayFast                  |
| **Deployment**       | Netlify                  |
| **State Management** | Zustand + React Context  |
| **Validation**       | Zod                      |

---

## 📁 Project Structure

```
eventconnect/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── (auth)/          # Auth pages (login, register)
│   │   ├── (dashboard)/     # Protected pages (dashboard, groups, events)
│   │   └── api/             # API routes & webhooks
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui base components
│   │   ├── layout/         # Header, Footer, Navigation
│   │   └── shared/         # Reusable components
│   ├── lib/                 # Core utilities
│   │   ├── supabase/       # Database client
│   │   ├── payfast/        # Payment integration
│   │   ├── validations/    # Zod schemas
│   │   └── utils/          # Helper functions
│   ├── actions/             # Server actions (mutations)
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state stores
│   └── types/               # TypeScript definitions
├── supabase/
│   ├── migrations/          # Database migrations
│   └── seed.sql            # Sample data
├── public/                  # Static assets
└── [config files]
```

---

## 🔐 Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PayFast (optional)
PAYFAST_MERCHANT_ID=your-merchant-id
PAYFAST_MERCHANT_KEY=your-merchant-key
PAYFAST_PASSPHRASE=your-passphrase
NEXT_PUBLIC_PAYFAST_URL=https://sandbox.payfast.co.za/eng/process

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=EventConnect
```

See `.env.example` for full reference.

---

## 🧪 Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

---

## 🚢 Deployment

### Deploy to Netlify

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [netlify.com](https://netlify.com) and import your repository
3. Build settings auto-detect from `netlify.toml`
4. Add environment variables in Netlify dashboard
5. Deploy!

See **[NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md)** for detailed instructions.

---

## 📈 Project Status

**Current Phase**: Phase 1 - MVP Development  
**Progress**: ~65% Complete  
**Next Milestone**: Authentication & Profile Management

See **[ROADMAP.md](ROADMAP.md)** for detailed task list and progress.

---

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests: `npm run lint && npm run type-check`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Workflow

1. Check **[ROADMAP.md](ROADMAP.md)** for available tasks
2. Pick a task and move it to "In Progress"
3. Create a feature branch
4. Implement the feature
5. Test thoroughly
6. Submit PR with description
7. Update ROADMAP.md marking task complete

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Next.js](https://nextjs.org/)** - React framework
- **[Supabase](https://supabase.com/)** - Backend infrastructure
- **[shadcn/ui](https://ui.shadcn.com/)** - UI components
- **[Netlify](https://netlify.com/)** - Hosting platform

---

## 📞 Support

- **Documentation**: Check the docs folder
- **Issues**: [Open an issue](https://github.com/yourusername/eventconnect/issues)
- **Discussions**: [Join discussions](https://github.com/yourusername/eventconnect/discussions)

---

**Made with ❤️ for connecting communities**
