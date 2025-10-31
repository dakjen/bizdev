import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Trash2, ArrowLeft, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function ConversationHistory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['ideaConversations'],
    queryFn: async () => {
      const convos = await base44.entities.IdeaConversation.list('-last_updated');
      return convos;
    }
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.IdeaConversation.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ideaConversations']);
    }
  });

  const handleViewConversation = (conversationId) => {
    navigate(createPageUrl('BusinessStarter') + `?conversation=${conversationId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#510069]/5 via-white to-[#9ab292]/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#510069] mx-auto mb-4" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#510069]/5 via-white to-[#9ab292]/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link 
            to={createPageUrl('BusinessStarter')} 
            className="inline-flex items-center gap-2 text-[#510069] hover:text-[#510069]/80 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Business Starter
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Conversation History</h1>
          <p className="text-gray-600 mt-2">Review your previous idea discovery sessions</p>
        </div>

        {conversations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No conversations yet</p>
              <Link to={createPageUrl('BusinessStarter')}>
                <Button className="bg-[#510069] hover:bg-[#510069]/90 text-white">
                  Start Your First Conversation
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => {
              const messageCount = conversation.messages?.length || 0;
              const lastMessage = conversation.messages?.[messageCount - 1];
              
              return (
                <Card 
                  key={conversation.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleViewConversation(conversation.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-[#510069]" />
                          {conversation.title || 'Untitled Conversation'}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(conversation.last_updated || conversation.created_date), 'MMM d, yyyy')}
                          </span>
                          <span>{messageCount} messages</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this conversation?')) {
                            deleteConversationMutation.mutate(conversation.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {lastMessage && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {lastMessage.content}
                      </p>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}