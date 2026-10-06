import { Check, ChevronLeft, ChevronRight, Clipboard, Menu, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'

type Lesson = {
  title: string
  kicker: string
  win: string
  sections: Array<{ heading: string; body: string; bullets?: string[] }>
  example: { label: string; text: string }
  prompt: string
}

const lessons: Lesson[] = [
  {
    kicker: 'Lesson 1 · The mental model',
    title: 'Agents are action loops, not chatbots',
    win: 'Know when a task needs an agent—and when a normal prompt is enough.',
    sections: [
      { heading: 'Three different things', body: 'A chat model writes a response. A workflow follows a sequence you designed. An agent pursues a goal by choosing actions, using tools, observing results, and deciding what to do next.', bullets: ['Chat: “summarise this document.”', 'Workflow: extract → classify → format.', 'Agent: investigate the situation, choose the next useful action, and keep going until the goal is met.'] },
      { heading: 'The planning example', body: 'Imagine asking an agent to turn “prepare a launch plan for our new service” into a useful package. It might inspect existing documents, ask for missing constraints, draft milestones, compare risks, and produce a plan plus supporting documents. The value is the loop—not a magical answer.' },
      { heading: 'The decision test', body: 'Use an agent when the path is uncertain, the task has several dependent steps, and the system can inspect results between steps. Use a normal prompt when you already know the sequence and only need text or reasoning.' },
    ],
    example: { label: 'Before / after', text: 'Prompt: “Write a launch plan.”\n\nAgent-shaped request: “Help me prepare a launch plan. First inspect the attached context, identify missing decisions, propose a plan, and pause before any external action. Show your evidence and assumptions.”' },
    prompt: 'Help me decide whether this task needs a chat response, a fixed workflow, or an agent. Explain the choice, the actions involved, and where a human should approve.',
  },
  {
    kicker: 'Lesson 2 · Efficiency',
    title: 'Context is working memory you manage',
    win: 'Spend tokens and attention on the information that changes the decision.',
    sections: [
      { heading: 'More context is not automatically better', body: 'An agent can only use what it can see, and every extra file or paragraph competes for attention. Good context is selected, labelled, and easy to verify—not a dump of everything nearby.' },
      { heading: 'The highest-leverage tricks', body: 'Save time by shaping the loop before it runs.', bullets: ['Give the goal, constraints, audience, and definition of done up front.', 'Point to the relevant files instead of pasting duplicate background.', 'Ask for a short plan before expensive work.', 'Use checkpoints: research → findings → draft → review.', 'Pass structured handoffs: facts, decisions, open questions, next action.', 'Stop when the goal is met; do not reward extra activity.'] },
      { heading: 'A useful checkpoint', body: 'Ask the agent to compress stable findings into a small brief before continuing. That brief becomes the working context for the next phase and makes resuming later much cheaper.' },
    ],
    example: { label: 'Context compression', text: 'Instead of repeating a 20-message discussion:\n\n“Create a handoff brief with: goal, confirmed facts, decisions, constraints, open questions, files used, and next action. Keep it under 300 words.”' },
    prompt: 'You are at a checkpoint. Compress the work so far into goal, facts, decisions, constraints, open questions, evidence, and next action. Keep it concise and do not invent missing information.',
  },
  {
    kicker: 'Lesson 3 · Leverage and control',
    title: 'Skills make good behaviour reusable',
    win: 'Turn a successful way of working into a repeatable, supervised capability.',
    sections: [
      { heading: 'What a skill is', body: 'A skill is a reusable instruction package for a recurring kind of work. It describes the job, expected inputs, constraints, available tools, output shape, and verification steps. Codex skills and Claude skills are practical examples of this idea.' },
      { heading: 'Tools change the risk', body: 'Reading a file, drafting a document, editing local code, sending a message, and deleting data are not equivalent actions. Explain the difference to yourself and to the agent.', bullets: ['Read: usually low risk.', 'Draft: review before sharing.', 'Reversible edit: bounded and inspectable.', 'External action: explicit approval.', 'Destructive action: confirmation plus verification.'] },
      { heading: 'The supervision loop', body: 'Useful autonomy is graduated. Let the agent investigate and propose. Keep approval gates around consequential actions. Require evidence for decisions and a clear stop condition. Fast is good; unreviewable is not.' },
    ],
    example: { label: 'A small skill', text: 'Planning skill\n\nPurpose: turn a vague work goal into a reviewable plan.\nInputs: goal, audience, deadline, constraints.\nOutput: assumptions, milestones, risks, open questions.\nVerify: every milestone has an owner and a next action.\nGate: never contact people or publish without approval.' },
    prompt: 'Design a reusable skill for this recurring task. Include purpose, inputs, constraints, allowed tools, output format, verification checks, and actions that always require approval.',
  },
]

export function LessonsView() {
  const [lessonIndex, setLessonIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const lesson = lessons[lessonIndex]

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(lesson.prompt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-black text-white">
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} shrink-0 overflow-hidden border-r border-slate-800 bg-black transition-all`}>
        <div className="w-72 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">AI agents</p>
          <h2 className="mt-2 text-lg font-bold">Practical lessons</h2>
          <p className="mt-2 text-sm leading-5 text-white/75">Concepts, tricks, and supervision patterns for everyday work.</p>
          <nav className="mt-8 grid gap-2" aria-label="Lessons">
            {lessons.map((item, index) => (
              <button key={item.title} type="button" onClick={() => setLessonIndex(index)} className={`rounded-xl p-3 text-left transition ${index === lessonIndex ? 'bg-cyan-300/10 text-cyan-100 ring-1 ring-cyan-300/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}>
                <span className="block text-xs font-semibold uppercase tracking-wide text-cyan-300/80">0{index + 1}</span>
                <span className="mt-1 block text-sm font-semibold">{item.title}</span>
              </button>
            ))}
          </nav>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8 sm:px-10 sm:py-12">
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={() => setSidebarOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800" aria-label={sidebarOpen ? 'Hide lessons' : 'Show lessons'}>
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />} {sidebarOpen ? 'Hide lessons' : 'Lessons'}
            </button>
            <span className="text-xs font-medium text-slate-500">{lessonIndex + 1} / {lessons.length}</span>
          </div>
          <header className="mt-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">{lesson.kicker}</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">{lesson.title}</h1>
            <p className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-lg leading-7 text-cyan-50"><strong className="text-cyan-300">One win:</strong> {lesson.win}</p>
          </header>
          <div className="mt-12 grid gap-10">
            {lesson.sections.map((section) => <section key={section.heading}><h2 className="text-2xl font-bold text-white">{section.heading}</h2><p className="mt-3 max-w-3xl text-base leading-7 text-white">{section.body}</p>{section.bullets ? <ul className="mt-4 grid gap-3 pl-5 text-base leading-6 text-white">{section.bullets.map((bullet) => <li key={bullet} className="list-disc pl-2 marker:text-cyan-300">{bullet}</li>)}</ul> : null}</section>)}
            <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-white/70">{lesson.example.label}</p><pre className="mt-4 whitespace-pre-wrap font-mono text-sm leading-6 text-white">{lesson.example.text}</pre></section>
            <section className="rounded-2xl border border-amber-300/20 bg-amber-300/5 p-5"><div className="flex items-center justify-between gap-4"><h2 className="text-lg font-bold text-white">Try this</h2><button type="button" onClick={() => void copyPrompt()} className="inline-flex items-center gap-2 rounded-lg border border-amber-200/30 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-200/10">{copied ? <Check size={14} /> : <Clipboard size={14} />} {copied ? 'Copied' : 'Copy prompt'}</button></div><p className="mt-4 text-sm leading-6 text-white">{lesson.prompt}</p></section>
            <footer className="flex items-center justify-between border-t border-slate-800 pt-6"><button type="button" disabled={!lessonIndex} onClick={() => setLessonIndex((value) => value - 1)} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 disabled:invisible"><ChevronLeft size={16} /> Previous</button><button type="button" onClick={() => setLessonIndex((value) => (value + 1) % lessons.length)} className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200">{lessonIndex === lessons.length - 1 ? 'Start over' : 'Next lesson'} {lessonIndex === lessons.length - 1 ? <RotateCcw size={16} /> : <ChevronRight size={16} />}</button></footer>
          </div>
        </div>
      </main>
    </div>
  )
}
