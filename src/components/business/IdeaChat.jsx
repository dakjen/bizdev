import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Lightbulb, HelpCircle, Target, History, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function IdeaChat({ conversationId, stepContext, onClearStepContext }) {
  const getInitialMessage = () => {
    if (stepContext) {
      return {
        role: 'assistant',
        content: `Great! Let's work through **${stepContext.title}** together. 🎯\n\nI'll guide you through this step and help you complete it successfully.\n\nTo start, tell me: Where are you with this step? Have you already started, or is this completely new to you?`
      };
    }
    
    return {
      role: 'assistant',
      content: "👋 Welcome! I'm excited to help you discover your perfect business idea.\n\nLet's start with where you are right now. Which best describes you?\n\n💡 **I have a specific business idea** - I know what I want to do\n🎯 **I want to solve a problem** - I see something that needs fixing\n🤔 **I'm not sure yet** - I want to explore what's possible\n\nJust tell me which one resonates with you, or share in your own words!"
    };
  };

  const [messages, setMessages] = useState([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const messagesEndRef = useRef(null);

  // Reset messages when stepContext changes
  useEffect(() => {
    setMessages([getInitialMessage()]);
    setCurrentConversationId(null);
  }, [stepContext?.id]);

  // Load existing conversation if conversationId is provided
  const { data: existingConversation } = useQuery({
    queryKey: ['ideaConversation', conversationId],
    queryFn: async () => {
      if (!conversationId || stepContext) return null;
      const conversations = await base44.entities.IdeaConversation.filter({ id: conversationId });
      return conversations[0] || null;
    },
    enabled: !!conversationId && !stepContext
  });

  useEffect(() => {
    if (existingConversation?.messages && !stepContext) {
      setMessages(existingConversation.messages);
    }
  }, [existingConversation, stepContext]);

  const saveConversationMutation = useMutation({
    mutationFn: async ({ id, messages }) => {
      // Generate a title from the first user message
      const firstUserMessage = messages.find(m => m.role === 'user');
      const title = firstUserMessage 
        ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        : 'New Conversation';

      const data = {
        messages,
        title,
        last_updated: new Date().toISOString()
      };

      if (id) {
        await base44.entities.IdeaConversation.update(id, data);
        return id;
      } else {
        const newConversation = await base44.entities.IdeaConversation.create(data);
        return newConversation.id;
      }
    },
    onSuccess: (id) => {
      if (!currentConversationId) {
        setCurrentConversationId(id);
      }
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-save conversation after each message exchange (only if not in step context)
  useEffect(() => {
    if (messages.length > 1 && !stepContext) {
      saveConversationMutation.mutate({
        id: currentConversationId,
        messages
      });
    }
  }, [messages, stepContext]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build conversation context
      const conversationHistory = newMessages.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n\n');

      let prompt;

      if (stepContext) {
        // Step-specific guidance
        prompt = `You are an expert business coach helping someone complete a specific step in their business journey.

STEP INFORMATION:
Title: ${stepContext.title}
Description: ${stepContext.description}

Detailed steps they need to complete:
${stepContext.details.map((detail, i) => `${i + 1}. ${detail}`).join('\n')}

YOUR ROLE:
- Guide them through completing this specific step
- Ask clarifying questions about their progress
- Provide actionable advice and encouragement
- Help them overcome obstacles
- Keep responses SHORT and CASUAL (2-4 sentences max)
- Ask ONE question at a time
- Be conversational like texting a friend

Previous conversation:
${conversationHistory}

User's latest message: ${userMessage}

Provide a SHORT, helpful response that moves them forward on THIS SPECIFIC STEP. Keep it casual and encouraging.`;
      } else {
        // General idea discovery
        prompt = `You are an expert business coach helping someone discover and develop their ideal business idea. Your approach is structured and discovery-focused:

CONVERSATION FLOW (adapt based on where they are):
1. First, understand their starting point:
   - Do they have a specific idea already?
   - Do they want to solve a particular problem?
   - Are they exploring and not sure yet?

2. If they're exploring or need help, discover their unique strengths:
   - Ask about their skills and expertise (what are they naturally good at?)
   - Explore their passions (what do they love doing or talking about?)
   - Identify their "superpowers" (what do others ask them for help with?)
   - Learn about their experiences and background

3. Based on their strengths, offer 3-5 specific business idea options that:
   - Leverage their unique combination of skills and passions
   - Address real market needs
   - Are practical and actionable
   - Match their lifestyle and goals

4. Once they choose a direction (or if they came with an idea), help them refine:
   - Define their target customer clearly
   - Clarify the unique value proposition
   - Explore business model options
   - Identify first steps to validate the idea
   - Address potential challenges

IMPORTANT STYLE RULES:
- Keep responses SHORT and CASUAL (2-4 sentences max per question/point)
- Ask ONE question at a time, not multiple
- Be conversational like texting a friend
- Use emojis occasionally but sparingly
- Avoid formal business jargon
- Break up long ideas into multiple short messages if needed

TONE: Warm, encouraging, curious, and casual. Like a supportive friend who knows business.

Previous conversation:
${conversationHistory}

User's latest message: ${userMessage}

Provide a SHORT, casual response (2-4 sentences max) that moves them forward. Ask just ONE question at a time. Keep it conversational and friendly.`;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const starterQuestions = [
    "I have a specific business idea",
    "I want to solve a problem",
    "I'm not sure yet - help me explore"
  ];

  const handleStarterClick = (question) => {
    setInput(question);
  };

  return (
    <Card className="h-[600px] flex flex-col bg-white shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-[#510069]/5 to-[#9ab292]/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-[#510069]">
              <Sparkles className="w-5 h-5" />
              {stepContext ? `Help: ${stepContext.title}` : 'Business Idea Discovery'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {stepContext ? "Let's work through this step together" : "Let's discover the perfect business idea for you"}
            </p>
          </div>
          {stepContext && onClearStepContext && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearStepContext}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-[#510069] text-white'
                  : 'bg-[#9ab292]/20 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#9ab292]/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#510069] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-[#510069] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#510069] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {messages.length === 1 && !stepContext && (
          <div className="space-y-2 mt-4">
            <p className="text-sm text-gray-600 font-medium">Quick select:</p>
            {starterQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 border-[#c6c6c6]/40 hover:bg-[#510069]/5"
                onClick={() => handleStarterClick(question)}
              >
                {index === 0 && <Lightbulb className="w-4 h-4 mr-2 flex-shrink-0 text-[#510069]" />}
                {index === 1 && <Target className="w-4 h-4 mr-2 flex-shrink-0 text-[#510069]" />}
                {index === 2 && <HelpCircle className="w-4 h-4 mr-2 flex-shrink-0 text-[#510069]" />}
                <span className="text-sm">{question}</span>
              </Button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2 mb-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Enter to send)"
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-[#510069] hover:bg-[#510069]/90 text-white px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {!stepContext && (
          <Link 
            to={createPageUrl('ConversationHistory')} 
            className="text-sm text-[#510069] hover:text-[#510069]/80 flex items-center gap-1"
          >
            <History className="w-4 h-4" />
            View conversation history
          </Link>
        )}
      </div>
    </Card>
  );
}