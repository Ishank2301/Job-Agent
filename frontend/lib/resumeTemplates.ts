/**
 * Resume template catalog. Each template is a styling config over a shared
 * renderer — layouts: classic | sidebar | banner | twin. `pro` templates are
 * gated by plan in the picker (stored in localStorage as ja_plan).
 */

export type TemplateLayout = "classic" | "sidebar" | "banner" | "twin";

export interface ResumeTemplate {
  id: string;
  name: string;
  category: string;
  layout: TemplateLayout;
  accent: string;
  font: "serif" | "sans" | "mono";
  headerAlign: "left" | "center";
  density: "cozy" | "compact";
  uppercaseHeadings: boolean;
  pro: boolean;
  blurb: string;
}

export const TEMPLATES: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    category: "ATS-First",
    layout: "classic",
    accent: "#0e7a5f",
    font: "serif",
    headerAlign: "left",
    density: "cozy",
    uppercaseHeadings: true,
    pro: false,
    blurb: "Single column, parser-perfect. The safest choice for big-company ATS.",
  },
  {
    id: "minimal",
    name: "Minimal",
    category: "ATS-First",
    layout: "classic",
    accent: "#1c1917",
    font: "sans",
    headerAlign: "left",
    density: "cozy",
    uppercaseHeadings: false,
    pro: false,
    blurb: "Clean sans-serif with generous air. Reads fast.",
  },
  {
    id: "compact",
    name: "Compact",
    category: "ATS-First",
    layout: "classic",
    accent: "#374151",
    font: "sans",
    headerAlign: "left",
    density: "compact",
    uppercaseHeadings: true,
    pro: false,
    blurb: "Fits a long career on one page. Small margins, tight leading.",
  },
  {
    id: "technical",
    name: "Technical",
    category: "ATS-First",
    layout: "classic",
    accent: "#0f766e",
    font: "mono",
    headerAlign: "left",
    density: "compact",
    uppercaseHeadings: true,
    pro: false,
    blurb: "Monospace accents and a skills grid for engineers.",
  },
  {
    id: "executive",
    name: "Executive",
    category: "Leadership",
    layout: "classic",
    accent: "#b45309",
    font: "serif",
    headerAlign: "center",
    density: "cozy",
    uppercaseHeadings: true,
    pro: true,
    blurb: "Centered serif presence for senior and leadership roles.",
  },
  {
    id: "boardroom",
    name: "Boardroom",
    category: "Leadership",
    layout: "banner",
    accent: "#78350f",
    font: "serif",
    headerAlign: "left",
    density: "cozy",
    uppercaseHeadings: true,
    pro: true,
    blurb: "Banner header with a summary strip — board-ready gravitas.",
  },
  {
    id: "sidebar",
    name: "Sidebar",
    category: "Modern",
    layout: "sidebar",
    accent: "#155e75",
    font: "sans",
    headerAlign: "left",
    density: "cozy",
    uppercaseHeadings: true,
    pro: true,
    blurb: "Two-column: skills and contact in a tinted sidebar.",
  },
  {
    id: "neon-stack",
    name: "Neon Stack",
    category: "Modern",
    layout: "sidebar",
    accent: "#6d28d9",
    font: "sans",
    headerAlign: "left",
    density: "compact",
    uppercaseHeadings: false,
    pro: true,
    blurb: "Violet sidebar for product and design roles.",
  },
  {
    id: "modern-bar",
    name: "Modern Bar",
    category: "Modern",
    layout: "banner",
    accent: "#0e7a5f",
    font: "sans",
    headerAlign: "left",
    density: "cozy",
    uppercaseHeadings: false,
    pro: true,
    blurb: "Full-width color header with contact chips.",
  },
  {
    id: "prism",
    name: "Prism",
    category: "Creative",
    layout: "banner",
    accent: "#be185d",
    font: "sans",
    headerAlign: "center",
    density: "cozy",
    uppercaseHeadings: false,
    pro: true,
    blurb: "Centered creative banner for portfolios and studios.",
  },
  {
    id: "twin",
    name: "Twin",
    category: "Creative",
    layout: "twin",
    accent: "#4338ca",
    font: "sans",
    headerAlign: "left",
    density: "compact",
    uppercaseHeadings: false,
    pro: true,
    blurb: "Asymmetric two-column with a bold name block.",
  },
  {
    id: "academic",
    name: "Academic",
    category: "Creative",
    layout: "classic",
    accent: "#1e3a5f",
    font: "serif",
    headerAlign: "center",
    density: "cozy",
    uppercaseHeadings: true,
    pro: true,
    blurb: "CV-style serif for research and academic applications.",
  },
];

export function getTemplate(id: string): ResumeTemplate {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
