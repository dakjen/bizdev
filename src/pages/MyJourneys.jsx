
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Rocket, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MyJourneys() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [businessStatus, setBusinessStatus] = useState('');
  const [businessExplanation, setBusinessExplanation] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: journeys = [], isLoading } = useQuery({
    queryKey: ['businessJourneys'],
    queryFn: async () => {
      const response = await fetch('/api/journeys');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });

  const createJourneyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch('/api/journeys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: (journey) => {
      queryClient.invalidateQueries(['businessJourneys']);
      setIsDialogOpen(false);
      setBusinessName('');
      setDescription('');
      setBusinessStatus('');
      setBusinessExplanation('');
      navigate(createPageUrl('BusinessStarter') + `?journey=${journey.id}`);
    }
  });

  const deleteJourneyMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/journeys/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['businessJourneys']);
    }
  });

  const handleCreateJourney = () => {
    if (businessName.trim()) {
      if (businessStatus === 'has_business' || businessStatus === 'established') {
        setIsAlertOpen(true);
      } else {
        createJourneyMutation.mutate({
          business_name: businessName,
          description: description,
          business_status: businessStatus,
          business_explanation: businessExplanation,
          is_active: true
        });
      }
    }
  };

  const handleConfirmCreateJourney = () => {
    createJourneyMutation.mutate({
      business_name: businessName,
      description: description,
      business_status: businessStatus,
      business_explanation: businessExplanation,
      is_active: true
    });
  };

  const handleViewJourney = (journey) => {
    if (journey.business_status === 'has_business' || journey.business_status === 'established') {
      navigate(createPageUrl('ExistingBusiness') + `?journey=${journey.id}`);
    } else {
      navigate(createPageUrl('BusinessStarter') + `?journey=${journey.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#510069]/5 via-white to-[#9ab292]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#510069] mx-auto mb-4" />
          <p className="text-gray-600">Loading your journeys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#510069]/5 via-white to-[#9ab292]/10 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Where2Start: Journey</h1>
            <p className="text-gray-600">Track and manage multiple business ventures</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#510069] hover:bg-[#510069]/90 text-white">
                <Plus className="w-5 h-5 mr-2" />
                New Journey
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a New Business Journey</DialogTitle>
                <DialogDescription>This will create a new business journey for you to track.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Business Name</label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g., My Consulting Business"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description (optional)</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your business idea..."
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">What stage are you in?</label>
                  <Select onValueChange={setBusinessStatus} value={businessStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your business status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="no_business">I don't have a business yet.</SelectItem>
                      <SelectItem value="has_business">I have a business</SelectItem>
                      <SelectItem value="established">I'm established</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(businessStatus === 'has_business' || businessStatus === 'established') && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Explain where your business is</label>
                    <Textarea
                      value={businessExplanation}
                      onChange={(e) => setBusinessExplanation(e.target.value)}
                      placeholder="e.g., I have a few paying customers..."
                      className="min-h-[100px]"
                    />
                  </div>
                )}
                <Button
                  onClick={handleCreateJourney}
                  disabled={!businessName.trim() || createJourneyMutation.isLoading}
                  className="w-full bg-[#510069] hover:bg-[#510069]/90 text-white"
                >
                  {createJourneyMutation.isLoading ? 'Creating...' : 'Start Journey'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>The business plan will cost $2.99 a month</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Back</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmCreateJourney}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {journeys.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Rocket className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No journeys yet</h3>
              <p className="text-gray-600 mb-6">Start your first business journey and track your progress</p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-[#510069] hover:bg-[#510069]/90 text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Journey
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {journeys.map((journey) => (
              <Card
                key={journey.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleViewJourney(journey)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2 group-hover:text-[#510069] transition-colors">
                        {journey.business_name}
                      </CardTitle>
                      {journey.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{journey.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete "${journey.business_name}"?`)) {
                          deleteJourneyMutation.mutate(journey.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-[#510069]/5 group-hover:border-[#510069]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewJourney(journey);
                    }}
                  >
                    Continue Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
