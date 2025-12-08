# Components Directory

This directory contains all reusable React components for the Ceylon Express website.

## Component Structure

### Layout Components
- **Navigation.tsx** - Main navigation for home page
- **MenuNavigation.tsx** - Navigation for menu page with different links
- **Footer.tsx** - Main footer for home page
- **MenuFooter.tsx** - Footer for menu page

### Page Sections
- **Hero.tsx** - Hero section with logo and main CTA
- **AboutSection.tsx** - About/story section
- **LocationSection.tsx** - Location and contact information

### Reusable Components
Components are designed to be modular and reusable across pages.

## Usage

All components are designed to be imported and used in page files:

```tsx
import Navigation from './components/Navigation'
import Hero from './components/Hero'
// etc.
```

## Data Management

Menu data and constants are managed in the `constants` directory:
- `menuData.ts` - All menu items and categories
- `socialLinks.ts` - Social media links and business info

