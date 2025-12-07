
export interface LogicRule {
  fieldId: string;
  condition: 'equals' | 'not_equals' | 'contains';
  value: string;
  action: 'show' | 'hide';
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  logo?: string;
  coverImage?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'phone' | 'country' | 'file' | 'image' | 'date' | 'time' | 'html' | 'quote' | 'youtube' | 'countdown' | 'url' | 'stripe' | 'paypal' | 'product' | 'rating' | 'slider' | 'signature';
  placeholder?: string;
  helperText?: string;
  options?: string[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  logic?: LogicRule[];
  
  // New properties for rich fields
  content?: string; // For HTML, Quote text
  author?: string; // For Quote author
  videoUrl?: string; // For Youtube
  targetDate?: string; // For Countdown
  showCountryCode?: boolean; // For Phone fields

  // Commerce & Advanced properties
  price?: number;
  currency?: string;
  productImage?: string;
  productDescription?: string;
  min?: number;
  max?: number;
  step?: number;
  
  // Payment Configurations
  apiKey?: string; // Stripe Publishable Key or PayPal Client ID
  paymentMethods?: string[]; // ['visa', 'mastercard', 'amex', 'paypal']
  environment?: 'sandbox' | 'live';
  
  // File Upload Configurations
  allowedFileTypes?: string[]; // ['.pdf', '.jpg', '.png']
  maxFileSizeMB?: number;
}

export interface FormStats {
    views: number;
    responses: number;
    completionRate: number;
    avgTime: string;
}

export interface GeneratedForm {
  title: string;
  description: string;
  submitButtonText?: string;
  successMessage?: string;
  slug?: string; // Custom URL slug
  ownerEmail?: string; // Email of the form creator for notifications
  
  // Design & Branding
  theme?: FormTheme;

  // Settings
  collectEmails?: boolean;
  limitOneResponse?: boolean;
  restrictToOrg?: boolean;
  allowResponseEditing?: boolean;
  showProgressBar?: boolean;
  shuffleQuestions?: boolean;
  collaborators?: string[];

  fields: FormField[];
  stats?: FormStats;
  status?: 'draft' | 'published' | 'completed';
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}