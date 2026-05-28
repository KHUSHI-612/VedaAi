import { create } from 'zustand';
import { Assessment, UserProfile } from '../types';
import api from '../lib/api';

interface AssessmentState {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  jobStatus: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  userProfile: UserProfile | null;
  
  // Actions
  fetchAll: () => Promise<void>;
  fetchAssessment: (id: string) => Promise<Assessment | null>;
  createAssessment: (assessmentData: Omit<Assessment, '_id' | 'status' | 'createdAt'>) => Promise<Assessment>;
  setJobStatus: (status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed') => void;
  setProgress: (progress: number) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  loadUserProfile: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  assessments: [],
  currentAssessment: null,
  jobStatus: 'idle',
  progress: 0,
  userProfile: null,

  fetchAll: async () => {
    try {
      const response = await api.get<Assessment[]>('/assessments');
      set({ assessments: response.data });
    } catch (error) {
      console.error('[Store] Failed to fetch assessments:', error);
    }
  },

  fetchAssessment: async (id: string) => {
    try {
      const response = await api.get<Assessment>(`/assessments/${id}`);
      set({ currentAssessment: response.data });
      return response.data;
    } catch (error) {
      console.error(`[Store] Failed to fetch assessment ${id}:`, error);
      return null;
    }
  },

  createAssessment: async (assessmentData) => {
    try {
      const response = await api.post<Assessment>('/assessments', assessmentData);
      const newAssessment = response.data;
      set((state) => ({
        assessments: [newAssessment, ...state.assessments],
        currentAssessment: newAssessment,
        jobStatus: 'queued',
        progress: 0,
      }));
      return newAssessment;
    } catch (error) {
      console.error('[Store] Failed to create assessment:', error);
      throw error;
    }
  },

  setJobStatus: (jobStatus) => set({ jobStatus }),
  
  setProgress: (progress) => set({ progress }),

  setUserProfile: (userProfile) => {
    set({ userProfile });
    if (typeof window !== 'undefined') {
      if (userProfile) {
        localStorage.setItem('user_profile', JSON.stringify(userProfile));
      } else {
        localStorage.removeItem('user_profile');
      }
    }
  },

  loadUserProfile: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_profile');
      if (stored) {
        try {
          set({ userProfile: JSON.parse(stored) });
        } catch (error) {
          console.error('[Store] Failed to parse stored user profile:', error);
        }
      }
    }
  },
}));
