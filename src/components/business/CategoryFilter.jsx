import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, Scale, DollarSign, Cog, MessageCircle } from 'lucide-react';

export default function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="mb-6">
      <Tabs value={activeCategory} onValueChange={onCategoryChange}>
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full bg-gray-100 p-1">
          <TabsTrigger value="idea" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">The Idea</span>
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden sm:inline">Planning</span>
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">Legal</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Cog className="w-4 h-4" />
            <span className="hidden sm:inline">Operations</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <span className="hidden sm:inline">All Steps</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}