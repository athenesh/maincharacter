import { NextRequest, NextResponse } from 'next/server';
import { supabase, generateAccessCode } from '@/lib/supabase';
import { generateStoryChapter, LIFE_PERIODS } from '@/lib/gemini';

// Create new story
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
      const { mainCharacterName, relationship, birthYear } = body.data;

      const { data: story, error } = await supabase
        .from('stories')
        .insert({
          main_character_name: mainCharacterName,
          relationship,
          birth_year: birthYear,
          status: 'draft',
          current_step: 0,
          access_code: generateAccessCode()
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ story });
    }

    if (action === 'generate') {
      // Generate complete story from interview responses
      const { storyId } = body.data;

      // Update status
      await supabase
        .from('stories')
        .update({ status: 'generating' })
        .eq('id', storyId);

      // Get story info
      const { data: story } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (!story) throw new Error('Story not found');

      // Generate chapter for each life period
      const chapters = [];
      let chapterNumber = 1;

      for (const period of LIFE_PERIODS) {
        // Get all responses for this period
        const { data: responses } = await supabase
          .from('interview_responses')
          .select('question_text, answer_text')
          .eq('story_id', storyId)
          .eq('life_period', period.key)
          .order('question_number', { ascending: true });

        if (responses && responses.length > 0) {
          // Get ratings for this period
          const { data: events } = await supabase
            .from('life_events')
            .select('emotional_rating, event_title')
            .eq('story_id', storyId)
            .eq('life_period', period.key);

          const responsesWithRatings = responses.map((r, idx) => {
            const matchingEvent = events?.find(e => e.event_title === r.question_text);
            return {
              question: r.question_text,
              answer: r.answer_text || '',
              rating: matchingEvent?.emotional_rating
            };
          });

          // Generate chapter
          const content = await generateStoryChapter(
            story.main_character_name,
            period.label,
            responsesWithRatings
          );

          // Save chapter
          const { data: chapter } = await supabase
            .from('story_chapters')
            .insert({
              story_id: storyId,
              chapter_number: chapterNumber,
              chapter_title: period.label,
              life_period: period.key,
              content,
              age_range: period.ageRange,
              ai_generated: true
            })
            .select()
            .single();

          chapters.push(chapter);
          chapterNumber++;
        }
      }

      // Update story status
      await supabase
        .from('stories')
        .update({ 
          status: 'completed',
          final_story_generated: true,
          story_title: `The Life Story of ${story.main_character_name}`
        })
        .eq('id', storyId);

      return NextResponse.json({ 
        success: true, 
        chapters,
        storyUrl: `/story/${storyId}`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Story API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Get story by ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
    }

    // Get story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Get chapters
    const { data: chapters } = await supabase
      .from('story_chapters')
      .select('*')
      .eq('story_id', id)
      .order('chapter_number', { ascending: true });

    // Get life events for curve
    const { data: events } = await supabase
      .from('life_events')
      .select('*')
      .eq('story_id', id)
      .order('sequence_order', { ascending: true });

    // Get photos
    const { data: photos } = await supabase
      .from('photos')
      .select('*')
      .eq('story_id', id)
      .order('sequence_order', { ascending: true });

    return NextResponse.json({ 
      story,
      chapters: chapters || [],
      events: events || [],
      photos: photos || []
    });
  } catch (error) {
    console.error('Get story error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}
