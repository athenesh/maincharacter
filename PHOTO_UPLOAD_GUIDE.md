# Photo Upload Feature Guide

## ✅ Implemented Features

### 1. **Photo Upload API** (`/app/api/photos/route.ts`)
- **POST**: Upload photos with metadata
  - File upload to Supabase Storage
  - Save metadata to database (character name, age, etc.)
  - Support for sequencing photos
- **GET**: Fetch all photos for a story
- **DELETE**: Remove photos (from storage and database)

### 2. **PhotoUpload Component** (`/components/PhotoUpload.tsx`)
Features:
- Drag-and-drop style file picker
- Image preview before upload
- Metadata fields:
  - Mark if photo is of main character
  - Approximate age in photo
- File validation:
  - Image files only
  - Max 5MB file size
- Upload progress indicator
- Error handling

### 3. **PhotoGallery Component** (`/components/PhotoGallery.tsx`)
Features:
- Responsive grid layout (2-4 columns)
- Hover effects with photo info
- Click to open lightbox modal
- Full-screen photo viewing
- Photo metadata display (age, character name)
- Delete functionality (with confirmation)
- AI-generated badge support

### 4. **Story Page Integration** (`/app/story/[id]/page.tsx`)
- "+ Add Photos" button in header
- Photo gallery display above life curve
- Toggle upload form visibility
- Real-time photo list updates
- Editable mode with delete capability

## 📸 How to Use

### For Users:
1. **Navigate to a story page** (after completing interview)
2. **Click "+ Add Photos"** button in the header
3. **Select a photo** from your device
4. **Add metadata** (optional):
   - Check if it's the main character
   - Enter approximate age in photo
5. **Click "Upload Photo"**
6. Photo appears in the gallery immediately

### Viewing Photos:
- Photos display in a grid below the upload section
- Hover to see metadata
- Click any photo to view full-screen
- Click delete in full-screen view to remove (with confirmation)

## 🗄️ Database Structure

The `photos` table includes:
```typescript
{
  id: string
  created_at: timestamp
  story_id: string (foreign key)
  storage_path: string
  display_url: string
  is_main_character: boolean
  character_name: string
  approximate_age: number
  is_ai_generated: boolean
  generation_prompt: string (for future AI features)
  sequence_order: number
}
```

## 📦 Storage

Photos are stored in Supabase Storage:
- **Bucket**: `story-photos`
- **Path structure**: `{storyId}/{timestamp}.{ext}`
- **Public access**: Enabled for viewing

## ⚠️ Storage Bucket Setup Required

You need to ensure the Supabase storage bucket is set up correctly:

### Steps to Set Up Storage Bucket:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: khlsggafheknjcnvompo
3. **Navigate to Storage** (left sidebar)
4. **Create bucket if not exists**:
   - Name: `story-photos`
   - Public bucket: **YES** (so photos can be viewed)
5. **Set Storage Policies**:

#### Policy for Upload (Authenticated):
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow upload for authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'story-photos');

-- Allow public uploads (since you don't have auth yet)
CREATE POLICY "Allow upload for anyone"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'story-photos');
```

#### Policy for Read (Public):
```sql
-- Allow anyone to view photos
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'story-photos');
```

#### Policy for Delete (Public for now):
```sql
-- Allow anyone to delete (you can restrict this later with auth)
CREATE POLICY "Allow delete"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'story-photos');
```

### Quick Setup via Supabase SQL Editor:

```sql
-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-photos', 'story-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads (temporary, until auth is added)
CREATE POLICY "Public upload" ON storage.objects
  FOR INSERT TO public
  WITH CHECK (bucket_id = 'story-photos');

-- Allow public reads
CREATE POLICY "Public read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'story-photos');

-- Allow public deletes (temporary, until auth is added)
CREATE POLICY "Public delete" ON storage.objects
  FOR DELETE TO public
  USING (bucket_id = 'story-photos');
```

## 🚀 Next Steps (TODO)

### Phase 2: Korean Webtoon-Style AI Cartoonization

1. **Choose AI Service**:
   - Option A: Google Imagen (via Gemini)
   - Option B: Stability AI / Stable Diffusion
   - Option C: Leonardo.ai API
   - Option D: Replicate.com (various models)

2. **Implementation**:
   - Add "Cartoonize" button to each photo
   - Call AI service with Korean webtoon style prompt
   - Save AI-generated version as new photo (with `is_ai_generated: true`)
   - Display both original and cartoon side-by-side

3. **Prompt Engineering**:
   ```
   "Transform this portrait photo into a Korean webtoon character illustration. 
   Style: clean smooth linework, soft gradient shading, realistic proportions, 
   expressive eyes, detailed flowing hair, warm pastel colors, professional 
   digital art quality similar to popular Korean webtoons like True Beauty, 
   Yumi's Cells, or Lore Olympus. Maintain the person's distinctive facial 
   features and expressions."
   ```

### Phase 3: Enhancements

- [ ] Add photo captions/descriptions
- [ ] Photo categories (childhood, youth, adulthood, etc.)
- [ ] Link photos to specific life events
- [ ] Photo carousel/slideshow mode
- [ ] Bulk upload support
- [ ] Image editing (crop, rotate, filters)
- [ ] Print-ready photo book export

## 💡 Tips

1. **Image Quality**: Encourage users to upload high-resolution photos for better results
2. **File Names**: The system auto-generates unique filenames to prevent conflicts
3. **Order**: Photos are displayed in upload order (sequence_order field)
4. **Storage Costs**: 1GB free in Supabase, then $0.021/GB/month

## 🐛 Troubleshooting

### Upload Fails:
- Check Supabase storage bucket exists and is public
- Verify storage policies are set correctly
- Check file size (must be < 5MB)
- Ensure file is an image type

### Photos Don't Display:
- Check `display_url` is being returned correctly
- Verify storage bucket is set to public
- Check browser console for CORS errors

### Can't Delete Photos:
- Verify delete policy is set in Supabase Storage
- Check browser console for errors

---

**Status**: ✅ Photo upload feature is complete and ready to use!
**Next**: Set up Supabase storage bucket, then test the feature.
