
import { ChangeList } from './types';

export const MOCK_CHANGES: ChangeList[] = [
  {
    id: "I45a2b3c",
    project: "gerit-front",
    branch: "main",
    subject: "feat: implement Gemini-powered code analysis",
    status: 'NEW',
    owner: "alex_dev",
    updated: "2024-05-20 14:30",
    insertions: 245,
    deletions: 12,
    files: [
      {
        path: "services/geminiService.ts",
        status: "ADDED",
        content: `import { GoogleGenAI } from "@google/genai";\n\nconst ai = new GoogleGenAI({ apiKey: process.env.API_KEY });\n\nexport const analyzeCode = async (code: string) => {\n  const response = await ai.models.generateContent({\n    model: 'gemini-3-pro-preview',\n    contents: \`Review this code: \${code}\`\n  });\n  return response.text;\n};`
      },
      {
        path: "components/ReviewPanel.tsx",
        status: "MODIFIED",
        oldContent: "const ReviewPanel = () => <div>No Review</div>;",
        content: "const ReviewPanel = ({ analysis }) => <div className='p-4'>{analysis}</div>;"
      }
    ]
  },
  {
    id: "I98d7e6f",
    project: "kernel-core",
    branch: "stable",
    subject: "fix: memory leak in thread scheduler",
    status: 'NEW',
    owner: "sarah_eng",
    updated: "2024-05-20 12:15",
    insertions: 15,
    deletions: 45,
    files: [
      {
        path: "kernel/sched.c",
        status: "MODIFIED",
        content: "// Fixed scheduler leak logic here...",
        oldContent: "// Buggy scheduler leak logic here..."
      }
    ]
  },
  {
    id: "I11f22g3",
    project: "web-ui-kit",
    branch: "v2-alpha",
    subject: "docs: update design tokens for dark mode support",
    status: 'MERGED',
    owner: "design_system_bot",
    updated: "2024-05-19 09:00",
    insertions: 500,
    deletions: 0,
    files: []
  }
];
