export interface PromptTemplate {
  id: string;
  title: string;
  category: 'writing' | 'coding' | 'translation' | 'grammar' | 'study' | 'image' | 'business';
  description: string;
  iconName: string;
  prompt: string;
  tags: string[];
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // AI Writing Tools
  {
    id: 'email-composer',
    title: 'Professional Email Composer',
    category: 'writing',
    description: 'Draft polite, clear, and high-impact emails for clients or workplace.',
    iconName: 'Mail',
    prompt: 'Write a professional email regarding: [Topic/Purpose]. Ensure a respectful, persuasive tone with a clear call to action.',
    tags: ['Email', 'Work', 'Writing']
  },
  {
    id: 'essay-builder',
    title: 'Structured Essay & Report Writer',
    category: 'writing',
    description: 'Create well-researched essays with strong arguments and citations.',
    iconName: 'FileText',
    prompt: 'Write a structured academic essay on "[Topic]". Include an engaging introduction, 3 body paragraphs with arguments, and a strong conclusion.',
    tags: ['Essay', 'Academic', 'Writing']
  },
  {
    id: 'resume-generator',
    title: 'Resume & Cover Letter Polish',
    category: 'writing',
    description: 'Craft ATS-friendly bullet points and persuasive cover letters.',
    iconName: 'Award',
    prompt: 'Generate 5 high-impact ATS-friendly resume bullet points using action verbs for a [Job Title] role highlighting [Key Skill/Achievement].',
    tags: ['Resume', 'Career', 'Writing']
  },
  {
    id: 'creative-story',
    title: 'Creative Story Generator',
    category: 'writing',
    description: 'Generate immersive story plots, character arcs, and dialogue.',
    iconName: 'Feather',
    prompt: 'Write a captivating creative short story about [Concept/Character] in a [Genre] setting with an unexpected twist ending.',
    tags: ['Creative', 'Story', 'Writing']
  },

  // AI Coding Assistant
  {
    id: 'code-debugger',
    title: 'Smart Code Debugger & Fixer',
    category: 'coding',
    description: 'Find runtime bugs, logic flaws, and memory leaks in code snippets.',
    iconName: 'Bug',
    prompt: 'Analyze this code snippet for bugs, performance issues, and edge cases. Provide the corrected code with clear explanations:\n\n```\n[Insert Code Here]\n```',
    tags: ['Coding', 'Debug', 'Fix']
  },
  {
    id: 'code-explainer',
    title: 'Line-by-Line Code Explainer',
    category: 'coding',
    description: 'Break down complex algorithms and code into plain English.',
    iconName: 'Code2',
    prompt: 'Explain the following code step-by-step as if explaining to a developer, highlighting key functions and data structures:\n\n```\n[Insert Code Here]\n```',
    tags: ['Coding', 'Explain', 'Learn']
  },
  {
    id: 'unit-test-gen',
    title: 'Unit Test Generator',
    category: 'coding',
    description: 'Generate comprehensive unit tests with edge cases.',
    iconName: 'CheckSquare',
    prompt: 'Generate unit tests using standard frameworks (Jest/Vitest/PyTest) for the following function, covering happy path and edge cases:\n\n```\n[Insert Code Here]\n```',
    tags: ['Coding', 'Testing', 'QA']
  },

  // AI Translator & Multi-Language
  {
    id: 'universal-translator',
    title: 'Universal Multi-Language Translator',
    category: 'translation',
    description: 'Translate text accurately into 100+ languages preserving idioms and tone.',
    iconName: 'Languages',
    prompt: 'Translate the following text into [Target Language, e.g. Hindi, Spanish, French, German, Japanese, Arabic]. Keep the original tone natural and native:\n\n"[Insert Text Here]"',
    tags: ['Translate', 'Languages', 'Global']
  },

  // AI Grammar & Style Checker
  {
    id: 'grammar-style-checker',
    title: 'AI Grammar & Style Polish',
    category: 'grammar',
    description: 'Correct spelling, punctuation, sentence flow, and clarity.',
    iconName: 'Sparkles',
    prompt: 'Review and improve the grammar, tone, and conciseness of the following text. Show the corrected version and list key improvements made:\n\n"[Insert Text Here]"',
    tags: ['Grammar', 'Proofread', 'Writing']
  },

  // AI Image & OCR
  {
    id: 'image-prompt-creator',
    title: 'Photorealistic Image Generator Prompt',
    category: 'image',
    description: 'Craft ultra-detailed prompts for Midjourney / Imagen / DALL-E.',
    iconName: 'Image',
    prompt: 'Generate a photorealistic 8K image prompt describing [Subject/Scene], including lighting, camera lens (e.g. 85mm f/1.4), depth of field, and art style.',
    tags: ['Image', 'Prompt', 'Art']
  },

  // Study & Learning
  {
    id: 'study-concept-explainer',
    title: 'Complex Concept Simplifier (Feynman Technique)',
    category: 'study',
    description: 'Explain physics, math, science, or economics concepts simply.',
    iconName: 'GraduationCap',
    prompt: 'Explain the concept of "[Topic]" using simple real-world analogies, step-by-step bullet points, and key formulas if applicable.',
    tags: ['Study', 'Learning', 'Feynman']
  }
];
