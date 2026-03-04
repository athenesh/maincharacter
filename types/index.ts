// Database types matching Supabase schema

export interface Story {
  id: string;
  created_at: string;
  updated_at: string;
  main_character_name: string;
  relationship?: string;
  birth_year?: number;
  status: 'draft' | 'interviewing' | 'generating' | 'completed';
  current_step: number;
  access_code?: string;
  final_story_generated: boolean;
  story_title?: string;
}

export interface LifeEvent {
  id: string;
  created_at: string;
  story_id: string;
  age?: number;
  year?: number;
  event_title: string;
  event_description?: string;
  emotional_rating?: number; // 1-10
  sequence_order?: number;
  life_period?: 'childhood' | 'youth' | 'adulthood' | 'later_years';
}

export interface StoryChapter {
  id: string;
  created_at: string;
  story_id: string;
  chapter_number: number;
  chapter_title?: string;
  life_period?: string;
  content?: string;
  ai_generated: boolean;
  age_range?: string;
  token_count?: number;
}

export interface Photo {
  id: string;
  created_at: string;
  story_id: string;
  storage_path: string;
  display_url?: string;
  is_main_character: boolean;
  character_name?: string;
  approximate_age?: number;
  is_ai_generated: boolean;
  generation_prompt?: string;
  sequence_order?: number;
}

export interface InterviewResponse {
  id: string;
  created_at: string;
  story_id: string;
  question_number: number;
  question_text: string;
  answer_text?: string;
  life_period?: string;
  follow_up_question: boolean;
  tokens_used?: number;
}

// Frontend types
export interface InterviewQuestion {
  id: number;
  text: string;
  period?: string;
  isFollowUp?: boolean;
}

export interface InterviewAnswer {
  questionId: number;
  answer: string;
  rating?: number;
}

export interface LifeCurveDataPoint {
  age: number;
  rating: number;
  event: string;
}
