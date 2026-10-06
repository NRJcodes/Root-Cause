import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { ProblemCategory, UploadedDoc, InvestigationSession } from '../../types';
import { SAMPLE_BENCHMARKS } from '../../utils/sampleData';

interface Stage1IntakeProps {
  session: InvestigationSession;
  onUpdateIntake: (intakeData: InvestigationSession['intake']) => void;
  onProceedToClarifying: () => void;
  isLoadingClarifying: boolean;
  onLoadBenchmark: (benchmarkId: string) => void;
}

const CATEGORIES: ProblemCategory[] = [
  'Production/Operations',
  'Financial',
  'Supply Chain',
  'Quality',
  'Staffing/HR',
  'Other',
];

export const Stage1Intake: React.FC<Stage1IntakeProps> = ({
  session,
  onUpdateIntake,
  onProceedToClarifying,
  isLoadingClarifying,
  onLoadBenchmark,
}) => {
  const [category, setCategory] = useState<ProblemCategory>(
    session.intake.category || 'Production/Operations'
  );
  const [description, setDescription] = useState(session.intake.description || '');
  const [documents, setDocuments] = useState<UploadedDoc[]>(session.intake.documents || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<UploadedDoc | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryChange = (newCat: ProblemCategory) => {
    setCategory(newCat);
    onUpdateIntake({
      category: newCat,
      description,
      documents,
    });
  };

  const handleDescriptionChange = (newDesc: string) => {
    setDescription(newDesc);
    onUpdateIntake({
      category,
      description: newDesc,
      documents,
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);

    const newDocs: UploadedDoc[] = [...documents];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setUploadError(errData.error || `Upload failed with status ${res.status}`);
          continue;
        }

        const data = await res.json();
        if (data.doc) {
          newDocs.push(data.doc);
        }
      } catch (err: any) {
        console.error('File upload error:', err);
        setUploadError(err.message || 'File upload failed');
      }
    }

    setDocuments(newDocs);
    onUpdateIntake({
      category,
      description,
      documents: newDocs,
    });
    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveDoc = (id: string) => {
    const filtered = documents.filter((d) => d.id !== id);
    setDocuments(filtered);
    onUpdateIntake({
      category,
      description,
      documents: filtered,
    });
  };

  const isFormValid = description.trim().length >= 20;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Stage Header Banner */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Stage 1 of 6
              </span>
              <span className="text-xs text-slate-500 font-medium">Diagnostic Intake Protocol</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Problem Intake & Evidence Ingestion
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Define the observed business anomaly in operational terms. The AI will cross-reference this intake against supporting documents to formulate targeted clarifying questions before conducting root cause analysis.
            </p>
          </div>

          {/* Quick Benchmark loader */}
          <div className="shrink-0 bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Load Enterprise Benchmark</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_BENCHMARKS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => onLoadBenchmark(b.id)}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium px-2 py-1 rounded text-[11px] transition shadow-2xs"
                >
                  {b.badge}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Intake Form */}
      <div className="space-y-6">
        {/* Field 1: Problem Category */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <label className="block text-sm font-semibold text-slate-900 mb-1">
            Problem Category <span className="text-rose-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Select the operational domain where the symptom primarily surfaces.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                className={`py-2.5 px-3 rounded-lg border text-xs font-semibold transition text-left flex items-center justify-between ${
                  category === cat
                    ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{cat}</span>
                {category === cat && <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Field 2: Problem Description */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-slate-900">
              Stated Problem Description <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {description.length} chars
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Describe what is happening, where it occurs, and how it is currently impacting throughput, margin, or safety. Focus on factual observations rather than speculating on cause.
          </p>

          <textarea
            rows={6}
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="e.g. During the last 4 weeks, Line #3 throughput dropped by 22% due to repeated thermal sensor cutoffs on heating chamber B. Finished items display micro-cracks along seam 4..."
            className="w-full text-sm text-slate-900 border border-slate-300 rounded-lg p-3.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none leading-relaxed transition resize-y font-sans"
          />

          {description.length > 0 && description.length < 20 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Please provide at least 20 characters for a rigorous diagnostic assessment.</span>
            </div>
          )}

          <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-semibold text-slate-800">Diagnostic Rule:</span> The AI adheres to strict evidence-based isolation. Avoid guessing internal causes here; state the physical and operational symptoms precisely.
            </div>
          </div>
        </div>

        {/* Field 3: Supporting Documents & Data Exports */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
          <label className="block text-sm font-semibold text-slate-900 mb-1">
            Supporting Evidence & Technical Documents
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Upload maintenance logs, telemetry CSVs, shift reports, vendor memos, or audit notes (PDF, CSV, TXT, JSON, MD). Text is parsed into plain text and used as empirical context.
          </p>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileUpload(e.dataTransfer.files);
            }}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/30 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              multiple
              accept=".txt,.csv,.json,.pdf,.md,.log"
              className="hidden"
            />
            <div className="w-11 h-11 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-indigo-600 group-hover:border-indigo-200 transition shadow-2xs mb-2">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              ) : (
                <UploadCloud className="w-5 h-5" />
              )}
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {isUploading ? 'Parsing document contents...' : 'Click to upload or drag & drop files'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports PDF, CSV, TXT, JSON, Markdown, Logs (max 20MB per file)
            </p>
          </div>

          {uploadError && (
            <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Uploaded Documents List */}
          {documents.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-semibold text-slate-700">
                Attached Documents ({documents.length}):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {doc.name.endsWith('.csv') ? (
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-800 truncate" title={doc.name}>
                          {doc.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {Math.round(doc.size / 1024)} KB • {doc.textContent.length} text chars extracted
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded transition"
                        title="Preview extracted plain text"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(doc.id)}
                        className="p-1 text-slate-500 hover:text-rose-600 hover:bg-white rounded transition"
                        title="Remove document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Proceed to Stage 2 */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            {isFormValid ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Ready for Clarifying Questions
              </span>
            ) : (
              <span>Fill out problem description to proceed.</span>
            )}
          </div>

          <button
            type="button"
            disabled={!isFormValid || isLoadingClarifying}
            onClick={onProceedToClarifying}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition ${
              isFormValid && !isLoadingClarifying
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer hover:shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoadingClarifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Formulating Clarifying Questions...</span>
              </>
            ) : (
              <>
                <span>Proceed to Stage 2: Clarifying Questions</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Extracted Text Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  {previewDoc.name}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Extracted Plain Text Passed to Gemini ({previewDoc.textContent.length} characters)
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-4 overflow-y-auto font-mono text-xs text-slate-800 bg-slate-900 text-slate-200 leading-relaxed whitespace-pre-wrap flex-1">
              {previewDoc.textContent || '(No textual content found in document)'}
            </div>
            <div className="p-3 border-t border-slate-200 flex justify-end bg-slate-50 rounded-b-xl">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-100"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
