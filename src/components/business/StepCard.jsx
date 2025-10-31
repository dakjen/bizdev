import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Circle, 
  ExternalLink,
  StickyNote,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryColors = {
  planning: 'bg-[#510069]/10 text-[#510069] border-[#510069]/30',
  legal: 'bg-[#9ab292]/20 text-[#510069] border-[#9ab292]/40',
  financial: 'bg-[#510069]/15 text-[#510069] border-[#510069]/40',
  operations: 'bg-[#c6c6c6]/40 text-gray-700 border-[#c6c6c6]/60'
};

export default function StepCard({ 
  step, 
  isCompleted, 
  userNotes,
  onToggleComplete, 
  onSaveNotes,
  onGetHelp
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(userNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    await onSaveNotes(step.id, notes);
    setIsSaving(false);
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${
      isCompleted ? 'bg-[#9ab292]/10 border-[#9ab292]' : 'bg-white'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <button
            onClick={() => onToggleComplete(step.id)}
            className="mt-1 flex-shrink-0 hover:scale-110 transition-transform"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-7 h-7 text-[#9ab292]" />
            ) : (
              <Circle className="w-7 h-7 text-[#c6c6c6] hover:text-gray-400" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className={`text-lg font-semibold ${
                isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}>
                {step.title}
              </h3>
              <Badge variant="outline" className={categoryColors[step.category]}>
                {step.category}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm mb-3">{step.description}</p>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onGetHelp(step)}
                className="border-[#510069] text-[#510069] hover:bg-[#510069]/5"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Get Help with This Step
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-600"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show Details
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-0 border-t">
              <div className="space-y-4 mt-4">
                {/* Detailed Instructions */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    📋 Detailed Steps
                  </h4>
                  <ul className="space-y-2 ml-4">
                    {step.details.map((detail, index) => (
                      <li key={index} className="text-gray-700 text-sm flex gap-2">
                        <span className="text-[#510069] font-semibold">{index + 1}.</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                {step.resources && step.resources.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      🔗 Helpful Resources
                    </h4>
                    <div className="space-y-2">
                      {step.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[#510069] hover:text-[#510069]/80 text-sm transition-colors group"
                        >
                          <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          <span className="underline">{resource.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <StickyNote className="w-4 h-4" />
                    Your Notes
                  </h4>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes, thoughts, or important details..."
                    className="min-h-[100px] mb-2"
                  />
                  <Button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    size="sm"
                    className="bg-[#510069] hover:bg-[#510069]/90 text-white"
                  >
                    {isSaving ? 'Saving...' : 'Save Notes'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}