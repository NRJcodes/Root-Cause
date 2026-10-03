import React, { useState } from 'react';
import {
  Download,
  Printer,
  Copy,
  Check,
  FileText,
  ArrowLeft,
  Share2,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Compass,
  Layers,
  AlertOctagon,
  Clock,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { InvestigationSession } from '../../types';
import { generatePdfReport } from '../../utils/pdfExport';

interface Stage6ExportProps {
  session: InvestigationSession;
  onBackToRecommendation: () => void;
  onNewSession: () => void;
}

export const Stage6Export: React.FC<Stage6ExportProps> = ({
  session,
  onBackToRecommendation,
  onNewSession,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = () => {
    setIsExporting(true);
    try {
      generatePdfReport(session);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# ${session.title}
**Category:** ${session.intake.category}
**Date:** ${new Date(session.updatedAt || Date.now()).toLocaleDateString()}

## 1. Problem Statement
${session.intake.description}

## 2. Clarifying Facts
${session.clarifying.questions.map((q, i) => `**Q${i + 1} (${q.focusArea}):** ${q.question}\n*Answer:* ${q.answer}\n`).join('\n')}

## 3. Root Cause Deconstruction
${session.investigation.nodes.map((n) => `- [${n.confidence}] **${n.category}:** ${n.title}\n  *Mechanism:* ${n.description}\n  *Evidence:* ${n.evidence}\n`).join('\n')}

## 4. Evaluated Solutions
${session.solutions.items.map((s) => `- **${s.solution}** (Addresses: ${s.rootCauseTitle})\n  *Cost:* ${s.estimatedCost} | *Time:* ${s.estimatedTimeframe} | *Risk:* ${s.riskLevel} | *Impact:* ${s.expectedImpact}\n  *Action:* ${s.actionPlan}\n`).join('\n')}

## 5. Strategic Recommendation
**Primary Path Forward:**
${session.recommendation.data?.primaryPath}

**Operational Rationale:**
${session.recommendation.data?.rationale}

> **Governance Notice:**
> ${session.recommendation.data?.disclaimer}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header and Download Controls */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Stage 6 of 6
              </span>
              <span className="text-xs text-slate-500 font-medium">Final Dossier & Distribution</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Export Investigation Dossier
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Export the complete evidence ledger, root cause tree, comparative solutions matrix, and final recommendation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Copied Brief' : 'Copy Markdown'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print View</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download Official PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRINTABLE DOSSIER PREVIEW */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8 text-slate-900 printable-dossier">
        {/* Dossier Header */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-mono">
            <span>ROOTCAUSE AI — BUSINESS DIAGNOSTIC DOSSIER</span>
            <span>REF: {session.id.slice(0, 16)}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {session.title}
          </h2>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
            <div>
              <strong>Category:</strong> {session.intake.category}
            </div>
            <div>
              <strong>Status:</strong> Investigation Completed
            </div>
            <div>
              <strong>Date:</strong> {new Date(session.updatedAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Section 1: Problem Intake */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded">
            1. Problem Statement & Intake Evidence
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed pl-1 pt-1 whitespace-pre-line">
            {session.intake.description}
          </p>

          {session.intake.documents && session.intake.documents.length > 0 && (
            <div className="mt-3 pl-1 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Attached Technical Documents:</span>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                {session.intake.documents.map((d) => (
                  <li key={d.id}>
                    {d.name} ({Math.round(d.size / 1024)} KB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Section 2: Clarifying Facts */}
        {session.clarifying.questions && session.clarifying.questions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded">
              2. Clarifying Questions & Recorded Operational Facts
            </h3>
            <div className="space-y-2 pl-1">
              {session.clarifying.questions.map((q, i) => (
                <div key={q.id || i} className="text-xs border-b border-slate-100 pb-2">
                  <div className="font-bold text-slate-900">
                    Q{i + 1} [{q.focusArea}]: {q.question}
                  </div>
                  <div className="text-slate-600 mt-0.5 pl-2 border-l-2 border-indigo-200 italic">
                    Answer: {q.answer || 'No answer recorded.'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Root Cause Tree & Evidence Ledger */}
        {session.investigation.nodes && session.investigation.nodes.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded">
              3. Root-Cause Deconstruction & Evidence Ledger
            </h3>

            {session.investigation.summary && (
              <p className="text-xs text-slate-600 italic pl-1 mb-2">
                "{session.investigation.summary}"
              </p>
            )}

            <div className="space-y-2.5 pl-1">
              {session.investigation.nodes.map((node) => (
                <div
                  key={node.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      [{node.category}] {node.title}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                        node.confidence === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : node.confidence === 'LIKELY'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}
                    >
                      {node.confidence}
                    </span>
                  </div>
                  <p className="text-slate-600">{node.description}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    <strong className="text-slate-700">Evidence cited:</strong> {node.evidence}
                  </p>
                  {node.missingData && (
                    <p className="text-[10px] text-amber-700">
                      <strong>To confirm:</strong> {node.missingData}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 4: Solutions Matrix */}
        {session.solutions.items && session.solutions.items.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded">
              4. Evaluated Solutions Comparison
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <th className="p-2">Solution</th>
                    <th className="p-2">Addresses</th>
                    <th className="p-2 text-center">Cost</th>
                    <th className="p-2 text-center">Time</th>
                    <th className="p-2 text-center">Risk</th>
                    <th className="p-2 text-center">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {session.solutions.items.map((s, idx) => (
                    <tr key={s.id || idx}>
                      <td className="p-2 font-semibold text-slate-900">
                        {s.solution}
                        <div className="text-[10px] font-normal text-slate-500">{s.actionPlan}</div>
                      </td>
                      <td className="p-2 text-slate-600">{s.rootCauseTitle}</td>
                      <td className="p-2 text-center whitespace-nowrap">{s.estimatedCost}</td>
                      <td className="p-2 text-center whitespace-nowrap">{s.estimatedTimeframe}</td>
                      <td className="p-2 text-center whitespace-nowrap">{s.riskLevel}</td>
                      <td className="p-2 text-center whitespace-nowrap">{s.expectedImpact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 5: Recommendation & Disclaimer */}
        {session.recommendation.data && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded">
              5. Final Recommendation & Governance Sign-off
            </h3>

            {/* Mandatory Disclaimer Box */}
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-950 font-semibold italic">
              "{session.recommendation.data.disclaimer}"
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Primary Recommended Path Forward:
              </div>
              <div className="text-base font-bold text-white">
                {session.recommendation.data.primaryPath}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                {session.recommendation.data.rationale}
              </p>
            </div>

            {session.recommendation.data.immediateMilestones && (
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-900 mb-2">Immediate Implementation Milestones:</div>
                <div className="space-y-1.5">
                  {session.recommendation.data.immediateMilestones.map((m, idx) => (
                    <div key={idx} className="text-xs flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="font-mono font-bold text-slate-800 w-24 shrink-0">{m.period}:</span>
                      <span className="text-slate-700">{m.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-200 mt-8">
        <button
          type="button"
          onClick={onBackToRecommendation}
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recommendation</span>
        </button>

        <button
          type="button"
          onClick={onNewSession}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm bg-slate-900 hover:bg-slate-800 text-white cursor-pointer transition"
        >
          <span>Start Another Investigation</span>
        </button>
      </div>
    </div>
  );
};
