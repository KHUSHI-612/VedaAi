import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface AssessmentDataInput {
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
 * Builds the instruction prompt for Groq, defining target criteria and requested JSON structure.
 */
export const buildPrompt = (assessmentData: AssessmentDataInput): string => {
  const {
    title,
    subject,
    className,
    questionTypes,
    numQuestions,
    marksPerQuestion,
    difficulty,
    instructions,
  } = assessmentData;

  return `
You are an expert curriculum developer and academic educator. Your task is to generate a comprehensive, highly rigorous, and structured question paper (assessment) for students based on the following criteria:

- **Assessment Title**: ${title}
- **Subject**: ${subject}
- **Target Class/Grade**: ${className}
- **Types of Questions to Include**: ${questionTypes.join(', ')}
- **Total Number of Questions**: ${numQuestions}
${marksPerQuestion ? `- **Standard Marks per Question**: ${marksPerQuestion}` : ''}
- **Overall Difficulty Level**: ${difficulty}
${instructions ? `- **Additional Instructions**: ${instructions}` : ''}

### Response Requirements:
You must output a single JSON object. The JSON object must strictly conform to this structure:

{
  "sections": [
    {
      "title": "Section A",
      "type": "mcq", // e.g. mcq, short, long
      "instructions": "Choose correct option",
      "questions": [
        {
          "text": "Question text...",
          "difficulty": "easy", // 'easy', 'medium', or 'hard'
          "marks": 1,
          "options": ["A) opt1", "B) opt2", "C) opt3", "D) opt4"] // Only include options array for mcq types
        }
      ]
    }
  ]
}

Ensure that:
1. The total number of questions across all sections matches exactly ${numQuestions}.
2. Sections are logically separated depending on the requested questionTypes.
3. Every question is highly academic, clear, and completely free of placeholders.
`;
};

/**
 * Calls Groq API with llama-3.3-70b-versatile, forcing a structured JSON output,
 * and returns the parsed JSON matching the requested section-question schema.
 */
export const generateQuestions = async (assessmentData: AssessmentDataInput): Promise<any> => {
  const prompt = buildPrompt(assessmentData);

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

    const parsedResult = JSON.parse(content);
    
    // Basic verification on sections structure
    if (!parsedResult.sections || !Array.isArray(parsedResult.sections)) {
      throw new Error('Invalid response structure: missing sections array.');
    }

    return parsedResult;
  } catch (error) {
    console.error('Error generating assessment questions via Groq:', error);
    throw error;
  }
};
