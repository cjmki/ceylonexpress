# Ceylon Express

Authentic Sri Lankan Cuisine - Coming Soon

## About

Ceylon Express is preparing to bring authentic Sri Lankan flavors through our food truck and catering services. This website showcases our brand and provides updates on our upcoming launch.

## Tech Stack

- **Next.js 14** - React framework with App Router for optimal SEO
- **TypeScript** - Type-safe code
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Supabase** - Backend as a service (optional)
- **Lucide React** - Icon library

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

The project follows a modular component architecture. See [STRUCTURE.md](./STRUCTURE.md) for detailed documentation.

```
ceylonexpress/
├── app/
│   ├── components/         # Reusable React components
│   ├── constants/          # Data and constants
│   ├── menu/              # Menu page route
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── public/
│   └── images/            # Logo and assets
├── src/
│   ├── index.css          # Global styles
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript types
└── [config files]
```

## Features

- ✅ Server-side rendering (SSR) for better SEO
- ✅ Optimized metadata and Open Graph tags
- ✅ Responsive design
- ✅ Custom Ceylon Express brand colors
- ✅ Animated hero section
- ✅ Mobile-friendly navigation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run types:supabase` - Generate Supabase types

## Brand Colors

The site uses custom Ceylon Express brand colors defined in `tailwind.config.js`:

- `ceylon-orange`: #D9873B (Burnt orange)
- `ceylon-yellow`: #F0D871 (Golden yellow)
- `ceylon-cream`: #F5EDA0 (Light cream/pale yellow)
- `ceylon-blue`: #A7C7D7 (Light blue/sky blue)
- `ceylon-bg`: #F5EDA0 (Light cream - main background)
- `ceylon-accent`: #D9873B (Burnt orange - accents)
- `ceylon-light`: #F5EDA0 (Light cream - subtle elements)
- `ceylon-dark`: #A7C7D7 (Light blue - contrast)
- `ceylon-text`: #1A1A1A (Black text)

## Deployment

This project is configured for **static export** and ready to deploy on Netlify, Vercel, or any static hosting platform.

### Deploy to Netlify

The project includes a `netlify.toml` configuration file. Simply:

1. Connect your GitHub repository to Netlify
2. Netlify will automatically use the settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: 20.17.0

3. Deploy!

### Manual Build

```bash
npm run build
```

This generates a static site in the `out` directory.

## Environment Variables

If using Supabase, create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_PROJECT_ID=your-project-id
```

## Social Media

Follow Ceylon Express:
- Instagram: [@ceylonexpress.se](https://www.instagram.com/ceylonexpress.se/)
- Facebook: [ceylonexpressse](https://www.facebook.com/ceylonexpressse)

## License

© 2024 Ceylon Express. All rights reserved.
