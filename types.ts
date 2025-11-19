export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

export interface GeneratedForm {
  title: string;
  description: string;
  fields: FormField[];
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}