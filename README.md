# execution-003-ai-room-design-2

Will‑It‑Fit (Room → Doorway): Verify a new sofa/rug/TV fits your room—and through your door—using one photo. Cross‑retailer, homography‑based 2D footprint with doorway/walkway clearance badges, confidence notes, exportable results, and fallbacks.

## Landing Page

This repository contains a responsive marketing landing page for Will‑It‑Fit with an interactive demo widget.

### Features

- Responsive design for desktop, tablet, and mobile
- Sticky header with navigation
- Interactive live demo widget with doorway fit calculations
- Accessible FAQ accordion with keyboard support
- AR preview integration (QR code handoff)
- Full marketing page with all sections:
  - Hero with value proposition
  - Social proof and client logos
  - Three-up value propositions
  - How it works stepper
  - Live demo widget (doorway check + AR preview)
  - Feature deep dives
  - Integrations showcase
  - ROI and proof section
  - Pricing overview
  - FAQ accordion
  - Footer with navigation

### Technology Stack

- Pure HTML, CSS, and JavaScript (no frameworks)
- Vite for development and building
- Modern CSS with custom properties (CSS variables)
- Accessible markup with ARIA attributes

### Demo Widget Fit Logic

The demo widget implements a lightweight approximation of doorway fit checking:

1. **Orthogonal check**: Tests if the item can fit through the doorway in any of the 6 orthogonal orientations (3 axes × 2 rotations)
2. **Diagonal tilt**: If no orthogonal fit is found and tilt is allowed, calculates diagonal dimension using `sqrt(a² + b²)` for the two smaller dimensions
3. **Margin calculation**: 
   - Pass: Adequate clearance (>2 units)
   - Tight: Marginal clearance (0-2 units)
   - No-go: Insufficient clearance (<0 units)
4. **Recommendations**: Provides specific guidance based on hinge side, swing direction, and clearance margins

**Note**: This is an illustrative demo. The actual production app would use path-aware physics simulation with more sophisticated collision detection and movement constraints.

### Local Development

#### Prerequisites

- Node.js 16+ and npm

#### Setup and Run

```bash
# Navigate to the site directory
cd site/will-it-fit

# Install dependencies
npm install

# Start development server (usually runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Testing Plan

1. **Desktop Layout** (1200px+)
   - Verify sticky header behavior on scroll
   - Check all sections render correctly
   - Test live demo widget with various dimensions
   - Verify FAQ accordion keyboard navigation
   - Check that all CTAs are clickable

2. **Tablet Layout** (768px - 1023px)
   - Verify responsive grid layouts adjust properly
   - Check navigation menu behavior
   - Test demo widget responsiveness

3. **Mobile Layout** (<768px)
   - Verify hamburger menu functionality
   - Check hero section stacks vertically
   - Verify mobile-optimized demo widget
   - Test AR launch button appears on mobile

4. **Accessibility**
   - Keyboard navigation through all interactive elements
   - Focus states visible
   - ARIA attributes properly set
   - Color contrast meets AA standards

5. **Performance**
   - Run Lighthouse audit (target: Performance ≥90, Accessibility ≥95)
   - Check Core Web Vitals: LCP <2.5s, CLS <0.1
   - Verify lazy loading of heavy assets

6. **Interactive Features**
   - Demo widget calculates fit correctly for various inputs
   - Tab switching works smoothly
   - FAQ accordion expands/collapses with keyboard and mouse
   - All analytics data attributes present

### Design System

#### Colors
- Primary: `#0B2343` (ink/headings)
- Accent Orange: `#FF7A1A` (CTAs)
- Accent Teal: `#0FB7A7` (highlights)
- Status Colors:
  - Pass: `#1FBF75` (green)
  - Tight: `#FFB020` (amber)
  - No-go: `#E34D4D` (red)

#### Typography
- Font: Inter (via Google Fonts)
- Base size: 18px
- Heading scale: 24px, 32px, 48px, 56px

#### Spacing
- Base increment: 8px
- Section padding: 88-120px (desktop), 56-72px (mobile)
- Vertical rhythm: 24-32px

### Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- iOS Safari 14+
- Android Chrome 90+

### Performance Targets

- Lighthouse Performance Score: ≥90
- Lighthouse Accessibility Score: ≥95
- LCP (Largest Contentful Paint): <2.5s
- CLS (Cumulative Layout Shift): <0.1
- TBT (Total Blocking Time): <200ms

### Analytics Integration

The page includes data attributes on key interactions for analytics tracking:
- `data-analytics="try-now"` - Try it now CTAs
- `data-analytics="book-demo"` - Book a demo CTAs
- `data-analytics="live-demo-run"` - Live demo check fit button
- `data-analytics="ar-launch"` - AR launch button

### SEO

The page includes:
- Semantic HTML5 markup
- Meta description and Open Graph tags
- Twitter Card metadata
- Structured data (Organization + WebSite schema)
- Canonical link
- Proper heading hierarchy

### Future Enhancements

- CMS integration for stats/testimonials
- Locale detection and unit switcher default
- Unit tests for fit calculation logic
- Real AR model generation (USDZ/GLB)
- Video demo in hero section
- Advanced animations and micro-interactions

### License

MIT
