const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

const app = express();
const redis = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(express.json());

// Journeys
app.post('/api/journeys', async (req, res) => {
  const { business_name, description, business_status, business_explanation } = req.body;
  const id = uuidv4();
  const journey = { id, business_name, description, business_status, business_explanation, is_active: true, created_date: new Date().toISOString() };
  await redis.hset('journeys', id, JSON.stringify(journey));
  res.status(201).json(journey);
});

app.get('/api/journeys', async (req, res) => {
  const journeys = await redis.hvals('journeys');
  res.json(journeys.map(JSON.parse).sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
});

app.get('/api/journeys/:id', async (req, res) => {
  const journey = await redis.hget('journeys', req.params.id);
  if (journey) {
    res.json(JSON.parse(journey));
  } else {
    res.status(404).json({ message: 'Journey not found' });
  }
});

app.put('/api/journeys/:id', async (req, res) => {
  const { business_name, description, is_active, business_status, business_explanation } = req.body;
  const journeyString = await redis.hget('journeys', req.params.id);
  if (journeyString) {
    const journey = JSON.parse(journeyString);
    const updatedJourney = { ...journey, business_name, description, is_active, business_status, business_explanation };
    await redis.hset('journeys', req.params.id, JSON.stringify(updatedJourney));
    res.json(updatedJourney);
  } else {
    res.status(404).json({ message: 'Journey not found' });
  }
});

app.delete('/api/journeys/:id', async (req, res) => {
  const result = await redis.hdel('journeys', req.params.id);
  if (result) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Journey not found' });
  }
});

// Steps
app.post('/api/steps', async (req, res) => {
  const { journey_id, step_id, completed, notes } = req.body;
  const id = uuidv4();
  const step = { id, journey_id, step_id, completed, notes, completed_date: completed ? new Date().toISOString() : null };
  await redis.hset('steps', id, JSON.stringify(step));
  res.status(201).json(step);
});

app.get('/api/steps', async (req, res) => {
  const { journey_id } = req.query;
  const steps = await redis.hvals('steps');
  const journeySteps = steps.map(JSON.parse).filter(step => step.journey_id === journey_id);
  res.json(journeySteps);
});

app.put('/api/steps/:id', async (req, res) => {
  const { completed, notes } = req.body;
  const stepString = await redis.hget('steps', req.params.id);
  if (stepString) {
    const step = JSON.parse(stepString);
    const updatedStep = { ...step, completed, notes, completed_date: completed ? new Date().toISOString() : step.completed_date };
    await redis.hset('steps', req.params.id, JSON.stringify(updatedStep));
    res.json(updatedStep);
  } else {
    res.status(404).json({ message: 'Step not found' });
  }
});

// Conversations
app.post('/api/conversations', async (req, res) => {
  const { title, messages } = req.body;
  const id = uuidv4();
  const conversation = { id, title, messages, last_updated: new Date().toISOString() };
  await redis.hset('conversations', id, JSON.stringify(conversation));
  res.status(201).json(conversation);
});

app.get('/api/conversations', async (req, res) => {
  const conversations = await redis.hvals('conversations');
  res.json(conversations.map(JSON.parse).sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated)));
});

app.get('/api/conversations/:id', async (req, res) => {
  const conversation = await redis.hget('conversations', req.params.id);
  if (conversation) {
    res.json(JSON.parse(conversation));
  } else {
    res.status(404).json({ message: 'Conversation not found' });
  }
});

app.put('/api/conversations/:id', async (req, res) => {
  const { title, messages } = req.body;
  const conversationString = await redis.hget('conversations', req.params.id);
  if (conversationString) {
    const conversation = JSON.parse(conversationString);
    const updatedConversation = { ...conversation, title, messages, last_updated: new Date().toISOString() };
    await redis.hset('conversations', req.params.id, JSON.stringify(updatedConversation));
    res.json(updatedConversation);
  } else {
    res.status(404).json({ message: 'Conversation not found' });
  }
});

app.delete('/api/conversations/:id', async (req, res) => {
  const result = await redis.hdel('conversations', req.params.id);
  if (result) {
    res.status(204).send();
  } else {
    res.status(404).json({ message: 'Conversation not found' });
  }
});

module.exports = app;