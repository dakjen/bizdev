import React from 'react';
import { CheckCircle2, Target, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

export default function ProgressHeader({ totalSteps, completedSteps }) {
  const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
          Start Your Business Journey
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Follow this comprehensive checklist to launch your small business with confidence
        </p>
      </div>

      <Card className="bg-gradient-to-br from-[#510069]/10 to-[#9ab292]/20 border-none shadow-lg p-6">
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#510069]/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-[#510069]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Steps</p>
              <p className="text-2xl font-bold text-gray-900">{totalSteps}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#9ab292]/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#9ab292]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{completedSteps}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#c6c6c6]/40 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[#510069]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-700">
            <span>Your Progress</span>
            <span>{completedSteps} of {totalSteps} steps</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>
      </Card>
    </div>
  );
}