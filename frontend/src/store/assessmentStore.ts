import { create } from 'zustand';

interface AssessmentState {
  assessments: any[];
  currentAssessment: any | null;
  loading: boolean;
  setAssessments: (assessments: any[]) => void;
  setCurrentAssessment: (assessment: any) => void;
  setLoading: (loading: boolean) => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  assessments: [],
  currentAssessment: null,
  loading: false,
  setAssessments: (assessments) => set({ assessments }),
  setCurrentAssessment: (currentAssessment) => set({ currentAssessment }),
  setLoading: (loading) => set({ loading }),
}));
