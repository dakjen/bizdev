import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ProgressHeader from '../components/business/ProgressHeader';
import CategoryFilter from '../components/business/CategoryFilter';
import StepCard from '../components/business/StepCard';
import IdeaChat from '../components/business/IdeaChat';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ExistingBusiness from './ExistingBusiness';

// Complete business starter steps data
const BUSINESS_STEPS = [
  // Planning Phase
  {
    id: 'idea-validation',
    category: 'planning',
    title: 'Validate Your Business Idea',
    description: 'Research and validate that your business idea has market potential',
    details: [
      'Identify your target market and customer pain points',
      'Research competitors and analyze their strengths/weaknesses',
      'Survey potential customers to gauge interest',
      'Create a unique value proposition',
      'Test your idea with a minimum viable product (MVP)'
    ],
    resources: [
      { title: 'SBA Market Research Guide', url: 'https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis' },
      { title: 'Google Trends', url: 'https://trends.google.com' }
    ]
  },
  {
    id: 'business-plan',
    category: 'planning',
    title: 'Write a Business Plan',
    description: 'Create a comprehensive plan outlining your business strategy',
    details: [
      'Write an executive summary',
      'Define your business model and revenue streams',
      'Outline your marketing and sales strategy',
      'Create financial projections for 3-5 years',
      'Identify key milestones and goals'
    ],
    resources: [
      { title: 'SBA Business Plan Tool', url: 'https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan' },
      { title: 'SCORE Business Plan Template', url: 'https://www.score.org/resource/business-plan-template-startup-business' }
    ]
  },
  {
    id: 'business-name',
    category: 'planning',
    title: 'Choose Your Business Name',
    description: 'Select a memorable, unique name and check availability',
    details: [
      'Brainstorm business name ideas',
      'Check domain name availability',
      'Search trademark database to avoid conflicts',
      'Verify name availability in your state',
      'Get feedback from potential customers'
    ],
    resources: [
      { title: 'USPTO Trademark Search', url: 'https://www.uspto.gov/trademarks' },
      { title: 'Domain Name Search', url: 'https://domains.google.com' }
    ]
  },

  // Legal Phase
  {
    id: 'business-structure',
    category: 'legal',
    title: 'Choose Your Business Structure',
    description: 'Select the legal structure that best fits your business',
    details: [
      'Understand different structures: Sole Proprietorship, LLC, Corporation, Partnership',
      'Consider liability protection and tax implications',
      'Consult with a lawyer or accountant if needed',
      'Decide on the best structure for your situation',
      'Document your decision and reasoning'
    ],
    resources: [
      { title: 'SBA Business Structure Guide', url: 'https://www.sba.gov/business-guide/launch-your-business/choose-business-structure' },
      { title: 'IRS Business Structures', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/business-structures' }
    ]
  },
  {
    id: 'register-business',
    category: 'legal',
    title: 'Register Your Business',
    description: 'Officially register your business with state and federal agencies',
    details: [
      'Register with your Secretary of State',
      'Apply for an Employer Identification Number (EIN)',
      'Register for state taxes',
      'Apply for necessary business licenses',
      'Register for local permits if required'
    ],
    resources: [
      { title: 'Apply for EIN', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online' },
      { title: 'SBA State Registration', url: 'https://www.sba.gov/business-guide/launch-your-business/register-your-business' }
    ]
  },
  {
    id: 'licenses-permits',
    category: 'legal',
    title: 'Get Required Licenses and Permits',
    description: 'Obtain all necessary business licenses and permits',
    details: [
      'Research federal, state, and local requirements',
      'Apply for professional licenses if needed',
      'Get zoning permits for your location',
      'Obtain health department permits if applicable',
      'Secure industry-specific licenses'
    ],
    resources: [
      { title: 'SBA Licenses & Permits', url: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits' },
      { title: 'Business.gov License Finder', url: 'https://www.sba.gov/business-guide/launch-your-business/apply-licenses-permits' }
    ]
  },
  {
    id: 'contracts-agreements',
    category: 'legal',
    title: 'Prepare Legal Documents',
    description: 'Create essential contracts and agreements',
    details: [
      'Draft customer contracts and terms of service',
      'Create vendor and supplier agreements',
      'Prepare employee contracts or independent contractor agreements',
      'Write a privacy policy and terms of use for your website',
      'Consider hiring a lawyer for complex agreements'
    ],
    resources: [
      { title: 'LegalZoom', url: 'https://www.legalzoom.com' },
      { title: 'Rocket Lawyer', url: 'https://www.rocketlawyer.com' }
    ]
  },

  // Financial Phase
  {
    id: 'business-bank-account',
    category: 'financial',
    title: 'Open a Business Bank Account',
    description: 'Separate your personal and business finances',
    details: [
      'Research banks that offer business accounts',
      'Gather required documents (EIN, registration papers)',
      'Compare fees and features',
      'Open a business checking account',
      'Consider a business savings account and credit card'
    ],
    resources: [
      { title: 'NerdWallet Business Checking', url: 'https://www.nerdwallet.com/best/small-business/business-checking-accounts' },
      { title: 'Bankrate Business Accounts', url: 'https://www.bankrate.com/banking/best-business-checking-accounts/' }
    ]
  },
  {
    id: 'accounting-system',
    category: 'financial',
    title: 'Set Up Accounting System',
    description: 'Establish a system to track income and expenses',
    details: [
      'Choose accounting software (QuickBooks, FreshBooks, Wave)',
      'Set up your chart of accounts',
      'Create a system for tracking receipts and invoices',
      'Establish a bookkeeping routine',
      'Consider hiring an accountant or bookkeeper'
    ],
    resources: [
      { title: 'QuickBooks', url: 'https://quickbooks.intuit.com' },
      { title: 'Wave (Free)', url: 'https://www.waveapps.com' }
    ]
  },
  {
    id: 'funding',
    category: 'financial',
    title: 'Secure Funding',
    description: 'Obtain the capital needed to start and grow your business',
    details: [
      'Calculate your startup costs',
      'Explore funding options: savings, loans, investors, grants',
      'Prepare financial projections for lenders/investors',
      'Apply for small business loans if needed',
      'Consider crowdfunding or angel investors'
    ],
    resources: [
      { title: 'SBA Funding Programs', url: 'https://www.sba.gov/funding-programs' },
      { title: 'Grants.gov', url: 'https://www.grants.gov' }
    ]
  },
  {
    id: 'insurance',
    category: 'financial',
    title: 'Get Business Insurance',
    description: 'Protect your business with appropriate insurance coverage',
    details: [
      'Assess your insurance needs based on your industry',
      'Research types: General Liability, Professional Liability, Property',
      'Get quotes from multiple insurance providers',
      'Purchase necessary coverage',
      'Review and update policies annually'
    ],
    resources: [
      { title: 'SBA Insurance Guide', url: 'https://www.sba.gov/business-guide/launch-your-business/get-business-insurance' },
      { title: 'NEXT Insurance', url: 'https://www.nextinsurance.com' }
    ]
  },

  // Operations Phase
  {
    id: 'location',
    category: 'operations',
    title: 'Establish Your Business Location',
    description: 'Set up your physical or virtual business location',
    details: [
      'Decide between home-based, office, retail, or virtual',
      'Evaluate location options and costs',
      'Sign a lease or set up home office',
      'Ensure compliance with zoning laws',
      'Set up utilities and internet connection'
    ],
    resources: [
      { title: 'Regus Virtual Offices', url: 'https://www.regus.com' },
      { title: 'WeWork', url: 'https://www.wework.com' }
    ]
  },
  {
    id: 'suppliers-vendors',
    category: 'operations',
    title: 'Find Suppliers and Vendors',
    description: 'Establish relationships with key suppliers',
    details: [
      'Identify products or services you need to source',
      'Research and vet potential suppliers',
      'Request quotes and compare pricing',
      'Negotiate terms and payment schedules',
      'Establish backup suppliers'
    ],
    resources: [
      { title: 'Alibaba', url: 'https://www.alibaba.com' },
      { title: 'ThomasNet', url: 'https://www.thomasnet.com' }
    ]
  },
  {
    id: 'website',
    category: 'operations',
    title: 'Build Your Website',
    description: 'Create an online presence for your business',
    details: [
      'Purchase a domain name',
      'Choose a website builder or hire a developer',
      'Design pages: Home, About, Services/Products, Contact',
      'Set up payment processing if selling online',
      'Optimize for mobile and search engines (SEO)'
    ],
    resources: [
      { title: 'Wix', url: 'https://www.wix.com' },
      { title: 'Squarespace', url: 'https://www.squarespace.com' },
      { title: 'Shopify (E-commerce)', url: 'https://www.shopify.com' }
    ]
  },
  {
    id: 'marketing-plan',
    category: 'operations',
    title: 'Create Marketing Plan',
    description: 'Develop a strategy to attract and retain customers',
    details: [
      'Define your target audience and ideal customer',
      'Choose marketing channels: social media, email, content, ads',
      'Create a content calendar',
      'Set up social media profiles',
      'Plan your launch campaign'
    ],
    resources: [
      { title: 'HubSpot Marketing Hub', url: 'https://www.hubspot.com/products/marketing' },
      { title: 'Mailchimp', url: 'https://mailchimp.com' }
    ]
  },
  {
    id: 'systems-tools',
    category: 'operations',
    title: 'Set Up Business Systems',
    description: 'Implement tools and processes for daily operations',
    details: [
      'Choose project management software',
      'Set up customer relationship management (CRM)',
      'Implement communication tools (email, messaging)',
      'Create standard operating procedures (SOPs)',
      'Establish workflow automation where possible'
    ],
    resources: [
      { title: 'Asana', url: 'https://asana.com' },
      { title: 'Trello', url: 'https://trello.com' },
      { title: 'HubSpot CRM (Free)', url: 'https://www.hubspot.com/products/crm' }
    ]
  },
  {
    id: 'hire-team',
    category: 'operations',
    title: 'Build Your Team (If Needed)',
    description: 'Hire employees or contractors to support your business',
    details: [
      'Define roles and responsibilities',
      'Create job descriptions',
      'Post job listings or use recruiting services',
      'Interview and vet candidates',
      'Complete hiring paperwork and onboarding'
    ],
    resources: [
      { title: 'Indeed', url: 'https://www.indeed.com/hire' },
      { title: 'LinkedIn', url: 'https://www.linkedin.com/talent' },
      { title: 'Upwork (Freelancers)', url: 'https://www.upwork.com' }
    ]
  },
  {
    id: 'launch',
    category: 'operations',
    title: 'Launch Your Business!',
    description: 'Officially open your doors and start serving customers',
    details: [
      'Announce your launch on all channels',
      'Host a launch event or promotion',
      'Reach out to your network',
      'Start delivering your product or service',
      'Celebrate this amazing milestone!'
    ],
    resources: [
      { title: 'Eventbrite (Events)', url: 'https://www.eventbrite.com' },
      { title: 'Canva (Marketing Materials)', url: 'https://www.canva.com' }
    ]
  }
];

export default function BusinessStarter() {
  const [activeCategory, setActiveCategory] = useState('planning');
  const [stepContext, setStepContext] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get journey ID and conversation ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const journeyId = urlParams.get('journey');
  const conversationId = urlParams.get('conversation');

  // If viewing a conversation, switch to idea tab
  useEffect(() => {
    if (conversationId) {
      setActiveCategory('idea');
    }
  }, [conversationId]);

  // Get or create default journey
  const { data: currentJourney, isLoading: isLoadingJourney } = useQuery({
    queryKey: ['currentJourney', journeyId],
    queryFn: async () => {
      if (journeyId) {
        const response = await fetch(`/api/journeys/${journeyId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      } else {
        const response = await fetch('/api/journeys');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const allJourneys = await response.json();
        if (allJourneys.length > 0) {
          navigate(createPageUrl('BusinessStarter') + `?journey=${allJourneys[0].id}`, { replace: true });
          return allJourneys[0];
        } else {
          const createResponse = await fetch('/api/journeys', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              business_name: 'My First Business',
              description: 'Getting started with my business journey',
              is_active: true
            }),
          });
          if (!createResponse.ok) {
            throw new Error('Network response was not ok');
          }
          const newJourney = await createResponse.json();
          navigate(createPageUrl('BusinessStarter') + `?journey=${newJourney.id}`, { replace: true });
          return newJourney;
        }
      }
    }
  });

  const { data: userSteps = [], isLoading: isLoadingSteps } = useQuery({
    queryKey: ['businessSteps', currentJourney?.id],
    queryFn: async () => {
      if (!currentJourney?.id) return [];
      const response = await fetch(`/api/steps?journey_id=${currentJourney.id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    enabled: !!currentJourney?.id
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: async (stepId) => {
      const existingStep = userSteps.find(s => s.step_id === stepId);
      if (existingStep) {
        const response = await fetch(`/api/steps/${existingStep.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ completed: !existingStep.completed }),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      } else {
        const response = await fetch('/api/steps', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            journey_id: currentJourney.id,
            step_id: stepId,
            completed: true,
          }),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['businessSteps', currentJourney?.id]);
    }
  });

  const saveNotesMutation = useMutation({
    mutationFn: async ({ stepId, notes }) => {
      const existingStep = userSteps.find(s => s.step_id === stepId);
      if (existingStep) {
        const response = await fetch(`/api/steps/${existingStep.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notes }),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      } else {
        const response = await fetch('/api/steps', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            journey_id: currentJourney.id,
            step_id: stepId,
            notes,
            completed: false
          }),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['businessSteps', currentJourney?.id]);
    }
  });

  const getUserStepData = (stepId) => {
    return userSteps.find(s => s.step_id === stepId) || null;
  };

  const handleGetHelp = (step) => {
    setStepContext(step);
    setActiveCategory('idea');
  };

  const handleClearStepContext = () => {
    setStepContext(null);
  };

  const filteredSteps = activeCategory === 'all' 
    ? BUSINESS_STEPS 
    : BUSINESS_STEPS.filter(step => step.category === activeCategory);

  const completedSteps = BUSINESS_STEPS.filter(step => {
    const userData = getUserStepData(step.id);
    return userData?.completed;
  }).length;

  if (isLoadingJourney || isLoadingSteps) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#510069]/5 via-white to-[#9ab292]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#510069] mx-auto mb-4" />
          <p className="text-gray-600">Loading your business journey...</p>
        </div>
      </div>
    );
  }

  if (currentJourney && (currentJourney.business_status === 'has_business' || currentJourney.business_status === 'established')) {
    return <ExistingBusiness currentJourney={currentJourney} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#510069]/5 via-white to-[#9ab292]/10">
      <div className="max-w-5xl mx-auto p-4 md:p-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('MyJourneys'))}
          className="mb-4 text-[#510069] hover:text-[#510069]/80"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Journeys
        </Button>

        {currentJourney && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{currentJourney.business_name}</h2>
            {currentJourney.description && (
              <p className="text-gray-600 mt-1">{currentJourney.description}</p>
            )}
          </div>
        )}

        <ProgressHeader 
          totalSteps={BUSINESS_STEPS.length} 
          completedSteps={completedSteps} 
        />

        <CategoryFilter 
          activeCategory={activeCategory}
          onCategoryChange={(category) => {
            setActiveCategory(category);
            if (category !== 'idea') {
              setStepContext(null);
            }
          }}
        />

        {activeCategory === 'idea' ? (
          <IdeaChat 
            conversationId={conversationId} 
            stepContext={stepContext}
            onClearStepContext={handleClearStepContext}
            currentJourney={currentJourney}
          />
        ) : (
          <>
            <div className="space-y-4">
              {filteredSteps.map((step) => {
                const userData = getUserStepData(step..id);
                return (
                  <StepCard
                    key={step.id}
                    step={step}
                    isCompleted={userData?.completed || false}
                    userNotes={userData?.notes}
                    onToggleComplete={(stepId) => toggleCompleteMutation.mutate(stepId)}
                    onSaveNotes={(stepId, notes) => saveNotesMutation.mutate({ stepId, notes })}
                    onGetHelp={handleGetHelp}
                  />
                );
              })}
            </div>

            {filteredSteps.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No steps in this category</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}