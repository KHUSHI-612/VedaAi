import Groq from 'groq-sdk';
import { IAssessmentResult } from '../models/Assessment';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface GenerateAssessmentInput {
  title: string;
  subject: string;
  className: string;
  questionTypes: string[];
  numQuestions: number;
  marksPerQuestion?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions?: string;
}

/**
 * Generates a structured assessment using Groq API and llama-3.3-70b-versatile in JSON mode.
 *converts it into a strongly typed IAssessmentResult containing sections and questions.
 */
export const generateAssessment = async (input: GenerateAssessmentInput): Promise<IAssessmentResult> => {
  const {
    title,
    subject,
    className,
    questionTypes,
    numQuestions,
    marksPerQuestion,
    difficulty,
    instructions,
  } = input;

  const prompt = `
You are an expert curriculum developer and academic educator. Your task is to generate a comprehensive, highly rigorous, and structured question paper (assessment) for students based on the following criteria:

- **Assessment Title**: ${title}
- **Subject**: ${subject}
- **Target Class/Grade**: ${className}
- **Types of Questions to Include**: ${questionTypes.join(', ')}
- **Total Number of Questions**: ${numQuestions}
${marksPerQuestion ? `- **Standard Marks per Question**: ${marksPerQuestion}` : ''}
- **Overall Difficulty Level**: ${difficulty} (Ensure the ratio of questions matches this target: 'easy' questions should be simple, 'medium' should require conceptual clarity, and 'hard' should require critical thinking/analytical application.)
${instructions ? `- **Additional Instructions**: ${instructions}` : ''}

### Response Requirements:
You must output a single JSON object. The JSON object must strictly conform to the following schema:

{
  "sections": [
    {
      "name": "Section A",
      "instructions": "Instructions for Section A...",
      "questions": [
        {
          "text": "Question text...",
          "options": ["Option A", "Option B", "Option C", "Option D"], // Only include for multiple choice question types
          "correctAnswer": "Option A", // Include correct answer for questions where applicable
          "marks": 5, // Marks for this question
          "difficulty": "easy" // 'easy', 'medium', or 'hard'
        }
      ]
    }
  ]
}

Ensure that:
1. The total number of questions across all sections matches exactly ${numQuestions}.
2. Sections are logically separated (e.g. Section A: Multiple Choice Questions, Section B: Short Answer Questions, Section C: Long Answer / Subjective Questions) depending on the requested questionTypes.
3. Every question has a clear, realistic difficulty level ('easy', 'medium', or 'hard') and a logical mark weight.
4. The questions are highly academic, realistic, and completely free of placeholders.
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an educational assistant that strictly outputs valid JSON matching the specified schemas.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Groq returned an empty response.');
    }

    const parsedResult: IAssessmentResult = JSON.parse(content);
    
    // Basic structural verification
    if (!parsedResult.sections || !Array.isArray(parsedResult.sections)) {
      throw new Error('Invalid response structure: missing sections array.');
    }

    return parsedResult;
  } catch (error) {
    console.error('Error generating assessment via Groq:', error);
    throw error;
  }
};
