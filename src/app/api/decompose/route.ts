import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are helping a busy knowledge worker break down tasks into actionable subtasks.

Rules:
- Each subtask should be 1-4 hours (60-240 minutes)
- Include a clear "definition of done" - what does completion look like?
- Be realistic about time estimates based on typical complexity
- Maximum 8 subtasks per backlog item
- If the task is too large, suggest breaking it into multiple backlog items
- Keep subtask titles concise and action-oriented (start with a verb)
- Make definitions of done specific and measurable

Respond with JSON only in this format:
{
  "subtasks": [
    {
      "title": "string",
      "definitionOfDone": "string",
      "estimatedMinutes": number,
      "rationale": "string"
    }
  ]
}`;

interface DecomposeRequest {
  backlogItem: {
    title: string;
    description?: string;
  };
  constraints: {
    minSubtaskMinutes: number;
    maxSubtaskMinutes: number;
    maxSubtasks: number;
  };
}

export async function POST(request: Request) {
  try {
    const { backlogItem, constraints }: DecomposeRequest = await request.json();

    if (!backlogItem?.title) {
      return NextResponse.json(
        { error: 'Backlog item title is required' },
        { status: 400 }
      );
    }

    const userMessage = `Break down this task into subtasks:

Title: ${backlogItem.title}
Description: ${backlogItem.description || 'No description provided'}

Constraints:
- Minimum subtask duration: ${constraints.minSubtaskMinutes} minutes
- Maximum subtask duration: ${constraints.maxSubtaskMinutes} minutes
- Maximum number of subtasks: ${constraints.maxSubtasks}`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Parse JSON from response, handling potential markdown code blocks
      let jsonText = content.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }
      jsonText = jsonText.trim();

      const parsed = JSON.parse(jsonText);
      return NextResponse.json(parsed);
    }

    return NextResponse.json(
      { error: 'Unexpected response format from AI' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Decomposition error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate decomposition' },
      { status: 500 }
    );
  }
}
