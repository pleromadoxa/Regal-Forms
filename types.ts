
export interface LogicRule {
  fieldId: string;
  condition: 'equals' | 'not_equals' | 'contains';
  value: string;
  action: 'show' | 'hide';
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'phone' | 'file' | 'image';
  placeholder?: string;
  helperText?: string;
  options?: string[];
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  logic?: LogicRule[];
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
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}