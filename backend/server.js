
const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');
const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const redis = new Redis(process.env.REDIS_URL);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

app.post('/api/chat', ClerkExpressRequireAuth(), async (req, res) => {
  const { history } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash'});
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(' ');
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error communicating with AI' });
  }
});


// Journeys
app.post('/api/journeys', ClerkExpressRequireAuth(), async (req, res) => {
  const { business_name, description, business_status, business_explanation } = req.body;
  const { userId } = req.auth;
  const id = uuidv4();
  const journey = { id, userId, business_name, description, business_status, business_explanation, is_active: true, created_date: new Date().toISOString() };
  await redis.hset('journeys', id, JSON.stringify(journey));
  res.status(201).json(journey);
});

app.get('/api/journeys', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const journeys = await redis.hvals('journeys');
  const userJourneys = journeys.map(JSON.parse).filter(j => j.userId === userId);
  res.json(userJourneys.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
});

app.get('/api/journeys/:id', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const journeyString = await redis.hget('journeys', req.params.id);
  if (journeyString) {
    const journey = JSON.parse(journeyString);
    if (journey.userId === userId) {
      res.json(journey);
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  } else {
    res.status(404).json({ message: 'Journey not found' });
  }
});

app.put('/api/journeys/:id', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const { business_name, description, is_active, business_status, business_explanation } = req.body;
  const journeyString = await redis.hget('journeys', req.params.id);
  if (journeyString) {
    const journey = JSON.parse(journeyString);
    if (journey.userId === userId) {
      const updatedJourney = { ...journey, business_name, description, is_active, business_status, business_explanation };
      await redis.hset('journeys', req.params.id, JSON.stringify(updatedJourney));
      res.json(updatedJourney);
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  } else {
    res.status(404).json({ message: 'Journey not found' });
  }
});

app.delete('/api/journeys/:id', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const journeyString = await redis.hget('journeys', req.params.id);
  if (journeyString) {
    const journey = JSON.parse(journeyString);
    if (journey.userId === userId) {
      await redis.hdel('journeys', req.params.id);
      res.status(204).send();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  } else {
    res.status(404).json({ message: 'Journey not found' });
  }
});

// Steps
app.post('/api/steps', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const { journey_id, step_id, completed, notes } = req.body;
  const id = uuidv4();
  const step = { id, userId, journey_id, step_id, completed, notes, completed_date: completed ? new Date().toISOString() : null };
  await redis.hset('steps', id, JSON.stringify(step));
  res.status(201).json(step);
});

app.get('/api/steps', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const { journey_id } = req.query;
  const steps = await redis.hvals('steps');
  const journeySteps = steps.map(JSON.parse).filter(step => step.journey_id === journey_id && step.userId === userId);
  res.json(journeySteps);
});

app.put('/api/steps/:id', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const { completed, notes } = req.body;
  const stepString = await redis.hget('steps', req.params.id);
  if (stepString) {
    const step = JSON.parse(stepString);
    if (step.userId === userId) {
      const updatedStep = { ...step, completed, notes, completed_date: completed ? new Date().toISOString() : step.completed_date };
      await redis.hset('steps', req.params.id, JSON.stringify(updatedStep));
      res.json(updatedStep);
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  } else {
    res.status(404).json({ message: 'Step not found' });
  }
});

// Conversations
app.post('/api/conversations', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const { title, messages } = req.body;
  const id = uuidv4();
  const conversation = { id, userId, title, messages, last_updated: new Date().toISOString() };
  await redis.hset('conversations', id, JSON.stringify(conversation));
  res.status(201).json(conversation);
});

app.get('/api/conversations', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const conversations = await redis.hvals('conversations');
  const userConversations = conversations.map(JSON.parse).filter(c => c.userId === userId);
  res.json(userConversations.sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated)));
});

app.get('/api/conversations/:id', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const conversationString = await redis.hget('conversations', req.params.id);
  if (conversationString) {
    const conversation = JSON.parse(conversationString);
    if (conversation.userId === userId) {
      res.json(conversation);
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  } else {
    res.status(404).json({ message: 'Conversation not found' });
  }
});

app.put('/api/conversations/:id', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const { title, messages } = req.body;
  const conversationString = await redis.hget('conversations', req.params.id);
  if (conversationString) {
    const conversation = JSON.parse(conversationString);
    if (conversation.userId === userId) {
      const updatedConversation = { ...conversation, title, messages, last_updated: new Date().toISOString() };
      await redis.hset('conversations', req.params.id, JSON.stringify(updatedConversation));
      res.json(updatedConversation);
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  } else {
    res.status(404).json({ message: 'Conversation not found' });
  }
});

app.delete('/api/conversations/:id', ClerkExpressRequireAuth(), async (req, res) => {
  const { userId } = req.auth;
  const conversationString = await redis.hget('conversations', req.params.id);
  if (conversationString) {
    const conversation = JSON.parse(conversationString);
    if (conversation.userId === userId) {
      await redis.hdel('conversations', req.params.id);
      res.status(204).send();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  } else {
    res.status(404).json({ message: 'Conversation not found' });
  }
});

module.exports = app;
