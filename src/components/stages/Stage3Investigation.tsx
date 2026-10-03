import React, { useState } from 'react';
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Filter,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Search,
  Layers,
  ChevronRight,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  InvestigationSession,
  RootCauseNode,
  ConfidenceLevel,
  RootCauseCategory,
} from '../../types';

interface Stage3InvestigationProps {
  session: InvestigationSession;
  onProceedToSolutions: () => void;
  onBackToClarifying: () => void;
  onRerunInvestigation: () => void;
  isLoadingSolutions: boolean;
  isRerunning: boolean;
}

const CATEGORY_COLORS: Record<RootCauseCategory, { bg: string; text: string; border: string }> = {
  People: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Process: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  Equipment: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Materials: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  Environment: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  Management: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export const Stage3Investigation: React.FC<Stage3InvestigationProps> = ({
  session,
  onProceedToSolutions,
  onBackToClarifying,
  onRerunInvestigation,
  isLoadingSolutions,
  isRerunning,
}) => {
  const [selectedConfidence, setSelectedConfidence] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeNode, setActiveNode] = useState<RootCauseNode | null>(
    session.investigation.nodes[0] || null
  );
  const [searchQuery, setSearchQuery] = useState('');

  const nodes = session.investigation.nodes || [];
  const symptom = session.investigation.symptom || session.intake.description;

  const confirmedCount = nodes.filter((n) => n.confidence === 'CONFIRMED').length;
  const likelyCount = nodes.filter((n) => n.confidence === 'LIKELY').length;
  const speculativeCount = nodes.filter((n) => n.confidence === 'SPECULATIVE').length;

  const filteredNodes = nodes.filter((node) => {
    if (selectedConfidence !== 'ALL' && node.confidence !== selectedConfidence) return false;
    if (selectedCategory !== 'ALL' && node.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        node.title.toLowerCase().includes(q) ||
        node.description.toLowerCase().includes(q) ||
        node.category.toLowerCase().includes(q) ||
        node.evidence.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getConfidenceBadge = (confidence: ConfidenceLevel) => {
    switch (confidence) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            CONFIRMED
          </span>
        );
      case 'LIKELY':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-300 px-2 py-0.5 rounded">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            LIKELY
          </span>
        );
      case 'SPECULATIVE':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded">
            <ShieldQuestion className="w-3 h-3 text-slate-500" />
            SPECULATIVE
          </span>
        );
    }
  };

  // Group filtered nodes by category
  const categoriesPresent = Array.from(new Set(filteredNodes.map((n) => n.category))) as RootCauseCategory[];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Stage 3 of 6
              </span>
              <span className="text-xs text-slate-500 font-medium">Diagnostic Root Cause Tree</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Root Cause Deconstruction & Evidence Ledger
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Symptoms are separated from root causes. Every claim is strictly audited and classified as Confirmed, Likely, or Speculative with supporting citations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRerunInvestigation}
              disabled={isRerunning}
              className="text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 font-medium px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRerunning ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>{isRerunning ? 'Re-analyzing...' : 'Re-run Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confidence Counts Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Factors</div>
            <div className="text-xl font-extrabold">{nodes.length}</div>
          </div>
          <Layers className="w-5 h-5 text-indigo-400" />
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Confirmed (Data Supported)</div>
            <div className="text-xl font-extrabold text-emerald-900">{confirmedCount}</div>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Likely (Reasonable Inference)</div>
            <div className="text-xl font-extrabold text-amber-900">{likelyCount}</div>
          </div>
          <ShieldAlert className="w-5 h-5 text-amber-600" />
        </div>

        <div className="bg-slate-100 border border-slate-300 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Speculative (Unverified)</div>
            <div className="text-xl font-extrabold text-slate-800">{speculativeCount}</div>
          </div>
          <ShieldQuestion className="w-5 h-5 text-slate-500" />
        </div>
      </div>

      {/* Assessment Summary Callout */}
      {session.investigation.summary && (
        <div className="mb-6 p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs text-indigo-950 flex items-start gap-3">
          <GitFork className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-indigo-900">Diagnostic Synthesis: </strong>
            {session.investigation.summary}
          </div>
        </div>
      )}

      {/* ROOT SYMPTOM CARD (Top Node in Tree) */}
      <div className="mb-8">
        <div className="relative p-5 bg-slate-900 text-white rounded-xl shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
                Root Symptom (Top Node)
              </span>
              <span className="text-xs text-slate-400 font-mono">Domain: {session.intake.category || 'Operations'}</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {symptom}
            </h2>
            <p className="text-xs text-slate-400">
              This is the external symptom presented for investigation. The branches below represent contributing factors and underlying root causes.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400 font-medium">Deconstructed into:</span>
            <span className="font-bold text-indigo-400">{categoriesPresent.length} Ishikawa Categories</span>
          </div>
        </div>

        {/* Tree Trunk Visual Connector */}
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-slate-400"></div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter Confidence:
          </span>
          {['ALL', 'CONFIRMED', 'LIKELY', 'SPECULATIVE'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedConfidence(lvl)}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                selectedConfidence === lvl
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search factors or evidence..."
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Visual Tree / Category Branches Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Interactive Tree Branches */}
        <div className="lg:col-span-7 space-y-6">
          {categoriesPresent.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No root causes match the current filter.
            </div>
          ) : (
            categoriesPresent.map((category) => {
              const catNodes = filteredNodes.filter((n) => n.category === category);
              const col = CATEGORY_COLORS[category] || {
                bg: 'bg-slate-50',
                text: 'text-slate-700',
                border: 'border-slate-200',
              };

              return (
                <div key={category} className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  {/* Category branch header */}
                  <div className={`px-4 py-2.5 ${col.bg} border-b ${col.border} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.text.replace('text-', 'bg-')}`}></span>
                      <h3 className={`text-xs font-bold uppercase tracking-wider ${col.text}`}>
                        {category} Branch ({catNodes.length})
                      </h3>
                    </div>
                  </div>

                  {/* Nodes in this category */}
                  <div className="divide-y divide-slate-100">
                    {catNodes.map((node) => {
                      const isSelected = activeNode?.id === node.id;
                      return (
                        <div
                          key={node.id}
                          onClick={() => setActiveNode(node)}
                          className={`p-4 transition cursor-pointer flex items-start justify-between gap-3 ${
                            isSelected ? 'bg-indigo-50/50 ring-1 ring-inset ring-indigo-500/30' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {getConfidenceBadge(node.confidence)}
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 leading-snug">
                              {node.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                              {node.description}
                            </p>
                            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 truncate pt-0.5">
                              <span className="font-semibold text-slate-700">Evidence:</span>
                              <span className="italic truncate">{node.evidence}</span>
                            </div>
                          </div>

                          <ChevronRight className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Node Inspector Drawer */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Root Cause Detail Inspector
              </span>
              {activeNode && getConfidenceBadge(activeNode.confidence)}
            </div>

            {activeNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Category</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">{activeNode.category}</div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Root Cause / Factor</div>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">{activeNode.title}</h3>
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Causal Mechanism</div>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {activeNode.description}
                  </p>
                </div>

                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Evidence Supporting Claim</div>
                  <div className="mt-1 p-2.5 rounded-lg border text-xs leading-relaxed bg-slate-50 border-slate-200 text-slate-800">
                    <p className="font-mono text-[11px] italic">
                      "{activeNode.evidence || 'no supporting data provided, inference only.'}"
                    </p>
                  </div>
                </div>

                {activeNode.missingData && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg">
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Required Data to Resolve Uncertainty
                    </div>
                    <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                      {activeNode.missingData}
                    </p>
                  </div>
                )}

                {activeNode.subFactors && activeNode.subFactors.length > 0 && (
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Observed Associated Symptoms / Sub-factors
                    </div>
                    <ul className="space-y-1">
                      {activeNode.subFactors.map((sf, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                          <span>{sf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">Select any root cause node to inspect audit evidence.</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-200 mt-8">
        <button
          type="button"
          onClick={onBackToClarifying}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clarifying Q&A</span>
        </button>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">
            {confirmedCount + likelyCount} actionable root causes identified
          </span>

          <button
            type="button"
            disabled={isLoadingSolutions || confirmedCount + likelyCount === 0}
            onClick={onProceedToSolutions}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition ${
              !isLoadingSolutions && confirmedCount + likelyCount > 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer hover:shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoadingSolutions ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Formulating Solutions Matrix...</span>
              </>
            ) : (
              <>
                <span>Proceed to Stage 4: Solutions Comparison</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
