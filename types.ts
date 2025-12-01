
export enum PlanType {
  LANDING = 'LANDING',
  CMS = 'CMS',
  SAAS = 'SAAS',
  AUTOMATION = 'AUTOMATION'
}

export interface ServicePlan {
  id: PlanType;
  title: string;
  price: string;
  description: string;
  features: string[];
}

export interface FormData {
  selectedPlan: PlanType | null;
  brandColors: {
    primary: string;
    secondary: string;
  };
  typography: string;
  businessName: string;
  businessDescription: string;
  email: string;
  phone: string;
  industry: string;
  logoFile?: File[] | null;
  contentFile?: File | null;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
}
