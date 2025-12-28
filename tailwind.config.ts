import type { Config } from "tailwindcss";

const withOpacity = (variableName: string) => {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue === undefined) {
      return `rgb(var(${variableName}) / 1)`;
    }
    return `rgb(var(${variableName}) / ${opacityValue})`;
  };
};

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: withOpacity("--color-background") as any,
        surface: withOpacity("--color-surface") as any,
        muted: withOpacity("--color-muted") as any,
        border: withOpacity("--color-border") as any,
        foreground: withOpacity("--color-foreground") as any,
        primary: withOpacity("--color-primary") as any,
        "primary-foreground": withOpacity("--color-primary-foreground") as any,
        secondary: withOpacity("--color-secondary") as any,
        "secondary-foreground": withOpacity("--color-secondary-foreground") as any,
        accent: withOpacity("--color-accent") as any,
        success: withOpacity("--color-success") as any,
        warning: withOpacity("--color-warning") as any,
        danger: withOpacity("--color-danger") as any,
      },
      boxShadow: {
        card: "0 20px 45px rgb(var(--color-shadow) / 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;

