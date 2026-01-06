---
name: ceylon-express-frontend
description: Create distinctive, production-grade frontend interfaces for Ceylon Express - a Sri Lankan restaurant in Stockholm. Use this skill when building web components, pages, or features for the restaurant website that celebrates authentic Sri Lankan cuisine while targeting Sri Lankan expats and Swedish food enthusiasts.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces for Ceylon Express that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices that honor Sri Lankan culinary heritage.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Project Context

**Ceylon Express** is a Sri Lankan restaurant bringing authentic island flavors to Stockholm, Sweden.

- **Purpose**: Connect Sri Lankan expats with nostalgic, authentic home-cooked flavors while introducing Swedish locals to Sri Lankan cuisine
- **Audience**: Primary - Sri Lankan expats in Stockholm/Sweden seeking authentic tastes from home; Secondary - Swedish food enthusiasts curious about Sri Lankan cuisine
- **Brand Values**: Authenticity, warmth, community, cultural pride, nostalgia
- **Tech Stack**: Next.js 14+, React, TypeScript, Tailwind CSS, Framer Motion

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction rooted in Ceylon Express's identity:

- **Purpose**: What problem does this interface solve? Who uses it? (Sri Lankan expats seeking authentic cuisine; locals discovering new flavors)
- **Tone**: **Warm Nostalgia Meets Contemporary Refinement** - The aesthetic should balance:
  - Nostalgic warmth that evokes home-cooked Sri Lankan meals
  - Contemporary sophistication suitable for a Stockholm restaurant
  - Cultural richness without stereotypical exoticism
  - Inviting, communal feeling that food brings people together
- **Constraints**: Next.js, React, Tailwind CSS, Framer Motion, mobile-first responsive design, fast loading for food imagery
- **Differentiation**: What makes this UNFORGETTABLE? Authentic cultural storytelling through design, unexpected warm color palettes that break typical restaurant website molds, micro-interactions that feel like sharing a meal with loved ones

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. The design should feel distinctly Sri Lankan while being modern and approachable.

Then implement working code that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with Ceylon Express's warm, authentic brand
- Meticulously refined in every detail

## Ceylon Express Brand Guidelines

### Color Palette (from tailwind.config.js)
ceylon: {
  bg: "#F5EDA0",      // Light cream/pale yellow background
  text: "#1A1A1A",    // Black text for readability
  accent: "#D9873B",  // Burnt orange for accents
  orange: "#D9873B",  // Burnt orange
  yellow: "#F0D871",  // Golden yellow
  cream: "#F5EDA0",   // Light cream/pale yellow
  blue: "#A7C7D7",    // Light blue/sky blue
}**Color Philosophy**: 
- Warm, sun-soaked palette inspired by Sri Lankan spices and tropical landscapes
- Cream/yellow as dominant creates an inviting, appetizing atmosphere
- Burnt orange provides cultural depth (reminiscent of cinnamon, turmeric, curry)
- Light blue offers cool contrast (reminiscent of ocean surrounding the island)
- Avoid stark whites - prefer cream tones for warmth

### Typography Guidance
- **Display/Headings**: Consider distinctive fonts that feel warm yet contemporary. Explore:
  - Serif fonts with personality (NOT Times New Roman)
  - Fonts with gentle curves that feel welcoming
  - Cultural consideration: fonts that work well with both English and potential Sinhala/Tamil text
- **Body Text**: Clean, highly readable fonts for descriptions and menu items
- **Avoid**: Inter, Roboto, Arial, generic system fonts
- **Size**: Generous sizing for menu items and food descriptions (food should feel abundant)

### Motion & Interaction
- Use Framer Motion for page transitions and component animations
- **Philosophy**: Gentle, warm animations that feel organic, not mechanical
- Consider: 
  - Staggered reveals for menu items (like dishes arriving at a table)
  - Subtle parallax effects that add depth
  - Hover states that feel generous and inviting
  - Page transitions that feel smooth, like turning pages in a family recipe book

### Spatial Composition
- **Generous spacing**: Don't crowd content - let elements breathe like a well-plated dish
- **Asymmetry with purpose**: Break grid for featured dishes or cultural stories
- **Visual hierarchy**: Hero images of food should be prominent and mouthwatering
- **Mobile-first**: Most expats will browse on phones - ensure touch-friendly interactions

### Cultural Authenticity
- **Imagery**: High-quality photos of actual Sri Lankan dishes (no stock photos of random "Asian" food)
- **Language**: Authentic dish names (e.g., "Lamprais," "Kaha Bath") with clear English descriptions
- **Storytelling**: Share the heritage behind dishes without being didactic
- **Textures**: Consider subtle patterns inspired by:
  - Batik fabric patterns
  - Geometric kolam/rangoli designs
  - Natural textures (banana leaf, woven palm)
  - BUT apply with restraint - enhance, don't overwhelm

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that feel warm, inviting, and slightly editorial. Pair a characterful display font for headings with a clean, generous body font for menu descriptions. Food deserves beautiful typography.

- **Color & Theme**: Maintain the warm cream/yellow base with burnt orange accents. Use the light blue sparingly for surprising moments. Create depth through layered transparencies and subtle gradients rather than flat colors. Dominant warm tones with strategic cool accents.

- **Motion**: Use Framer Motion for orchestrated reveals. Consider staggered animations for menu items appearing (animation-delay), gentle hover effects on food images (subtle scale/lift), smooth scroll-triggered reveals for sections. High-impact moments: hero section entrance, featured dish reveals, page transitions.

- **Spatial Composition**: Generous negative space that feels abundant, not sparse. Asymmetric layouts for featured content. Consider overlap of text on images with careful contrast management. Diagonal or curved flow for visual interest. Grid-breaking elements for cultural stories or chef's specials.

- **Backgrounds & Visual Details**: 
  - Gradient meshes with cream-to-yellow-to-orange flows
  - Subtle noise textures for organic warmth
  - Geometric patterns inspired by Sri Lankan art (use sparingly, tastefully)
  - Layered transparencies for depth
  - Soft shadows that