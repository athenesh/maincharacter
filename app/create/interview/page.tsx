'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LIFE_PERIODS } from '@/lib/gemini';

interface Message {
  type: 'question' | 'answer';
  text: string;
  questionNumber?: number;
}

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storyId = searchParams.get('storyId');
  
  const [characterName, setCharacterName] = useState('');
  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionsInPeriod, setQuestionsInPeriod] = useState(0);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!storyId) {
      router.push('/');
      return;
    }
    
    // Prevent double initialization in React Strict Mode
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      loadStoryAndStart();
    }
  }, [storyId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadStoryAndStart = async () => {
    try {
      const response = await fetch(`/api/story?id=${storyId}`);
      const { story } = await response.json();
      const name = story.main_character_name;
      setCharacterName(name);
      
      // Generate first question with the loaded name
      await generateNextQuestion(name);
    } catch (error) {
      console.error('Failed to load story:', error);
    }
  };

  const generateNextQuestion = async (nameOverride?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          action: 'generate_question',
          data: {
            characterName: nameOverride || characterName || 'the person',
            currentPeriod: LIFE_PERIODS[currentPeriodIndex].key,
            questionNumber
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(`API returned ${response.status}: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Question generated:', data);
      
      if (!data.question) {
        throw new Error('No question returned from API');
      }
      
      setMessages(prev => [...prev, { 
        type: 'question', 
        text: data.question,
        questionNumber 
      }]);
    } catch (error) {
      console.error('Failed to generate question:', error);
      // Show error to user
      alert(`Failed to generate question: ${error instanceof Error ? error.message : 'Unknown error'}. Please refresh the page and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim()) return;

    const lastQuestion = messages.filter(m => m.type === 'question').pop();
    if (!lastQuestion) return;

    // Add answer to messages
    setMessages(prev => [...prev, { 
      type: 'answer', 
      text: currentAnswer 
    }]);

    setIsLoading(true);

    try {
      // Save response to database
      const response = await fetch('/api/gemini/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyId,
          action: 'save_response',
          data: {
            questionNumber: lastQuestion.questionNumber,
            questionText: lastQuestion.text,
            answerText: currentAnswer,
            lifePeriod: LIFE_PERIODS[currentPeriodIndex].key,
            rating
          }
        })
      });

      const { needsFollowUp } = await response.json();

      // Clear input
      setCurrentAnswer('');
      setRating(5);
      setQuestionsInPeriod(prev => prev + 1);

      // Check if we should move to next period or continue
      const maxQuestionsPerPeriod = 4;
      
      if (questionsInPeriod >= maxQuestionsPerPeriod - 1) {
        // Move to next period
        if (currentPeriodIndex < LIFE_PERIODS.length - 1) {
          setCurrentPeriodIndex(prev => prev + 1);
          setQuestionsInPeriod(0);
          setQuestionNumber(prev => prev + 1);
          await generateNextQuestion();
        } else {
          // Interview complete - generate story
          await generateStory();
        }
      } else {
        // Continue in current period
        setQuestionNumber(prev => prev + 1);
        await generateNextQuestion();
      }
    } catch (error) {
      console.error('Failed to save answer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateStory = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          data: { storyId }
        })
      });

      const { storyUrl } = await response.json();
      router.push(storyUrl);
    } catch (error) {
      console.error('Failed to generate story:', error);
      alert('Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Story...</h2>
          <p className="text-gray-600">This may take a minute or two</p>
        </div>
      </div>
    );
  }

  const currentPeriod = LIFE_PERIODS[currentPeriodIndex];
  const progress = ((currentPeriodIndex * 4 + questionsInPeriod) / (LIFE_PERIODS.length * 4)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header with Progress */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold text-gray-900">
              Life Interview: {characterName}
            </h1>
            <span className="text-sm text-gray-600">
              {currentPeriod.label}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6 mb-32">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'question' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-2xl px-6 py-4 rounded-2xl ${
                  message.type === 'question'
                    ? 'bg-white shadow-sm'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {message.type === 'question' && (
                  <span className="text-xs text-gray-500 font-medium">
                    Question {message.questionNumber}
                  </span>
                )}
                <p className="mt-1">{message.text}</p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm px-6 py-4 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Answer Input (Fixed at bottom) */}
        {!isLoading && messages.length > 0 && messages[messages.length - 1].type === 'question' && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                {/* Rating Slider */}
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    Emotional Impact:
                  </label>
                  <div className="flex-1 flex items-center space-x-2">
                    <span className="text-xs text-gray-500">😢 Low</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-500">High 🎉</span>
                    <span className="text-lg font-bold text-blue-600 w-8">
                      {rating}
                    </span>
                  </div>
                </div>

                {/* Answer Text */}
                <div className="flex space-x-2">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Share your story..."
                    rows={3}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!currentAnswer.trim()}
                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
