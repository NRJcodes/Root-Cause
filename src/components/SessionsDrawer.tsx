import React from 'react';
import {
  X,
  PlusCircle,
  FolderOpen,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { InvestigationSession } from '../types';

interface SessionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: InvestigationSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
}

export const SessionsDrawer: React.FC<SessionsDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Investigation Dossiers</h3>
                <p className="text-[11px] text-slate-400">Stored diagnostic sessions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New investigation CTA */}
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <button
              onClick={() => {
                onNewSession();
                onClose();
              }}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start New Investigation</span>
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
            {sessions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No saved investigations yet.
              </div>
            ) : (
              sessions.map((s) => {
                const isSelected = s.id === currentSessionId;
                const dateStr = new Date(s.updatedAt || s.createdAt || Date.now()).toLocaleDateString();
                const nodeCount = s.investigation?.nodes?.length || 0;
                const hasRec = !!s.recommendation?.data;

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectSession(s.id);
                      onClose();
                    }}
                    className={`p-3 rounded-lg transition cursor-pointer mb-1 border ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-500/20'
                        : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/60 px-1.5 py-0.2 rounded">
                            {s.intake?.category || 'General'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Stage {s.currentStage || 1}/6
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug truncate" title={s.title}>
                          {s.title}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {dateStr}
                          </span>
                          <span>•</span>
                          <span>{nodeCount} root causes</span>
                          {hasRec && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Recommended
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete investigation "${s.title}"?`)) {
                            onDeleteSession(s.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition"
                        title="Delete investigation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
