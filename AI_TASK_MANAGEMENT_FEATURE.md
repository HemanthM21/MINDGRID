# AI-Assisted Task Management Feature

## Overview
This feature allows users to write journal entries or describe their day, and the AI will automatically extract actionable tasks, deadlines, and priorities.

## How It Works

### 1. User Flow
1. User writes their thoughts, journal entry, or describes their day
2. Click "✨ Analyze with AI" button
3. AI analyzes the text and generates task suggestions
4. AI provides clarifying follow-up questions if needed
5. User reviews and selects which tasks to create
6. Click "✅ Create Selected Tasks" to add them to the task list

### 2. Backend Implementation

#### New AI Service Function: `generateTasksFromJournal()`
Located in: `server/services/aiService.js`

Features:
- Uses Google Gemini API to analyze journal text
- Extracts multiple actionable tasks from freeform text
- Automatically determines priority levels (HIGH, MEDIUM, LOW)
- Extracts or infers due dates from context
- Generates follow-up clarifying questions
- Returns structured JSON with tasks and metadata

Response Format:
```json
{
  "tasks": [
    {
      "title": "Task title",
      "description": "What needs to be done",
      "priority": "HIGH|MEDIUM|LOW",
      "dueDate": "YYYY-MM-DD or null",
      "reason": "Why this was extracted"
    }
  ],
  "followUpQuestions": ["Question 1", "Question 2"],
  "summary": "Brief summary of key items"
}
```

#### New Controller Functions
Located in: `server/controllers/taskController.js`

1. **`generateTasksFromJournal()`**
   - Endpoint: `POST /tasks/ai-journal`
   - Analyzes journal text and returns preview
   - Protected route (requires authentication)

2. **`confirmAndCreateTasks()`**
   - Endpoint: `POST /tasks/ai-journal/confirm`
   - Creates selected tasks from AI preview
   - Marks tasks with `source: 'ai'` for tracking
   - Protected route (requires authentication)

#### New Routes
Located in: `server/routes/taskRoutes.js`

```
POST /tasks/ai-journal              → Generate task preview from journal
POST /tasks/ai-journal/confirm      → Create confirmed tasks
```

### 3. Frontend Implementation

#### New UI Components
Located in: `client/src/pages/Tasks.jsx`

**1. AI Journal Button**
- Prominent button: "🤖 AI-Assisted: Generate tasks from journal"
- Only shows when not in AI mode

**2. Journal Input Panel**
- Large textarea for writing thoughts/journal entry
- Placeholder with example text
- "✨ Analyze with AI" button
- Cancel option to exit

**3. Task Preview Panel**
- Shows AI-generated tasks with checkboxes
- Displays priority badges (HIGH/MEDIUM/LOW)
- Shows task descriptions and inferred due dates
- Displays reasoning ("Why this task was extracted")
- Shows follow-up questions in highlighted box
- Allows selective task confirmation
- "✅ Create Selected Tasks" button

**4. Task Display Enhancement**
- Added "🤖 AI" badge to tasks created by AI
- Helps users distinguish AI-generated vs manual tasks

#### State Management
New state variables added:
```javascript
- showAIJournal: boolean (toggle journal input panel)
- journalText: string (user's journal entry)
- aiLoading: boolean (loading state during AI analysis)
- aiPreview: object (AI response with tasks and questions)
- selectedTasks: object (checkboxes state: { 0: true, 1: false, ... })
```

#### New Functions
- `analyzeJournal()` - Send journal to backend for AI analysis
- `confirmAITasks()` - Create selected tasks after confirmation

### 4. Example Usage

**User Input:**
```
"Need to finish the project report by Friday. Also want to schedule a meeting with the team and buy groceries. I should also review the budget for next month. Trying to plan a vacation for December, need to book flights and hotel."
```

**AI-Generated Tasks:**
1. ✓ Finish project report (HIGH, Due: Friday)
2. ☐ Schedule team meeting (MEDIUM, No specific date)
3. ☐ Buy groceries (LOW, No specific date)
4. ☐ Review monthly budget (MEDIUM, Due: End of month)
5. ☐ Plan December vacation (LOW, Due: This month)
6. ☐ Book flights (MEDIUM, Due: ASAP)
7. ☐ Book hotel (MEDIUM, Due: ASAP)

**Follow-up Questions:**
- "Do you want to set reminders for these tasks?"
- "Are there any blockers or dependencies between these tasks?"

### 5. Key Features

✅ **Intelligent Extraction**
- Identifies action verbs (need to, should, must, want to, plan to, will, going to)
- Extracts deadlines and time references
- Determines priorities based on urgency

✅ **Context-Aware**
- Understands natural language descriptions
- Infers priorities from time sensitivity
- Groups related tasks

✅ **User Control**
- Preview before creating
- Select which tasks to actually create
- Clarifying questions help refine tasks

✅ **Task Tracking**
- AI-generated tasks marked with `source: 'ai'`
- Can be distinguished from manually created tasks
- Full task lifecycle management

## Technical Stack

- **AI Model:** Google Gemini 1.5 Flash / Pro
- **Backend:** Express.js, Node.js, MongoDB
- **Frontend:** React, Framer Motion (animations)
- **API:** RESTful endpoints with authentication

## Security & Privacy

- All AI-journal endpoints protected by authentication middleware
- User tasks isolated by `createdBy` user ID
- Journal text sent to Google Gemini API (follow their privacy policy)
- No persistent storage of raw journal text

## Future Enhancements

1. **Quick Follow-up Questions**
   - Interactive Q&A to refine tasks
   - Allow users to answer questions before confirming

2. **Task Dependencies**
   - AI identifies task relationships
   - Suggest task ordering/scheduling

3. **Habit Extraction**
   - Identify recurring patterns
   - Suggest habit tracking

4. **Smart Reminders**
   - AI-suggested reminder times based on task type
   - Integration with calendar

5. **Multi-language Support**
   - Journal entries in any language
   - AI handles translation

## Testing the Feature

1. Ensure backend is running: `npm start` in `/server`
2. Start frontend: `npm run dev` in `/client`
3. Navigate to Tasks page
4. Click "🤖 AI-Assisted: Generate tasks from journal"
5. Write a journal entry describing your day/thoughts
6. Click "✨ Analyze with AI"
7. Review suggested tasks
8. Select which tasks you want to create
9. Click "✅ Create Selected Tasks"

## Dependencies

Make sure these are installed:
- `@google/generative-ai` (for Gemini API)
- `express` (server)
- `mongoose` (database)
- `react` (frontend)
- `framer-motion` (animations)

All are already in your `package.json` files.
