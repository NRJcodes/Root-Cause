import React from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  AlertOctagon,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Loader2,
  Download,
} from 'lucide-react';
import { InvestigationSession } from '../../types';

interface Stage5RecommendationProps {
  session: InvestigationSession;
  onProceedToExport: () => void;
  onBackToSolutions: () => void;
  onRegenerateRecommendation: () => void;
  isRegenerating: boolean;
}

export const Stage5Recommendation: React.FC<Stage5RecommendationProps> = ({
  session,
  onProceedToExport,
  onBackToSolutions,
  onRegenerateRecommendation,
  isRegenerating,
}) => {
  const rec = session.recommendation.data;

  if (!rec) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-900">Synthesizing Final Recommendation...</h2>
        <p className="text-xs text-slate-500 mt-1">Cross-referencing root causes and solutions trade-offs.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Stage 5 of 6
              </span>
              <span className="text-xs text-slate-500 font-medium">Strategic Decision Synthesis</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Executive Recommendation & Governance
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              A single primary path forward synthesized from the evidence ledger. Requires operational sign-off before field deployment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRegenerateRecommendation}
              disabled={isRegenerating}
              className="text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 font-medium px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>{isRegenerating ? 'Regenerating...' : 'Re-synthesize'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* MANDATORY GOVERNANCE DISCLAIMER BOX */}
        <div className="bg-rose-50/80 border-2 border-rose-300/80 rounded-xl p-4.5 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                <span>Mandatory Operational Validation Notice</span>
                <span className="text-[10px] bg-rose-200/60 text-rose-800 px-1.5 py-0.2 rounded font-mono">
                  ISO / Operational Governance
                </span>
              </div>
              <p className="text-xs font-semibold text-rose-950 leading-relaxed italic">
                "{rec.disclaimer || 'This recommendation is based on the information provided and requires validation by someone with direct operational knowledge before action is taken.'}"
              </p>
            </div>
          </div>
        </div>

        {/* PRIMARY PATH FORWARD CARD */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="w-4 h-4" />
            <span>Primary Recommended Path Forward</span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-tight leading-snug mb-3">
            {rec.primaryPath}
          </h2>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">Addressed Symptom: </span>
            <span className="text-slate-200">{session.investigation.symptom || session.intake.description}</span>
          </div>
        </div>

        {/* OPERATIONAL RATIONALE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-indigo-600" />
            <span>Operational Rationale & Trade-off Analysis</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
            {rec.rationale}
          </p>
        </div>

        {/* IMMEDIATE MILESTONES (30-60-90 DAY PLAN) */}
        {rec.immediateMilestones && rec.immediateMilestones.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Immediate Implementation Milestones</span>
            </h3>

            <div className="space-y-3">
              {rec.immediateMilestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <span className="w-20 shrink-0 font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-1 rounded text-center text-[11px]">
                    {m.period}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 leading-snug">{m.action}</p>
                    {m.owner && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Accountable Lead: <span className="text-slate-700 font-medium">{m.owner}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RISKS & LEADING INDICATORS TO MONITOR */}
        {rec.risksToMonitor && rec.risksToMonitor.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Critical Operational Risks & Leading Indicators</span>
            </h3>

            <ul className="space-y-2">
              {rec.risksToMonitor.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-200 mt-8">
        <button
          type="button"
          onClick={onBackToSolutions}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Solutions Matrix</span>
        </button>

        <button
          type="button"
          onClick={onProceedToExport}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer hover:shadow-md transition"
        >
          <span>Proceed to Stage 6: Export PDF Dossier</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
