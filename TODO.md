# TODO List - MainCharacter Project

## 🚨 Immediate Action Items

### 1. ⚠️ Set Up Supabase Storage Bucket
**Status**: REQUIRED before photos work  
**Time**: 5 minutes  
**Steps**:
1. Go to https://supabase.com/dashboard
2. Open project: khlsggafheknjcnvompo
3. Click "SQL Editor"
4. Run the SQL in SETUP_GUIDE.md (lines 93-111)
5. Verify bucket exists in Storage section

### 2. 🔧 Fix Gemini API Model Names
**Status**: Currently broken (404 errors)  
**Time**: 5 minutes  
**Issue**: Using `gemini-pro` which doesn't exist in v1beta API

**Fix** in `/lib/gemini.ts`:
```typescript
// OLD (broken):
export const flashModel = genAI.getGenerativeModel({ 
  model: 'gemini-pro'
});

// NEW (working):
export const flashModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash'
});

export const proModel = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro'
});
```

### 3. 🧪 Test Photo Upload
**Status**: Ready to test after items #1 and #2  
**Steps**:
1. Run `npm run dev`
2. Create a test story
3. Go to story page
4. Click "+ Add Photos"
5. Upload a test image
6. Verify it appears in gallery
7. Try deleting

---

## 🎨 Phase 2: Korean Webtoon AI Cartoonization

### Priority: HIGH
**Goal**: Convert uploaded photos to Korean webtoon-style cartoon illustrations

### Implementation Options:

#### Option A: Google Imagen (Recommended)
**Pros**:
- Already using Google Gemini
- High quality
- Good API integration
- Single vendor

**Cons**:
- More expensive (~$0.02-0.04 per image)
- Requires Imagen API access

**Implementation**:
```typescript
// Add to lib/gemini.ts
import { GoogleAIFileManager } from "@google/generative-ai/server";

export async function cartoonizePhoto(
  photoPath: string,
  characterName: string
): Promise<string> {
  const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
  
  // Upload file
  const uploadResult = await fileManager.uploadFile(photoPath, {
    mimeType: "image/jpeg",
    displayName: characterName,
  });

  const imagenModel = genAI.getGenerativeModel({ 
    model: "imagen-3.0-generate-001" 
  });

  const prompt = `Transform this portrait into a Korean webtoon character illustration. 
  Style: clean smooth linework, soft gradient shading, realistic proportions, 
  expressive eyes, detailed flowing hair, warm pastel colors, professional digital 
  art quality similar to Korean webtoons like True Beauty or Yumi's Cells. 
  Maintain the person's distinctive facial features.`;

  const result = await imagenModel.generateContent([
    prompt,
    {
      fileData: {
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType,
      }
    }
  ]);

  // Save generated image to storage
  // Return new photo URL
}
```

#### Option B: Stability AI
**Pros**:
- Very cheap (~$0.003 per image)
- Excellent quality
- Good documentation

**Cons**:
- Need separate API key
- Another vendor to manage

**Setup**:
1. Sign up at https://platform.stability.ai/
2. Get API key
3. Add to `.env.local`: `STABILITY_API_KEY=...`

**Implementation**:
```typescript
export async function cartoonizePhoto(
  imageBase64: string,
  characterName: string
): Promise<string> {
  const response = await fetch(
    "https://api.stability.ai/v2beta/stable-image/control/structure",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.STABILITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageBase64,
        control_strength: 0.7,
        prompt: "Korean webtoon style portrait, clean linework, soft gradient shading, realistic proportions, expressive eyes, detailed hair, warm pastel colors, professional digital illustration",
        negative_prompt: "anime, manga, low quality, blurry",
        output_format: "png",
      }),
    }
  );

  const data = await response.json();
  return data.image; // Base64 image
}
```

#### Option C: Replicate
**Pros**:
- Easy to use
- Many models to choose from
- Pay-per-use

**Cons**:
- Need API key
- Model selection can be overwhelming

**Popular Models**:
- `stability-ai/sdxl` - General purpose
- `tencentarc/photomaker` - Consistent character style
- Custom anime/webtoon models

### UI Flow for Cartoonization:

1. **Add "Cartoonize" button** to each photo in gallery
2. **Click button** → Show loading spinner
3. **API processes** (10-30 seconds)
4. **Save result** as new photo with `is_ai_generated: true`
5. **Display side-by-side** with original

### Files to Modify:

1. **`/lib/cartoonize.ts`** (new file)
   - API integration for chosen service
   - Image processing logic
   - Error handling

2. **`/app/api/photos/route.ts`**
   - Add POST endpoint for cartoonization
   - Handle AI generation flow

3. **`/components/PhotoGallery.tsx`**
   - Add "Cartoonize" button
   - Show loading state
   - Display both versions

4. **Database**:
   - Already has `is_ai_generated` field ✓
   - Already has `generation_prompt` field ✓

### Cost Estimate (for 20 users, 5 photos each):

| Service | Cost per Image | 100 Images Total |
|---------|---------------|------------------|
| Google Imagen | $0.02-0.04 | $2-4 |
| Stability AI | $0.003 | $0.30 |
| Replicate | $0.005-0.01 | $0.50-1.00 |

**Recommendation**: Start with Stability AI (cheapest), can switch to Imagen later

---

## 📋 Phase 3: Additional Features

### Photo Features:
- [ ] Add photo captions/descriptions
- [ ] Bulk upload (multiple photos at once)
- [ ] Photo categories (childhood, youth, adulthood, etc.)
- [ ] Link photos to specific life events
- [ ] Photo carousel/slideshow mode
- [ ] Drag-and-drop reordering
- [ ] Image cropping tool
- [ ] Filters (black & white, sepia, etc.)

### Story Features:
- [ ] Edit story chapters after generation
- [ ] Add custom chapters
- [ ] Chapter reordering
- [ ] Export to PDF
- [ ] Print-ready formatting
- [ ] Multiple themes/templates
- [ ] Add music/audio clips
- [ ] Video compilation

### Interview Features:
- [ ] Save interview progress (draft mode)
- [ ] Skip questions
- [ ] Add follow-up questions manually
- [ ] Voice recording + transcription
- [ ] Multi-language support
- [ ] Custom question sets
- [ ] Interview templates (military, immigration, career, etc.)

### Authentication (Clerk):
- [ ] Sign up/login
- [ ] User dashboard
- [ ] My stories list
- [ ] Privacy controls (public/private)
- [ ] Collaboration (multiple people editing)
- [ ] Comments on stories

### Social Features:
- [ ] Public gallery of stories
- [ ] Featured stories
- [ ] Search/discover
- [ ] Share to social media
- [ ] Embed stories on other sites
- [ ] QR code generation

### Premium Features:
- [ ] Unlimited stories (free tier: 3 stories)
- [ ] Professional templates
- [ ] Priority AI generation
- [ ] Custom branding
- [ ] Advanced analytics
- [ ] White-label option

---

## 🎯 Recommended Sequence

### Week 1 (MVP Complete):
1. ✅ Photo upload (DONE)
2. ⚠️ Fix Gemini API
3. ⚠️ Set up storage bucket
4. 🧪 Test everything

### Week 2 (AI Features):
1. Choose AI service (Stability AI recommended)
2. Implement cartoonization
3. Test with various photos
4. Refine Korean webtoon prompt

### Week 3 (Polish):
1. Add photo captions
2. Link photos to life events
3. Improve error handling
4. Add loading animations

### Week 4 (Launch Prep):
1. Deploy to Vercel
2. Test with real users
3. Gather feedback
4. Fix bugs

### Week 5+ (Enhancements):
1. Add authentication (Clerk)
2. User dashboards
3. Edit functionality
4. PDF export
5. Premium features

---

## 🐛 Known Issues

### High Priority:
- ⚠️ **Gemini API 404 errors** - Need to update model names
- ⚠️ **Storage bucket not set up** - Required for photos

### Medium Priority:
- ⚠️ **Node.js version warning** - Upgrade to v20+
- 📱 Mobile responsiveness could be improved
- 🎨 Font loading error (Geist) - but falls back to Inter

### Low Priority:
- No error recovery if interview is interrupted
- Can't edit stories after generation
- No way to delete a story
- No user authentication

---

## 💡 Ideas for Future

### AI Enhancements:
- Generate photos from descriptions (if no photos available)
- Animate photos (talking photos)
- Age progression/regression
- Colorize black & white photos
- Remove photo backgrounds
- Enhance low-quality photos

### Storytelling:
- Audio narration (text-to-speech)
- Multiple narrative voices
- Different writing styles (formal, casual, poetic)
- Timeline view
- Interactive life map

### Sharing:
- Create memorial pages
- Family tree integration
- Collaborative stories (multiple family members contribute)
- Physical book printing service
- Video slideshows with music

### Monetization:
- Free tier: 3 stories, basic features
- Pro tier ($9.99/mo): Unlimited stories, AI cartoons, PDF export
- Premium tier ($19.99/mo): All features, priority support, custom branding
- Enterprise: White-label, API access, custom integration

---

## 📊 Progress Tracker

### Phase 1 - MVP: 95% Complete ✅
- [x] Landing page
- [x] Story creation form
- [x] AI interview system
- [x] Life curve visualization
- [x] Story generation
- [x] Shareable pages
- [x] Photo upload
- [ ] Fix API issues
- [ ] Set up storage

### Phase 2 - Enhancements: 10% Complete 🚧
- [x] Photo upload
- [ ] AI cartoonization
- [ ] Photo captions
- [ ] PDF export
- [ ] Edit stories

### Phase 3 - Growth: 0% Complete 📋
- [ ] Authentication
- [ ] User dashboard
- [ ] Public gallery
- [ ] Premium features

---

**Next Steps**: Fix the Gemini API and set up Supabase storage, then test photo upload! 🚀
