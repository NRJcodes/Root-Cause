import React from 'react';
import {
  FileText,
  HelpCircle,
  GitFork,
  CheckCircle2,
  TableProperties,
  Compass,
  Download,
  Lock,
} from 'lucide-react';
import { InvestigationSession } from '../types';

interface StageIndicatorProps {
  currentStage: number;
  session: InvestigationSession;
  onSelectStage: (stage: number) => void;
}

export const STAGES = [
  {
    num: 1,
    id: 'intake',
    title: 'Intake',
    desc: 'Problem Definition & Evidence',
    icon: FileText,
  },
  {
    num: 2,
    id: 'clarifying',
    title: 'Clarifying',
    desc: 'Targeted Q&A',
    icon: HelpCircle,
  },
  {
    num: 3,
    id: 'investigation',
    title: 'Investigation',
    desc: 'Root Cause Deconstruction',
    icon: GitFork,
  },
  {
    num: 4,
    id: 'solutions',
    title: 'Solutions',
    desc: 'Comparative Matrix',
    icon: TableProperties,
  },
  {
    num: 5,
    id: 'recommendation',
    title: 'Recommendation',
    desc: 'Decision & Path Forward',
    icon: Compass,
  },
  {
    num: 6,
    id: 'export',
    title: 'Export',
    desc: 'Executive Dossier (PDF)',
    icon: Download,
  },
];

export const StageIndicator: React.FC<StageIndicatorProps> = ({
  currentStage,
  session,
  onSelectStage,
}) => {
  // Check completion logic
  const isStageUnlocked = (stageNum: number): boolean => {
    if (stageNum === 1) return true;
    if (stageNum === 2) return !!session.intake.description.trim();
    if (stageNum === 3) return session.clarifying.questions.length > 0;
    if (stageNum === 4) return session.investigation.nodes.length > 0;
    if (stageNum === 5) return session.solutions.items.length > 0;
    if (stageNum === 6) return !!session.recommendation.data;
    return false;
  };

  const isStageCompleted = (stageNum: number): boolean => {
    if (stageNum === 1) return !!session.intake.description.trim() && session.clarifying.questions.length > 0;
    if (stageNum === 2) return session.clarifying.isSubmitted;
    if (stageNum === 3) return session.investigation.nodes.length > 0;
    if (stageNum === 4) return session.solutions.items.length > 0;
    if (stageNum === 5) return !!session.recommendation.data;
    if (stageNum === 6) return true;
    return false;
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur border-b border-slate-800 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav aria-label="Investigation Stages">
          <ol className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              const isCurrent = currentStage === stage.num;
              const isCompleted = isStageCompleted(stage.num);
              const isUnlocked = isStageUnlocked(stage.num);

              let containerClasses = 'relative flex items-center p-2.5 rounded-lg border transition-all text-left';
              let badgeClasses = 'w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0';
              let titleColor = 'text-slate-300';
              let descColor = 'text-slate-500';

              if (isCurrent) {
                containerClasses += ' bg-indigo-950/60 border-indigo-500 shadow-sm ring-1 ring-indigo-500/50';
                badgeClasses += ' bg-indigo-600 text-white shadow-sm';
                titleColor = 'text-white font-bold';
                descColor = 'text-indigo-300';
              } else if (isCompleted) {
                containerClasses += ' bg-slate-800/80 border-slate-700/80 hover:bg-slate-800 cursor-pointer';
                badgeClasses += ' bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
                titleColor = 'text-slate-200 font-semibold';
                descColor = 'text-slate-400';
              } else if (isUnlocked) {
                containerClasses += ' bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60 cursor-pointer';
                badgeClasses += ' bg-slate-700 text-slate-300';
                titleColor = 'text-slate-300 font-medium';
                descColor = 'text-slate-500';
              } else {
                containerClasses += ' bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed';
                badgeClasses += ' bg-slate-800 text-slate-500';
                titleColor = 'text-slate-500';
                descColor = 'text-slate-600';
              }

              return (
                <li key={stage.num}>
                  <button
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => isUnlocked && onSelectStage(stage.num)}
                    className={`w-full ${containerClasses}`}
                  >
                    <div className="flex items-center gap-2.5 w-full">
                      <div className={badgeClasses}>
                        {isCompleted && !isCurrent ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : isUnlocked ? (
                          stage.num
                        ) : (
                          <Lock className="w-3 h-3 text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${titleColor} truncate`}>{stage.title}</span>
                          <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-400' : 'text-slate-500'} hidden lg:block`} />
                        </div>
                        <p className={`text-[10px] ${descColor} truncate hidden sm:block`}>{stage.desc}</p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};
