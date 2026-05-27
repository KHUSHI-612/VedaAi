'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAssessmentStore } from '../../../store/assessmentStore';
import { User, School, MapPin, Save, CheckCircle } from 'lucide-react';

// Form validation schema using Zod
const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  schoolName: z.string().min(3, { message: 'School name must be at least 3 characters.' }),
  city: z.string().min(2, { message: 'City name must be at least 2 characters.' }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const { userProfile, setUserProfile, loadUserProfile } = useAssessmentStore();
  const [isSaved, setIsSaved] = React.useState(false);

  // Initialize and load profile on mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      schoolName: '',
      city: '',
    },
  });

  // Hydrate form values when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setValue('name', userProfile.name);
      setValue('schoolName', userProfile.schoolName);
      setValue('city', userProfile.city);
    }
  }, [userProfile, setValue]);

  const onSubmit = (data: ProfileFormValues) => {
    setUserProfile(data);
    setIsSaved(true);
    
    // Hide the success banner after 4 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 4000);
  };

  return (
    <div className="max-w-2xl mx-auto mt-2">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Educator Profile Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize your name, school profile, and city. Changes will immediately sync across VedaAI.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.02)]">
        
        {/* Success Alert Banner */}
        {isSaved && (
          <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="text-sm font-medium">
              Profile updated successfully! All navigation and header cards are synced.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* 1. Educator Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">
              Educator Full Name
            </label>
            <div className="relative rounded-2xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                {...register('name')}
                placeholder="e.g. John Doe"
                className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border rounded-2xl text-[14.5px] font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-100 focus:ring-orange-100 focus:border-orange-400 focus:bg-white'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs font-semibold text-red-500 mt-1 pl-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* 2. School Name */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">
              School / Institution Name
            </label>
            <div className="relative rounded-2xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <School className="w-5 h-5" />
              </div>
              <input
                type="text"
                {...register('schoolName')}
                placeholder="e.g. Delhi Public School"
                className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border rounded-2xl text-[14.5px] font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.schoolName
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-100 focus:ring-orange-100 focus:border-orange-400 focus:bg-white'
                }`}
              />
            </div>
            {errors.schoolName && (
              <p className="text-xs font-semibold text-red-500 mt-1 pl-1">
                {errors.schoolName.message}
              </p>
            )}
          </div>

          {/* 3. City / Region */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">
              City / Location
            </label>
            <div className="relative rounded-2xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <MapPin className="w-5 h-5" />
              </div>
              <input
                type="text"
                {...register('city')}
                placeholder="e.g. Bokaro Steel City"
                className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border rounded-2xl text-[14.5px] font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.city
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-100 focus:ring-orange-100 focus:border-orange-400 focus:bg-white'
                }`}
              />
            </div>
            {errors.city && (
              <p className="text-xs font-semibold text-red-500 mt-1 pl-1">
                {errors.city.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1a1a1a] hover:bg-black text-white py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            >
              <Save className="w-4.5 h-4.5" />
              <span>{isSubmitting ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
