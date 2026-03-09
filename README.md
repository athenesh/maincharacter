# MainCharacter - Life Story Platform

A beautiful AI-powered platform to capture, preserve, and share life stories. Interview people about their life experiences, visualize their journey, and generate compelling narratives.

## 🎯 What This Does

- **AI Conversational Interview**: Asks thoughtful questions about life events
- **Life Curve Visualization**: Auto-generates emotional journey graph based on ratings
- **Story Generation**: Transforms interviews into beautiful narrative chapters
- **Easy Sharing**: Shareable web pages for each life story

## 🚀 Setup Instructions

### Prerequisites

**IMPORTANT**: You need Node.js v20 or higher. To check your version:
```bash
node --version
```

If you're on v18, upgrade Node.js:
- **Mac**: Use [nvm](https://github.com/nvm-sh/nvm) or download from [nodejs.org](https://nodejs.org/)
- After upgrading, restart your terminal

### Installation

1. **Add your Gemini API key** to `.env.local`:
```bash
# Open the file and replace 'your_gemini_api_key_here' with your actual key
GEMINI_API_KEY=your_actual_key_here
```

2. **Install dependencies** (if not already done):
```bash
npm install
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open** [http://localhost:3000](http://localhost:3000)

## 📊 Database Setup

Already configured! Your Supabase database includes:
- ✅ Stories table
- ✅ Life events (for the curve)
- ✅ Interview responses
- ✅ Story chapters
- ✅ Photos
- ✅ Storage bucket: `story-photos`

## 🎨 How to Use

### Creating a Story

1. **Home Page**: Enter the person's name, your relationship, and birth year
2. **Interview**: AI asks ~16 questions across 4 life periods:
   - Childhood & Early Years (0-15)
   - Youth & Coming of Age (16-30)
   - Adulthood & Building Life (31-60)
   - Later Years & Wisdom (60+)
3. **Rate Each Answer**: 1-10 scale for emotional impact (builds the life curve)
4. **Generate Story**: Click to create narrative chapters
5. **Share**: Get a unique URL to share with family/friends

### For Your 20 Users

Since there's no auth yet, here's how to manage:

**Option A: Sit with them**
- Open the app on your device
- Create their story together
- Take screenshots or share the link immediately

**Option B: Send them the link**
- Share `http://localhost:3000` (if running locally)
- Or deploy to Vercel and share that URL
- Each person creates their own story

## 💰 Cost Estimation

For 20 complete stories:
- **Gemini API**: ~$1 total (Flash for interviews, Pro for generation)
- **Supabase**: Free tier (easily handles 20 users)
- **Total**: ~$1 🎉

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API (2.0 Flash + 1.5 Pro)
- **Charts**: Recharts
- **State**: React hooks + Zustand (if needed later)

## 📁 Project Structure

```
maincharacter/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── create/interview/           # AI interview page
│   ├── story/[id]/                 # View completed story
│   └── api/
│       ├── gemini/interview/       # Interview questions
│       └── story/                  # CRUD operations
├── components/
│   └── LifeCurve.tsx              # Life curve visualization
├── lib/
│   ├── supabase.ts                # Database client
│   └── gemini.ts                  # AI prompts & logic
└── types/
    └── index.ts                    # TypeScript definitions
```

## 🔮 Roadmap

### Phase 1 (Current - MVP)
- ✅ AI interview system
- ✅ Life curve visualization
- ✅ Story generation
- ✅ Shareable web pages

### Phase 2 (In Progress)
- 🔲 Clerk authentication
- ✅ Photo upload
- 🔲 AI cartoon generation (Korean webtoon style)
- 🔲 PDF export
- 🔲 Edit/refine stories

### Phase 3 (Future/Premium)
- 🔲 Voice recording + transcription
- 🔲 Multi-language support
- 🔲 Video compilation
- 🔲 Public gallery for inspiration

## 🐛 Troubleshooting

### "Node.js version required" error
- Upgrade to Node.js v20+
- Restart terminal after upgrading

### Supabase connection errors
- Check `.env.local` has correct credentials
- Verify Supabase project is active

### Gemini API errors
- Ensure API key is correct in `.env.local`
- Check you have Gemini API enabled in Google Cloud

### Interview not generating questions
- Open browser console (F12) to see errors
- Check API key is set
- Verify network requests in Network tab

## 📝 Notes for Your Grandma's Story

Special features to capture her experiences:
- Japanese colonial period context
- Korean War memories (age 9)
- Economic hardships
- Multiple life challenges

The AI will ask follow-up questions on high/low rated events (8+ or 3-) to capture depth.

## 💙 Built With Love

This project was built to preserve the incredible stories of people who've lived through extraordinary times. Your grandma's story will inspire many!

---

**Need help?** Check the console logs or reach out for support!
# maincharacter
