'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../../../../store/assessmentStore';
import { WebSocketClient } from '../../../../lib/websocket';
import api from '../../../../lib/api';
import {
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

/* ─── tiny helper ─────────────────────────────────────────────── */
const difficultyLabel = (d?: string) => {
  if (!d) return '';
  return `[${d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()}]`;
};

interface AssignmentDetailsPageProps {
  params: {
    id: string;
  };
}

interface Question {
  text: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Section {
  name: string;
  instructions?: string;
  questions: Question[];
}

interface AssessmentData {
  _id: string;
  title: string;
  subject: string;
  className: string;
  dueDate?: string;
  questionTypes: string[];
  numQuestions: number;
  marksPerQuestion?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  instructions?: string;
  fileUrl?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    sections: Section[];
  };
  createdAt: string;
}

export default function AssignmentDetailsPage({ params }: AssignmentDetailsPageProps) {
  const router = useRouter();
  const { id } = params;

  const { userProfile, loadUserProfile } = useAssessmentStore();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Load User Profile on Mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // 2. Data Fetching Function
  const fetchDetails = useCallback(async () => {
    try {
      const response = await api.get<AssessmentData>(`/assessments/${id}`);
      setAssessment(response.data);
      setError(null);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error('[Page] Failed to fetch assessment details:', error);
      setError(error.response?.data?.error || 'Failed to load question paper details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // 3. Initial Load and WebSocket subscription setup
  useEffect(() => {
    fetchDetails();

    console.log('[Page] Setting up WebSocket subscription for:', id);
    const ws = new WebSocketClient();
    ws.connect(id);

    ws.onMessage((message: unknown) => {
      console.log('[Page WebSocket] Received broadcast message:', message);
      const { event, data } = message as { event: string; data: AssessmentData };

      if (event === 'job:processing') {
        setAssessment((prev) => (prev ? { ...prev, status: 'processing' } : null));
      } else if (event === 'job:completed') {
        setAssessment(data);
      } else if (event === 'job:failed') {
        setAssessment((prev) => (prev ? { ...prev, status: 'failed' } : null));
        setError((data as { error?: string })?.error || 'Background AI question generation failed.');
      }
    });

    return () => {
      console.log('[Page] Cleaning up WebSocket subscription.');
      ws.disconnect();
    };
  }, [id, fetchDetails]);

  // 4. Download PDF Action Handler
  const handleDownloadPDF = () => {
    if (!assessment || assessment.status !== 'completed') return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    window.location.href = `${apiBase}/assessments/${id}/pdf`;
  };



  // 6. Title Case formatting helper for premium typography
  const titleCase = (str: string) => {
    if (!str) return '';
    return str
      .split(' ')
      .filter((w) => w.length > 0)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Calculate user and assessment variables
  const schoolNameRaw = userProfile?.schoolName || 'Delhi Public School, Sector-4, Bokaro';
  const schoolNameFormatted = titleCase(schoolNameRaw);
  const userName = userProfile?.name || 'khushi';
  const className = assessment?.className || 'Grade 8';
  const subject = assessment?.subject || 'Science';

  // Calculate dynamic sum of marks of all generated questions
  const totalMarks =
    assessment?.result?.sections?.reduce(
      (acc, section) => acc + section.questions.reduce((qSum, q) => qSum + q.marks, 0),
      0
    ) ||
    (assessment?.numQuestions ?? 0) * (assessment?.marksPerQuestion ?? 2) ||
    20;

  // Flattened questions list to construct the Answer Key dynamically
  const flattenedQuestions: { text: string; answer?: string }[] = [];
  if (assessment?.result?.sections) {
    assessment.result.sections.forEach((section) => {
      section.questions.forEach((q) => {
        flattenedQuestions.push({
          text: q.text,
          answer: q.correctAnswer,
        });
      });
    });
  }

  // ==========================================
  // VIEW: LOADING SPINNER STATE
  // ==========================================
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-[#f8f9fa] font-sans">
        <Loader2 className="w-12 h-12 text-[#1a1a1a] animate-spin stroke-[2.5]" />
        <span className="text-sm font-bold text-gray-500">Loading Question Paper...</span>
      </div>
    );
  }

  // ==========================================
  // VIEW: ERROR STATE CONTAINER
  // ==========================================
  if (error && (!assessment || assessment.status === 'failed')) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 bg-[#f8f9fa] font-sans">
        <div className="bg-white border border-rose-100 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">Failed to load Assessment</h2>
            <p className="text-sm text-gray-500 max-w-md">{error}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <button
              onClick={fetchDetails}
              className="bg-[#1a1a1a] hover:bg-black text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: QUEUED / PROCESSING ANIMATION VIEW
  // ==========================================
  if (assessment && (assessment.status === 'pending' || assessment.status === 'processing')) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f8f9fa] font-sans px-4 py-8">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-lg border border-gray-100 text-center space-y-6 animate-fadeIn">
          {/* Animated Spinner with multiple rings */}
          <div className="relative flex items-center justify-center w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-[#1a1a1a]/10 animate-spin [animation-duration:10s]" />
            <div className="absolute w-16 h-16 rounded-full border-4 border-t-[#1a1a1a] border-r-transparent border-b-transparent border-l-transparent animate-spin [animation-duration:1.5s]" />
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[#1a1a1a] animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              Generating your question paper...
            </h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed px-4">
              VedaAI is analyzing your instructions and building customized, curriculum-aligned questions. This usually takes under 30 seconds.
            </p>
          </div>

          {/* Simple Dynamic Progress Meter */}
          <div className="space-y-1.5 px-4 pt-2">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Job Status</span>
              <span className="text-orange-500 animate-pulse">{assessment.status}</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner relative">
              <div className="bg-gradient-to-r from-orange-400 to-indigo-500 h-full rounded-full animate-progressAnimation w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: FULL SPEC COMPLETED EXAM PAPER VIEW
  // ==========================================
  return (
    <div className="w-full font-sans pb-16">

      {/* Outer white wrapper for mobile — creates the extra layer effect */}
      <div className="bg-white/80 md:bg-transparent rounded-[28px] md:rounded-none p-3 md:p-0 shadow-sm md:shadow-none">

      {/* 1. PART 1 — Dark banner */}
      <div className="bg-[#303030] text-white px-6 pt-6 pb-6 rounded-[24px] md:rounded-[32px] mb-4 shadow-sm">
        <p className="text-[14px] font-medium leading-relaxed">
          Certainly, {userName}! Here are customized Question Paper for your {subject} {className} classes on the NCERT chapters:
        </p>

        <button
          onClick={handleDownloadPDF}
          className="mt-4 w-[44px] h-[44px] bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors shadow-sm"
        >
          <Download className="w-[20px] h-[20px] text-white" />
        </button>
      </div>

      {/* 3. PART 2 — White exam paper card */}
      <div
        className="bg-white rounded-[24px] md:rounded-[32px] shadow-md md:shadow-sm text-[#0f172a] select-text border border-gray-200 md:border-gray-100"
        style={{ padding: '40px 24px' }}
      >

        {/* ── School / Subject / Class header ── */}
        <div className="text-center space-y-1 pb-5">
          <h2 className="text-[22px] font-bold text-neutral-900">
            {schoolNameFormatted}
          </h2>
          <p className="text-[14px] font-medium text-neutral-700">
            Subject: {subject}
          </p>
          <p className="text-[14px] font-medium text-neutral-700">
            Class: {className}
          </p>
        </div>

        {/* Time / Marks row (stacked, left-aligned) */}
        <div className="flex flex-col gap-2 text-[12px] text-neutral-800 font-medium mt-6">
          <span>Time Allowed: 45 minutes</span>
          <span>Maximum Marks: {totalMarks}</span>
        </div>

        {/* Global instructions */}
        <p className="text-[12px] text-neutral-800 font-medium mt-6 mb-6 leading-relaxed max-w-[280px]">
          All questions are compulsory unless stated otherwise.
        </p>

        {/* Student info blanks — stacked vertically, solid underlines */}
        <div className="flex flex-col gap-3 text-[12px] font-medium text-neutral-800 mb-8">
          <div className="flex items-end gap-1">
            <span>Name:</span>
            <div className="border-b-2 border-[#1a1a1a] w-[140px] mb-[2px]" />
          </div>
          <div className="flex items-end gap-1">
            <span>Roll Number:</span>
            <div className="border-b-2 border-[#1a1a1a] w-[110px] mb-[2px]" />
          </div>
          <div className="flex items-end gap-1">
            <span>Class: {className} Section:</span>
            <div className="border-b-2 border-[#1a1a1a] w-[70px] mb-[2px]" />
          </div>
        </div>

        {/* ── 4. Sections & Questions ── */}
        <div className="space-y-10">
          {assessment?.result?.sections && assessment.result.sections.length > 0 ? (
            assessment.result.sections.map((section, sIdx) => {
              const secMarks = section.questions[0]?.marks || 2;
              const hasMCQ =
                section.questions[0]?.options &&
                section.questions[0].options.length > 0;
              const sectionSubtitle = hasMCQ
                ? 'Multiple Choice Questions'
                : 'Short Answer Questions';

              return (
                <div key={sIdx}>

                  {/* Section header: centered name */}
                  <div className="text-center mb-1">
                    <h3 className="text-[15px] font-bold text-neutral-900">
                      {section.name}
                    </h3>
                  </div>

                  {/* Subtitle: bold, left-aligned */}
                  <p className="text-[13.5px] font-bold text-neutral-800 mt-2 mb-1">
                    {sectionSubtitle}
                  </p>

                  {/* Instructions: italic, left-aligned */}
                  <p className="text-[12px] text-neutral-500 italic mb-5">
                    {section.instructions ||
                      `Attempt all questions. Each question carries ${secMarks} marks.`}
                  </p>

                  {/* Questions: plain numbered list */}
                  <ol className="space-y-4 list-none">
                    {section.questions && section.questions.length > 0 ? (
                      section.questions.map((question, qIndex) => (
                        <li key={qIndex}>
                          {/* "1. [Easy] Question text [2 Marks]" */}
                          <p className="text-[13.5px] text-neutral-900 leading-relaxed">
                            <span className="font-semibold">{qIndex + 1}.</span>{' '}
                            <span className="text-neutral-500 font-medium">
                              {difficultyLabel(question.difficulty)}
                            </span>{' '}
                            <span>{question.text}</span>{' '}
                            <span className="font-semibold text-neutral-700">
                              [{question.marks} Marks]
                            </span>
                          </p>

                          {/* MCQ options indented */}
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2 ml-6 grid grid-cols-1 sm:grid-cols-2 gap-1">
                              {question.options.map((opt, oIndex) => (
                                <p
                                  key={oIndex}
                                  className="text-[12.5px] text-neutral-600"
                                >
                                  {opt}
                                </p>
                              ))}
                            </div>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="text-neutral-400 text-[13px] italic">
                        No questions found in this section.
                      </li>
                    )}
                  </ol>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-sm text-slate-400 font-semibold italic">
              No questions found inside this paper config.
            </div>
          )}
        </div>

        {/* ── 5. Answer Key ── */}
        {flattenedQuestions.length > 0 && (
          <div className="mt-12 pt-8 border-t-2 border-dashed border-neutral-200 space-y-6">
            <h4 className="text-[18px] font-bold text-neutral-900 tracking-tight">
              Answer Key:
            </h4>
            <div className="flex flex-col gap-y-5 text-[15px] text-neutral-700 leading-relaxed">
              {flattenedQuestions.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="font-semibold text-neutral-800">{idx + 1}.</span>
                  <span className="text-neutral-700">
                    {item.answer || 'Provide your answer'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      </div> {/* End outer white wrapper */}

    </div>
  );
}
