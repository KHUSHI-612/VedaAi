import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ISection {
  name: string; // e.g. "Section A", "Section B"
  instructions?: string;
  questions: IQuestion[];
}

export interface IAssessmentResult {
  sections: ISection[];
}

export interface IAssessment extends Document {
  title: string;
  subject: string;
  className: string;
  dueDate?: Date;
  questionTypes: string[];
  numQuestions: number;
  marksPerQuestion?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions?: string;
  fileUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  result?: IAssessmentResult;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  options: { type: [String], default: undefined },
  correctAnswer: { type: String },
  marks: { type: Number, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
});

const SectionSchema = new Schema<ISection>({
  name: { type: String, required: true },
  instructions: { type: String },
  questions: { type: [QuestionSchema], required: true },
});

const AssessmentResultSchema = new Schema<IAssessmentResult>({
  sections: { type: [SectionSchema], required: true },
});

const AssessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    dueDate: { type: Date },
    questionTypes: { type: [String], required: true },
    numQuestions: { type: Number, required: true },
    marksPerQuestion: { type: Number },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    instructions: { type: String },
    fileUrl: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      required: true,
    },
    jobId: { type: String },
    result: { type: AssessmentResultSchema },
  },
  {
    timestamps: true,
  }
);

export const Assessment = mongoose.model<IAssessment>('Assessment', AssessmentSchema);
