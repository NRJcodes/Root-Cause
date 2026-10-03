import React, { useState } from 'react';
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { InvestigationSession, ClarifyingQuestion } from '../../types';

interface Stage2ClarifyingProps {
  session: InvestigationSession;
  onUpdateClarifying: (questions: ClarifyingQuestion[], isSubmitted: boolean) => void;
  onProceedToInvestigation: () => void;
  isLoadingInvestigation: boolean;
  onRegenerateQuestions: () => void;
  isRegenerating: boolean;
  onBackToIntake: () => void;
}

export const Stage2Clarifying: React.FC<Stage2ClarifyingProps> = ({
  session,
  onUpdateClarifying,
  onProceedToInvestigation,
  isLoadingInvestigation,
  onRegenerateQuestions,
  isRegenerating,
  onBackToIntake,
}) => {
  const [questions, setQuestions] = useState<ClarifyingQuestion[]>(
    session.clarifying.questions || []
  );

  const handleAnswerChange = (index: number, newAnswer: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], answer: newAnswer };
    setQuestions(updated);
    onUpdateClarifying(updated, false);
  };

  const answeredCount = questions.filter((q) => q.answer && q.answer.trim().length > 0).length;
  const canProceed = questions.length > 0 && answeredCount > 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Stage 2 of 6
              </span>
              <span className="text-xs text-slate-500 font-medium">Empirical Fact Verification</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Clarifying Questions & Factual Boundaries
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Before jumping to conclusions, the AI diagnostic engine requires specific operational context on timeline, recent system adjustments, and prior interventions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRegenerateQuestions}
              disabled={isRegenerating}
              className="text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 font-medium px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
              title="Formulate a fresh set of questions from intake"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>{isRegenerating ? 'Refreshing...' : 'Re-ask Questions'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Intake Context Recap Panel */}
      <div className="mb-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Problem Under Investigation ({session.intake.category || 'General'}):</span>
          </div>
          <button
            onClick={onBackToIntake}
            className="text-indigo-600 hover:text-indigo-800 font-medium text-xs hover:underline"
          >
            Edit Intake
          </button>
        </div>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
          "{session.intake.description}"
        </p>
        {session.intake.documents && session.intake.documents.length > 0 && (
          <div className="mt-2 text-[11px] text-slate-500">
            Attached Evidence: {session.intake.documents.map((d) => d.name).join(', ')}
          </div>
        )}
      </div>

      {/* Q&A Form */}
      <div className="space-y-5">
        {questions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900">Formulating Diagnostic Questions...</h3>
            <p className="text-xs text-slate-500 mt-1">Analyzing intake text and supporting documents.</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id || `q_${idx}`}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 transition hover:border-slate-300"
            >
              {/* Question metadata header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded">
                    {q.focusArea || 'Investigation Domain'}
                  </span>
                </div>

                {q.answer && q.answer.trim().length > 0 ? (
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Answered
                  </span>
                ) : (
                  <span className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Awaiting Input
                  </span>
                )}
              </div>

              {/* The Question */}
              <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1">
                {q.question}
              </h3>

              {/* Analytical Rationale */}
              <p className="text-xs text-slate-500 mb-3 flex items-start gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-700">Diagnostic Rationale:</strong> {q.rationale}
                </span>
              </p>

              {/* Operator Answer Input */}
              <div>
                <textarea
                  rows={3}
                  value={q.answer || ''}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder="Provide observed dates, shift numbers, specific telemetry figures, or past containment attempts..."
                  className="w-full text-xs text-slate-900 border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed"
                />
              </div>
            </div>
          ))
        )}

        {/* Progress & Navigation Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={onBackToIntake}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Intake</span>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">
              {answeredCount} of {questions.length} questions answered
            </span>

            <button
              type="button"
              disabled={!canProceed || isLoadingInvestigation}
              onClick={() => {
                onUpdateClarifying(questions, true);
                onProceedToInvestigation();
              }}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition ${
                canProceed && !isLoadingInvestigation
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer hover:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoadingInvestigation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Root Cause Tree...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Stage 3: Root-Cause Investigation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
