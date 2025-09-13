# Social Gaming Matchmaking App - Design Guidelines

## Design Approach
**Reference-Based Approach** - Drawing inspiration from Discord, Steam, and Twitch for their gaming-focused social interfaces and real-time communication patterns. The app is experience-focused with visual appeal driving user engagement in the competitive gaming space.

## Core Design Elements

### Color Palette
**Dark Mode Primary** (default theme for gaming audience):
- Background: 220 15% 8% (deep dark blue-gray)
- Surface: 220 12% 12% (elevated dark surfaces)
- Primary: 230 85% 65% (vibrant blue for CTAs)
- Accent: 285 85% 70% (purple for status indicators)
- Success: 145 65% 55% (green for connections/matches)
- Warning: 45 85% 65% (orange for pending states)
- Text Primary: 0 0% 95% (high contrast white)
- Text Secondary: 220 10% 70% (muted gray)

**Light Mode** (optional):
- Background: 220 20% 98%
- Surface: 0 0% 100%
- Primary: 230 85% 55%
- Text Primary: 220 25% 15%

### Typography
- **Primary Font**: Inter (Google Fonts) - clean, modern readability
- **Display Font**: Outfit (Google Fonts) - bold headers and gaming elements
- **Font Scale**: text-sm (14px), text-base (16px), text-lg (18px), text-xl (20px), text-2xl (24px)

### Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8
- Micro spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px) 
- Section spacing: p-6, m-6 (24px)
- Major spacing: p-8, m-8 (32px)

### Component Library

**Navigation**:
- Fixed bottom tab bar (mobile-first)
- Icons: Home, Search, Post, Profile, Messages
- Active state with primary color background
- Badge notifications for new matches

**Match Request Cards**:
- Compact card design with game badge, player count, and quick action buttons
- Status indicators: waiting (orange), matched (green), declined (red)
- Subtle gradient overlay on game type badges

**Profile Components**:
- Circular avatar with online/offline status ring
- Bio cards with rounded corners and subtle shadows
- Gaming stats and preferences in pill format

**Real-time Feed**:
- Infinite scroll with skeleton loading states
- Filter chips for game types (1v1, 2v2, 3v3)
- Pull-to-refresh functionality

**Forms & Inputs**:
- Dark-themed form inputs with subtle borders
- Floating label animation
- Gaming-style toggle switches for preferences

### Gaming Visual Enhancements
- Subtle neon glow effects on interactive elements
- Gaming controller and trophy icons throughout
- Status badges with slight pulsing animation for "live" requests
- Card hover states with gentle elevation increase

### Images
**No large hero image required** - the app focuses on user-generated content and real-time feeds rather than marketing imagery. Profile avatars and game icons will be the primary visual elements.

**Icon Sources**: Heroicons for UI elements, Gaming-specific icons via Font Awesome for controllers, games, and stats.

### Responsive Behavior
- Mobile-first design (320px+)
- Single-column layout on mobile
- Two-column layout on tablet/desktop (feed + sidebar)
- Touch-friendly button sizing (minimum 44px)

### Key Design Principles
1. **Gaming Identity**: Dark theme default with neon accents
2. **Real-time Focus**: Visual indicators for live activity and status changes  
3. **Social Connection**: Emphasis on user profiles and mutual interactions
4. **Performance**: Lightweight components for real-time updates
5. **Accessibility**: High contrast ratios and clear status communication