const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const lmStudioBaseUrl = process.env.LM_STUDIO_BASE_URL || 'http://localhost:1234';
const lmStudioApiKey = process.env.LM_STUDIO_API_KEY || 'lm-studio';

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const errorResponse = (res, error) => {
  console.error(error);
  res.status(500).json({ message: error.message || 'Unexpected error' });
};

const callLmStudio = async (endpoint, payload, method = 'POST') => {
  const response = await fetch(`${lmStudioBaseUrl}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${lmStudioApiKey}`
    },
    body: method === 'POST' ? JSON.stringify(payload) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LM Studio responded with ${response.status}: ${text}`);
  }

  return response.json();
};

app.get('/api/models', async (_req, res) => {
  try {
    const data = await callLmStudio('/v1/models', undefined, 'GET');
    res.json(data);
  } catch (error) {
    errorResponse(res, error);
  }
});

app.post('/api/chat', async (req, res) => {
  const { model, messages, temperature = 0.7, maxTokens = 512 } = req.body;

  if (!model) {
    return res.status(400).json({ message: 'Model is required' });
  }

  try {
    const data = await callLmStudio('/v1/chat/completions', {
      model,
      messages,
      max_tokens: maxTokens,
      temperature
    });

    res.json(data);
  } catch (error) {
    errorResponse(res, error);
  }
});

app.post('/api/analyze-style', async (req, res) => {
  const { model, samples } = req.body;

  if (!model || !samples || !Array.isArray(samples) || samples.length === 0) {
    return res.status(400).json({ message: 'Model and at least one text sample are required.' });
  }

  const prompt = `You are a writing style synthesiser. Given the following samples, extract a concise master style guide. Capture tone, pacing, vocabulary, imagery, sentence length, hypnotic devices (e.g., repetition, rhythm, embedded commands), and persona. Provide 5-7 bullet points titled \"Master Style\" followed by a 2-3 sentence summary under \"Voice Overview\". Keep it actionable.`;

  const joinedSamples = samples
    .map((sample, index) => `Sample ${index + 1}:\n${sample}`)
    .join('\n\n');

  try {
    const data = await callLmStudio('/v1/chat/completions', {
      model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: joinedSamples }
      ],
      max_tokens: 600,
      temperature: 0.5
    });

    res.json(data);
  } catch (error) {
    errorResponse(res, error);
  }
});

app.post('/api/generate-script', async (req, res) => {
  const { model, styleSummary, length = 400, intensity = 6, theme } = req.body;

  if (!model || !styleSummary) {
    return res.status(400).json({ message: 'Model and a style summary are required.' });
  }

  const prompt = `Using the provided master style, write a hypnotic script. Respect the tone, pacing, and hypnotic devices described. Approximate length: ${length} words. Intensity 1-10: ${intensity} (1 = light relaxation, 10 = profound trance). Include a brief induction, deepening, themed body, and gentle exit. Keep language safe and supportive.`;

  const userContent = `${theme ? `Theme or focus: ${theme}\n\n` : ''}Master style:\n${styleSummary}`;

  try {
    const data = await callLmStudio('/v1/chat/completions', {
      model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userContent }
      ],
      max_tokens: Math.min(Math.max(Math.round((length / 0.75)), 256), 2000),
      temperature: 0.7
    });

    res.json(data);
  } catch (error) {
    errorResponse(res, error);
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`UI server running on http://localhost:${port}`);
  console.log(`Proxying requests to LM Studio at ${lmStudioBaseUrl}`);
});
