import React, { useState } from 'react';
import { Star, CheckCircle2, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { InvestigationSession } from '../types';

interface RatingCardProps {
  session: InvestigationSession;
  onRatingSubmitted?: (rating: number, savedToKb: boolean) => void;
}

export const RatingCard: React.FC<RatingCardProps> = ({
  session,
  onRatingSubmitted,
}) => {
  const [currentRating, setCurrentRating] = useState<number>(session.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>(session.feedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavedToKb, setIsSavedToKb] = useState<boolean>(!!session.savedToKnowledgeBase);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRate = async (stars: number) => {
    setCurrentRating(stars);
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem('rootcause_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/sessions/${session.id}/rate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rating: stars, feedback }),
      });

      const data = await res.json();
      if (data.success) {
        setIsSavedToKb(data.savedToKnowledgeBase);
        if (data.savedToKnowledgeBase) {
          setStatusMessage('⭐ Saved to Institutional Knowledge Base! Future investigations with similar problems will cite this case pattern.');
        } else {
          setStatusMessage('Thank you for rating this investigation.');
        }
        if (onRatingSubmitted) {
          onRatingSubmitted(stars, data.savedToKnowledgeBase);
        }
      }
    } catch (err) {
      console.error('Rating submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Rate Investigation Quality
            </h3>
            {isSavedToKb && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Knowledge Base Verified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ratings of 4★ or higher automatically contribute verified root-cause patterns to the vector knowledge base.
          </p>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = (hoverRating || currentRating) >= star;
            return (
              <button
                key={star}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 rounded-md transition hover:scale-110 focus:outline-none"
                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    isFilled
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300 hover:text-slate-400'
                  }`}
                />
              </button>
            );
          })}
          {isSubmitting && (
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600 ml-2" />
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-lg text-xs text-indigo-900 flex items-start gap-2 animate-in fade-in duration-150">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
