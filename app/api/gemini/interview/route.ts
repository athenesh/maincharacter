import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestion, shouldAskFollowUp } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storyId, action, data } = body;

    if (action === 'generate_question') {
      // Generate next question
      const { characterName, currentPeriod, questionNumber } = data;

      // Get previous answers from this period
      const { data: previousResponses } = await supabase
        .from('interview_responses')
        .select('question_text, answer_text')
        .eq('story_id', storyId)
        .eq('life_period', currentPeriod)
        .order('question_number', { ascending: true });

      const previousAnswers = previousResponses?.map(r => ({
        question: r.question_text,
        answer: r.answer_text || ''
      })) || [];

      const question = await generateInterviewQuestion({
        characterName,
        currentPeriod,
        previousAnswers,
        questionNumber
      });

      return NextResponse.json({ question });
    }

    if (action === 'save_response') {
      // Save answer and determine if follow-up needed
      const { questionNumber, questionText, answerText, lifePeriod, rating } = data;

      // Save to database
      const { data: response, error } = await supabase
        .from('interview_responses')
        .insert({
          story_id: storyId,
          question_number: questionNumber,
          question_text: questionText,
          answer_text: answerText,
          life_period: lifePeriod,
          follow_up_question: false
        })
        .select()
        .single();

      if (error) throw error;

      // Save as life event if rating provided
      if (rating) {
        await supabase.from('life_events').insert({
          story_id: storyId,
          event_title: questionText,
          event_description: answerText,
          emotional_rating: rating,
          life_period: lifePeriod,
          sequence_order: questionNumber
        });
      }

      // Check if follow-up needed
      const followUp = await shouldAskFollowUp(questionText, answerText, rating);

      return NextResponse.json({ 
        success: true, 
        responseId: response.id,
        needsFollowUp: followUp.needsFollowUp,
        reason: followUp.reason
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Interview API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
