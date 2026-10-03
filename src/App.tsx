/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StageIndicator } from './components/StageIndicator';
import { Stage1Intake } from './components/stages/Stage1Intake';
import { Stage2Clarifying } from './components/stages/Stage2Clarifying';
import { Stage3Investigation } from './components/stages/Stage3Investigation';
import { Stage4Solutions } from './components/stages/Stage4Solutions';
import { Stage5Recommendation } from './components/stages/Stage5Recommendation';
import { Stage6Export } from './components/stages/Stage6Export';
import { AuthModal } from './components/AuthModal';
import { SessionsDrawer } from './components/SessionsDrawer';
import { InvestigationSession, User, ClarifyingQuestion } from './types';
import { SAMPLE_BENCHMARKS } from './utils/sampleData';
import { AlertCircle, X } from 'lucide-react';

const STORAGE_KEY_USER = 'rootcause_user';
const STORAGE_KEY_SESSION_ID = 'rootcause_current_session_id';

function createNewSession(userId?: string): InvestigationSession {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: userId || 'anonymous',
    title: 'New Root Cause Investigation',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    currentStage: 1,
    intake: {
      category: 'Production/Operations',
      description: '',
      documents: [],
    },
    clarifying: {
      questions: [],
      isSubmitted: false,
    },
    investigation: {
      symptom: '',
      summary: '',
      nodes: [],
    },
    solutions: {
      items: [],
    },
    recommendation: {
      data: null,
    },
  };
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentSession, setCurrentSession] = useState<InvestigationSession>(() => {
    // Default to the first rich benchmark so the app opens with comprehensive data ready to test
    const defaultBenchmark = SAMPLE_BENCHMARKS[0];
    const initial = createNewSession();
    return {
      ...initial,
      title: defaultBenchmark.session.title || defaultBenchmark.name,
      intake: {
        category: defaultBenchmark.session.intake?.category || 'Production/Operations',
        description: defaultBenchmark.session.intake?.description || '',
        documents: defaultBenchmark.session.intake?.documents || [],
      },
      clarifying: {
        questions: (defaultBenchmark.session.clarifying?.questions as ClarifyingQuestion[]) || [],
        isSubmitted: true,
      },
      currentStage: 1,
    };
  });

  const [allSessions, setAllSessions] = useState<InvestigationSession[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Loading states
  const [isLoadingClarifying, setIsLoadingClarifying] = useState(false);
  const [isLoadingInvestigation, setIsLoadingInvestigation] = useState(false);
  const [isLoadingSolutions, setIsLoadingSolutions] = useState(false);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);

  // Load user sessions from backend or local storage
  const loadSessions = useCallback(async (userId?: string) => {
    try {
      const uId = userId || user?.id || 'anonymous';
      const res = await fetch(`/api/sessions?userId=${uId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.sessions && Array.isArray(data.sessions)) {
          setAllSessions(data.sessions);
          return;
        }
      }
    } catch (err) {
      console.warn('Could not load sessions from backend:', err);
    }
  }, [user]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Persist session changes to backend
  const saveSession = useCallback(
    async (sessionToSave: InvestigationSession) => {
      setIsSaving(true);
      try {
        await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionToSave),
        });
        setAllSessions((prev) => {
          const index = prev.findIndex((s) => s.id === sessionToSave.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = sessionToSave;
            return next;
          }
          return [sessionToSave, ...prev];
        });
      } catch (err) {
        console.warn('Backend save fallback:', err);
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const updateCurrentSession = useCallback(
    (updater: (prev: InvestigationSession) => InvestigationSession) => {
      setCurrentSession((prev) => {
        const next = updater(prev);
        saveSession(next);
        return next;
      });
    },
    [saveSession]
  );

  // Stage 1 -> Stage 2: Formulate Clarifying Questions via AI
  const handleProceedToClarifying = async () => {
    setIsLoadingClarifying(true);
    setErrorMessage(null);

    try {
      const allDocsText = currentSession.intake.documents.map((d) => `[Document: ${d.name}]\n${d.textContent}`).join('\n\n');

      const res = await fetch('/api/ai/clarifying-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: currentSession.intake.category,
          description: currentSession.intake.description,
          documentsText: allDocsText,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate clarifying questions');
      }

      const data = await res.json();
      const generatedQuestions = (data.questions || []).map((q: any, i: number) => ({
        id: q.id || `cq_${Date.now()}_${i}`,
        question: q.question,
        rationale: q.rationale,
        focusArea: q.focusArea || 'Scope/Impact',
        answer: '',
      }));

      updateCurrentSession((prev) => ({
        ...prev,
        currentStage: 2,
        clarifying: {
          questions: generatedQuestions,
          isSubmitted: false,
        },
      }));
    } catch (err: any) {
      console.error('Clarifying questions error:', err);
      setErrorMessage(`Stage 2 Error: ${err.message}`);
    } finally {
      setIsLoadingClarifying(false);
    }
  };

  // Stage 2 -> Stage 3: Synthesize Root-Cause Breakdown Tree via AI
  const handleProceedToInvestigation = async () => {
    setIsLoadingInvestigation(true);
    setErrorMessage(null);

    try {
      const allDocsText = currentSession.intake.documents.map((d) => `[Document: ${d.name}]\n${d.textContent}`).join('\n\n');

      const res = await fetch('/api/ai/investigate-root-causes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: currentSession.intake.category,
          description: currentSession.intake.description,
          documentsText: allDocsText,
          clarifyingQA: currentSession.clarifying.questions,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to conduct root-cause investigation');
      }

      const data = await res.json();
      const breakdown = data.breakdown || {};

      updateCurrentSession((prev) => ({
        ...prev,
        currentStage: 3,
        clarifying: {
          ...prev.clarifying,
          isSubmitted: true,
        },
        investigation: {
          symptom: breakdown.symptom || prev.intake.description,
          summary: breakdown.summary || '',
          nodes: breakdown.nodes || [],
          generatedAt: new Date().toISOString(),
        },
      }));
    } catch (err: any) {
      console.error('Investigation error:', err);
      setErrorMessage(`Stage 3 Error: ${err.message}`);
    } finally {
      setIsLoadingInvestigation(false);
    }
  };

  // Stage 3 -> Stage 4: Generate Solutions for Confirmed & Likely Root Causes
  const handleProceedToSolutions = async () => {
    setIsLoadingSolutions(true);
    setErrorMessage(null);

    try {
      const confirmedAndLikelyCauses = currentSession.investigation.nodes.filter(
        (n) => n.confidence === 'CONFIRMED' || n.confidence === 'LIKELY'
      );

      const res = await fetch('/api/ai/generate-solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom: currentSession.investigation.symptom || currentSession.intake.description,
          confirmedAndLikelyCauses,
          contextSummary: currentSession.investigation.summary,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate solutions matrix');
      }

      const data = await res.json();

      updateCurrentSession((prev) => ({
        ...prev,
        currentStage: 4,
        solutions: {
          items: data.solutions || [],
          generatedAt: new Date().toISOString(),
        },
      }));
    } catch (err: any) {
      console.error('Solutions generation error:', err);
      setErrorMessage(`Stage 4 Error: ${err.message}`);
    } finally {
      setIsLoadingSolutions(false);
    }
  };

  // Stage 4 -> Stage 5: Synthesize Final Recommendation with mandatory disclaimer
  const handleProceedToRecommendation = async () => {
    setIsLoadingRecommendation(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/generate-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: currentSession,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to synthesize recommendation');
      }

      const data = await res.json();

      updateCurrentSession((prev) => ({
        ...prev,
        currentStage: 5,
        recommendation: {
          data: data.recommendation,
          generatedAt: new Date().toISOString(),
        },
      }));
    } catch (err: any) {
      console.error('Recommendation generation error:', err);
      setErrorMessage(`Stage 5 Error: ${err.message}`);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  // Benchmark Loader
  const handleLoadBenchmark = (benchmarkId: string) => {
    const benchmark = SAMPLE_BENCHMARKS.find((b) => b.id === benchmarkId);
    if (!benchmark || !benchmark.session) return;

    const newSess: InvestigationSession = {
      ...createNewSession(user?.id),
      title: benchmark.name,
      intake: {
        category: benchmark.session.intake?.category || 'Production/Operations',
        description: benchmark.session.intake?.description || '',
        documents: benchmark.session.intake?.documents || [],
      },
      clarifying: {
        questions: (benchmark.session.clarifying?.questions as ClarifyingQuestion[]) || [],
        isSubmitted: true,
      },
      currentStage: 2,
    };

    setCurrentSession(newSess);
    saveSession(newSess);
  };

  // New blank investigation
  const handleNewSession = () => {
    const newSess = createNewSession(user?.id);
    setCurrentSession(newSess);
    saveSession(newSess);
  };

  // Delete an investigation
  const handleDeleteSession = async (id: string) => {
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      setAllSessions((prev) => prev.filter((s) => s.id !== id));
      if (currentSession.id === id) {
        handleNewSession();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  // Switch to an investigation
  const handleSelectSession = (id: string) => {
    const found = allSessions.find((s) => s.id === id);
    if (found) {
      setCurrentSession(found);
    }
  };

  // Auth login success
  const handleAuthSuccess = (authenticatedUser: User, token: string) => {
    setUser(authenticatedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(authenticatedUser));
    loadSessions(authenticatedUser.id);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      {/* Platform Header */}
      <Header
        currentSession={currentSession}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenSessions={() => setIsSessionsOpen(true)}
        onNewSession={handleNewSession}
        onLoadBenchmark={handleLoadBenchmark}
        onUpdateTitle={(title) => updateCurrentSession((prev) => ({ ...prev, title }))}
        isSaving={isSaving}
      />

      {/* Investigation Pipeline Stepper */}
      <StageIndicator
        currentStage={currentSession.currentStage || 1}
        session={currentSession}
        onSelectStage={(stage) => updateCurrentSession((prev) => ({ ...prev, currentStage: stage }))}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto w-full px-4 mt-4">
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Stage Body */}
      <main className="flex-1 pb-16">
        {currentSession.currentStage === 1 && (
          <Stage1Intake
            session={currentSession}
            onUpdateIntake={(intake) => updateCurrentSession((prev) => ({ ...prev, intake }))}
            onProceedToClarifying={handleProceedToClarifying}
            isLoadingClarifying={isLoadingClarifying}
            onLoadBenchmark={handleLoadBenchmark}
          />
        )}

        {currentSession.currentStage === 2 && (
          <Stage2Clarifying
            session={currentSession}
            onUpdateClarifying={(questions, isSubmitted) =>
              updateCurrentSession((prev) => ({
                ...prev,
                clarifying: { questions, isSubmitted },
              }))
            }
            onProceedToInvestigation={handleProceedToInvestigation}
            isLoadingInvestigation={isLoadingInvestigation}
            onRegenerateQuestions={handleProceedToClarifying}
            isRegenerating={isLoadingClarifying}
            onBackToIntake={() => updateCurrentSession((prev) => ({ ...prev, currentStage: 1 }))}
          />
        )}

        {currentSession.currentStage === 3 && (
          <Stage3Investigation
            session={currentSession}
            onProceedToSolutions={handleProceedToSolutions}
            onBackToClarifying={() => updateCurrentSession((prev) => ({ ...prev, currentStage: 2 }))}
            onRerunInvestigation={handleProceedToInvestigation}
            isLoadingSolutions={isLoadingSolutions}
            isRerunning={isLoadingInvestigation}
          />
        )}

        {currentSession.currentStage === 4 && (
          <Stage4Solutions
            session={currentSession}
            onProceedToRecommendation={handleProceedToRecommendation}
            onBackToInvestigation={() => updateCurrentSession((prev) => ({ ...prev, currentStage: 3 }))}
            onRegenerateSolutions={handleProceedToSolutions}
            isLoadingRecommendation={isLoadingRecommendation}
            isRegenerating={isLoadingSolutions}
          />
        )}

        {currentSession.currentStage === 5 && (
          <Stage5Recommendation
            session={currentSession}
            onProceedToExport={() => updateCurrentSession((prev) => ({ ...prev, currentStage: 6 }))}
            onBackToSolutions={() => updateCurrentSession((prev) => ({ ...prev, currentStage: 4 }))}
            onRegenerateRecommendation={handleProceedToRecommendation}
            isRegenerating={isLoadingRecommendation}
          />
        )}

        {currentSession.currentStage === 6 && (
          <Stage6Export
            session={currentSession}
            onBackToRecommendation={() => updateCurrentSession((prev) => ({ ...prev, currentStage: 5 }))}
            onNewSession={handleNewSession}
          />
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Saved Sessions Drawer */}
      <SessionsDrawer
        isOpen={isSessionsOpen}
        onClose={() => setIsSessionsOpen(false)}
        sessions={allSessions}
        currentSessionId={currentSession.id}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
}
