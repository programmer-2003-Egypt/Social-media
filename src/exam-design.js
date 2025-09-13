// ui.js v3 ✨
import styled, { createGlobalStyle, css, keyframes } from "styled-components";
import { Button as MuiButton } from "@mui/material";

// 🎨 Theme Variables
export const Global = createGlobalStyle`
  :root {
    --bg-body: #0b1020;
    --bg-card: #0f1733;
    --bg-card-alt: #101936;
    --bg-input: #0b1330;
    --bg-progress: linear-gradient(90deg, #3b63ff, #14b86a);
    --bg-badge: #1a2452;
    --bg-error: #3b1630;
    --bg-success: #0f2f24;
    --bg-warning: #332a0f;

    --border: #2a335a;
    --border-light: #33407a;
    --border-dashed: #3a467d;

    --text-main: #e7ecff;
    --text-muted: #a9b4d6;
    --text-error: #ffd8e6;
    --text-success: #d3ffe8;
    --text-warning: #fff1c4;

    --shadow: 0 8px 28px rgba(0,0,0,.35);
    --radius: 16px;
  }

  * { box-sizing: border-box; }
  body { 
    margin: 0; 
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; 
    background: var(--bg-body); 
    color: var(--text-main); 
  }
  ::selection{ background:#5b8cff55; }
`;

// 🌈 Animations
const pulse = keyframes`
  0%, 100% { opacity: .9; }
  50% { opacity: .5; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
`;

const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const breathe = keyframes`
  0%, 100% { transform: scale(1); box-shadow: var(--shadow); }
  50% { transform: scale(1.02); box-shadow: 0 12px 40px rgba(0,0,0,.45); }
`;

// 🏠 Layout
export const Shell = styled.div`
  max-width: 1100px; 
  margin: 28px auto; 
  padding: 20px; 
`;

export const Flex = styled.div`
  display:flex; 
  align-items:center; 
  gap:${p => p.gap || 10}px; 
  flex-wrap: wrap;
  justify-content: ${p => p.between ? "space-between" : "flex-start"};
`;

// 📦 Cards
export const Card = styled.div`
  background: var(--bg-card); 
  border: 1px solid var(--border); 
  border-radius: var(--radius);
  box-shadow: var(--shadow); 
  padding: ${p => p.compact ? "16px" : "24px"};
  backdrop-filter: blur(12px);
  transition: 0.25s ease;
  animation: ${p => p.breathe && breathe} 5s ease-in-out infinite;

  ${p => p.hover && css`
    &:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,.4); }
  `}
`;

export const QCard = styled(Card)`
  border: 1px dashed var(--border-dashed);
  background: var(--bg-card-alt);
  margin-bottom: 16px;
`;

// 📝 Typography
export const Title = styled.h1`
  margin: 0 0 16px; 
  font-size: 24px; 
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: ${fadeSlide} 0.4s ease;
`;

export const Sub = styled.p`
  opacity: .85; 
  margin: 6px 0 14px;
`;

export const Muted = styled.span`
  opacity: .6; 
  font-size: 14px;
`;

// 🏷️ Badges
const badgeVariants = {
  default: css`background:var(--bg-badge); color:#cfe0ff;`,
  error: css`background:var(--bg-error); color:var(--text-error);`,
  success: css`background:var(--bg-success); color:var(--text-success);`,
  warning: css`background:var(--bg-warning); color:var(--text-warning);`,
};

export const Badge = styled.span`
  padding: 4px 10px; 
  border-radius: 999px; 
  font-size: 12px; 
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: 6px;
  ${({ variant }) => badgeVariants[variant || "default"]}
`;

// 🖊️ Inputs
export const Row = styled.div`
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 12px;
`;

export const Grid2 = styled(Row)`
  gap: 14px; 
  @media(max-width:860px){ grid-template-columns: 1fr; }
`;

export const Input = styled.input`
  width: 100%; 
  padding: 12px 14px; 
  border-radius: 12px; 
  border: 1px solid var(--border-light);
  background: var(--bg-input); 
  color: #fff; 
  outline: none; 
  transition: .2s;
  &:focus{ border-color:#6f8cff; box-shadow: 0 0 0 4px #6f8cff22; }
`;

// ✅ Button
export const Button = styled(MuiButton).attrs(({ variant }) => ({
  variant: variant || "contained"
}))`
  && {
    padding: 10px 16px;
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    background: linear-gradient(135deg, #3b63ff, #14b86a);
    border: 1px solid #4453a1;
    box-shadow: 0 3px 12px rgba(59,99,255,.3);
    transition: all 0.25s ease;
    animation: ${fadeSlide} 0.3s ease;

    &:hover { filter: brightness(1.1); box-shadow: 0 6px 16px rgba(59,99,255,.45); }
    &:disabled { opacity: .5; cursor: not-allowed; }

    ${p => p.danger && css`
      background: linear-gradient(135deg, #ff4c6a, #b8143f);
      border-color: #a82244;
    `}
    ${p => p.outline && css`
      background: transparent;
      color: var(--text-main);
      border: 1px solid var(--border-light);
    `}
  }
`;

// 🚨 Alerts
export const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin: 10px 0;
  background: #ffebee;         
  color: #b71c1c;              
  font-weight: bold;
  font-size: 0.95rem;
  border: 1px solid #f44336;   
  border-left: 5px solid #d32f2f; 
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease-in-out;
  animation: ${shake} 0.4s, ${pulse} 2s infinite;
`;

// ☑️ Options
export const Opt = styled.label`
  display: flex; 
  gap: 8px; 
  align-items: center; 
  padding: 10px 12px; 
  margin: 8px 0; 
  border-radius: 12px;
  border: 1px solid #2d396f; 
  cursor: pointer; 
  background: #0b1330; 
  user-select: none;
  transition: .2s;
  &:hover{ border-color:#6f8cff; background:#101940; }
  input{ transform: translateY(1px); }
`;

// 📊 Progress
export const BarWrap = styled.div`
  height: 12px; 
  background:#121a38; 
  border-radius:999px; 
  border:1px solid #2c3a6e; 
  overflow:hidden;
`;

export const Bar = styled.div`
  height:100%; 
  width:${p=>p.w||0}%; 
  background: var(--bg-progress);
  background-size: 200% 100%;
  animation: ${shimmer} ${p=>p.speed || 3}s linear infinite;
  transition:.4s ease;
`;
