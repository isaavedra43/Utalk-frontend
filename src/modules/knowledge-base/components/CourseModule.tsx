'use client';

import React from 'react';
import { Course, UserProgress } from '@/types/knowledge-base';

interface CourseModuleProps {
  courses: Course[];
  userProgress: UserProgress;
  isLoading: boolean;
  error?: string;
  onCourseSelect: (course: Course) => void;
  onEnroll: (courseId: string) => void;
}

export function CourseModule({
  courses,
  userProgress,
  isLoading,
  error,
  onCourseSelect,
  onEnroll
}: CourseModuleProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Módulo de Cursos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Sistema completo de cursos y formación en desarrollo...
        </p>
      </div>
    </div>
  );
}
