# EventConnect - Detailed Setup Guide

This guide provides comprehensive setup instructions for EventConnect.

> 💡 **Quick Start?** See [README.md](README.md) for a faster setup  
> 📋 **Tasks?** See [ROADMAP.md](ROADMAP.md) for development tasks  
> 🔧 **Technical Details?** See [SPEC.md](SPEC.md) for full specification

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or later
- **npm** or **yarn** or **pnpm**
- **Git**
- A **Supabase** account (free tier is fine)
- A **PayFast** merchant account (for payment integration)

## Step 1: Install Dependencies

First, install all required dependencies:

```bash
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in your project details:
   - Project name: `eventconnect`
   - Database password: (choose a strong password)
   - Region: (select closest to your users)

### 2.2 Get Your Supabase Credentials

1. In your Supabase project dashboard, click on the "Settings" icon
2. Navigate to "API" section
3. Copy the following:
   - Project URL (starts with `https://`)
   - `anon` `public` key
   - `service_role` `secret` key (keep this secure!)

### 2.3 Run Database Migrations

You have two options to set up your database:

#### Option A: Using Supabase SQL Editor (Recommended for beginners)

1. In your Supabase dashboard, go to the "SQL Editor"
2. Click "New Query"
3. Copy and paste the content from `supabase/migrations/20240101000000_initial_schema.sql`
4. Click "Run"
5. Repeat for `20240102000000_add_rls_policies.sql`
6. Repeat for `20240103000000_add_functions.sql`
7. Optionally, run `supabase/seed.sql` to add sample badges

#### Option B: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root of your project:

```bash
cp .env.example .env.local
```

Then fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# PayFast (use sandbox for testing)
PAYFAST_MERCHANT_ID=your_merchant_id
PAYFAST_MERCHANT_KEY=your_merchant_key
PAYFAST_PASSPHRASE=your_passphrase
NEXT_PUBLIC_PAYFAST_URL=https://sandbox.payfast.co.za/eng/process

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=EventConnect
```

### PayFast Setup (Optional - for payment features)

1. Sign up at [PayFast Sandbox](https://sandbox.payfast.co.za/)
2. Get your merchant credentials from the dashboard
3. Add them to `.env.local`

**Note**: For production, you'll need to:

- Sign up for a live PayFast account
- Change the URL to `https://www.payfast.co.za/eng/process`
- Update your merchant credentials

## Step 4: Configure Supabase Authentication

### 4.1 Set Up Auth Providers

In your Supabase dashboard:

1. Go to "Authentication" > "Providers"
2. Enable Email provider (enabled by default)
3. (Optional) Enable social providers:
   - Google: Follow instructions to add OAuth credentials
   - Facebook: Follow instructions to add OAuth credentials

### 4.2 Configure Auth Settings

1. Go to "Authentication" > "URL Configuration"
2. Add your site URL: `http://localhost:3000`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - For production, add your production URLs

### 4.3 Configure Email Templates (Optional)

Customize the email templates for:

- Confirmation email
- Password reset email
- Magic link email

## Step 5: Set Up Storage (Optional)

For image uploads (profile pictures, group covers):

1. In Supabase dashboard, go to "Storage"
2. Create a new bucket called `avatars`
3. Create another bucket called `group-covers`
4. Set appropriate policies:

```sql
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Step 6: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: The first build may take a few minutes as dependencies are installed and the application is compiled.

## Step 7: Create Your First User

1. Navigate to `/register`
2. Create a test account
3. Check your email for the confirmation link (or check Supabase > Authentication > Users)
4. Confirm your account

## Project Structure Overview

```
eventconnect/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (dashboard)/       # Main application pages
│   │   ├── api/               # API routes
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   └── [feature]/        # Feature-specific components
│   ├── lib/                   # Utility libraries
│   │   ├── supabase/         # Supabase client setup
│   │   ├── payfast/          # PayFast integration
│   │   ├── validations/      # Zod schemas
│   │   └── utils/            # Helper functions
│   ├── hooks/                 # Custom React hooks
│   ├── actions/               # Server actions
│   ├── store/                 # State management (Zustand)
│   └── types/                 # TypeScript types
├── supabase/                  # Database migrations
├── public/                    # Static assets
└── [config files]
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Utilities
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## Next Steps

Now that your setup is complete, you can:

1. **Customize the UI**: Modify components in `src/components/`
2. **Add Features**: Follow the spec to implement remaining features
3. **Configure Deployment**: Deploy to Vercel (recommended)

### Deploying to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Choose your Git provider and select your repository
5. Build settings should auto-detect from `netlify.toml`
6. Add environment variables in Site settings > Environment variables
7. Deploy!

Don't forget to update:

- `NEXT_PUBLIC_APP_URL` to your Netlify URL
- Supabase redirect URLs to include your Netlify domain
- PayFast URL to production (when ready)

For detailed deployment instructions, see `NETLIFY_DEPLOY.md`

## Troubleshooting

### Common Issues

**Issue: "Invalid API key"**

- Solution: Double-check your Supabase credentials in `.env.local`
- Make sure you're using the `anon` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Issue: "relation does not exist"**

- Solution: Make sure you ran all database migrations

**Issue: "User already registered"**

- Solution: Check Supabase > Authentication > Users to see existing users

**Issue: Can't access authenticated routes**

- Solution: Check that middleware is properly configured and auth is working

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the technical spec in the project

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Enable RLS (Row Level Security) on all tables
- [ ] Review and test all RLS policies
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS only
- [ ] Set up proper CORS policies
- [ ] Configure Content Security Policy
- [ ] Enable rate limiting
- [ ] Set up monitoring and error tracking
- [ ] Review PayFast security settings
- [ ] Test payment webhooks thoroughly

## Next Steps

Now that setup is complete:

1. **Start Development**: See [ROADMAP.md](ROADMAP.md) for current tasks and sprint goals
2. **Understand Architecture**: See [SPEC.md](SPEC.md) for complete technical details
3. **Deploy to Production**: See [NETLIFY_DEPLOY.md](NETLIFY_DEPLOY.md) when ready to deploy

---

**Happy coding! 🚀**

For questions or issues:

- Check [SPEC.md](SPEC.md) for technical details
- Check [ROADMAP.md](ROADMAP.md) for development progress
- Check [DOCS_STRUCTURE.md](DOCS_STRUCTURE.md) for documentation guidelines
