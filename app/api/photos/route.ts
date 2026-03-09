import { NextRequest, NextResponse } from 'next/server';
import { supabase, uploadPhoto } from '@/lib/supabase';

// Upload photo
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const storyId = formData.get('storyId') as string;
    const isMainCharacter = formData.get('isMainCharacter') === 'true';
    const characterName = formData.get('characterName') as string || null;
    const approximateAge = formData.get('approximateAge') as string;

    if (!file || !storyId) {
      return NextResponse.json(
        { error: 'File and storyId are required' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const { path, url } = await uploadPhoto(file, storyId);

    // Get the next sequence order
    const { data: existingPhotos } = await supabase
      .from('photos')
      .select('sequence_order')
      .eq('story_id', storyId)
      .order('sequence_order', { ascending: false })
      .limit(1);

    const nextSequence = existingPhotos && existingPhotos.length > 0 
      ? (existingPhotos[0].sequence_order || 0) + 1 
      : 1;

    // Save photo metadata to database
    const { data: photo, error } = await supabase
      .from('photos')
      .insert({
        story_id: storyId,
        storage_path: path,
        display_url: url,
        is_main_character: isMainCharacter,
        character_name: characterName,
        approximate_age: approximateAge ? parseInt(approximateAge) : null,
        is_ai_generated: false,
        sequence_order: nextSequence
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, photo });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    );
  }
}

// Get photos for a story
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json(
        { error: 'storyId is required' },
        { status: 400 }
      );
    }

    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .eq('story_id', storyId)
      .order('sequence_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Get photos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}

// Delete photo
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get('photoId');

    if (!photoId) {
      return NextResponse.json(
        { error: 'photoId is required' },
        { status: 400 }
      );
    }

    // Get photo to get storage path
    const { data: photo } = await supabase
      .from('photos')
      .select('storage_path')
      .eq('id', photoId)
      .single();

    if (photo) {
      // Delete from storage
      await supabase.storage
        .from('story-photos')
        .remove([photo.storage_path]);
    }

    // Delete from database
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}
