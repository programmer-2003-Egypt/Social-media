import styled, { keyframes, ThemeProvider,css} from "styled-components";
import { motion } from "framer-motion";
import { FaEnvelope, FaLinkedin, FaGithub } from "react-icons/fa";
 // ====== Global Animations ======
 export const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  25% { background-position: 50% 100%; }
  50% { background-position: 100% 50%; }
  75% { background-position: 50% 0%; }
  100% { background-position: 0% 50%; }
`;

// Fade up (yours is good)
export const fadeInUp = keyframes`
  0% { opacity: 0; transform: translateY(12px) scale(0.98); }
  60% { opacity: 1; transform: translateY(-2px) scale(1.01); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
`;

// Shimmer effect (your base, smoothed)
export const shimmer = keyframes`
  0% { background-position: -200% 0; }
  50% { background-position: 0% 0; }
  100% { background-position: 200% 0; }
`;

// Fade + slide up (yours, extended with easing)
export const fadeSlideUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.96);
  }
  60% {
    opacity: 0.8;
    transform: translateY(-6px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

// Floating animation (yours, extended with subtle rotation)
export const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(1deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

// Hover pulse (yours, extended with shadow pulse)
export const hoverPulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(255, 126, 179, 0); }
  50% { transform: scale(1.06); box-shadow: 0 8px 18px rgba(255, 126, 179, 0.35); }
  100% { transform: scale(1); box-shadow: 0 0 0 rgba(255, 126, 179, 0); }
`;

// New: 3D card flip
export const flip3D = keyframes`
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
  100% { transform: rotateY(360deg); }
`;

// New: Skew morph effect
export const skewMorph = keyframes`
  0% { transform: skew(0deg, 0deg); }
  25% { transform: skew(6deg, -3deg); }
  50% { transform: skew(-6deg, 3deg); }
  75% { transform: skew(3deg, -6deg); }
  100% { transform: skew(0deg, 0deg); }
`;

// New: Glow pulse
export const glowPulse = keyframes`
  0% { box-shadow: 0 0 4px rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 0 16px rgba(255, 126, 179, 0.6); }
  100% { box-shadow: 0 0 4px rgba(255, 255, 255, 0.2); }
`;
export const SocialContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
  padding: 20px 28px;
  margin: 40px auto;
  border-radius: 16px;

  /* glassy background */
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);

  /* subtle border */
  border: 1px solid rgba(255, 255, 255, 0.1);

  /* entry animation */
  animation: fadeInUp 0.8s ease both;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.5);
  }
`;
const glow = keyframes`
  0% { box-shadow: 0 0 4px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 12px rgba(255, 255, 255, 0.6); }
  100% { box-shadow: 0 0 4px rgba(255, 255, 255, 0.3); }
`;

// Striped moving effect
const stripes = keyframes`
  0% { background-position: 0 0; }
  100% { background-position: 40px 0; }
`;
export const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  font-size: 22px;
  color: #fff;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  /* default gradient + shadow */
  background: ${({ theme }) =>
    theme.accentGradient ||
    "linear-gradient(135deg, #6e8efb, #a777e3)"};
  box-shadow: ${({ theme }) =>
    theme.shadow || "0 6px 18px rgba(0,0,0,0.25)"};

  transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);

  /* glowing ring */
  &::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: inherit;
    filter: blur(12px);
    opacity: 0.4;
    transition: opacity 0.4s ease;
    z-index: -1;
  }

  &:hover {
    transform: scale(1.25) translateY(-6px) rotate(-4deg);
    animation: ${float} 0.9s ease-in-out infinite;
    background: ${({ theme }) =>
      theme.hoverGradient ||
      "linear-gradient(135deg,#ff758c,#ff7eb3)"};
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
  }

  &:hover::before {
    opacity: 0.8;
    animation: ${glowPulse} 2s infinite ease-in-out;
  }

  /* icon (svg or i) */
  svg, i {
    transition: transform 0.4s ease, color 0.3s ease;
  }

  &:hover svg, &:hover i {
    transform: scale(1.2) rotate(6deg);
    color: #fff;
  }
`;

// ===== Page (animated gradient + subtle particles) =====
export const Page = styled.div`
  font-family: 'Inter', ui-sans-serif, system-ui;
  color: ${p => p.theme.text};
  background: ${p =>
    p.theme.bg ||
    "linear-gradient(-45deg,#1e1e2f,#25253a,#1a1a27,#232335)"};
  background-size: 300% 300%;
  animation: ${gradientMove} 30s ease infinite;

  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  transition: background 0.6s ease;

  /* subtle noise overlay */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='noiseFilter'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23noiseFilter)'/></svg>");
    opacity: 0.04;
    pointer-events: none;
    z-index: 1;
  }

  /* floating particles */
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05), transparent 60%),
                radial-gradient(circle at 80% 70%, rgba(255,126,179,0.08), transparent 60%);
    background-size: cover;
    animation: ${gradientMove} 60s linear infinite;
    z-index: 0;
  }
`;

export const Shell = styled.div`
  max-width: 1280px;
  width: 100%;
  padding: 32px clamp(16px, 5vw, 48px);
  margin: 0 auto;
  position: relative;

  /* glass gradient background */
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.02)
  );
  backdrop-filter: blur(10px);

  /* border + shadow */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);

  /* entry animation */
  animation: ${fadeSlideUp} 0.8s ease both;

  /* Responsive tweaks */
  @media (max-width: 992px) {
    padding: 28px clamp(14px, 6vw, 32px);
    border-radius: 16px;
  }

  @media (max-width: 600px) {
    padding: 24px 16px;
    border-radius: 12px;
  }

  /* subtle hover lift */
  transition: all 0.35s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.5);
  }
`;

export const TopNav = styled.nav`
position: sticky;
top: 0;
z-index: 100;
${p => p.theme.glass};
background: ${p => p.theme.card};
border-bottom: 1px solid ${p => p.theme.border};
backdrop-filter: blur(20px) saturate(1.4);
transition: background 0.3s ease, border 0.3s ease, backdrop-filter 0.3s ease;

&:hover {
  backdrop-filter: blur(26px) saturate(1.6);
}
`;
export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-radius: 14px;
  position: sticky;
  top: 0;
  z-index: 1000;

  /* modern gradient background */
  background: linear-gradient(
    135deg,
    rgba(30, 30, 30, 0.85),
    rgba(15, 15, 15, 0.75)
  );
  backdrop-filter: blur(12px);

  /* border + shadow */
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);

  /* smooth animation */
  transition: all 0.35s ease;

  &:hover {
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.55);
    transform: translateY(-2px);
  }
`;

export const NavLinks = styled.div`
display: flex; gap: clamp(10px, 2vw, 22px);

a {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: .3px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 1px solid transparent;
  transition: all 0.25s ease, color 0.25s ease;
  position: relative;

  &:hover {
    border-color: ${p => p.theme.accent};
    background: rgba(255,255,255,0.05);
    transform: translateY(-1px);
    color: ${p => p.theme.accent};
  }
  &:focus {
    outline: 2px solid ${p => p.theme.accent};
    outline-offset: 2px;
  }

  /* subtle underline slide in */
  &::after {
    content: "";
    position: absolute;
    left: 50%; bottom: 4px;
    width: 0; height: 2px;
    background: ${p => p.theme.accent};
    transition: width 0.25s ease, left 0.25s ease;
  }
  &:hover::after {
    width: 70%; left: 15%;
  }
}
`;
export const TagWrapper = styled.div`
  display: flex;
  flex-direction: column;       /* stack tags vertically */
  align-items: center;          /* center horizontally */
  justify-content: center;      /* center vertically */
  gap: 16px;                    /* spacing between tags */
  padding: 24px 16px;           /* inner spacing */
  min-height: 100%;             /* make wrapper take full height if needed */
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    transform: scale(1.02);
  }
`;

export const Toggle = styled.button`
border: 1px solid ${p => p.theme.border};
background: ${p => p.theme.card};
padding: 8px 14px;
border-radius: 999px;
cursor: pointer;
font-weight: 600;
transition: all 0.25s ease;
position: relative;
overflow: hidden;

&:hover {
  background: ${p => p.theme.accent};
  color: #141414;
}

/* pulse ring */
&::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid ${p => p.theme.accent};
  opacity: 0;
  transform: scale(1.2);
  transition: opacity 0.4s, transform 0.4s;
}
&:hover::after {
  opacity: 0.5;
  transform: scale(1);
}
`;
export const Progress = styled.div`
  height: 4px;
  width: 0%;
  border-radius: 6px;
  transition: width 0.45s ease-in-out;

  background: linear-gradient(
    90deg,
    ${p => p.theme.accent},
    ${p => p.theme.accentAlt || "#ff7eb3"}
  );

  /* subtle stripes overlay */
  background-image: linear-gradient(
    45deg,
    rgba(255,255,255,0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255,255,255,0.2) 50%,
    rgba(255,255,255,0.2) 75%,
    transparent 75%,
    transparent
  );
  background-size: 40px 40px;
  animation: ${stripes} 1.5s linear infinite, ${glow} 2s ease-in-out infinite;
`;

export const Section = styled.section`
  margin: clamp(50px, 8vw, 100px) 0;
  padding: 40px 0;
  animation: ${fadeInUp} 0.8s ease both;
  position: relative;
  z-index: 1;

  /* background accent layer (subtle parallax) */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at top right,
      rgba(255, 126, 179, 0.05),
      transparent 70%
    );
    z-index: -1;
  }

  /* stylish divider line */
  &::after {
    content: "";
    position: absolute;
    bottom: -50px;
    left: 0;
    width: 100%;
    height: 1.5px;
    background: linear-gradient(
      90deg,
      transparent,
      ${p => p.theme.border},
      transparent
    );
    box-shadow: 0 0 6px ${p => p.theme.border};
  }
`;

export const Glass = styled(motion.div)`
border: 1px solid ${p => p.theme.border};
background: ${p => p.theme.card};
border-radius: 20px;
box-shadow: ${p => p.theme.glow};
padding: clamp(20px, 3.5vw, 34px);
${p => p.theme.glass};
transition: transform 0.3s ease, box-shadow 0.3s ease;
overflow: hidden;
position: relative;

&:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 18px 40px rgba(0,0,0,0.25);
}

/* animated border shine */
&::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid transparent;
  background: linear-gradient(120deg, ${p => p.theme.accent}, transparent, ${p => p.theme.accent2});
  background-size: 200% 100%;
  background-position: -200% 0;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: destination-out;
  mask-composite: exclude;
  animation: ${shimmer} 5s linear infinite;
  pointer-events: none;
}
`;

export const Title = styled.h2`
font-size: clamp(26px, 3.5vw, 38px);
margin-bottom: 14px;
font-weight: 700;
background: linear-gradient(90deg, ${p => p.theme.accent}, ${p => p.theme.accent2});
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
letter-spacing: .6px;
position: relative;

/* subtle underline glow */
&::after {
  content: "";
  position: absolute;
  bottom: -6px; left: 0;
  width: 40px; height: 3px;
  border-radius: 2px;
  background: ${p => p.theme.accent};
  box-shadow: 0 0 8px ${p => p.theme.accent};
}
`;
export const Sub = styled.p`
  opacity: ${p => p.opacity || 0.9};
  line-height: ${p => p.lineHeight || 1.75};
  font-size: clamp(${p => p.minFont || 15}px, ${p => p.fontVW || 2}vw, ${p => p.maxFont || 17}px);
  max-width: ${p => p.maxWidth || "720px"};
  color: ${p => p.color || "#444"};
  font-weight: ${p => p.bold ? "600" : "400"};
  text-align: ${p => p.align || "left"};
  animation: ${fadeInUp} 0.6s ease-out forwards;
  transition: all 0.3s ease;

  &:hover {
    color: ${p => p.hoverColor || "#000"};
    animation: ${hoverPulse} 0.5s ease;
  }

  ${p => p.highlight && css`
    background: linear-gradient(90deg, #f0f, #0ff);
    -webkit-background-clip: text;
    color: transparent;
    font-weight: 700;
  `}
`;

// ===== Grid with advanced responsive features =====
export const Grid = styled.div`
  display: grid;
  gap: clamp(${p => p.minGap || 16}px, ${p => p.gapVW || 2.4}vw, ${p => p.maxGap || 26}px);
  grid-template-columns: repeat(12, 1fr);
  padding: ${p => p.padding || "0"};
  margin: ${p => p.margin || "0 auto"};
  justify-items: ${p => p.justify || "stretch"};
  align-items: ${p => p.align || "start"};

  @media (max-width: 1200px) {
    gap: clamp(12px, 2vw, 22px);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(1, 1fr);
    gap: 8px;
  }
`;

// ===== Column with dynamic span, hover, and responsive =====
export const Col = styled.div`
  grid-column: span ${p => p.span || 12};
  display: flex;
  flex-direction: ${p => p.direction || "column"};
  justify-content: ${p => p.justify || "flex-start"};
  align-items: ${p => p.align || "flex-start"};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: ${p => p.padding || "0"};

  &:hover {
    transform: ${p => p.hoverScale || "scale(1.02)"};
    box-shadow: ${p => p.hoverShadow || "0 4px 20px rgba(0,0,0,0.1)"};
  }

  @media (max-width: 900px) {
    grid-column: span 12;
  }

  ${p => p.center && css`
    justify-content: center;
    align-items: center;
  `}
`;
export const Tag = styled(motion.div)`
  flex: 0 0 200px; /* fixed column width */
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;
  margin: 8px;
  border-radius: 16px;
  font-weight: 600;
  font-size: 14px;
  color: #fff;
  background: linear-gradient(
    135deg,
    ${p => p.startColor || "#ff7e5f"},
    ${p => p.middleColor || "#feb47b"},
    ${p => p.endColor || "#ff7e5f"}
  );
  box-shadow: 0 6px 15px rgba(0,0,0,0.25);
  cursor: pointer;
  perspective: 800px;
  transform-style: preserve-3d;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: rotateX(8deg) rotateY(8deg) scale(1.05);
    box-shadow: 0 12px 30px rgba(0,0,0,0.35);
  }

  animation: ${float} 4s ease-in-out infinite;
  background-size: 200% 200%;
  background-position: 0 0;
  animation: ${shimmer} 6s linear infinite, ${float} 4s ease-in-out infinite;
`;

  export const Card = styled(motion.div)`
  position: relative;
  border-radius: 16px;
  border: 1px solid ${p => p.theme.border};
  background: ${p => p.theme.card};
  cursor: pointer;
  transition: transform 0.35s ease, box-shadow 0.35s ease, border 0.35s ease;
  perspective: 1000px;

  &:hover {
    transform: translateY(-6px) rotateX(2deg) rotateY(-2deg);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
    border-color: ${p => p.theme.accent};
  }

  img, video {
    width: 100%;
    display: block;
    object-fit: cover;
    aspect-ratio: 16/10;
    transition: transform 0.45s ease;
  }

  &:hover img,
  &:hover video {
    transform: scale(1.08);
  }

  /* Overlay gradient */
  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: linear-gradient(transparent 40%, rgba(0, 0, 0, 0.7));
    padding: 18px;
    z-index: 2;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.4s ease;
  }
  &:hover .overlay {
    opacity: 1;
    transform: translateY(0);
  }

  /* ===== h4 styles (scoped) ===== */
  .overlay h4 {
    margin: 0 0 10px 0;
    color: #f5f5f5;
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: 0.75px;
    line-height: 1.4;
    text-transform: capitalize;
    position: relative;
    padding-left: 12px;
    font-family: "Poppins", "Segoe UI", sans-serif;
    transition: all 0.3s ease;
  }

  /* Decorative accent line only for h4 */
  .overlay h4::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 70%;
    border-radius: 4px;
    background: linear-gradient(135deg, #6a11cb, #2575fc);
  }

  /* Hover effect only on h4 */
  .overlay h4:hover {
    color: #ffd700;
    transform: translateX(4px);
    text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  }

  /* Shine effect */
  &::before {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      120deg,
      transparent 40%,
      rgba(255, 255, 255, 0.25) 50%,
      transparent 60%
    );
    transform: rotate(25deg);
    opacity: 0;
    transition: opacity 0.4s;
    pointer-events: none;
  }
  &:hover::before {
    opacity: 1;
    animation: shine 1s forwards;
  }

  @keyframes shine {
    0% { transform: translateX(-100%) rotate(25deg); }
    100% { transform: translateX(100%) rotate(25deg); }
  }
`;


  // Timeline
export const Timeline = styled.div`
  position: relative;
  padding-left: 40px;
  margin: 40px 0;

  &:before {
    content: "";
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(
      to bottom,
      ${p => p.theme.border},
      ${p => p.theme.text}
    );
    border-radius: 2px;
    box-shadow: 0 0 6px rgba(0,0,0,0.2);
  }
`;
  export const Titem = styled.div`
    position: relative; margin: 20px 0;
    &:before {
      content: ""; position: absolute; left: -2px; top: 6px;
      width: 12px; height: 12px; border-radius: 50%;
      background: ${p => p.theme.accent};
      box-shadow: 0 0 0 4px rgba(255,193,7,.25);
    }
  `;
  // Link preview card
export const LinkCardWrap = styled(motion.a)`
display: grid;
grid-template-columns: 86px 1fr;
gap: 14px;
text-decoration: none;
border: 1px solid ${p => p.theme.border};
background: ${p => p.theme.card};
border-radius: 14px;
padding: 12px;
color: inherit;
transition: transform 0.25s ease, box-shadow 0.3s ease, border 0.3s ease;
align-items: center;
position: relative;
overflow: hidden;

&:hover {
  transform: translateY(-3px);
  border-color: ${p => p.theme.accent};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

img {
  width: 86px;
  height: 86px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.35s ease;
}
&:hover img {
  transform: scale(1.05);
}

h5 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: ${p => p.theme.text};
  line-height: 1.3;
  letter-spacing: 0.3px;
  transition: color 0.3s ease;
}
&:hover h5 {
  color: ${p => p.theme.accent};
}

p {
  margin: 0;
  font-size: 13px;
  opacity: 0.85;
  line-height: 1.4;
}

/* Subtle shine */
&::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    120deg,
    transparent 40%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 60%
  );
  transform: rotate(25deg);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
}
&:hover::after {
  opacity: 1;
  animation: shine 1s forwards;
}
`;

// Back to top Floating Button
export const Fab = styled.button`
position: fixed;
right: 20px;
bottom: 20px;
z-index: 200;
border: none;
cursor: pointer;
padding: 14px 16px;
border-radius: 50%;
background: ${p => p.theme.accent};
color: #141414;
font-weight: 700;
font-size: 1rem;
box-shadow: ${p => p.theme.glow};
transition: all 0.3s ease, transform 0.2s ease;

&:hover {
  transform: translateY(-4px) scale(1.08) rotate(-3deg);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
}
&:active {
  transform: scale(0.95);
}

/* Ripple effect */
&:after {
  content: "";
  position: absolute;
  border-radius: 50%;
  inset: 0;
  background: rgba(255, 255, 255, 0.25);
  opacity: 0;
  transition: opacity 0.4s, transform 0.4s;
}
&:active:after {
  opacity: 1;
  transform: scale(1.4);
  transition: 0s;
}
`;
export const ProgressBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  color: #fff;
  padding: 6px 14px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(135deg, #ff7eb3, #ff758c);
    transform: scale(1.05);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.5);
  }
`;

export const CardContainer = styled.div`
  background: linear-gradient(160deg, #1c1c1c, #121212);
  border-radius: 20px;
  padding: 18px;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  margin: 0 auto;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.55);
  }
`;

export const CardImage = styled.img`
  width: 100%;
  height: 50%;
  object-fit: cover;
  border-radius: 14px;
  margin-bottom: 14px;
  transition: transform 0.4s ease;

  ${CardContainer}:hover & {
    transform: scale(1.08);
  }
`;

export const CardTitle = styled.h3`
  margin-bottom: 8px;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  transition: color 0.3s ease;

  ${CardContainer}:hover & {
    color: #ff7eb3;
  }
`;
export const CardDescription = styled.p`
  position: relative;
  opacity: 0.85;
  font-size: clamp(0.9rem, 1.5vw, 1.05rem);
  line-height: 1.6;
  color: #ddd;
  letter-spacing: 0.3px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  white-space: normal;
  transition: all 0.3s ease;

  /* Default line clamp */
  -webkit-line-clamp: ${({ expanded }) => (expanded ? "unset" : 6)};
  max-height: ${({ expanded }) => (expanded ? "none" : "7.5rem")};

  /* Hover effect if hoverable */
  ${({ hoverable }) =>
    hoverable &&
    css`
      ${CardContainer}:hover & {
        opacity: 1;
        color: #111;
      }
    `}

  /* Responsive adjustments */
  @media (max-width: 768px) {
    font-size: 0.9rem;
    -webkit-line-clamp: ${({ expanded }) => (expanded ? "unset" : 6)};
  }

  @media (max-width: 480px) {
    font-size: 0.85rem;
    -webkit-line-clamp: ${({ expanded }) => (expanded ? "unset" : 4)};
  }
`;

// Read More / Read Less toggle button
export const ReadMore = styled.button`
  margin-top: 8px;
  background: none;
  border: none;
  color: #4fa3ff;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  transition: color 0.3s ease;

  &:hover {
    color: #82c7ff;
  }
`;

// Container for scrollable table
export const TableContainer = styled.div`
  overflow: auto;
  max-height: 500px;
  padding-bottom: 10px;
  scrollbar-width: thin;
  scrollbar-color: #1890ff #f0f0f0;

  &::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f0f0f0;
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #1890ff;
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #096dd9;
  }
`;

// Table
export const StyledTable = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: separate;
  border-spacing: 0 8px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 0.95rem;
`;

// Table header cell
export const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  border-bottom: 2px solid #ccc;
  border-radius: 4px 4px 0 0;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  background-color: #f0f0f0;
  user-select: none;
`;

// Table row
export const Tr = styled.tr`
  background-color: ${(props) => (props.index % 2 === 0 ? "#fff" : "#fafafa")};
  transition: all 0.3s ease;

  &:hover {
    background-color: #e6f7ff;
  }
`;

// Table cell
export const Td = styled.td`
  padding: 12px 16px;
  vertical-align: top;
  word-break: break-word;
  max-width: ${(props) => props.maxWidth || "none"};
`;

// Tooltip
export const TooltipWrapper = styled.span`
  position: relative;
  display: inline-block;
`;

export const TooltipText = styled.span`
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  white-space: pre-wrap;
  z-index: 1000;
  box-shadow: 0 3px 8px rgba(0,0,0,0.25);
  pointer-events: none;
  max-width: 300px;
  text-align: center;
`;
export const SearchInput = styled(motion.input)`
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #ccc;
  flex: 1 1 250px;
  font-size: 0.95rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #1890ff;
    box-shadow: 0 0 8px rgba(24, 144, 255, 0.3);
  }
`;