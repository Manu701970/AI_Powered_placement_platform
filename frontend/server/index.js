import 'dotenv/config'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import multer from 'multer'
import OpenAI, { toFile } from 'openai'

const app = express()
const port = Number(process.env.PORT) || 3001
const maxAudioBytes = 12 * 1024 * 1024
const supportedAudioTypes = new Set([
  'audio/mp4',
  'audio/mpeg',
  'audio/mpga',
  'audio/ogg',
  'audio/wav',
  'audio/webm',
  'audio/x-wav',
])

const interviewQuestions = {
  'behavioral-story': 'Tell me about a time you solved a hard problem.',
  'project-walkthrough': 'Walk me through your most recent coding project.',
  'algorithm-approach': 'How do you approach a tricky algorithm question?',
  teamwork: 'Tell me about a time you worked through a disagreement on a team.',
  'learning-challenge': 'Describe a technical skill you had to learn quickly.',
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxAudioBytes, files: 1 },
  fileFilter: (_request, file, callback) => {
    const mediaType = file.mimetype.split(';', 1)[0].trim().toLowerCase()
    if (!supportedAudioTypes.has(mediaType)) {
      callback(new Error('Unsupported audio format. Record using WebM or MP4 audio.'))
      return
    }
    callback(null, true)
  },
})

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    aiConfigured: Boolean(process.env.OPENAI_API_KEY),
  })
})

app.use(
  '/api/mock-interviews/score',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many scoring requests. Please try again later.' },
  }),
)

app.post('/api/mock-interviews/score', upload.single('audio'), async (request, response) => {
  if (!process.env.OPENAI_API_KEY) {
    response.status(503).json({
      error: 'AI feedback is not configured. Add OPENAI_API_KEY to frontend/.env and restart the API.',
    })
    return
  }

  const question = interviewQuestions[request.body.questionId]
  if (!question) {
    response.status(400).json({ error: 'Choose a valid interview prompt.' })
    return
  }

  if (!request.file) {
    response.status(400).json({ error: 'Record an audio answer before requesting feedback.' })
    return
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(request.file.buffer, request.file.originalname, {
        type: request.file.mimetype.split(';', 1)[0].trim().toLowerCase(),
      }),
      model: process.env.OPENAI_TRANSCRIPTION_MODEL || 'gpt-4o-mini-transcribe',
    })
    const transcript = transcription.text.trim()

    if (!transcript) {
      response.status(422).json({
        error: 'We could not hear a spoken answer. Please record again in a quieter place.',
      })
      return
    }

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_FEEDBACK_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'interview_answer_feedback',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              summary: { type: 'string' },
              criteria: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  properties: {
                    name: {
                      type: 'string',
                      enum: ['Clarity', 'Structure', 'Relevance', 'Evidence', 'Conciseness'],
                    },
                    score: { type: 'integer', minimum: 1, maximum: 5 },
                    feedback: { type: 'string' },
                  },
                  required: ['name', 'score', 'feedback'],
                },
              },
              nextStep: { type: 'string' },
            },
            required: ['summary', 'criteria', 'nextStep'],
          },
        },
      },
      messages: [
        {
          role: 'system',
          content:
            'You are a fair interview-practice coach. Evaluate only the substance of the transcribed answer against the question. Do not infer or score accent, identity, emotion, fluency, or voice quality. A score of 1 means the criterion is mostly missing; 3 means adequate but improvable; 5 means especially effective. Be specific, constructive, and avoid inventing details.',
        },
        {
          role: 'user',
          content: `Interview question:\n${question}\n\nStudent answer transcript:\n${transcript}`,
        },
      ],
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('The feedback model returned an empty response.')
    }

    const feedback = JSON.parse(content)
    const expectedCriteria = new Set([
      'Clarity',
      'Structure',
      'Relevance',
      'Evidence',
      'Conciseness',
    ])
    if (
      !Array.isArray(feedback.criteria) ||
      feedback.criteria.length !== expectedCriteria.size ||
      new Set(feedback.criteria.map((criterion) => criterion.name)).size !==
        expectedCriteria.size ||
      feedback.criteria.some(
        (criterion) =>
          !expectedCriteria.has(criterion.name) ||
          !Number.isInteger(criterion.score) ||
          criterion.score < 1 ||
          criterion.score > 5,
      )
    ) {
      throw new Error('The feedback model returned an invalid score.')
    }

    const score = Math.round(
      (feedback.criteria.reduce((total, criterion) => total + criterion.score, 0) / 25) *
        100,
    )

    response.json({
      score,
      summary: feedback.summary,
      criteria: feedback.criteria,
      nextStep: feedback.nextStep,
      transcript,
    })
  } catch (error) {
    console.error('Mock interview scoring failed:', error)
    response.status(502).json({
      error: 'Could not generate feedback. Check the API configuration and try again.',
    })
  }
})

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    response.status(413).json({ error: 'Audio must be 12 MB or smaller.' })
    return
  }

  if (error.message.startsWith('Unsupported audio format')) {
    response.status(415).json({ error: error.message })
    return
  }

  console.error('API request failed:', error)
  response.status(500).json({ error: 'The request could not be processed.' })
})

app.listen(port, () => {
  console.log(`Pathfinder API listening on http://localhost:${port}`)
})
