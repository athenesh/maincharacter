import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to generate unique access code
export function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Upload photo to Supabase storage
export async function uploadPhoto(file: File, storyId: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${storyId}/${Date.now()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('story-photos')
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('story-photos')
    .getPublicUrl(fileName);

  return {
    path: fileName,
    url: urlData.publicUrl
  };
}
