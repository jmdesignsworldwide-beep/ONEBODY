// Tipos enfocados de la base para las lecturas públicas del landing.
// El esquema completo tipado se genera en tandas de admin; aquí basta con lo
// que consume la superficie pública.

export type ProjectStatus =
  | "draft"
  | "active"
  | "funded"
  | "completed"
  | "archived";

export type DonationStatus = "pending" | "completed" | "failed" | "refunded";

export type ProjectCategory =
  | "vivienda"
  | "alimentacion"
  | "educacion"
  | "maternidad"
  | "adiccion"
  | "emergencia"
  | "salud"
  | "general";

export type PublicStats = {
  total_raised_usd: number;
  donation_count: number;
  donor_count: number;
  country_count: number;
  active_projects: number;
  completed_projects: number;
  updated_at: string;
};

export type WallEntry = {
  id: string;
  display_name: string;
  amount_usd: number;
  project_id: string | null;
  project_title: string | null;
  message: string | null;
  country_code: string | null;
  created_at: string;
};

export type FeaturedProject = {
  id: string;
  slug: string;
  title_es: string;
  summary_es: string;
  goal_amount: number;
  raised_amount: number;
  currency: string;
  category: ProjectCategory;
  cover_image: string | null;
  location_name: string | null;
};

export type ProjectFull = FeaturedProject & {
  story_es: string;
  status: ProjectStatus;
  deadline: string | null;
};

export type BudgetItem = {
  id: string;
  label_es: string;
  amount: number;
  sort_order: number;
};

export type ProjectUpdate = {
  id: string;
  title_es: string;
  body_es: string;
  images: string[];
  published_at: string | null;
};
