// ====================
// 1. MOOD-BASED CODE GENERATION
// ====================
// .opencode/tool/vibe-generate.ts
import { tool } from "@opencode-ai/plugin"

export const creative = tool({
  description: "Generate creative, experimental code with unusual patterns and interesting approaches",
  args: {
    prompt: tool.schema.string().describe("What you want to build"),
    language: tool.schema.string().optional().describe("Programming language preference"),
  },
  async execute(args) {
    return {
      mode: "creative",
      instruction: `Generate code for: ${args.prompt}
      
Use creative, experimental approaches:
- Try unusual design patterns
- Use interesting algorithms
- Add unexpected but useful features
- Make it beautiful and elegant
Language: ${args.language || "auto-detect"}`,
    }
  },
})

export const minimal = tool({
  description: "Generate minimal, clean code that does exactly what's needed",
  args: {
    prompt: tool.schema.string().describe("What you want to build"),
  },
  async execute(args) {
    return {
      mode: "minimal",
      instruction: `Generate minimal code for: ${args.prompt}
      
Constraints:
- Fewest lines possible
- No unnecessary abstractions
- Direct and obvious
- Single responsibility`,
    }
  },
})

export const exploratory = tool({
  description: "Generate code with multiple approaches to explore different solutions",
  args: {
    prompt: tool.schema.string().describe("Problem to explore"),
  },
  async execute(args) {
    return {
      mode: "exploratory",
      instruction: `Explore multiple solutions for: ${args.prompt}
      
Provide:
- 3 different approaches
- Pros/cons of each
- Recommend the best for this context`,
    }
  },
})

// ====================
// 2. CONTEXT CAPTURE
// ====================
// .opencode/tool/vibe-context.ts
import { tool } from "@opencode-ai/plugin"

export const snapshot = tool({
  description: "Capture the current coding context - what you're working on, thinking about, and trying to achieve",
  args: {
    thoughts: tool.schema.string().describe("What's on your mind right now"),
    goal: tool.schema.string().optional().describe("What you're trying to accomplish"),
  },
  async execute(args, context) {
    const timestamp = new Date().toISOString()
    const snapshot = {
      timestamp,
      sessionId: context.sessionID,
      thoughts: args.thoughts,
      goal: args.goal,
    }
    
    // Save to a context file
    await Bun.write(
      `.opencode/vibe-context/${timestamp}.json`,
      JSON.stringify(snapshot, null, 2)
    )
    
    return `Context snapshot saved! Continue vibing 🎨`
  },
})

export const recall = tool({
  description: "Recall recent coding context from previous sessions",
  args: {
    howMany: tool.schema.number().optional().describe("Number of recent contexts to recall (default: 3)"),
  },
  async execute(args) {
    const dir = ".opencode/vibe-context/"
    const count = args.howMany || 3
    
    try {
      const files = await Bun.$`ls -t ${dir}`.text()
      const recent = files.split('\n').slice(0, count)
      
      const contexts = []
      for (const file of recent) {
        if (file) {
          const content = await Bun.file(`${dir}${file}`).text()
          contexts.push(JSON.parse(content))
        }
      }
      
      return `Recent coding contexts:\n${JSON.stringify(contexts, null, 2)}`
    } catch {
      return "No previous contexts found. Start with vibe-context_snapshot!"
    }
  },
})

// ====================
// 3. FLOW STATE HELPERS
// ====================
// .opencode/tool/flow.ts
import { tool } from "@opencode-ai/plugin"

export const focus = tool({
  description: "Get a focused, distraction-free breakdown of the next coding step",
  args: {
    task: tool.schema.string().describe("The task you're working on"),
  },
  async execute(args) {
    return `🎯 FOCUS MODE

Task: ${args.task}

Next step (ONE thing):
1. [Generate specific, actionable next step]

Why this first: [Brief reason]

After this: [Quick preview of what comes next]

Time estimate: ~[X] minutes

Ready? Let's code.`
  },
})

export const unstuck = tool({
  description: "Get unstuck when you hit a mental block",
  args: {
    problem: tool.schema.string().describe("What's blocking you"),
    attempted: tool.schema.string().optional().describe("What you've tried so far"),
  },
  async execute(args) {
    return `🧩 UNSTUCK MODE

Current block: ${args.problem}
${args.attempted ? `You've tried: ${args.attempted}` : ''}

Fresh perspectives:
1. [Alternative approach 1]
2. [Simpler version]
3. [Different angle]

Quick wins:
- [Small thing you can do right now]
- [Another small thing]

Remember: Sometimes the vibe is just to ship something working, then make it beautiful.`
  },
})

export const momentum = tool({
  description: "Build momentum with quick wins and achievable micro-goals",
  args: {
    bigGoal: tool.schema.string().describe("Your larger goal"),
  },
  async execute(args) {
    return `⚡ MOMENTUM MODE

Big goal: ${args.bigGoal}

Break it down (5-minute chunks):
1. [Micro-goal 1]
2. [Micro-goal 2]
3. [Micro-goal 3]
4. [Micro-goal 4]
5. [Micro-goal 5]

Start with ANY of these. Momentum > Perfection.

After each one: Quick commit, then next!`
  },
})

// ====================
// 4. CODE AESTHETICS
// ====================
// .opencode/tool/aesthetic.ts
import { tool } from "@opencode-ai/plugin"

export const beautify = tool({
  description: "Make code more aesthetically pleasing while keeping functionality",
  args: {
    file: tool.schema.string().describe("File to beautify"),
    style: tool.schema.enum(["minimal", "expressive", "functional", "elegant"]).optional(),
  },
  async execute(args) {
    return `Beautifying ${args.file} with ${args.style || "elegant"} style...

Focus on:
- Meaningful variable names
- Consistent spacing
- Logical grouping
- Clear function composition
- Satisfying symmetry

The code should feel good to read.`
  },
})

export const refactor_vibe = tool({
  description: "Refactor code to match a specific vibe or aesthetic",
  args: {
    file: tool.schema.string().describe("File to refactor"),
    targetVibe: tool.schema.string().describe("Desired vibe (e.g., 'unix philosophy', 'functional zen', 'readable prose')"),
  },
  async execute(args) {
    return `Refactoring ${args.file} to match vibe: "${args.targetVibe}"

Applying transformations to match the vibe...`
  },
})

// ====================
// 5. EXPERIMENTAL ZONE
// ====================
// .opencode/tool/experiment.ts
import { tool } from "@opencode-ai/plugin"

export const wild_idea = tool({
  description: "Generate a wild, experimental implementation of an idea",
  args: {
    idea: tool.schema.string().describe("Your wild idea"),
    constraints: tool.schema.string().optional().describe("Any constraints to keep"),
  },
  async execute(args) {
    return `🌪️ WILD IDEA MODE

Let's implement: ${args.idea}
${args.constraints ? `Keeping: ${args.constraints}` : 'No constraints - full creative freedom!'}

Experimental approach incoming...
- Unusual patterns welcome
- Unconventional solutions encouraged
- "Shouldn't work but might" energy
- Zero judgment zone

This is where magic happens.`
  },
})

export const prototype = tool({
  description: "Create a rapid prototype focused on the core experience",
  args: {
    experience: tool.schema.string().describe("The experience you want to create"),
  },
  async execute(args) {
    return `⚡ PROTOTYPE MODE

Target experience: ${args.experience}

Prototype principles:
- Core experience ONLY
- Hardcode what you need to
- Ugly is fine
- Make it work, feel right

This is about validating the vibe, not shipping production code.

Ship it in 30 minutes or less.`
  },
})

// ====================
// 6. VIBES LOGGER
// ====================
// .opencode/tool/vibes-log.ts
import { tool } from "@opencode-ai/plugin"

export default tool({
  description: "Log your coding vibes, energy levels, and what's working/not working",
  args: {
    vibe: tool.schema.enum(["🔥", "✨", "🌊", "🎯", "😴", "🤔", "⚡"]).describe("Current vibe"),
    note: tool.schema.string().describe("What's happening"),
  },
  async execute(args) {
    const timestamp = new Date().toISOString()
    const entry = `${timestamp} ${args.vibe} ${args.note}\n`
    
    await Bun.$`echo ${entry} >> .opencode/vibes.log`
    
    return `Vibe logged: ${args.vibe} ${args.note}`
  },
})

// ====================
// 7. MUSIC/AMBIANCE TRIGGER
// ====================
// .opencode/tool/ambiance.ts
import { tool } from "@opencode-ai/plugin"

export const set_mode = tool({
  description: "Set your coding ambiance mode and get matched suggestions",
  args: {
    mode: tool.schema.enum([
      "deep-focus", 
      "creative-flow", 
      "debugging-zen", 
      "rapid-prototype",
      "learning-mode"
    ]).describe("Your current coding mode"),
  },
  async execute(args) {
    const ambiances = {
      "deep-focus": {
        music: "Lo-fi beats, ambient, minimal techno",
        lighting: "Dim, warm tones",
        approach: "Single-task, no interruptions, deep concentration",
      },
      "creative-flow": {
        music: "Upbeat instrumental, electronic, jazz fusion",
        lighting: "Dynamic, colorful",
        approach: "Experimental, playful, try wild ideas",
      },
      "debugging-zen": {
        music: "Calm, meditative, nature sounds",
        lighting: "Soft, neutral",
        approach: "Patient, systematic, methodical",
      },
      "rapid-prototype": {
        music: "High-energy, fast-paced",
        lighting: "Bright, energizing",
        approach: "Move fast, ship quick, iterate",
      },
      "learning-mode": {
        music: "Classical, focus music",
        lighting: "Comfortable, natural",
        approach: "Curious, exploratory, take notes",
      },
    }
    
    const config = ambiances[args.mode]
    
    return `🎵 AMBIANCE: ${args.mode}

Music: ${config.music}
Lighting: ${config.lighting}
Approach: ${config.approach}

You're in the zone. Let's code.`
  },
})