import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Use Gemini 2.5 Flash for quick interview questions
export const flashModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash'
});

// Use Gemini 2.5 Pro for final story generation (better quality)
export const proModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-pro'
});

// Optimized prompt templates to save tokens

export const INTERVIEW_SYSTEM_PROMPT = `You are a compassionate life story interviewer. Ask thoughtful questions to capture meaningful life events. Keep questions clear and specific. Focus on:
1. Major life events and their emotional impact
2. Challenges overcome
3. Moments of joy and growth
4. Wisdom gained

After each answer, determine if a follow-up question would add depth. Be concise.`;

export const STORY_GENERATION_PROMPT = `You are a skilled biographer. Transform interview responses into a compelling narrative chapter. 

Guidelines:
- Write in third person, past tense
- Capture emotional depth and historical context
- Show, don't tell - use specific details
- Keep paragraphs concise (3-4 sentences)
- Maintain chronological flow
- Honor the subject's voice and experiences

Chapter length: 300-500 words.`;

// Generate next interview question based on context
export async function generateInterviewQuestion(
  context: {
    characterName: string;
    currentPeriod: string;
    previousAnswers: Array<{ question: string; answer: string }>;
    questionNumber: number;
  }
): Promise<string> {
  const prompt = `${INTERVIEW_SYSTEM_PROMPT}

Character: ${context.characterName}
Life Period: ${context.currentPeriod}
Question #${context.questionNumber}

${context.previousAnswers.length > 0 ? `Previous Q&A:
${context.previousAnswers.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Based on the previous answer, ask ONE follow-up question that goes deeper OR move to a new significant topic in this life period.` : `Ask the first question about their ${context.currentPeriod}.`}

Return ONLY the question, no additional text.`;

  const result = await flashModel.generateContent(prompt);
  return result.response.text().trim();
}

// Generate story chapter from interview responses
export async function generateStoryChapter(
  characterName: string,
  lifePeriod: string,
  responses: Array<{ question: string; answer: string; rating?: number }>
): Promise<string> {
  const qaText = responses
    .map(r => `Q: ${r.question}\nA: ${r.answer}${r.rating ? ` (Emotional impact: ${r.rating}/10)` : ''}`)
    .join('\n\n');

  const prompt = `${STORY_GENERATION_PROMPT}

Subject: ${characterName}
Life Period: ${lifePeriod}

Interview Responses:
${qaText}

Write a compelling narrative chapter based on these responses.`;

  const result = await proModel.generateContent(prompt);
  return result.response.text().trim();
}

// Determine if follow-up question is needed
export async function shouldAskFollowUp(
  question: string,
  answer: string,
  rating?: number
): Promise<{ needsFollowUp: boolean; reason?: string }> {
  // High/low ratings indicate significant moments worth exploring
  if (rating && (rating >= 8 || rating <= 3)) {
    return { needsFollowUp: true, reason: 'significant_event' };
  }

  // Short answers might need elaboration
  if (answer.split(' ').length < 20) {
    return { needsFollowUp: true, reason: 'needs_detail' };
  }

  return { needsFollowUp: false };
}

// Life period definitions
export const LIFE_PERIODS = [
  { key: 'childhood', label: 'Childhood & Early Years', ageRange: '0-15' },
  { key: 'youth', label: 'Youth & Coming of Age', ageRange: '16-30' },
  { key: 'adulthood', label: 'Adulthood & Building Life', ageRange: '31-60' },
  { key: 'later_years', label: 'Later Years & Wisdom', ageRange: '60+' }
];
