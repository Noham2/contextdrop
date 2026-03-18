"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ style }: { style?: React.CSSProperties }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      style={style}
      title={theme === "light" ? "Mode sombre" : "Mode clair"}
      aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
