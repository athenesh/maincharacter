# Quick Setup Guide - MainCharacter

## ⚠️ Important: Node.js Version Issue

Your current Node.js version is **18.20.8**, but Next.js 15 requires **v20.9.0 or higher**.

## 🔧 Fix This First

### Option 1: Using NVM (Recommended)

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart your terminal, then:
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version  # Should show v20.x.x
```

### Option 2: Direct Install

1. Go to https://nodejs.org/
2. Download **LTS version** (v20.x.x or v22.x.x)
3. Install it
4. **Restart your terminal**
5. Verify: `node --version`

## 📝 After Node.js Upgrade

### 1. Add Your Gemini API Key

Open `.env.local` and replace the placeholder:

```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

Get your key from: https://aistudio.google.com/app/apikey

### 2. Run the Dev Server

```bash
cd /Users/seolhwaoh/Desktop/maincharacter
npm run dev
```

### 3. Open Your Browser

Visit: http://localhost:3000

## ✅ You're Ready!

Your app is now running. You should see:
- Beautiful landing page
- Form to create a new story
- Click "Begin Interview" to start

## 🧪 Test Flow

1. **Create a story**:
   - Name: "Test Person"
   - Relationship: "Friend"
   - Birth year: 1950

2. **Answer interview questions**:
   - AI will ask about childhood, youth, adulthood, later years
   - Rate each answer 1-10 for emotional impact
   - This builds the life curve

3. **Generate story**:
   - After ~16 questions, story generates automatically
   - You'll see the life curve + narrative chapters

4. **Share**:
   - Copy the URL and share with others

## 🎯 For Your 20 Users

### If Running Locally

**Pros**: Free, immediate
**Cons**: Only works when your computer is on

Share: `http://localhost:3000`

### If Deploying (Recommended)

**Deploy to Vercel** (free):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts, add environment variables when asked:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - GEMINI_API_KEY
```

You'll get a URL like: `https://maincharacter-xyz.vercel.app`

Share this URL with your 20 users!

## 📊 Database Access

Your Supabase dashboard: https://supabase.com/dashboard

To view created stories:
1. Go to your project
2. Click "Table Editor"
3. Select "stories" table
4. See all created stories

## 🐛 Common Issues

### "Port 3000 already in use"
```bash
# Kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Gemini API not working
- Check console for errors (F12 in browser)
- Verify API key in `.env.local`
- Make sure Gemini API is enabled in Google Cloud Console

### Supabase connection issues
- Check project is not paused (free tier pauses after inactivity)
- Verify URL and keys in `.env.local`

## 💡 Tips

1. **Save often**: Browser might refresh, losing progress
2. **Short answers**: AI works better with 2-3 sentence responses
3. **Honest ratings**: The life curve is more meaningful with authentic ratings
4. **Historical context**: Mention years/events (Korean War, etc.) for richer stories

## 🎨 Customization Ideas

Want to modify the interview?

Edit `/lib/gemini.ts`:
- Change number of questions per period
- Adjust life periods (currently 4)
- Modify AI prompts for different tone

## 🚀 Next Steps After Testing

1. ✅ Test with your own info first
2. ✅ Create your grandma's story
3. ✅ Share with family to review
4. ✅ Deploy to Vercel for others
5. ✅ Send link to your 20 users

## 📞 Need Help?

If something doesn't work:
1. Check browser console (F12 → Console tab)
2. Check terminal for error messages
3. Verify all environment variables are set
4. Make sure Supabase project is active

---

**You're all set! Upgrade Node.js and you're ready to go!** 🎉
