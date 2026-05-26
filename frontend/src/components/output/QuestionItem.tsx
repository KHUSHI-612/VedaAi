import React from 'react';

interface QuestionItemProps {
  text: string;
  marks: number;
  difficulty: string;
}

export default function QuestionItem({ text, marks, difficulty }: QuestionItemProps) {
  return (
    <div className="py-4 flex justify-between items-start space-x-4">
      <div className="space-y-1">
        <p className="text-slate-800 dark:text-slate-200">{text}</p>
        <span className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">
          {difficulty}
        </span>
      </div>
      <div className="text-sm font-semibold text-slate-900 dark:text-white">
        [{marks} Marks]
      </div>
    </div>
  );
}
