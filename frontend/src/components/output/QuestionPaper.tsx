import React from 'react';
import SectionBlock from './SectionBlock';

interface QuestionPaperProps {
  id: string;
}

export default function QuestionPaper({ id }: QuestionPaperProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm space-y-8">
      <div className="text-center border-b pb-6 space-y-2">
        <h2 className="text-2xl font-bold">VEDA AI CREATED ASSESSMENT</h2>
        <p className="text-sm text-slate-500">ID Reference: {id}</p>
      </div>
      <SectionBlock sectionName="Section A" />
      <SectionBlock sectionName="Section B" />
    </div>
  );
}
