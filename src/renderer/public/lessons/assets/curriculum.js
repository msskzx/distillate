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
  }
];
