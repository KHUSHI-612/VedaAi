import React from 'react';
import QuestionItem from './QuestionItem';

interface SectionBlockProps {
  sectionName: string;
}

export default function SectionBlock({ sectionName }: SectionBlockProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold border-l-4 border-indigo-600 pl-3 py-1">
        {sectionName}
      </h3>
      <div className="divide-y divide-slate-100">
        <QuestionItem text="Sample Question 1?" marks={5} difficulty="Medium" />
        <QuestionItem text="Sample Question 2?" marks={10} difficulty="Hard" />
      </div>
    </div>
  );
}
