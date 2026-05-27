export interface Question {
  id: string
  text: string
  type: 'mcq' | 'short' | 'long' | 'diagram' | 'numerical'
  difficulty: 'easy' | 'medium' | 'hard'
  marks: number
  options?: string[]
}

export interface Section {
  title: string
  instructions: string
  questions: Question[]
}

export interface Assessment {
  _id: string
  title: string
  subject: string
  className: string
  dueDate: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result?: { sections: Section[] }
  createdAt: string
}

export interface UserProfile {
  name: string
  schoolName: string
  city: string
}
