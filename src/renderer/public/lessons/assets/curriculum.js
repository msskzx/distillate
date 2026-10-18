/* ==========================================================================
   Distillate Lessons — curriculum manifest
   The single ordered list of artifacts. The sidebar is generated from this,
   so adding a lesson means adding one entry here.
   ========================================================================== */

window.TICKET_CRAFTER_CURRICULUM = [
  {
    group: "AI Agent Lessons",
    items: [
      {
        id: "0001",
        file: "lessons/0001-agents-are-action-loops.html",
        title: "Practical Lessons for Using Agents Well",
        architecture: "Current",
        blurb: "Understand when a task needs an agent loop, context budgets, and repeatable skills."
      },
      {
        id: "0002",
        file: "lessons/0002-inside-the-agent-harness.html",
        title: "Inside the Agent Harness",
        architecture: "Current",
        blurb: "ReAct loops, skills packaging, subagent isolation, sandboxes, and MCP tools."
      },
      {
        id: "0003",
        file: "lessons/0003-the-frontier-pause-wars.html",
        title: "The Frontier Pause Wars",
        architecture: "Current",
        blurb: "Corporate drama, safety pledges, commercial moats, and the battle over open weights."
      },
      {
        id: "0004",
        file: "lessons/0004-ai-security-incidents.html",
        title: "AI Security Incidents & Supply Chains",
        architecture: "Current",
        blurb: "Hugging Face breaches, pickle code execution, malicious weights, and Safetensors."
      },
      {
        id: "0005",
        file: "lessons/0005-real-world-engineering-skills.html",
        title: "Real-World Engineering Skills",
        architecture: "Current",
        blurb: "Unslop prose filtering, Socratic spec pipelines, and deep architecture refactoring."
      },
      {
        id: "0006",
        file: "lessons/0006-anatomy-of-the-agent-harness.html",
        title: "The Anatomy of the Agent Harness",
        architecture: "Current",
        blurb: "Runtime FSM, context compaction, tool interception, idempotency, and error recovery."
      },
      {
        id: "0007",
        file: "lessons/0007-sandboxing.html",
        title: "Sandboxing: Isolation Boundaries for Agent Execution",
        architecture: "Current",
        blurb: "Filesystem isolation, network restrictions, resource limits, syscall filtering, and container runtime comparisons."
      },
      { id: "0008", file: "lessons/0008-world-models.html", title: "World Models: Learning to Simulate Consequences", architecture: "Current", blurb: "Latent states, learned dynamics, imagined rollouts, and planning." },
      { id: "0009", file: "lessons/0009-latent-dynamics.html", title: "Latent Dynamics: What the Model Must Remember", architecture: "Current", blurb: "Markov state, memory, stochastic latents, and predictive losses." },
      { id: "0010", file: "lessons/0010-planning-with-world-models.html", title: "Planning with World Models", architecture: "Current", blurb: "Receding-horizon control, tree search, and model exploitation."
      },
      { id: "0011", file: "lessons/0011-dream-rsi.html", title: "Dream-RSI: Replay Worlds for Recursive Self-Improvement", architecture: "Current", blurb: "How discovery histories become replay simulators for improving exploration policies."
      }
    ]
  },
  {
    group: "Namaq: Source Pipeline",
    items: [
      { id: "N1", file: "lessons/namaq-0001-where-text-becomes-citable.html", title: "Where text becomes citable", architecture: "Namaq", blurb: "A source reaches Namaq as five nested things, and only one of them is a design decision you could still change cheaply." },
      { id: "N2", file: "lessons/namaq-0002-who-owns-a-page.html", title: "Who owns a page", architecture: "Namaq", blurb: "A reader asked whether /sources lets you read the book." },
      { id: "N3", file: "lessons/namaq-0003-a-check-that-exists-but-doesnt-run.html", title: "A check that exists but doesn't run", architecture: "Namaq", blurb: "Building lesson 0002's decision surfaced two bugs, at two different layers, with the same shape: something had a name that promised a check nothing actually performed." },
      { id: "N4", file: "lessons/namaq-0004-what-the-model-holds.html", title: "What the model holds, and what it cannot", architecture: "Namaq", blurb: "Making Siyar volumes 4 and 5 exact quotes showed where the current model drifts." },
      { id: "N5", file: "lessons/namaq-0005-how-al-bukhari-chooses-a-hadith.html", title: "How al-Bukhari chooses a hadith, and how a name in a chain becomes a person", architecture: "Namaq", blurb: "Namaq plans to extract Sahih al-Bukhari as printed and to link each name in a chain to a person through a sourced identification (docs/plans/data-model/plan.md, section 2.6)." },
      { id: "N6", file: "lessons/namaq-0006-the-ayah-next-door.html", title: "Fixing the ayah the owner named broke the ayah next to it", architecture: "Namaq", blurb: "The similar-ayat view on /quran/compare colours the words two passages share." },
      { id: "Ref", file: "lessons/namaq-source-pipeline.html", title: "Source pipeline card", architecture: "Namaq", blurb: "Every artifact a source passes through, from a printed page in سير أعلام النبلاء to a citation on a profile." }
    ]
  }
];
