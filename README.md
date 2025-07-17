# 🛹 Skateboard Contest Management App

A complete, self-hosted web application for managing skateboard contests end-to-end. Built with React, TypeScript, Tailwind CSS, and Supabase.

![Skateboard Contest App](https://img.shields.io/badge/Status-Complete-green)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green)
![GDPR](https://img.shields.io/badge/GDPR-Compliant-yellow)

## ✨ Features

### 🎯 Complete Contest Management
- **User Registration** with role-based access control
- **Contest Creation** with flexible configuration
- **Real-time Judging** with professional scoring interface
- **Live Commentator Panel** with countdown timers and audio alerts
- **Public Scoreboard** with QR code sharing
- **PayPal Payment Integration** for registration fees

### 👥 Multi-Role System
- **Skaters**: Register, pay, compete, view results
- **Judges**: Score runs with 0.0-10.0 scale, private notes
- **Head Judge**: Finalize scores, resolve conflicts (optional)
- **Commentator**: Control runs, timing, heat progression
- **Admin**: Create contests, manage users, assign roles
- **Super Admin**: Global access and system management

### 🔄 Real-time Features
- Live score updates via Supabase Realtime
- Synchronized judge interfaces
- Automatic ranking calculations
- Live scoreboard updates
- Contest state synchronization

### 🛡️ Security & Compliance
- GDPR-compliant data handling
- Cookie consent management
- Row Level Security (RLS) policies
- Role-based access control
- Secure payment processing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- PayPal Developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skateboard-contest-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations in order:
     ```sql
     -- Run these in your Supabase SQL editor
     -- 1. supabase/migrations/001_initial_schema.sql
     -- 2. supabase/migrations/002_rls_policies.sql
     -- 3. supabase/migrations/003_functions.sql
     ```

5. **Start development server**
   ```bash
   npm start
   ```

## 📋 Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id
REACT_APP_PAYPAL_MODE=sandbox
```

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Layout/          # Header, Layout components
│   ├── Judging/         # Scoring interface, skater notes
│   ├── Commentator/     # Run control, countdown timer
│   └── GDPR/           # Cookie consent, privacy
├── contexts/            # React contexts (Auth)
├── hooks/              # Custom hooks (Supabase integration)
├── lib/                # Utilities and configurations
├── pages/              # Page components
│   ├── Admin/          # Contest management
│   ├── Contests/       # Public contest listing
│   ├── Judging/        # Judge dashboard
│   ├── Commentator/    # Commentator panel
│   └── Scoreboard/     # Public scoreboard
├── types/              # TypeScript type definitions
└── supabase/
    └── migrations/     # Database schema and policies
```

## 🎯 User Flows

### Admin Flow
1. Create contest with categories and phases
2. Configure scoring system and time limits
3. Assign judge and commentator roles
4. Monitor contest progress

### Skater Flow
1. Register account with skateboarding details
2. Browse available contests
3. Select categories and pay registration fee
4. Compete and view live results

### Judge Flow
1. Access assigned contests
2. Score runs using numeric input pad (0.0-10.0)
3. Add private notes for each skater
4. Submit scores with real-time sync

### Commentator Flow
1. Control run timing with countdown
2. Start/stop runs with audio alerts
3. Advance through skaters and runs
4. Monitor heat progression

## 🔧 Development

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

### Database Management
All database schema and policies are version-controlled in `supabase/migrations/`. 

Key database features:
- Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates
- Automated ranking calculations
- Heat management functions

## 🚀 Deployment

### Frontend (Netlify)
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in Netlify dashboard

### Backend (Supabase)
1. Create production Supabase project
2. Run migrations in order
3. Configure authentication providers
4. Enable realtime for required tables

## 🛡️ Security Features

- **Authentication**: Email/password, OAuth, Magic Links
- **Authorization**: Role-based access control
- **Data Protection**: RLS policies, encrypted storage
- **GDPR Compliance**: Cookie consent, data portability
- **Payment Security**: PayPal integration, no stored payment data

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- Touch-friendly judge scoring interface
- Mobile-optimized admin panels
- Responsive public scoreboard
- PWA-ready (installable on mobile devices)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [documentation](./CLAUDE.md)
- Open an issue on GitHub
- Contact: support@skateboard-contest.app

## 🙏 Acknowledgments

- Built with React and TypeScript
- Powered by Supabase
- Styled with Tailwind CSS
- Icons by Lucide React
- Payment processing by PayPal

---

Made with ❤️ for the skateboarding community
