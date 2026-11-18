import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const loginStorageKey = 'pathfinder-student-usn'

async function readApiResponse(response) {
  const result = await response.json().catch(() => null)
  if (!result) throw new Error('The API returned an unreadable response.')
  if (!response.ok) throw new Error(result.error || 'The request could not be completed.')
  return result
}

async function postJson(url, value) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(value),
  })
  return readApiResponse(response)
}

const problems = [
  {
    id: 1,
    title: 'Two Sum',
    topic: 'Arrays & Hashing',
    difficulty: 'Easy',
    time: '15 min',
    description: 'Find two numbers in an array that add up to a target.',
  },
  {
    id: 2,
    title: 'Valid Parentheses',
    topic: 'Stacks',
    difficulty: 'Easy',
    time: '20 min',
    description: 'Check whether every bracket in a string is correctly matched.',
  },
  {
    id: 3,
    title: 'Best Time to Buy and Sell Stock',
    topic: 'Arrays',
    difficulty: 'Easy',
    time: '20 min',
    description: 'Find the best profit from one buy and one later sell.',
  },
  {
    id: 4,
    title: 'Longest Substring Without Repeating Characters',
    topic: 'Sliding Window',
    difficulty: 'Medium',
    time: '30 min',
    description: 'Find the longest substring with no repeated characters.',
  },
  {
    id: 5,
    title: 'Contains Duplicate',
    topic: 'Arrays & Hashing',
    difficulty: 'Easy',
    time: '15 min',
    description: 'Determine whether an array contains any repeated values.',
  },
  {
    id: 6,
    title: 'Valid Anagram',
    topic: 'Arrays & Hashing',
    difficulty: 'Easy',
    time: '20 min',
    description: 'Check whether two strings contain the same characters.',
  },
  {
    id: 7,
    title: 'Binary Search',
    topic: 'Binary Search',
    difficulty: 'Easy',
    time: '20 min',
    description: 'Find a target in a sorted array in logarithmic time.',
  },
  {
    id: 8,
    title: 'Maximum Subarray',
    topic: 'Dynamic Programming',
    difficulty: 'Medium',
    time: '25 min',
    description: 'Find the contiguous subarray with the largest sum.',
  },
  {
    id: 9,
    title: 'Product of Array Except Self',
    topic: 'Arrays',
    difficulty: 'Medium',
    time: '30 min',
    description: 'Build products for each index without using division.',
  },
  {
    id: 10,
    title: 'Merge Intervals',
    topic: 'Intervals',
    difficulty: 'Medium',
    time: '30 min',
    description: 'Combine overlapping intervals into a minimal set.',
  },
  {
    id: 11,
    title: 'Reverse Linked List',
    topic: 'Linked Lists',
    difficulty: 'Easy',
    time: '20 min',
    description: 'Reverse a singly linked list iteratively or recursively.',
  },
  {
    id: 12,
    title: 'Number of Islands',
    topic: 'Graphs',
    difficulty: 'Medium',
    time: '35 min',
    description: 'Count connected groups of land cells in a grid.',
  },
  {
    id: 13,
    title: 'Climbing Stairs',
    topic: 'Dynamic Programming',
    difficulty: 'Easy',
    time: '20 min',
    description: 'Count the ways to reach the top taking one or two steps.',
  },
  {
    id: 14,
    title: 'Three Sum',
    topic: 'Two Pointers',
    difficulty: 'Medium',
    time: '35 min',
    description: 'Find unique triplets whose values add up to zero.',
  },
  {
    id: 15,
    title: 'Top K Frequent Elements',
    topic: 'Arrays & Hashing',
    difficulty: 'Medium',
    time: '30 min',
    description: 'Return the k values that occur most often.',
  },
]

const assessmentQuestions = [
  {
    id: 'array-order',
    question: 'Which data structure is best for first-in, first-out order?',
    options: ['Stack', 'Queue', 'Hash map', 'Tree'],
    answer: 'Queue',
  },
  {
    id: 'hashing',
    question: 'What is the most common role of a hash map in coding interviews?',
    options: [
      'Tracking ordering of values',
      'Storing pairs with fast lookups',
      'Sorting values alphabetically',
      'Reversing strings',
    ],
    answer: 'Storing pairs with fast lookups',
  },
  {
    id: 'time-complexity',
    question: 'A linear scan through an array usually runs in what time complexity?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    answer: 'O(n)',
  },
  {
    id: 'binary-search',
    question: 'What condition must hold before using binary search?',
    options: [
      'The input must be sorted',
      'The input must contain unique values',
      'The input must be a linked list',
      'The input must have an even length',
    ],
    answer: 'The input must be sorted',
  },
  {
    id: 'two-pointers',
    question: 'Which technique is often useful for finding a pair in a sorted array?',
    options: ['Two pointers', 'Depth-first search', 'Prefix tree', 'Heap sort'],
    answer: 'Two pointers',
  },
  {
    id: 'recursion',
    question: 'What does a recursive function need to avoid running forever?',
    options: ['A hash map', 'A base case', 'A nested loop', 'A sorted input'],
    answer: 'A base case',
  },
  {
    id: 'bfs',
    question: 'Which data structure is commonly used for breadth-first search?',
    options: ['Queue', 'Stack', 'Set only', 'Priority queue'],
    answer: 'Queue',
  },
  {
    id: 'stack',
    question: 'Which operation order best describes a stack?',
    options: ['First in, first out', 'Last in, first out', 'Random access only', 'Sorted order'],
    answer: 'Last in, first out',
  },
  {
    id: 'set-membership',
    question: 'What is a common reason to use a set when solving an array problem?',
    options: [
      'To check membership efficiently',
      'To preserve duplicate values',
      'To guarantee sorted order',
      'To access values by position',
    ],
    answer: 'To check membership efficiently',
  },
  {
    id: 'linked-list',
    question: 'How do you typically move to the next item in a singly linked list?',
    options: [
      'Follow the current node’s next reference',
      'Increment an array index',
      'Pop the current item from a queue',
      'Search the list by key',
    ],
    answer: 'Follow the current node’s next reference',
  },
  {
    id: 'dynamic-programming',
    question: 'What is a key idea behind dynamic programming?',
    options: [
      'Reuse results of overlapping subproblems',
      'Always choose the locally largest value',
      'Replace every loop with recursion',
      'Sort the input before each step',
    ],
    answer: 'Reuse results of overlapping subproblems',
  },
  {
    id: 'complexity-space',
    question: 'What does space complexity describe?',
    options: [
      'The extra memory an algorithm uses',
      'The number of input values',
      'The time needed to compile code',
      'The number of functions in a program',
    ],
    answer: 'The extra memory an algorithm uses',
  },
]

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: 'DB' },
  { id: 'practice', label: 'Coding practice', icon: 'CP' },
  { id: 'assessments', label: 'Assessments', icon: 'AS' },
  { id: 'interviews', label: 'Mock interviews', icon: 'MI', requiresAi: true },
  { id: 'code-review', label: 'AI code review', icon: 'CR', requiresAi: true },
  { id: 'learning-plan', label: 'Learning plan', icon: 'LP', requiresAi: true },
  { id: 'resume', label: 'Resume review', icon: 'RR', requiresAi: true },
]

function App() {
  const [studentUsn, setStudentUsn] = useState(() => {
    try {
      return window.sessionStorage.getItem(loginStorageKey) || ''
    } catch {
      return ''
    }
  })
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  async function logIn(usn) {
    setLoginError('')
    setIsLoggingIn(true)
    try {
      const student = await postJson('/api/auth/login', { usn })
      window.sessionStorage.setItem(loginStorageKey, student.usn)
      setStudentUsn(student.usn)
    } catch (error) {
      setLoginError(error.message)
    } finally {
      setIsLoggingIn(false)
    }
  }

  function logOut() {
    window.sessionStorage.removeItem(loginStorageKey)
    setStudentUsn('')
  }

  return studentUsn ? (
    <PlacementWorkspace
      key={studentUsn}
      onLogout={logOut}
      studentUsn={studentUsn}
    />
  ) : (
    <LoginPage error={loginError} isSubmitting={isLoggingIn} onLogin={logIn} />
  )
}

function LoginPage({ error, isSubmitting, onLogin }) {
  const [usn, setUsn] = useState('')

  function submitLogin(event) {
    event.preventDefault()
    onLogin(usn.trim())
  }

  return (
    <main className="login-page">
      <section aria-labelledby="login-title" className="login-card">
        <div className="brand login-brand">
          <span aria-hidden="true" className="brand-mark">
            P
          </span>
          <span className="brand-copy">
            <strong>Pathfinder</strong>
            <span>PLACEMENT INTELLIGENCE</span>
          </span>
        </div>
        <p className="eyebrow">STUDENT WORKSPACE</p>
        <h1 id="login-title">Sign in with your USN</h1>
        <p className="login-description">
          Enter your university seat number. On first sign-in, it will be
          recorded in the student database.
        </p>
        <form className="login-form" onSubmit={submitLogin}>
          <label className="form-field">
            <span>University seat number (USN)</span>
            <input
              autoComplete="username"
              maxLength={36}
              onChange={(event) => setUsn(event.target.value)}
              placeholder="e.g. DEMO001"
              required
              value={usn}
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button button-primary login-submit"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Checking USN…' : 'Continue'}
          </button>
        </form>
        <p className="login-warning">
          USN-only sign-in does not verify identity. Anyone can enter a USN and
          access progress stored under it. Do not store confidential
          information here.
        </p>
      </section>
    </main>
  )
}

function PlacementWorkspace({ studentUsn, onLogout }) {
  const storageKey = `pathfinder-progress-${studentUsn}`
  const solutionStorageKey = `${storageKey}-solutions`
  const [activePage, setActivePage] = useState('dashboard')
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('All levels')
  const [completedProblems, setCompletedProblems] = useState(() => {
    if (typeof window === 'undefined') return []

    try {
      const savedValue = window.localStorage.getItem(storageKey)
      return savedValue ? JSON.parse(savedValue) : []
    } catch {
      return []
    }
  })
  const [practiceSolutions, setPracticeSolutions] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(solutionStorageKey) || '{}')
    } catch {
      return {}
    }
  })
  const [assessmentAnswers, setAssessmentAnswers] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(`${storageKey}-answers`) || '{}')
    } catch {
      return {}
    }
  })
  const [progressLoaded, setProgressLoaded] = useState(false)
  const [progressStatus, setProgressStatus] = useState('Loading progress…')
  const [aiStatus, setAiStatus] = useState('checking')
  const aiAvailable = aiStatus === 'available'

  useEffect(() => {
    let active = true
    fetch('/api/health')
      .then(readApiResponse)
      .then((health) => {
        if (active) {
          setAiStatus(
            health.ollamaAvailable && health.modelAvailable
              ? 'available'
              : 'unavailable',
          )
        }
      })
      .catch(() => {
        if (active) setAiStatus('unavailable')
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    fetch(`/api/progress/${encodeURIComponent(studentUsn)}`)
      .then(readApiResponse)
      .then((savedProgress) => {
        if (!active) return
        const localProblems = JSON.parse(window.localStorage.getItem(storageKey) || '[]')
        const localAnswers = JSON.parse(
          window.localStorage.getItem(`${storageKey}-answers`) || '{}',
        )
        const localSolutions = JSON.parse(
          window.localStorage.getItem(solutionStorageKey) || '{}',
        )
        const hasSavedProgress =
          savedProgress.completedProblems.length > 0 ||
          Object.keys(savedProgress.assessmentAnswers).length > 0 ||
          Object.keys(savedProgress.practiceSolutions || {}).length > 0
        setCompletedProblems(hasSavedProgress ? savedProgress.completedProblems : localProblems)
        setAssessmentAnswers(
          hasSavedProgress ? savedProgress.assessmentAnswers : localAnswers,
        )
        setPracticeSolutions(
          hasSavedProgress ? savedProgress.practiceSolutions || {} : localSolutions,
        )
        setProgressStatus('Synced with MySQL')
      })
      .catch(() => {
        if (active) setProgressStatus('MySQL unavailable; using this browser')
      })
      .finally(() => {
        if (active) setProgressLoaded(true)
      })

    return () => {
      active = false
    }
  }, [studentUsn, storageKey, solutionStorageKey])

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(completedProblems))
    window.localStorage.setItem(`${storageKey}-answers`, JSON.stringify(assessmentAnswers))
    window.localStorage.setItem(solutionStorageKey, JSON.stringify(practiceSolutions))
    if (!progressLoaded) return undefined

    const timerId = window.setTimeout(() => {
      fetch(`/api/progress/${encodeURIComponent(studentUsn)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedProblems, assessmentAnswers, practiceSolutions }),
      })
        .then(readApiResponse)
        .then(() => setProgressStatus('Synced with MySQL'))
        .catch((error) => setProgressStatus(`Local save only: ${error.message}`))
    }, 350)

    return () => window.clearTimeout(timerId)
  }, [
    assessmentAnswers,
    completedProblems,
    practiceSolutions,
    progressLoaded,
    studentUsn,
    storageKey,
    solutionStorageKey,
  ])

  const filteredProblems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return problems.filter((problem) => {
      const matchesQuery =
        !normalizedQuery ||
        `${problem.title} ${problem.topic}`.toLowerCase().includes(normalizedQuery)
      const matchesDifficulty =
        difficulty === 'All levels' || problem.difficulty === difficulty

      return matchesQuery && matchesDifficulty
    })
  }, [difficulty, query])

  function toggleProblem(problemId) {
    setCompletedProblems((current) =>
      current.includes(problemId)
        ? current.filter((id) => id !== problemId)
        : [...current, problemId],
    )
  }

  function updateAssessment(questionId, answer) {
    setAssessmentAnswers((current) => ({ ...current, [questionId]: answer }))
  }

  function updatePracticeSolution(problemId, code) {
    setPracticeSolutions((current) => ({ ...current, [problemId]: code }))
  }

  function navigateTo(page) {
    setActivePage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#dashboard"
          onClick={(event) => {
            event.preventDefault()
            navigateTo('dashboard')
          }}
        >
          <span className="brand-mark" aria-hidden="true">
            P
          </span>
          <span className="brand-copy">
            <strong>Pathfinder</strong>
            <span>PLACEMENT INTELLIGENCE</span>
          </span>
        </a>

        <p className="sidebar-label">WORKSPACE</p>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              className={`nav-item ${activePage === item.id ? 'is-active' : ''}`}
              disabled={item.requiresAi && !aiAvailable}
              key={item.id}
              onClick={() => navigateTo(item.id)}
              title={
                item.requiresAi && !aiAvailable
                  ? 'AI is not configured for this deployment.'
                  : undefined
              }
              type="button"
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
              {item.id === 'practice' && (
                <span className="nav-count">{problems.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <span className="note-spark" aria-hidden="true">
            *
          </span>
          <p className="note-title">A steady start</p>
          <p className="note-copy">
            Small, consistent practice beats trying to learn everything at once.
          </p>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar" aria-hidden="true">
            ST
          </div>
          <div>
            <strong>{studentUsn}</strong>
            <span>Signed in</span>
          </div>
          <span className="profile-menu" aria-hidden="true">
            ···
          </span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>
              {navigation.find((item) => item.id === activePage)?.label ??
                'Dashboard'}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="progress-sync-status">{progressStatus}</span>
            <span className="student-label">{studentUsn}</span>
            <span className="demo-badge">
              <span className="status-dot" />
              Starter version
            </span>
            <button className="sign-out-button" onClick={onLogout} type="button">
              Sign out
            </button>
            <button
              aria-label="Open dashboard"
              className="profile-avatar top-avatar"
              onClick={() => navigateTo('dashboard')}
              type="button"
            >
              ST
            </button>
          </div>
        </header>

        {activePage === 'dashboard' && (
          <Dashboard
            aiAvailable={aiAvailable}
            aiStatus={aiStatus}
            completedCount={completedProblems.length}
            onNavigate={navigateTo}
          />
        )}

        {activePage === 'practice' && (
          <PracticePage
            completedProblems={completedProblems}
            difficulty={difficulty}
            filteredProblems={filteredProblems}
            onDifficultyChange={setDifficulty}
            onQueryChange={setQuery}
            onSaveSolution={updatePracticeSolution}
            onSubmitSolution={toggleProblem}
            onToggleProblem={toggleProblem}
            practiceSolutions={practiceSolutions}
            query={query}
          />
        )}

        {activePage === 'assessments' && (
          <AssessmentPage
            answers={assessmentAnswers}
            onAnswerChange={updateAssessment}
          />
        )}

        {activePage === 'interviews' && <InterviewPage />}

        {activePage === 'code-review' && <CodeReviewPage />}

        {activePage === 'learning-plan' && (
          <LearningPlanPage completedProblems={completedProblems} />
        )}

        {activePage === 'resume' && <ResumePage />}

        <footer className="page-footer">
          <span>Built for practice, progress, and the next opportunity.</span>
          <span>Placement Intelligence Platform · Starter version</span>
        </footer>
      </main>
    </div>
  )
}

function Dashboard({ aiAvailable, aiStatus, completedCount, onNavigate }) {
  const totalProblems = problems.length
  const progress = Math.round((completedCount / totalProblems) * 100)
  const [studentCount, setStudentCount] = useState(null)
  const [studentCountUnavailable, setStudentCountUnavailable] = useState(false)
  const aiModuleStatus =
    aiStatus === 'checking'
      ? 'Checking AI…'
      : aiAvailable
        ? 'Available now'
        : 'AI unavailable'

  useEffect(() => {
    let active = true
    fetch('/api/dashboard/student-count')
      .then(readApiResponse)
      .then(({ count }) => {
        if (!Number.isSafeInteger(count) || count < 0) {
          throw new Error('The API returned an invalid student count.')
        }
        if (active) setStudentCount(count)
      })
      .catch(() => {
        if (active) setStudentCountUnavailable(true)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="page-content">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">YOUR PREPARATION, IN ONE PLACE</p>
          <h1>Build confidence, one session at a time.</h1>
          <p className="welcome-copy">
            Practice coding, understand your progress, and make your next step
            count.
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={() => onNavigate('practice')}
          type="button"
        >
          Start practicing <span aria-hidden="true">→</span>
        </button>
      </section>

      <section className="hero-card">
        <div className="hero-content">
          <span className="hero-kicker">
            <span className="hero-kicker-dot" />
            YOUR NEXT STEP
          </span>
          <h2>Start with a problem. Leave with a little more confidence.</h2>
          <p>
            Work through a focused set of interview-style challenges at your own
            pace.
          </p>
          <button
            className="button button-light"
            onClick={() => onNavigate('practice')}
            type="button"
          >
            Explore coding practice <span aria-hidden="true">↗</span>
          </button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-spark spark-one">✳</div>
          <div className="hero-spark spark-two">✦</div>
          <div className="hero-code-card">
            <span className="code-dots">
              <i />
              <i />
              <i />
            </span>
            <span className="code-line code-line-long" />
            <span className="code-line code-line-short" />
            <span className="code-line code-line-medium" />
            <span className="code-result">
              <span>✓</span> Keep going
            </span>
          </div>
        </div>
      </section>

      <section className="section-heading">
        <div>
          <p className="eyebrow">YOUR LEARNING SPACE</p>
          <h2>Choose where to begin</h2>
        </div>
        <span className="section-aside">Modules unlock as the platform grows</span>
      </section>

      <section className="module-grid" aria-label="Learning modules">
        <ModuleCard
          description="Sharpen your problem-solving with interview-style questions."
          icon="CP"
          label="Coding practice"
          onClick={() => onNavigate('practice')}
          status="Available now"
          tone="lavender"
        />
        <ModuleCard
          description="Check your topic knowledge and see what to improve."
          icon="AS"
          label="Skill assessments"
          onClick={() => onNavigate('assessments')}
          status="Available now"
          tone="mint"
        />
        <ModuleCard
          description="Rehearse your answers and build interview confidence."
          disabled={!aiAvailable}
          icon="MI"
          label="Mock interviews"
          onClick={() => onNavigate('interviews')}
          status={aiModuleStatus}
          tone="peach"
        />
        <ModuleCard
          description="Get clear explanations and actionable suggestions for your code."
          disabled={!aiAvailable}
          icon="CR"
          label="AI code review"
          onClick={() => onNavigate('code-review')}
          status={aiModuleStatus}
          tone="blue"
        />
        <ModuleCard
          description="Turn your goals and completed practice into a focused weekly plan."
          disabled={!aiAvailable}
          icon="LP"
          label="Personalized learning plan"
          onClick={() => onNavigate('learning-plan')}
          status={aiModuleStatus}
          tone="mint"
        />
        <ModuleCard
          description="Get thoughtful suggestions for presenting your skills."
          disabled={!aiAvailable}
          icon="RR"
          label="Resume review"
          onClick={() => onNavigate('resume')}
          status={aiModuleStatus}
          tone="blue"
        />
      </section>

      <section className="bottom-grid">
        <div className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CODING PRACTICE</p>
              <h2>Your progress</h2>
            </div>
            <span className="progress-ring" style={{ '--progress': `${progress}%` }}>
              <span>{progress}%</span>
            </span>
          </div>
          <p className="panel-copy">
            You have completed {completedCount} of {totalProblems} starter
            problems in this session.
          </p>
          <div
            aria-label={`${progress}% of starter problems completed`}
            className="progress-track"
            role="img"
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-foot">
            <span>{completedCount} completed</span>
            <button
              className="text-button"
              onClick={() => onNavigate('practice')}
              type="button"
            >
              View problem set <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        <div className="panel focus-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">A GOOD PLACE TO START</p>
              <h2>Today’s focus</h2>
            </div>
            <span className="focus-icon" aria-hidden="true">
              ✦
            </span>
          </div>
          <p className="focus-title">Arrays & problem-solving</p>
          <p className="panel-copy">
            Try one short challenge, then explain your approach in your own
            words.
          </p>
          <button
            className="text-button"
            onClick={() => onNavigate('practice')}
            type="button"
          >
            Find a challenge <span aria-hidden="true">→</span>
          </button>
        </div>

        <div aria-live="polite" className="panel student-count-panel">
          <p className="eyebrow">STUDENT COMMUNITY</p>
          <h2>Registered students</h2>
          <p className="student-count-value">
            {studentCount === null
              ? studentCountUnavailable
                ? '—'
                : '…'
              : studentCount.toLocaleString()}
          </p>
          <p className="student-count-description">
            {studentCountUnavailable
              ? 'Student count is unavailable.'
              : studentCount === null
                ? 'Loading student count…'
                : 'Unique student USNs'}
          </p>
        </div>
      </section>
    </div>
  )
}

function ModuleCard({ description, disabled = false, icon, label, onClick, status, tone }) {
  return (
    <button className="module-card" disabled={disabled} onClick={onClick} type="button">
      <span className={`module-icon ${tone}`} aria-hidden="true">
        {icon}
      </span>
      <span className="module-card-copy">
        <span className="module-card-topline">
          <strong>{label}</strong>
          <span className={`module-status ${status === 'Available now' ? 'available' : ''}`}>
            {status}
          </span>
        </span>
        <span className="module-description">{description}</span>
        <span className="module-link">
          {disabled ? 'Unavailable until configured' : 'Open module'}
          {!disabled && <span aria-hidden="true"> →</span>}
        </span>
      </span>
    </button>
  )
}

function PracticePage({
  completedProblems,
  difficulty,
  filteredProblems,
  onSaveSolution,
  onSubmitSolution,
  onDifficultyChange,
  onQueryChange,
  onToggleProblem,
  practiceSolutions,
  query,
}) {
  const [selectedProblemId, setSelectedProblemId] = useState(null)
  const selectedProblem = problems.find((problem) => problem.id === selectedProblemId)

  return (
    <div className="page-content practice-page">
      <section className="welcome-row practice-welcome">
        <div>
          <p className="eyebrow">CODING PRACTICE</p>
          <h1>Make problem-solving a habit.</h1>
          <p className="welcome-copy">
            A small starter set to help you build a strong interview-prep
            routine.
          </p>
        </div>
        <span className="problem-count">
          <strong>{completedProblems.length}</strong> / {problems.length} done
        </span>
      </section>

      <section className="practice-panel">
        <div className="practice-toolbar">
          <label className="search-field">
            <span className="search-icon" aria-hidden="true">
              ⌕
            </span>
            <span className="visually-hidden">Search problems</span>
            <input
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search problems or topics"
              type="search"
              value={query}
            />
          </label>
          <label className="filter-field">
            <span className="visually-hidden">Filter by difficulty</span>
            <select
              onChange={(event) => onDifficultyChange(event.target.value)}
              value={difficulty}
            >
              <option>All levels</option>
              <option>Easy</option>
              <option>Medium</option>
            </select>
          </label>
        </div>

        <div className="problem-list">
          {filteredProblems.map((problem) => {
            const isCompleted = completedProblems.includes(problem.id)

            return (
              <article className="problem-row" key={problem.id}>
                <span
                  className={`problem-check ${isCompleted ? 'is-complete' : ''}`}
                  aria-hidden="true"
                >
                  {isCompleted ? '✓' : ''}
                </span>
                <div className="problem-main">
                  <div className="problem-title-row">
                    <h2>{problem.title}</h2>
                    <span
                      className={`difficulty-tag ${problem.difficulty.toLowerCase()}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                  <p>{problem.description}</p>
                  <div className="problem-meta">
                    <span>{problem.topic}</span>
                    <span className="meta-separator">·</span>
                    <span>{problem.time}</span>
                  </div>
                </div>
                <button
                  aria-pressed={isCompleted}
                  className={`button ${isCompleted ? 'button-completed' : 'button-outline'}`}
                  onClick={() => onToggleProblem(problem.id)}
                  type="button"
                >
                  {isCompleted ? 'Completed' : 'Mark complete'}
                </button>
                <button
                  aria-pressed={selectedProblemId === problem.id}
                  className="text-button"
                  onClick={() => setSelectedProblemId(problem.id)}
                  type="button"
                >
                  {selectedProblemId === problem.id ? 'Editing' : 'Edit solution'}
                </button>
              </article>
            )
          })}
          {filteredProblems.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">
                ?
              </span>
              <h2>No matching problems</h2>
              <p>Try a different search or difficulty filter.</p>
            </div>
          )}
        </div>
        {selectedProblem && (
          <section aria-labelledby="solution-editor-title" className="solution-editor">
            <div className="solution-editor-heading">
              <div>
                <p className="eyebrow">JAVA PRACTICE</p>
                <h2 id="solution-editor-title">{selectedProblem.title}</h2>
                <p>{selectedProblem.description}</p>
              </div>
              <span className="language-tag">Java</span>
            </div>
            <label className="code-editor-label" htmlFor="java-solution">
              Your solution
            </label>
            <textarea
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="code-editor"
              id="java-solution"
              maxLength={15000}
              onChange={(event) =>
                onSaveSolution(selectedProblem.id, event.target.value)
              }
              spellCheck={false}
              value={
                practiceSolutions[selectedProblem.id] ??
                `class Solution {\n    // TODO: Implement ${selectedProblem.title}\n}`
              }
            />
            <div className="solution-editor-footer">
              <p>
                Drafts save automatically to this browser and MySQL. Code is not
                run here; mark complete only when you are ready.
              </p>
              <button
                aria-pressed={completedProblems.includes(selectedProblem.id)}
                className={`button ${completedProblems.includes(selectedProblem.id) ? 'button-completed' : 'button-outline'}`}
                onClick={() => onSubmitSolution(selectedProblem.id)}
                type="button"
              >
                {completedProblems.includes(selectedProblem.id)
                  ? 'Submitted'
                  : 'Mark as submitted'}
              </button>
            </div>
          </section>
        )}
        <p className="practice-note">
          Open a problem’s editor to write and save a Java draft. Mark problems
          complete manually; code execution is not enabled.
        </p>
      </section>
    </div>
  )
}

function AssessmentPage({ answers, onAnswerChange }) {
  const score = assessmentQuestions.reduce((total, item) => {
    return total + (answers[item.id] === item.answer ? 1 : 0)
  }, 0)

  return (
    <div className="page-content module-page">
      <section className="welcome-row practice-welcome">
        <div>
          <p className="eyebrow">SKILL ASSESSMENTS</p>
          <h1>Check your fundamentals before your next interview block.</h1>
          <p className="welcome-copy">
            A quick readiness snapshot for arrays, recursion patterns, and core data structures.
          </p>
        </div>
        <span className="problem-count">
          <strong>{score}</strong> / {assessmentQuestions.length} correct
        </span>
      </section>

      <section className="assessment-panel">
        {assessmentQuestions.map((item, index) => (
          <div className="assessment-card" key={item.id}>
            <p className="assessment-question-number">Question {index + 1}</p>
            <h2>{item.question}</h2>
            <div className="choice-group">
              {item.options.map((option) => (
                <label className="choice-option" key={option}>
                  <input
                    checked={answers[item.id] === option}
                    name={item.id}
                    onChange={() => onAnswerChange(item.id, option)}
                    type="radio"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="assessment-summary">
          <p className="eyebrow">READINESS SUMMARY</p>
          <h3>
            {score >= 2
              ? 'Strong foundation'
              : score === 1
                ? 'Good momentum'
                : 'Start with the basics'}
          </h3>
          <p>
            {score >= 2
              ? 'You are ready to push into medium-difficulty practice and explain your approach clearly.'
              : score === 1
                ? 'One concept still needs work. Revisit arrays and data-structure basics before moving on.'
                : 'Focus on the fundamentals: arrays, stacks, and hash maps are the backbone of many interview questions.'}
          </p>
        </div>
      </section>
    </div>
  )
}

function InterviewPage() {
  const [category, setCategory] = useState('HR')
  const [difficulty, setDifficulty] = useState('Medium')
  const [question, setQuestion] = useState('Tell me about a time you solved a hard problem.')
  const [hint, setHint] = useState('Use a clear situation, action, and result to structure your answer.')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [isScoring, setIsScoring] = useState(false)
  const [error, setError] = useState('')
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const speechRecognitionRef = useRef(null)

  useEffect(() => {
    if (!isRecording) return undefined

    let elapsed = 0
    const timerId = window.setInterval(() => {
      elapsed += 1
      setRecordingSeconds(elapsed)
      if (elapsed >= 120) {
        recorderRef.current?.stop()
      }
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isRecording])

  useEffect(
    () => () => {
      if (recorderRef.current?.state === 'recording') {
        recorderRef.current.stop()
      }
      speechRecognitionRef.current?.stop()
      streamRef.current?.getTracks().forEach((track) => track.stop())
    },
    [],
  )

  useEffect(
    () => () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    },
    [audioUrl],
  )

  async function startRecording() {
    setError('')
    setFeedback(null)
    setAudioBlob(null)
    setTranscript('')
    setRecordingSeconds(0)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl('')
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Audio recording is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'].find(
        (type) => MediaRecorder.isTypeSupported(type),
      )
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      recorder.onstop = () => {
        speechRecognitionRef.current?.stop()
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setIsRecording(false)
        const recording = new Blob(chunks, {
          type: recorder.mimeType || 'audio/webm',
        })
        if (recording.size === 0) {
          setError('No audio was captured. Please try recording again.')
          return
        }
        setAudioBlob(recording)
        setAudioUrl(URL.createObjectURL(recording))
      }

      recorderRef.current = recorder
      recorder.start()
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = 'en-US'
        recognition.onresult = (event) => {
          const newText = Array.from(event.results)
            .slice(event.resultIndex)
            .filter((result) => result.isFinal)
            .map((result) => result[0].transcript.trim())
            .filter(Boolean)
            .join(' ')
          if (newText) {
            setTranscript((current) => [current, newText].filter(Boolean).join(' '))
          }
        }
        recognition.onerror = (event) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            setError(`Speech recognition failed (${event.error}). You can type the transcript below.`)
          }
        }
        speechRecognitionRef.current = recognition
        try {
          recognition.start()
        } catch {
          setError('Live speech recognition could not start. You can type the transcript below.')
        }
      } else {
        setError('Live speech recognition is unavailable in this browser. You can type the transcript below.')
      }
      setIsRecording(true)
    } catch (recordingError) {
      setError(
        recordingError.name === 'NotAllowedError'
          ? 'Microphone access was blocked. Allow microphone access and try again.'
          : `Could not start recording: ${recordingError.message}`,
      )
    }
  }

  function stopRecording() {
    speechRecognitionRef.current?.stop()
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop()
    }
  }

  async function rateAnswer() {
    if (!transcript.trim()) {
      setError('Speak or enter a transcript before requesting feedback.')
      return
    }

    setError('')
    setFeedback(null)
    setIsScoring(true)
    try {
      const result = await postJson('/api/mock-interviews/score', {
        question,
        transcript: transcript.trim(),
      })
      setFeedback(result)
    } catch (scoringError) {
      setError(scoringError.message)
    } finally {
      setIsScoring(false)
    }
  }

  async function generateQuestion() {
    setIsGenerating(true)
    setError('')
    setFeedback(null)
    setAudioBlob(null)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl('')
    setTranscript('')
    setRecordingSeconds(0)

    try {
      const generated = await postJson('/api/mock-interviews/question', {
        category,
        difficulty,
      })
      setQuestion(generated.question)
      setHint(generated.hint)
    } catch (questionError) {
      setError(questionError.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const formattedDuration = `${Math.floor(recordingSeconds / 60)}:${String(
    recordingSeconds % 60,
  ).padStart(2, '0')}`

  return (
    <div className="page-content module-page">
      <section className="welcome-row practice-welcome">
        <div>
          <p className="eyebrow">MOCK INTERVIEWS</p>
          <h1>Practice with an AI interviewer.</h1>
          <p className="welcome-copy">
            Generate Java, SQL, DSA, or HR questions, record your answer, and get specific feedback.
          </p>
        </div>
        <span className="problem-count">
          <strong>4</strong> question categories
        </span>
      </section>

      <section className="feature-card interview-session" aria-live="polite">
        <div className="interview-settings">
          <label className="form-field">
            <span>Question category</span>
            <select
              disabled={isRecording || isScoring || isGenerating}
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option>Java</option>
              <option>SQL</option>
              <option>DSA</option>
              <option>HR</option>
            </select>
          </label>
          <label className="form-field">
            <span>Difficulty</span>
            <select
              disabled={isRecording || isScoring || isGenerating}
              onChange={(event) => setDifficulty(event.target.value)}
              value={difficulty}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </label>
          <button
            className="button button-outline generate-question"
            disabled={isRecording || isScoring || isGenerating}
            onClick={generateQuestion}
            type="button"
          >
            {isGenerating ? 'Generating question…' : 'Ask me a question'}
          </button>
        </div>

        <section className="recording-panel" aria-live="polite">
          <p className="eyebrow">YOUR ANSWER</p>
          <h2>{question}</h2>
          <p className="recording-tip">{hint}</p>
          <div className="recording-controls">
            {!isRecording ? (
              <button
                className="button button-primary"
                onClick={startRecording}
                type="button"
              >
                <span className="record-dot" aria-hidden="true" />
                {audioBlob ? 'Record again' : 'Start recording'}
              </button>
            ) : (
              <button
                className="button button-recording"
                onClick={stopRecording}
                type="button"
              >
                <span className="record-dot" aria-hidden="true" />
                Stop recording
              </button>
            )}
            <span className={`recording-time ${isRecording ? 'is-live' : ''}`}>
              {isRecording && <span className="live-dot" />}
              {formattedDuration} / 2:00
            </span>
          </div>

          {audioUrl && (
            <div className="audio-preview">
              <p className="eyebrow">REVIEW BEFORE SCORING</p>
              <audio controls src={audioUrl}>
                Your browser does not support audio playback.
              </audio>
            </div>
          )}

          <label className="form-field interview-transcript">
            <span>Transcript (recognized by your browser; editable)</span>
            <textarea
              onChange={(event) => setTranscript(event.target.value)}
              placeholder="Your spoken answer will appear here. You can also type or edit it."
              rows={5}
              value={transcript}
            />
          </label>
          <button
            className="button button-primary score-button"
            disabled={isScoring || isRecording || !transcript.trim()}
            onClick={rateAnswer}
            type="button"
          >
            {isScoring ? 'Scoring with local Ollama…' : 'Get AI feedback'}
          </button>

          {error && <p className="form-error" role="alert">{error}</p>}

          <p className="privacy-note">
            Audio playback stays in this browser; it is not uploaded or saved by this app.
            Browser speech recognition may use your browser vendor’s service. Only the transcript is sent
            to your local Ollama server for scoring. Avoid sharing sensitive personal information.
            Ratings assess the answer, not accent or voice characteristics.
          </p>

          {feedback && (
            <section className="feedback-card" aria-label="Interview answer feedback">
              <div className="feedback-score">
                <div>
                  <p className="eyebrow">ANSWER RATING</p>
                  <h3>{feedback.score}<span>/100</span></h3>
                </div>
                <div
                  aria-label={`Score ${feedback.score} out of 100`}
                  className="score-track"
                  role="img"
                >
                  <span style={{ width: `${feedback.score}%` }} />
                </div>
              </div>
              <p className="feedback-summary">{feedback.summary}</p>
              <div className="feedback-criteria">
                {feedback.criteria.map((criterion) => (
                  <div className="criterion-row" key={criterion.name}>
                    <span>{criterion.name}</span>
                    <strong>{criterion.score}/5</strong>
                    <p>{criterion.feedback}</p>
                  </div>
                ))}
              </div>
              <div className="next-step">
                <strong>Try this next</strong>
                <p>{feedback.nextStep}</p>
              </div>
              <details className="transcript-details">
                <summary>View transcript</summary>
                <p>{feedback.transcript}</p>
              </details>
            </section>
          )}
        </section>
      </section>
    </div>
  )
}

function CodeReviewPage() {
  const [language, setLanguage] = useState('Java')
  const [problem, setProblem] = useState('')
  const [code, setCode] = useState('')
  const [review, setReview] = useState(null)
  const [isReviewing, setIsReviewing] = useState(false)
  const [error, setError] = useState('')

  async function submitReview(event) {
    event.preventDefault()
    setError('')
    setReview(null)
    setIsReviewing(true)
    try {
      const result = await postJson('/api/code-review', { language, problem, code })
      setReview(result)
    } catch (reviewError) {
      setError(reviewError.message)
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <div className="page-content module-page">
      <section className="welcome-row practice-welcome">
        <div>
          <p className="eyebrow">AI CODE REVIEWER</p>
          <h1>Understand what your code does well—and what to improve.</h1>
          <p className="welcome-copy">
            Get feedback on correctness, edge cases, complexity, and readability. Code is reviewed, never executed.
          </p>
        </div>
      </section>

      <form className="feature-card ai-form" onSubmit={submitReview}>
        <div className="form-grid">
          <label className="form-field">
            <span>Programming language</span>
            <select onChange={(event) => setLanguage(event.target.value)} value={language}>
              <option>Java</option>
              <option>JavaScript</option>
              <option>Python</option>
              <option>C++</option>
              <option>SQL</option>
              <option>Other</option>
            </select>
          </label>
          <label className="form-field">
            <span>Problem statement (optional)</span>
            <input
              maxLength={2000}
              onChange={(event) => setProblem(event.target.value)}
              placeholder="What should this code do?"
              value={problem}
            />
          </label>
        </div>
        <label className="form-field">
          <span>Your code</span>
          <textarea
            maxLength={20000}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Paste your code here"
            required
            rows={12}
            value={code}
          />
        </label>
        <p className="privacy-note">
          Code is sent to your local Ollama model for review. Do not include passwords, API keys, or other secrets.
        </p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary form-submit" disabled={isReviewing} type="submit">
          {isReviewing ? 'Reviewing code…' : 'Review my code'}
        </button>
      </form>

      {review && (
        <section className="ai-results">
          <article className="feature-card">
            <p className="eyebrow">REVIEW SUMMARY</p>
            <h2>{review.summary}</h2>
            <p><strong>Complexity:</strong> {review.complexity}</p>
          </article>
          <article className="feature-card">
            <p className="eyebrow">FINDINGS</p>
            {review.issues.length ? (
              <div className="result-list">
                {review.issues.map((issue, index) => (
                  <div className="result-item" key={`${issue.severity}-${index}`}>
                    <strong>{issue.severity}</strong>
                    <p>{issue.explanation}</p>
                    <p><b>Suggestion:</b> {issue.suggestion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No specific issues were found in this review.</p>
            )}
          </article>
          {review.improvedExample && (
            <article className="feature-card">
              <p className="eyebrow">SUGGESTED EXAMPLE</p>
              <pre className="code-example"><code>{review.improvedExample}</code></pre>
            </article>
          )}
        </section>
      )}
    </div>
  )
}

function LearningPlanPage({ completedProblems }) {
  const [goal, setGoal] = useState('Prepare for software engineering placement interviews')
  const [topics, setTopics] = useState('Java, SQL, arrays, data structures')
  const [hoursPerWeek, setHoursPerWeek] = useState(5)
  const [plan, setPlan] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const completedTitles = problems
    .filter((problem) => completedProblems.includes(problem.id))
    .map((problem) => problem.title)

  async function generatePlan(event) {
    event.preventDefault()
    setError('')
    setPlan(null)
    setIsGenerating(true)
    try {
      const result = await postJson('/api/learning-plan', {
        goal,
        weakTopics: topics.split(',').map((topic) => topic.trim()).filter(Boolean),
        completedProblems: completedTitles,
        hoursPerWeek: Number(hoursPerWeek),
      })
      setPlan(result)
    } catch (planError) {
      setError(planError.message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="page-content module-page">
      <section className="welcome-row practice-welcome">
        <div>
          <p className="eyebrow">PERSONALIZED LEARNING PLAN</p>
          <h1>Turn your placement goal into a weekly routine.</h1>
          <p className="welcome-copy">
            The plan uses your goals, focus topics, available time, and completed problems.
          </p>
        </div>
        <span className="problem-count"><strong>{completedTitles.length}</strong> problems completed</span>
      </section>

      <form className="feature-card ai-form" onSubmit={generatePlan}>
        <label className="form-field">
          <span>Your goal</span>
          <input
            maxLength={300}
            onChange={(event) => setGoal(event.target.value)}
            required
            value={goal}
          />
        </label>
        <div className="form-grid">
          <label className="form-field">
            <span>Topics to improve (comma separated)</span>
            <input
              maxLength={500}
              onChange={(event) => setTopics(event.target.value)}
              placeholder="Java, SQL, arrays"
              value={topics}
            />
          </label>
          <label className="form-field">
            <span>Study hours per week</span>
            <input
              max={40}
              min={1}
              onChange={(event) => setHoursPerWeek(event.target.value)}
              required
              type="number"
              value={hoursPerWeek}
            />
          </label>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary form-submit" disabled={isGenerating} type="submit">
          {isGenerating ? 'Building your plan…' : 'Create my 7-day plan'}
        </button>
      </form>

      {plan && (
        <section className="ai-results">
          <article className="feature-card">
            <p className="eyebrow">YOUR PLAN</p>
            <h2>{plan.overview}</h2>
          </article>
          <div className="plan-grid">
            {plan.days.map((day) => (
              <article className="feature-card plan-day" key={day.day}>
                <p className="eyebrow">{day.day} · {day.minutes} MIN</p>
                <h2>{day.topic}</h2>
                <p>{day.activity}</p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ResumePage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  async function analyzeResume(event) {
    event.preventDefault()
    setError('')
    setAnalysis(null)
    setIsAnalyzing(true)
    try {
      const result = await postJson('/api/resume/analyze', { resumeText, jobDescription })
      setAnalysis(result)
    } catch (analysisError) {
      setError(analysisError.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="page-content module-page">
      <section className="welcome-row practice-welcome">
        <div>
          <p className="eyebrow">AI RESUME ANALYZER</p>
          <h1>Make your experience easier to scan and trust.</h1>
          <p className="welcome-copy">
            Paste your resume text for actionable feedback. No file upload is needed.
          </p>
        </div>
      </section>

      <form className="feature-card ai-form" onSubmit={analyzeResume}>
        <label className="form-field">
          <span>Resume text</span>
          <textarea
            maxLength={20000}
            onChange={(event) => setResumeText(event.target.value)}
            placeholder="Paste the text from your resume"
            required
            rows={10}
            value={resumeText}
          />
        </label>
        <label className="form-field">
          <span>Target job description (optional)</span>
          <textarea
            maxLength={12000}
            onChange={(event) => setJobDescription(event.target.value)}
            placeholder="Add a role description to tailor the feedback"
            rows={5}
            value={jobDescription}
          />
        </label>
        <p className="privacy-note">
          Resume text is sent to your local Ollama model for analysis. Remove personal details you do not want to share.
        </p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary form-submit" disabled={isAnalyzing} type="submit">
          {isAnalyzing ? 'Analyzing resume…' : 'Analyze my resume'}
        </button>
      </form>

      {analysis && (
        <section className="ai-results">
          <article className="feature-card resume-score-card">
            <div>
              <p className="eyebrow">RESUME READINESS</p>
              <h2>{analysis.score}<span>/100</span></h2>
            </div>
            <p>{analysis.summary}</p>
          </article>
          <div className="resume-layout">
            <article className="feature-card">
              <p className="eyebrow">STRENGTHS</p>
              <ul className="checklist">
                {analysis.strengths.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className="feature-card">
              <p className="eyebrow">SUGGESTED IMPROVEMENTS</p>
              <ul className="checklist">
                {analysis.improvements.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          </div>
          {analysis.rewrittenBullets.length > 0 && (
            <article className="feature-card">
              <p className="eyebrow">SAMPLE BULLET REWRITES</p>
              <ul className="checklist">
                {analysis.rewrittenBullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          )}
        </section>
      )}
    </div>
  )
}

export default App
