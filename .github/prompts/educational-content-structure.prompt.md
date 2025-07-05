# Educational Content Structure

Your goal is to create educational content structures for the Learning English Platform.

Ask for the content type and learning objectives if not provided.

Requirements for educational content:

- Use proper English level classification (A1, A2, B1, B2, C1, C2)
- Include learning objectives and outcomes
- Structure content with progressive difficulty
- Add proper metadata for content management
- Include accessibility features for diverse learners
- Use educational terminology and best practices
- Follow the existing content patterns in the platform
- Include proper TypeScript types for content structure

Content structure patterns:

```typescript
interface LearningContent {
  id: string;
  title: string;
  description: string;
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  category: ContentCategory;
  objectives: string[];
  estimatedTime: number; // in minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
  tags: string[];
  content: ContentSection[];
  assessment?: Assessment;
  createdAt: Date;
  updatedAt: Date;
}

interface ContentSection {
  id: string;
  type: "text" | "exercise" | "video" | "audio" | "quiz";
  title: string;
  content: string;
  metadata?: Record<string, any>;
}
```

Common content types for this platform:

- Grammar lessons with exercises
- Vocabulary building activities
- Reading comprehension passages
- Listening exercises with audio
- Speaking practice scenarios
- Writing prompts and templates
- Cultural context explanations
- Business English modules
- Exam preparation materials

Educational best practices:

- Progressive skill building
- Immediate feedback mechanisms
- Spaced repetition for retention
- Contextual learning examples
- Cultural sensitivity considerations
- Inclusive language and examples
- Multiple learning style accommodations
- Clear success criteria

Make sure to:

- Include proper level-appropriate content
- Add learning objectives and outcomes
- Structure content for progressive difficulty
- Include diverse examples and contexts
- Add proper metadata for search and filtering
- Include accessibility features
- Use educational terminology correctly
- Consider cultural sensitivity
- Include proper assessment methods
- Add engagement and interaction elements
