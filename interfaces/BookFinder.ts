// Define the form data structure
export interface FormData {
  genre: string;
  format: string;
  is_free: boolean;
  min_page_count: number;
  max_page_count?: number;
  author: string;
  language: string;
}

// Define the quiz question structure
export interface QuizQuestion {
  name: keyof FormData;
  label: string;
  inputType: "input" | "select" | "checkbox";
  dataType?: string;
  min?: number | null;
  max?: number | null;
  options?: { label: string; value: string | number }[];
}
