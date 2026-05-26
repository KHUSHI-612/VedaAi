export interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Section {
  name: string; // Section A, B, C
  instructions: string;
  questions: Question[];
}

export interface Assessment {
  id: string;
  subject: string;
  classLevel: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  sections: Section[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}
