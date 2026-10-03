import React, { useState } from 'react';
import {
  TableProperties,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { InvestigationSession, SolutionItem, ConfidenceLevel } from '../../types';

interface Stage4SolutionsProps {
  session: InvestigationSession;
  onProceedToRecommendation: () => void;
  onBackToInvestigation: () => void;
  onRegenerateSolutions: () => void;
  isLoadingRecommendation: boolean;
  isRegenerating: boolean;
}

export const Stage4Solutions: React.FC<Stage4SolutionsProps> = ({
  session,
  onProceedToRecommendation,
  onBackToInvestigation,
  onRegenerateSolutions,
  isLoadingRecommendation,
  isRegenerating,
}) => {
  const [filterCause, setFilterCause] = useState<string>('ALL');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const solutions = session.solutions.items || [];

  // Unique root causes represented
  const distinctCauses = Array.from(new Set(solutions.map((s) => s.rootCauseTitle)));

  const filteredSolutions = solutions.filter((s) => {
    if (filterCause !== 'ALL' && s.rootCauseTitle !== filterCause) return false;
    if (filterRisk !== 'ALL' && s.riskLevel !== filterRisk) return false;
    return true;
  });

  const getCostBadge = (cost: string) => {
    const c = cost.toLowerCase();
    let col = 'bg-slate-100 text-slate-700 border-slate-200';
    if (c.includes('low')) col = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (c.includes('med')) col = 'bg-blue-50 text-blue-700 border-blue-200';
    else if (c.includes('high')) col = 'bg-purple-50 text-purple-700 border-purple-200';

    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${col}`}>
        <DollarSign className="w-3 h-3" />
        {cost}
      </span>
    );
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Low':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
            Low Risk
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
            Medium Risk
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">
            High Risk
          </span>
        );
      default:
        return <span>{risk}</span>;
    }
  };

  const getImpactBadge = (impact: string) => {
    const imp = impact.toLowerCase();
    let col = 'bg-slate-100 text-slate-700 border-slate-200';
    if (imp.includes('high')) col = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
    else if (imp.includes('med')) col = 'bg-blue-50 text-blue-700 border-blue-200';
    else if (imp.includes('low')) col = 'bg-slate-100 text-slate-600 border-slate-200';

    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${col}`}>
        <TrendingUp className="w-3 h-3" />
        {impact}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Stage 4 of 6
              </span>
              <span className="text-xs text-slate-500 font-medium">Intervention Evaluation</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Solutions Comparison Matrix
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Targeted solutions generated explicitly for Confirmed and Likely root causes. Evaluated across cost, execution timeframe, implementation risk, and expected operational impact.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRegenerateSolutions}
              disabled={isRegenerating}
              className="text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 font-medium px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Solutions'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Root Cause:
          </span>
          <select
            value={filterCause}
            onChange={(e) => setFilterCause(e.target.value)}
            className="border border-slate-300 rounded-md px-2.5 py-1 text-xs text-slate-800 bg-white focus:ring-1 focus:ring-indigo-500 outline-none max-w-xs truncate"
          >
            <option value="ALL">All Root Causes ({distinctCauses.length})</option>
            {distinctCauses.map((cause) => (
              <option key={cause} value={cause}>
                {cause}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-semibold">Risk:</span>
          {['ALL', 'Low', 'Medium', 'High'].map((r) => (
            <button
              key={r}
              onClick={() => setFilterRisk(r)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                filterRisk === r ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white border-b border-slate-800">
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] w-1/4">
                  Root Cause Addressed
                </th>
                <th className="py-3 px-4 font-bold uppercase tracking-wider text-[11px] w-1/3">
                  Solution & Implementation Plan
                </th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-center">
                  Est. Cost
                </th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-center">
                  Timeframe
                </th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-center">
                  Risk Level
                </th>
                <th className="py-3 px-3 font-bold uppercase tracking-wider text-[11px] text-center">
                  Expected Impact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSolutions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No solutions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredSolutions.map((sol, idx) => {
                  const isExpanded = expandedId === sol.id;
                  return (
                    <tr
                      key={sol.id || idx}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : sol.id)}
                    >
                      {/* Root cause addressed */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {sol.rootCauseConfidence === 'CONFIRMED' ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                CONFIRMED
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                LIKELY
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-slate-900 leading-snug">
                            {sol.rootCauseTitle}
                          </div>
                        </div>
                      </td>

                      {/* Solution and action plan */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5">
                          <div className="font-bold text-slate-900 text-sm flex items-center justify-between gap-2">
                            <span>{sol.solution}</span>
                            <span className="text-slate-400">
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </span>
                          </div>
                          <p className={`text-slate-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                            {sol.actionPlan}
                          </p>
                          {isExpanded && (
                            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex items-center gap-3">
                              <span>Complexity: <strong className="text-slate-700">{sol.complexity}</strong></span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Est Cost */}
                      <td className="py-3.5 px-3 align-top text-center whitespace-nowrap">
                        {getCostBadge(sol.estimatedCost)}
                      </td>

                      {/* Timeframe */}
                      <td className="py-3.5 px-3 align-top text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {sol.estimatedTimeframe}
                        </span>
                      </td>

                      {/* Risk Level */}
                      <td className="py-3.5 px-3 align-top text-center whitespace-nowrap">
                        {getRiskBadge(sol.riskLevel)}
                      </td>

                      {/* Expected Impact */}
                      <td className="py-3.5 px-3 align-top text-center whitespace-nowrap">
                        {getImpactBadge(sol.expectedImpact)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onBackToInvestigation}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Root Cause Tree</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">
            {solutions.length} solutions evaluated
          </span>

          <button
            type="button"
            disabled={isLoadingRecommendation || solutions.length === 0}
            onClick={onProceedToRecommendation}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition ${
              !isLoadingRecommendation && solutions.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer hover:shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoadingRecommendation ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Final Recommendation...</span>
              </>
            ) : (
              <>
                <span>Proceed to Stage 5: Final Recommendation</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
