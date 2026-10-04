import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Star,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Tag,
  Loader2,
} from 'lucide-react';
import { KnowledgeBaseCase } from '../types';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCase?: (caseItem: KnowledgeBaseCase) => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  onSelectCase,
}) => {
  const [cases, setCases] = useState<KnowledgeBaseCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCase, setSelectedCase] = useState<KnowledgeBaseCase | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCases() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/knowledge-base');
        const data = await res.json();
        if (data.cases) {
          setCases(data.cases);
          if (data.cases.length > 0 && !selectedCase) {
            setSelectedCase(data.cases[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching knowledge base:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCases();
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['ALL', ...Array.from(new Set(cases.map((c) => c.category)))];

  const filteredCases = cases.filter((c) => {
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.summary.toLowerCase().includes(q) ||
        c.rootCauses.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.solutions && c.solutions.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Institutional Knowledge Base
                </h2>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-400/30">
                  Gemini Vector Memory
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verified high-rated past investigations automatically matched as reference patterns during root cause analysis.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search historical problem patterns, causes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Split view of cases list & details */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Left Column: List of Cases */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto p-4 space-y-2.5 max-h-[55vh]">
            {isLoading ? (
              <div className="py-12 text-center text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                <p className="text-xs">Loading institutional records...</p>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No matching cases found.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  High-rated investigations (rated 4★ or 5★) will be saved here automatically.
                </p>
              </div>
            ) : (
              filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {c.category}
                      </span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: c.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug">
                      {c.summary}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 italic">
                      Root cause: {c.rootCauses}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Case Deep Dive */}
          <div className="md:col-span-7 overflow-y-auto p-6 bg-slate-50/40 max-h-[55vh]">
            {selectedCase ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                      {selectedCase.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      Added {new Date(selectedCase.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-amber-700 text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{selectedCase.rating} / 5 Quality Rating</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Problem Summary / Symptom
                  </h3>
                  <div className="text-sm font-semibold text-slate-900 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed shadow-2xs">
                    {selectedCase.summary}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Root Cause Established
                  </h3>
                  <div className="text-xs text-slate-800 bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-200 leading-relaxed">
                    {selectedCase.rootCauses}
                  </div>
                </div>

                {selectedCase.solutions && (
                  <div>
                    <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">
                      Validated Remediation / Solutions
                    </h3>
                    <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                      {selectedCase.solutions}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-indigo-50/60 border border-indigo-200/80 rounded-lg text-[11px] text-indigo-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Vector Pattern Matching:</span> Whenever new problem intake reports mention similar failure modes, Gemini automatically compares vector embeddings against this case to extract diagnostic precedent.
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Select a case from the left to view root cause analysis details.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{cases.length} verified past cases active in vector search</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
