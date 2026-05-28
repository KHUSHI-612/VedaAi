'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../../../store/assessmentStore';
import api from '../../../lib/api';
import {
  CloudUpload,
  CalendarPlus,
  X,
  Mic,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  Check,
  ChevronDown,
} from 'lucide-react';

interface QuestionRow {
  id: string;
  type: 'mcq' | 'short' | 'long' | 'diagram' | 'numerical';
  numQuestions: number;
  marks: number;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { userProfile, createAssessment, loadUserProfile } = useAssessmentStore();

  // 1. Block access if no profile is loaded
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    // If loading finished and there is no user profile, redirect immediately!
    if (userProfile === null) {
      router.replace('/dashboard?triggerProfile=true');
    }
  }, [userProfile, router]);

  // Step indicator state
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // ==========================================
  // STEP 1 STATE VARIABLES
  // ==========================================
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dueDate, setDueDate] = useState('');

  // Dynamic question rows (MCQ and Short default rows)
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([
    { id: '1', type: 'mcq', numQuestions: 4, marks: 1 },
    { id: '2', type: 'short', numQuestions: 3, marks: 2 },
  ]);

  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // ==========================================
  // STEP 2 STATE VARIABLES
  // ==========================================
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [className, setClassName] = useState('');

  // Difficulty percentages
  const [easyPercent, setEasyPercent] = useState(40);
  const [mediumPercent, setMediumPercent] = useState(40);
  const [hardPercent, setHardPercent] = useState(20);

  // ==========================================
  // STEP 1 HANDLERS & COMPUTATIONS
  // ==========================================

  // Trigger file select dialog
  const handleBrowseFilesClick = () => {
    fileInputRef.current?.click();
  };

  // Process file upload directly to Render cloud API
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB limit constraint check
    if (file.size > 10 * 1024 * 1024) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadedFileUrl(response.data.filePath);
      setUploadedFileName(file.name);
    } catch (err) {
      console.error('[Create] File upload failed:', err);
      alert('Failed to upload file. The local disk upload will be mocked.');
      // Fallback fallback mock file url for seamless offline dev testing
      setUploadedFileUrl(`/uploads/mock-${Date.now()}-${file.name}`);
      setUploadedFileName(file.name);
    } finally {
      setIsUploading(false);
    }
  };

  // Add question type row
  const addQuestionRow = () => {
    const newRow: QuestionRow = {
      id: Math.random().toString(),
      type: 'mcq',
      numQuestions: 1,
      marks: 1,
    };
    setQuestionRows([...questionRows, newRow]);
  };

  // Remove question row
  const removeQuestionRow = (id: string) => {
    if (questionRows.length <= 1) {
      alert('You must have at least one question type.');
      return;
    }
    setQuestionRows(questionRows.filter((row) => row.id !== id));
  };

  // Modify question type values
  const updateRowField = (id: string, field: keyof QuestionRow, value: QuestionRow[keyof QuestionRow]) => {
    setQuestionRows(
      questionRows.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  // Calculate dynamic summary stats
  const totalQuestions = questionRows.reduce((acc, curr) => acc + curr.numQuestions, 0);
  const totalMarks = questionRows.reduce((acc, curr) => acc + (curr.numQuestions * curr.marks), 0);

  // Validate Step 1 and proceed
  const handleNextStep = () => {
    setFormError('');
    if (!dueDate) {
      setFormError('Please select a valid Due Date to proceed.');
      return;
    }
    setStep(2);
  };

  // ==========================================
  // STEP 2 SUBMIT HANDLER & VALIDATION
  // ==========================================
  const handleGenerateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!assignmentTitle.trim() || !subject.trim() || !className.trim()) {
      setFormError('Please fill in the Assignment Title, Subject, and Class fields.');
      return;
    }

    const totalDifficulty = easyPercent + mediumPercent + hardPercent;
    if (totalDifficulty !== 100) {
      setFormError(`Difficulty percentages must sum to exactly 100%. Currently it is ${totalDifficulty}%.`);
      return;
    }

    setIsSubmitting(true);

    // Map difficulty percentages to dominant string ('easy' | 'medium' | 'hard')
    let dominantDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
    if (easyPercent >= mediumPercent && easyPercent >= hardPercent) {
      dominantDifficulty = 'easy';
    } else if (hardPercent >= easyPercent && hardPercent >= mediumPercent) {
      dominantDifficulty = 'hard';
    }

    // Extract raw question types strings from rows
    const questionTypes = questionRows.map((row) => {
      if (row.type === 'mcq') return 'Multiple Choice Questions';
      if (row.type === 'short') return 'Short Questions';
      if (row.type === 'long') return 'Long Questions';
      if (row.type === 'diagram') return 'Diagram/Graph-Based Questions';
      return 'Numerical Problems';
    });

    const assessmentPayload = {
      title: assignmentTitle.trim(),
      subject: subject.trim(),
      className: className.trim(),
      dueDate: dueDate,
      questionTypes: Array.from(new Set(questionTypes)), // remove duplicates
      numQuestions: totalQuestions,
      marksPerQuestion: Math.round(totalMarks / totalQuestions) || 2, // average fallback
      difficulty: dominantDifficulty,
      instructions: additionalInstructions.trim(),
    };

    try {
      const created = await createAssessment(assessmentPayload);
      // On success, redirect directly to the assessment processing view
      router.push(`/dashboard/assignments/${created._id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      console.error('[Create] Generation failed:', error);
      setFormError(error.response?.data?.error || 'Failed to trigger AI assessment generation. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!userProfile) {
    return null; // Let the layout effect trigger the redirect cleanly
  }

  return (
    <div className="max-w-[1100px] mx-auto w-full pb-10 flex gap-8">
      {/* Left Column: Form Content */}
      <div className="flex-1 min-w-0">

        {/* 1. Header Section */}
        <div className="mb-6 flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 bg-[#4ade80] rounded-full ring-4 ring-[#4ade80]/20" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
              Create Assignment
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            Set up a new assignment for your students
          </p>
        </div>

        {/* 2. Step Progress Bar */}
        <div className="w-full bg-gray-200 h-1.5 rounded-full mb-8 relative overflow-hidden shadow-inner">
          <div
            className="bg-[#1a1a1a] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {/* 3. Main Form Container */}
        <div className="relative">

          {/* Error Alert Display */}
          {formError && (
            <div className="mb-6 flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <span className="text-xs font-semibold">{formError}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: ASSIGNMENT DETAILS                               */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="animate-fadeIn pb-32 md:pb-0">
              <div className="space-y-6 md:bg-white md:border md:border-gray-100 md:rounded-[32px] md:p-8 md:shadow-[0_8px_32px_rgba(0,0,0,0.02)]">

              {/* Step Heading */}
              <div>
                <h2 className="text-[17px] font-bold text-gray-900">
                  Assignment Details
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Basic information about your assignment
                </p>
              </div>

              {/* Drag & Drop File Upload Area */}
              <div className="space-y-2">
                <div
                  onClick={handleBrowseFilesClick}
                  className="bg-gray-50/50 border-2 border-dashed border-gray-200 hover:border-orange-200 hover:bg-orange-50/10 cursor-pointer rounded-3xl p-8 text-center flex flex-col items-center justify-center transition-all duration-200 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/jpeg,image/png,application/pdf"
                    className="hidden"
                  />

                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                      <span className="text-xs font-semibold text-gray-500">Uploading File...</span>
                    </div>
                  ) : uploadedFileUrl ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 mb-2">
                        <Check className="w-5 h-5 text-emerald-500" />
                      </div>
                      <span className="text-sm font-bold text-gray-700 max-w-[280px] truncate">
                        {uploadedFileName}
                      </span>
                      <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1">
                        File Uploaded successfully
                      </span>
                    </div>
                  ) : (
                    <>
                      <CloudUpload className="w-8 h-8 text-gray-700 group-hover:scale-105 transition-transform" />
                      <p className="text-sm font-bold text-gray-700 mt-3">
                        Choose a file or drag & drop it here
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        JPEG, PNG, upto 10MB
                      </p>
                      <button
                        type="button"
                        className="mt-4 bg-white border border-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-gray-50 shadow-sm transition-all"
                      >
                        Browse Files
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 text-center leading-normal">
                  Upload images of your preferred document/image
                </p>
              </div>

              {/* Due Date field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-medium text-gray-700 shadow-sm"
                  />
                  <CalendarPlus className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Question Types Layout Grid */}
              <div className="space-y-4 pt-2">
                {/* Rows */}
                <div className="space-y-4">
                  {questionRows.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-col bg-white rounded-3xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
                    >
                      {/* Top row: Dropdown and Delete */}
                      <div className="flex items-center justify-between mb-4 px-2">
                        <div className="relative flex-1">
                          <select
                            value={row.type}
                            onChange={(e) => updateRowField(row.id, 'type', e.target.value)}
                            className="w-full appearance-none bg-transparent text-[15px] font-medium text-gray-800 pr-8 focus:outline-none cursor-pointer"
                          >
                            <option value="mcq">Multiple Choice Questions</option>
                            <option value="short">Short Questions</option>
                            <option value="long">Long Questions</option>
                            <option value="diagram">Diagram/Graph-Based Questions</option>
                            <option value="numerical">Numerical Problems</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-800 pointer-events-none stroke-[2.5]" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestionRow(row.id)}
                          className="text-gray-800 hover:text-red-500 transition-colors p-1"
                        >
                          <X className="w-4.5 h-4.5 stroke-[2]" />
                        </button>
                      </div>

                      {/* Bottom Box: No. of Questions and Marks */}
                      <div className="bg-[#f0f0f0] rounded-[24px] p-4 flex gap-4">
                        {/* No. of Questions */}
                        <div className="flex-1 flex flex-col items-center">
                          <span className="text-[13px] text-gray-800 font-medium mb-3">No. of Questions</span>
                          <div className="w-full bg-white border-0 rounded-full px-3 py-2 flex items-center justify-between shadow-sm select-none">
                            <button
                              type="button"
                              onClick={() => updateRowField(row.id, 'numQuestions', Math.max(1, row.numQuestions - 1))}
                              className="text-gray-400 hover:text-gray-800 text-[20px] leading-none font-light px-2"
                            >
                              −
                            </button>
                            <span className="text-[14px] font-bold text-gray-800">
                              {row.numQuestions}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateRowField(row.id, 'numQuestions', row.numQuestions + 1)}
                              className="text-gray-400 hover:text-gray-800 text-[20px] leading-none font-light px-2"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Marks */}
                        <div className="flex-1 flex flex-col items-center">
                          <span className="text-[13px] text-gray-800 font-medium mb-3">Marks</span>
                          <div className="w-full bg-white border-0 rounded-full px-3 py-2 flex items-center justify-between shadow-sm select-none">
                            <button
                              type="button"
                              onClick={() => updateRowField(row.id, 'marks', Math.max(1, row.marks - 1))}
                              className="text-gray-400 hover:text-gray-800 text-[20px] leading-none font-light px-2"
                            >
                              −
                            </button>
                            <span className="text-[14px] font-bold text-gray-800">
                              {row.marks}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateRowField(row.id, 'marks', row.marks + 1)}
                              className="text-gray-400 hover:text-gray-800 text-[20px] leading-none font-light px-2"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Question Button */}
                <button
                  type="button"
                  onClick={addQuestionRow}
                  className="flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-orange-500 py-2 px-3 rounded-xl hover:bg-gray-50 transition-colors mt-2"
                >
                  <span className="w-5 h-5 bg-[#1a1a1a] hover:bg-black rounded-full flex items-center justify-center text-white text-sm">
                    +
                  </span>
                  <span>Add Question Type</span>
                </button>
              </div>

              {/* Total Summary Stats */}
              <div className="flex flex-col items-end text-right gap-1 pt-2">
                <span className="text-xs font-bold text-gray-700">
                  Total Questions: <span className="text-sm font-bold text-orange-600 pl-1">{totalQuestions}</span>
                </span>
                <span className="text-xs font-bold text-gray-700">
                  Total Marks: <span className="text-sm font-bold text-orange-600 pl-1">{totalMarks}</span>
                </span>
              </div>

              {/* Additional Info Textarea */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">
                  Additional Information (For better output)
                </label>
                <div className="relative bg-gray-50/50 border border-gray-100 rounded-3xl p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 focus-within:border-orange-400 transition-all shadow-inner">
                  <textarea
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    placeholder="e.g. Generate a question paper for a 3 hour exam duration..."
                    rows={4}
                    className="w-full bg-transparent px-4 py-3 text-sm placeholder-gray-400 focus:outline-none text-gray-700 font-medium resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => alert('Speech synthesis/microphone is coming soon!')}
                    className="absolute right-4 bottom-4 p-2 bg-white hover:bg-gray-100 border border-gray-100 text-gray-400 hover:text-gray-700 rounded-full transition-all shadow-sm"
                  >
                    <Mic className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              </div>
              
              {/* Step 1 Navigation footer buttons - Floating on mobile, Static outside on desktop */}
              <div className="fixed bottom-[80px] left-0 right-0 px-6 flex justify-center z-40 md:static md:bottom-auto md:px-0 md:justify-end md:mt-6">
                <div className="flex items-center bg-white md:bg-transparent rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] md:shadow-none p-1.5 md:p-0 gap-0 md:gap-4 border md:border-0 border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard')}
                    className="bg-white text-gray-800 hover:bg-gray-50 py-3.5 px-6 rounded-l-full md:rounded-full md:border md:border-gray-200 text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform"
                  >
                    <ArrowLeft className="w-4.5 h-4.5" />
                    <span className="pr-2 md:pr-0">Previous</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="bg-[#1a1a1a] text-white hover:bg-black py-3.5 px-8 rounded-full text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform shadow-md"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: PAPER DETAILS                                    */}
          {/* ======================================================== */}
          {step === 2 && (
            <form onSubmit={handleGenerateAssessment} className="animate-fadeIn pb-32 md:pb-0">
              <div className="space-y-6 md:bg-white md:border md:border-gray-100 md:rounded-[32px] md:p-8 md:shadow-[0_8px_32px_rgba(0,0,0,0.02)]">

              {/* Step Heading */}
              <div>
                <h2 className="text-[17px] font-bold text-gray-900">
                  Paper Details
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Refine parameters and configure paper distribution details
                </p>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g. Midterm Physics Exam"
                  className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-semibold text-gray-700"
                />
              </div>

              {/* Subject and Class Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Physics"
                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-semibold text-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block">
                    Target Class / Grade
                  </label>
                  <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="e.g. Grade 11"
                    className="w-full px-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all font-semibold text-gray-700"
                  />
                </div>
              </div>

              {/* Difficulty Distributions */}
              <div className="space-y-4 pt-2">
                <label className="text-sm font-bold text-gray-700 block">
                  Difficulty Distribution (Must sum to 100%)
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                  {/* 1. Easy % */}
                  <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-3 bg-gray-50/50 sm:bg-white border border-gray-100 sm:border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <span className="text-xs font-bold text-gray-500">Easy %:</span>
                    <div className="flex items-center gap-2.5 bg-white sm:bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1.5 shadow-sm mt-0 sm:mt-2">
                      <button
                        type="button"
                        onClick={() => setEasyPercent(Math.max(0, easyPercent - 5))}
                        className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-700">
                        {easyPercent}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setEasyPercent(Math.min(100, easyPercent + 5))}
                        className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 2. Medium % */}
                  <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-3 bg-gray-50/50 sm:bg-white border border-gray-100 sm:border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <span className="text-xs font-bold text-gray-500">Medium %:</span>
                    <div className="flex items-center gap-2.5 bg-white sm:bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1.5 shadow-sm mt-0 sm:mt-2">
                      <button
                        type="button"
                        onClick={() => setMediumPercent(Math.max(0, mediumPercent - 5))}
                        className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-700">
                        {mediumPercent}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setMediumPercent(Math.min(100, mediumPercent + 5))}
                        className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 3. Hard % */}
                  <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-start gap-3 bg-gray-50/50 sm:bg-white border border-gray-100 sm:border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <span className="text-xs font-bold text-gray-500">Hard %:</span>
                    <div className="flex items-center gap-2.5 bg-white sm:bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1.5 shadow-sm mt-0 sm:mt-2">
                      <button
                        type="button"
                        onClick={() => setHardPercent(Math.max(0, hardPercent - 5))}
                        className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-700">
                        {hardPercent}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setHardPercent(Math.min(100, hardPercent + 5))}
                        className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                </div>

                {/* Dynamic sum helper alert indicator */}
                <div className="flex items-center justify-between px-3 pt-1 text-[11px] font-bold">
                  <span className="text-gray-400">Sum Total Checklist:</span>
                  <span
                    className={
                      easyPercent + mediumPercent + hardPercent === 100
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    }
                  >
                    {easyPercent + mediumPercent + hardPercent}% / 100%
                  </span>
                </div>
              </div>

              </div>

              {/* Step 2 Navigation footer buttons - Floating on mobile, Static outside on desktop */}
              <div className="fixed bottom-[80px] left-0 right-0 px-6 flex justify-center z-40 md:static md:bottom-auto md:px-0 md:justify-end md:mt-6">
                <div className="flex items-center bg-white md:bg-transparent rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] md:shadow-none p-1.5 md:p-0 gap-0 md:gap-4 border md:border-0 border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isSubmitting}
                    className="bg-white text-gray-800 hover:bg-gray-50 py-3.5 px-6 rounded-l-full md:rounded-full md:border md:border-gray-200 text-sm font-semibold flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <ArrowLeft className="w-4.5 h-4.5" />
                    <span className="pr-2 md:pr-0">Previous</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#1a1a1a] text-white hover:bg-black py-3.5 px-8 rounded-full text-sm font-semibold flex items-center gap-2.5 active:scale-95 transition-transform shadow-md disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        <span>Generating Paper...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate</span>
                        <ArrowRight className="w-4.5 h-4.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}
