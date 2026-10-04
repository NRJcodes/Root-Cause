import React, { useState } from 'react';
import {
  FolderOpen,
  PlusCircle,
  FileCheck2,
  Sparkles,
  UserCheck,
  LogIn,
  LogOut,
  Layers,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { User, InvestigationSession } from '../types';
import { SAMPLE_BENCHMARKS } from '../utils/sampleData';

interface HeaderProps {
  currentSession: InvestigationSession;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSessions: () => void;
  onOpenKnowledgeBase: () => void;
  onNewSession: () => void;
  onLoadBenchmark: (benchmarkId: string) => void;
  onUpdateTitle: (newTitle: string) => void;
  isSaving: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentSession,
  user,
  onOpenAuth,
  onLogout,
  onOpenSessions,
  onOpenKnowledgeBase,
  onNewSession,
  onLoadBenchmark,
  onUpdateTitle,
  isSaving,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(currentSession.title);
  const [showBenchmarkDropdown, setShowBenchmarkDropdown] = useState(false);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (tempTitle.trim() && tempTitle !== currentSession.title) {
      onUpdateTitle(tempTitle.trim());
    }
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-inner ring-1 ring-white/20">
              <Layers className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">RootCause</span>
                <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold px-1.5 py-0.5 rounded border border-indigo-400/30 uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none">Diagnostic Decision Support</p>
            </div>
          </div>

          {/* Current Session Title */}
          <div className="hidden md:flex items-center max-w-md lg:max-w-lg">
            {isEditingTitle ? (
              <input
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="bg-slate-800 text-sm text-white px-3 py-1 rounded border border-indigo-500 outline-none w-full"
              />
            ) : (
              <button
                onClick={() => {
                  setTempTitle(currentSession.title);
                  setIsEditingTitle(true);
                }}
                className="group flex items-center gap-2 text-left truncate hover:bg-slate-800/80 px-2.5 py-1 rounded transition text-xs text-slate-300 hover:text-white"
                title="Click to rename investigation"
              >
                <span className="font-medium text-slate-200 truncate max-w-xs">{currentSession.title}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400 border border-slate-700 rounded px-1">
                  Rename
                </span>
              </button>
            )}
            {isSaving && (
              <span className="ml-2 text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                Saving...
              </span>
            )}
          </div>

          {/* Action buttons & User auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Benchmarks Selector */}
            <div className="relative">
              <button
                onClick={() => setShowBenchmarkDropdown(!showBenchmarkDropdown)}
                className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1.5 rounded-md font-medium transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Load Benchmark</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showBenchmarkDropdown && (
                <div
                  className="absolute right-0 mt-1.5 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs"
                  onMouseLeave={() => setShowBenchmarkDropdown(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-700 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Ready-to-Test Enterprise Cases
                  </div>
                  {SAMPLE_BENCHMARKS.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onLoadBenchmark(b.id);
                        setShowBenchmarkDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-700/80 transition flex flex-col gap-0.5 border-b border-slate-700/50 last:border-b-0"
                    >
                      <div className="font-medium text-slate-200">{b.name}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="text-indigo-400">{b.category}</span>
                        <span>•</span>
                        <span>{b.badge}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* New Investigation */}
            <button
              onClick={onNewSession}
              className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2.5 py-1.5 rounded-md shadow-sm transition"
              title="Start a new investigation"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Session</span>
            </button>

            {/* Past Investigations Drawer */}
            <button
              onClick={onOpenSessions}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-md font-medium transition"
              title="View past investigations"
            >
              <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Investigations</span>
            </button>

            {/* Knowledge Base Modal */}
            <button
              onClick={onOpenKnowledgeBase}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 px-2.5 py-1.5 rounded-md font-medium transition"
              title="View verified institutional knowledge base"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Knowledge Base</span>
            </button>

            {/* User profile / login */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-700 ml-1">
                <div
                  className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700"
                  title={`Logged in as ${user.email}`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[100px] truncate hidden sm:inline">{user.name || user.email}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="text-slate-400 hover:text-rose-400 p-1 rounded transition"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-md font-medium transition"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-400" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
