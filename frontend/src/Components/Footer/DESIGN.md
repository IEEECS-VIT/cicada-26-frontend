---
name: Obsidian Protocol
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d6c3ba'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#9e8d85'
  outline-variant: '#51443e'
  surface-tint: '#f8b898'
  primary: '#f8b898'
  on-primary: '#4d260f'
  primary-container: '#c58b6d'
  on-primary-container: '#4d260f'
  inverse-primary: '#835338'
  secondary: '#ffdb9d'
  on-secondary: '#412d00'
  secondary-container: '#feb700'
  on-secondary-container: '#6b4b00'
  tertiary: '#9ad0d5'
  on-tertiary: '#00363a'
  tertiary-container: '#6ca1a6'
  on-tertiary-container: '#00373a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#f8b898'
  on-primary-fixed: '#331201'
  on-primary-fixed-variant: '#683c23'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#ffba20'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#b5ecf1'
  tertiary-fixed-dim: '#9ad0d5'
  on-tertiary-fixed: '#002022'
  on-tertiary-fixed-variant: '#134e53'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: JetBrains Mono
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
  container-max: 1440px
---

## Brand & Style

This design system establishes a dark, cryptic, and futuristic aesthetic tailored for high-stakes puzzle immersion. The visual language is inspired by advanced terminal interfaces and deep-space telemetry, blending **Minimalism** with **High-Contrast** accents to evoke an atmosphere of mystery and technical precision.

The target audience consists of cryptographers and puzzle enthusiasts who value intellectual challenge. The emotional response is one of isolation, curiosity, and high-tech sophistication. The UI utilizes thin hairlines, mono-spaced typography, and subtle optical glows to simulate a "Black Site" digital console. 

Key stylistic pillars:
- **Terminal Aesthetics:** Monospaced fonts and utilitarian data readouts.
- **Atmospheric Depth:** Deep obsidian backgrounds with layered charcoal containers.
- **Energy Accents:** Glowing copper and amber highlights that signify interactivity and power.
- **Precision:** 1px borders and ample "negative space" to focus the mind on the puzzle at hand.

## Colors

The palette is anchored in **Deep Obsidian (#0A0A0A)**, creating a void-like canvas that eliminates peripheral distraction. **Charcoal** is used for secondary surface layers to establish hierarchy without breaking the dark immersion.

**Glowing Copper (#C58B6D)** serves as the primary action color, used for critical data, primary buttons, and active states. **Amber** is reserved for secondary status indicators and warnings, providing a warm, high-visibility contrast against the cool dark backgrounds. 

Text primarily utilizes a muted grey for body copy to reduce eye strain, while headings and interactive elements utilize the full brilliance of the copper glow.

## Typography

This design system uses **JetBrains Mono** exclusively to reinforce the technical, terminal-based narrative. The font's high legibility and distinct character shapes are essential for the cryptographic nature of the content.

- **Display & Headlines:** Use tight letter-spacing and bold weights for a commanding presence.
- **Body Text:** Standard weight with generous line-height to ensure readability during long puzzle-solving sessions.
- **Labels:** Always uppercase with increased letter-spacing to mimic hardware labels and telemetry markers.
- **Mobile Scaling:** Headlines scale down by 25% on mobile devices, while body text remains consistent at 16px for legibility.

## Layout & Spacing

The layout follows a **Fixed Grid** model on desktop, centering content within a 1440px container to simulate a focused workstation view. 

- **Grid:** A 12-column grid with 24px gutters.
- **Rhythm:** All spacing (padding, margins) is derived from a 4px base unit. 
- **Sectioning:** Content blocks are separated by significant vertical padding (80px - 120px) to allow the "Obsidian" background to create a sense of vastness.
- **Responsive:** On mobile, margins reduce to 16px and the 12-column grid collapses into a single-column stack. Components like the side navigation transition into a full-screen overlay.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Optical Glows** rather than traditional shadows.

1.  **Base Layer:** Obsidian (#0A0A0A) - The infinite background.
2.  **Surface Layer:** Charcoal (#1A1A1A) - Used for cards and panels. Borders are 1px solid #2D2D2D.
3.  **Active Layer:** Subtle copper outer glow (4px - 12px blur) to indicate focus or active states.
4.  **Scanline Overlay:** A global, low-opacity (2%) linear gradient pattern repeats every 4px vertically to simulate a CRT or high-end monitor texture.

## Shapes

The shape language is **Sharp (0px)**. To maintain a brutalist, technical aesthetic, all buttons, containers, and input fields utilize hard 90-degree angles. 

Occasional 45-degree clipped corners (chamfers) may be used on primary action buttons or decorative frame elements to reinforce the "futuristic hardware" motif.

## Components

### Buttons
- **Primary:** Copper border (1px), transparent background, copper text. On hover: Copper background, obsidian text, and an external 8px copper glow.
- **Ghost:** Charcoal border, muted grey text. On hover: White border, white text.

### Interactive Accordion (FAQ)
- **Header:** 1px charcoal border bottom. JetBrains Mono Bold text.
- **Icon:** A plus/minus sign (+) in copper.
- **Transition:** Vertical slide with a subtle opacity fade. 
- **State:** When expanded, the header text glows copper.

### Input Fields
- **Default:** 1px charcoal border bottom only. Muted grey placeholder.
- **Focus:** 1px copper border bottom with a faint copper "pulse" animation at the cursor.

### Sleek Footer
- **Structure:** Low-profile (height: 120px), obsidian background. 
- **Content:** Left-aligned copyright/versioning data; right-aligned "System Status: Online" indicator with a pulsing amber dot.
- **Links:** Muted grey, turning copper on hover with a 0.2s transition.

### Navigation Sidebar
- Vertical orientation. Active links are marked by a copper vertical line (2px) on the far left and a subtle copper text glow.