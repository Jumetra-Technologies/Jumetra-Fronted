export const THEMES = [
  "light",
  "dark",
  "light-contrast",
  "dark-contrast",
  "blue",
  "red",
  "green",
] as const;

export type Theme = (typeof THEMES)[number];

export type ThemeOption = {
  id: Theme;
  label: string;
  description: string;
  /** [sidebar, canvas, accent] preview chips */
  swatch: [string, string, string];
};

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    label: "Light",
    description: "Soft grey chrome, white canvas",
    swatch: ["#f2f2f2", "#ffffff", "#525252"],
  },
  {
    id: "dark",
    label: "Dark",
    description: "Soft charcoal chrome, deep canvas",
    swatch: ["#1c1c1c", "#0a0a0a", "#a3a3a3"],
  },
  {
    id: "light-contrast",
    label: "Light contrast",
    description: "Pale chrome, white canvas, max contrast",
    swatch: ["#f5f5f5", "#ffffff", "#000000"],
  },
  {
    id: "dark-contrast",
    label: "Dark contrast",
    description: "Soft black chrome, pure black canvas",
    swatch: ["#141414", "#000000", "#ffffff"],
  },
  {
    id: "blue",
    label: "Blue",
    description: "Muted blue chrome, light blue canvas",
    swatch: ["#6b86b8", "#eff6ff", "#2563eb"],
  },
  {
    id: "red",
    label: "Red",
    description: "Muted red chrome, light red canvas",
    swatch: ["#a66b6b", "#fef2f2", "#dc2626"],
  },
  {
    id: "green",
    label: "Green",
    description: "Muted green chrome, light green canvas",
    swatch: ["#5f8a6d", "#f0fdf4", "#16a34a"],
  },
];

/** Themes that use Tailwind `dark:` helper styles. */
export const DARK_SURFACE_THEMES: ReadonlySet<Theme> = new Set([
  "dark",
  "dark-contrast",
]);

export function isTheme(value: string | null | undefined): value is Theme {
  return THEMES.includes(value as Theme);
}

export const DEFAULT_THEME: Theme = "light";
