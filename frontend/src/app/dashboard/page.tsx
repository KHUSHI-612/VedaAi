'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAssessmentStore } from '../../store/assessmentStore';
import { format } from 'date-fns';
import api from '../../lib/api';
import {
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Eye,
  Plus,
  Loader2,
  AlertTriangle,
  X,
  ArrowLeft,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const {
    assessments,
    userProfile,
    fetchAll,
    setUserProfile,
    loadUserProfile,
  } = useAssessmentStore();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter] = useState<'all' | 'completed' | 'processing' | 'pending'>('all');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // First-time user modal state variables
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [modalName, setModalName] = useState('');
  const [modalSchoolName, setModalSchoolName] = useState('');
  const [modalCity, setModalCity] = useState('');
  const [modalError, setModalError] = useState('');

  // 1. Initial hydration and data loading
  useEffect(() => {
    loadUserProfile();

    const initData = async () => {
      try {
        await fetchAll();
      } catch (err) {
        console.error('Failed to load assessments during initialization:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [loadUserProfile, fetchAll]);

  // 2. Trigger welcome modal ONLY if redirected with triggerProfile=true parameter and profile is missing
  useEffect(() => {
    if (!isLoading && !userProfile) {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('triggerProfile') === 'true') {
          setShowWelcomeModal(true);
          setModalError('Please set up your profile to start creating assignments!');
        }
      }
    }
  }, [isLoading, userProfile]);

  const handleCreateAssignmentClick = () => {
    if (!userProfile) {
      setShowWelcomeModal(true);
      setModalError('Please set up your profile to start creating assignments!');
    } else {
      router.push('/dashboard/create');
    }
  };

  // 3. Handle welcome modal form submission
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalName.trim() || !modalSchoolName.trim() || !modalCity.trim()) {
      setModalError('Please fill in all three fields to get started.');
      return;
    }

    if (modalName.trim().length < 2) {
      setModalError('Your name must be at least 2 characters long.');
      return;
    }
    if (modalSchoolName.trim().length < 3) {
      setModalError('School name must be at least 3 characters long.');
      return;
    }
    if (modalCity.trim().length < 3) {
      setModalError('City location must be at least 3 characters long.');
      return;
    }

    // Title case helper
    const titleCase = (str: string) =>
      str
        .split(' ')
        .filter((w) => w.length > 0)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    const profile = {
      name: titleCase(modalName.trim()),
      schoolName: titleCase(modalSchoolName.trim()),
      city: titleCase(modalCity.trim()),
    };

    setUserProfile(profile);
    setShowWelcomeModal(false);
  };

  // 4. Handle card delete actions
  const handleDeleteAssessment = async (id: string) => {
    setActiveMenuId(null);
    if (!confirm('Are you sure you want to delete this assessment? This action cannot be undone.')) {
      return;
    }

    try {
      // Attempt delete API call in the backend
      await api.delete(`/assessments/${id}`);
    } catch (err) {
      console.warn('[Dashboard] Backend delete endpoint threw an error or was not found. Filtering locally.', err);
    } finally {
      // Always update the client Zustand store locally to keep UI extremely responsive
      useAssessmentStore.setState((state) => ({
        assessments: state.assessments.filter((item) => item._id !== id),
      }));
    }
  };

  // 5. Format dates safely helper
  const formatDateSafe = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd-MM-yyyy');
    } catch {
      return dateString;
    }
  };

  // 6. Filter assessments based on search query
  const filteredAssessments = assessments.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <span className="text-sm font-semibold text-gray-500">Loading VedaAI Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="relative pb-16 w-full flex flex-col flex-1 h-full">

      {/* ======================================================== */}
      {/* STATE 1: EMPTY STATE                                     */}
      {/* ======================================================== */}
      {assessments.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center flex-1 w-full h-full px-4 m-auto pb-12 transform -translate-x-4 translate-y-6">
          {/* Centered Illustration */}
          <div className="relative w-[340px] h-[260px] mb-8">
            <Image
              src="/Illustration found.png"
              alt="No assignments yet"
              fill
              className="object-contain"
              priority
            />
          </div>

          <h2 className="text-[22px] font-bold text-[#1a1a1a] tracking-tight leading-tight">
            No assignments yet
          </h2>

          <p className="text-[14px] text-[#666666] max-w-[480px] mt-3 mb-8 leading-relaxed">
            Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>

          <button
            onClick={handleCreateAssignmentClick}
            className="bg-[#1a1a1a] hover:bg-black text-white px-7 py-3 rounded-full text-[14.5px] font-semibold shadow-md transition-all active:scale-[0.98]"
          >
            + Create Your First Assignment
          </button>
        </div>
      ) : (
        /* ======================================================== */
        /* STATE 2: ASSIGNMENTS GRID STATE                           */
        /* ======================================================== */
        <div className="space-y-6 animate-fadeIn">

          {/* Header Section */}
          <div className="flex items-center relative h-10 mb-2 mt-2">
            <button className="md:hidden absolute left-0 w-10 h-10 bg-[#e5e7eb] rounded-full flex items-center justify-center transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-800" />
            </button>
            <h1 className="text-[16px] md:text-2xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 tracking-tight">
              Assignments
            </h1>
          </div>

          {/* Filter & Search Controls */}
          <div className="bg-white rounded-[24px] px-4 py-3.5 flex items-center gap-3 shadow-sm border border-gray-100">
            {/* Filter button */}
            <button className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-[13px] font-medium transition-colors border-r border-gray-200 pr-3">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Name"
                className="w-full pl-8 pr-4 py-1 bg-transparent border-none text-[13px] placeholder-gray-400 focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Grid Layout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
            {filteredAssessments.map((assessment) => (
              <div
                key={assessment._id}
                className="relative bg-[#f8f9fa] rounded-[24px] p-5 transition-all duration-200 cursor-pointer shadow-sm border border-gray-100/50"
                onClick={() => router.push(`/dashboard/assignments/${assessment._id}`)}
              >
                {/* 3-Dot Options Button */}
                <div className="absolute right-4 top-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === assessment._id ? null : assessment._id); }}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* Actions Dropdown */}
                  {activeMenuId === assessment._id && (
                    <>
                      {/* Backdrop overlay — stop propagation so it doesn't navigate */}
                      <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />

                      <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl p-1.5 z-20 flex flex-col gap-0.5 animate-fadeIn">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(null);
                            router.push(`/dashboard/assignments/${assessment._id}`);
                          }}
                          className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4.5 h-4.5 text-gray-400" />
                          <span>View Assignment</span>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteAssessment(assessment._id); }}
                          className="flex items-center gap-2.5 w-full text-left px-3 py-2 rounded-xl text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4.5 h-4.5 text-red-500" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Card Main details */}
                <div className="space-y-4 pr-6">
                  {/* Title */}
                  <h3 className="text-[15px] font-bold text-neutral-800 line-clamp-1">
                    {assessment.title || 'Untitled Assessment'}
                  </h3>

                  {/* Date Row */}
                  <div className="flex items-center gap-3 text-[12px] text-gray-500 font-medium">
                    <span>
                      <span className="text-gray-900 font-bold">Assigned on :</span> {formatDateSafe(assessment.createdAt)}
                    </span>
                    <span>
                      <span className="text-gray-900 font-bold">Due :</span> 21-06-2025
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Desktop Fixed Bottom Create Button — centered in main content area */}
          <div className="hidden md:flex justify-center fixed bottom-6 z-20"
            style={{ left: '280px', right: '0', pointerEvents: 'none' }}
          >
            <button
              onClick={handleCreateAssignmentClick}
              style={{ pointerEvents: 'auto' }}
              className="bg-[#1a1a1a] hover:bg-black text-white px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-150 border border-gray-800"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          </div>

        </div>
      )}



      {/* ======================================================== */}
      {/* FIRST-TIME USER MODAL                                    */}
      {/* ======================================================== */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl relative flex flex-col items-center border border-gray-100 animate-scaleIn">

            {/* Close Button X */}
            <button
              type="button"
              onClick={() => setShowWelcomeModal(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-700 transition-colors p-1.5 rounded-full hover:bg-gray-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* VedaAI Logo Header */}
            <div className="relative w-[130px] h-9 mb-4">
              <Image
                src="/logo2.png"
                alt="VedaAI Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            <h2 className="text-[20px] font-bold text-gray-900 mt-2 text-center leading-tight">
              Welcome to VedaAI! 👋
            </h2>
            <p className="text-[13px] text-gray-400 mt-1 mb-6 text-center">
              Tell us about yourself to get started creating assessments.
            </p>

            {modalError && (
              <div className="w-full mb-4 flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-3 rounded-xl text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="w-full space-y-4">

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 pl-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 focus:bg-white transition-all text-gray-800 font-medium"
                />
              </div>

              {/* School */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 pl-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={modalSchoolName}
                  onChange={(e) => setModalSchoolName(e.target.value)}
                  placeholder="e.g. Delhi Public School"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 focus:bg-white transition-all text-gray-800 font-medium"
                />
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 pl-1">
                  City / Location
                </label>
                <input
                  type="text"
                  value={modalCity}
                  onChange={(e) => setModalCity(e.target.value)}
                  placeholder="e.g. Bokaro Steel City"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 focus:bg-white transition-all text-gray-800 font-medium"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-[#1a1a1a] hover:bg-black text-white py-3.5 rounded-full text-sm font-semibold shadow-md active:scale-[0.99] transition-all duration-150 mt-6"
              >
                Get Started
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button (FAB) */}
      <button
        onClick={handleCreateAssignmentClick}
        className="md:hidden fixed bottom-24 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md z-50 transition-transform active:scale-95"
      >
        <Plus className="w-6 h-6 text-[#f97316]" />
      </button>

    </div>
  );
}
