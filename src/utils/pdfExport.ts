import { jsPDF } from 'jspdf';
import { InvestigationSession } from '../types';

export function generatePdfReport(session: InvestigationSession) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      renderPageHeader();
    }
  }

  function renderPageHeader() {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('RootCause AI | Enterprise Business Diagnostic Dossier', margin, 10);
    doc.text(`Ref: ${session.id.slice(0, 12)}`, pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 12, pageWidth - margin, 12);
  }

  // Cover / Header Banner
  doc.setFillColor(15, 23, 42); // Navy 900
  doc.rect(margin, y, contentWidth, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('ROOTCAUSE AI — BUSINESS DIAGNOSTIC DOSSIER', margin + 6, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Category: ${session.intake.category || 'Operations'}  |  Date: ${new Date(session.updatedAt || Date.now()).toLocaleDateString()}`, margin + 6, y + 18);

  y += 30;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  const titleLines = doc.splitTextToSize(session.title || 'Operational Investigation', contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 6 + 4;

  // STAGE 1: INTAKE & PROBLEM STATEMENT
  checkPageBreak(30);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('STAGE 1: PROBLEM STATEMENT & INTAKE EVIDENCE', margin + 4, y + 5);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  const descLines = doc.splitTextToSize(session.intake.description || 'No description provided.', contentWidth - 4);
  doc.text(descLines, margin + 2, y);
  y += descLines.length * 4.5 + 4;

  if (session.intake.documents && session.intake.documents.length > 0) {
    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Attached Evidence Documents:', margin + 2, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    session.intake.documents.forEach((d) => {
      checkPageBreak(5);
      doc.text(`• ${d.name} (${Math.round(d.size / 1024)} KB) — Parsed text character count: ${d.textContent.length}`, margin + 4, y);
      y += 4;
    });
    y += 3;
  }

  // STAGE 2: CLARIFYING QUESTIONS
  if (session.clarifying.questions && session.clarifying.questions.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('STAGE 2: TARGETED CLARIFYING QUESTIONS & OPERATIONAL FACTS', margin + 4, y + 5);
    y += 10;

    session.clarifying.questions.forEach((q, idx) => {
      checkPageBreak(22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const qText = `Q${idx + 1} [${q.focusArea}]: ${q.question}`;
      const qLines = doc.splitTextToSize(qText, contentWidth - 6);
      doc.text(qLines, margin + 2, y);
      y += qLines.length * 4 + 1;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const ansText = `Answer: ${q.answer || 'No answer recorded.'}`;
      const ansLines = doc.splitTextToSize(ansText, contentWidth - 6);
      doc.text(ansLines, margin + 4, y);
      y += ansLines.length * 4 + 4;
    });
  }

  // STAGE 3: ROOT CAUSE TREE & CONFIDENCE LEDGER
  if (session.investigation.nodes && session.investigation.nodes.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('STAGE 3: ROOT-CAUSE DECONSTRUCTION & CONFIDENCE LEDGER', margin + 4, y + 5);
    y += 10;

    if (session.investigation.summary) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      const sumLines = doc.splitTextToSize(`Assessment Summary: ${session.investigation.summary}`, contentWidth - 4);
      doc.text(sumLines, margin + 2, y);
      y += sumLines.length * 4.5 + 4;
    }

    session.investigation.nodes.forEach((node, i) => {
      checkPageBreak(25);
      // Box outline
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);

      // Confidence badge color
      let badgeR = 100, badgeG = 116, badgeB = 139; // Gray for speculative
      if (node.confidence === 'CONFIRMED') {
        badgeR = 16; badgeG = 149; badgeB = 193; // Emerald/Teal
      } else if (node.confidence === 'LIKELY') {
        badgeR = 217; badgeG = 119; badgeB = 6; // Amber
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(badgeR, badgeG, badgeB);
      doc.text(`[${node.confidence}]`, margin + 2, y);

      doc.setTextColor(15, 23, 42);
      const title = ` (${node.category}) ${node.title}`;
      const titleLines = doc.splitTextToSize(title, contentWidth - 35);
      doc.text(titleLines, margin + 30, y);
      y += Math.max(titleLines.length * 4, 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const descLines = doc.splitTextToSize(`Mechanism: ${node.description}`, contentWidth - 8);
      doc.text(descLines, margin + 4, y);
      y += descLines.length * 3.8 + 1;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text('Evidence cited: ', margin + 4, y);
      doc.setFont('helvetica', 'italic');
      const evText = node.evidence || 'no supporting data provided, inference only.';
      const evLines = doc.splitTextToSize(evText, contentWidth - 30);
      doc.text(evLines, margin + 24, y);
      y += evLines.length * 3.8 + 1;

      if (node.missingData) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 77, 24);
        const missLines = doc.splitTextToSize(`Data to confirm: ${node.missingData}`, contentWidth - 8);
        doc.text(missLines, margin + 4, y);
        y += missLines.length * 3.8 + 1;
      }

      y += 3;
    });
  }

  // STAGE 4: SOLUTIONS MATRIX
  if (session.solutions.items && session.solutions.items.length > 0) {
    checkPageBreak(30);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('STAGE 4: EVALUATED SOLUTIONS COMPARISON MATRIX', margin + 4, y + 5);
    y += 10;

    session.solutions.items.forEach((sol, i) => {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      const solTitle = `${i + 1}. ${sol.solution} (Addresses: ${sol.rootCauseTitle})`;
      const stLines = doc.splitTextToSize(solTitle, contentWidth - 6);
      doc.text(stLines, margin + 2, y);
      y += stLines.length * 4 + 1;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      const metrics = `Estimated Cost: ${sol.estimatedCost}   |   Timeframe: ${sol.estimatedTimeframe}   |   Risk: ${sol.riskLevel}   |   Impact: ${sol.expectedImpact}`;
      doc.text(metrics, margin + 4, y);
      y += 4;

      const actLines = doc.splitTextToSize(`Action Plan: ${sol.actionPlan}`, contentWidth - 8);
      doc.text(actLines, margin + 4, y);
      y += actLines.length * 3.8 + 4;
    });
  }

  // STAGE 5: RECOMMENDATION & MANDATORY DISCLAIMER
  if (session.recommendation.data) {
    const rec = session.recommendation.data;
    checkPageBreak(45);
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('STAGE 5: STRATEGIC RECOMMENDATION & EXECUTION PATHWAY', margin + 4, y + 5);
    y += 11;

    // Primary Path
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Primary Recommended Path Forward:', margin + 2, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const primLines = doc.splitTextToSize(rec.primaryPath, contentWidth - 4);
    doc.text(primLines, margin + 4, y);
    y += primLines.length * 4.5 + 4;

    // Rationale
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Operational Rationale & Trade-offs:', margin + 2, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const ratLines = doc.splitTextToSize(rec.rationale, contentWidth - 6);
    doc.text(ratLines, margin + 4, y);
    y += ratLines.length * 4 + 5;

    // MANDATORY DISCLAIMER CALLOUT BOX
    checkPageBreak(25);
    doc.setFillColor(254, 242, 242); // Red/Amber tint
    doc.setDrawColor(248, 113, 113);
    doc.rect(margin, y, contentWidth, 18, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(153, 27, 27);
    doc.text('MANDATORY GOVERNANCE DISCLAIMER', margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(127, 29, 29);
    const discLines = doc.splitTextToSize(
      rec.disclaimer ||
        'This recommendation is based on the information provided and requires validation by someone with direct operational knowledge before action is taken.',
      contentWidth - 8
    );
    doc.text(discLines, margin + 4, y + 10);
    y += 24;

    // Milestones
    if (rec.immediateMilestones && rec.immediateMilestones.length > 0) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text('Immediate Implementation Milestones:', margin + 2, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      rec.immediateMilestones.forEach((m) => {
        checkPageBreak(6);
        doc.text(`[${m.period}] ${m.action}${m.owner ? ` (Owner: ${m.owner})` : ''}`, margin + 4, y);
        y += 4;
      });
      y += 3;
    }
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `RootCause AI Diagnostic Platform  |  Page ${i} of ${totalPages}  |  Strict Evidence-Based Analysis`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  doc.save(`RootCause_AI_${session.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.pdf`);
}
