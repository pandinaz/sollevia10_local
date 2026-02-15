# Sollevia 10 — Functional Requirements

## Overview

Sollevia is a mobile-first web application for chronic pain management following the biopsychosocial model. It combines structured educational content, AI-powered coaching conversations, and daily habit tracking to help users understand and manage chronic pain.

**Tech stack:** React 19, TypeScript, Vite, IndexedDB, localStorage, Mia21 AI API

---

## 1. Navigation & App Shell

The app provides a tab-based navigation shell with full-screen overlays for immersive content.

### User Stories

- **US-1.1** As a user, I want a bottom navigation bar with four tabs (Home, Learn, Practice, Insights) so that I can quickly switch between main sections.
- **US-1.2** As a user, I want the bottom navigation bar to be hidden when I am viewing full-screen content (module content, chat, settings) so that I have an immersive experience.
- **US-1.3** As a user, I want to see which tab is currently active (highlighted icon and label) so that I always know where I am in the app.
- **US-1.4** As a user, I want the app to be optimized for mobile screen sizes (max-width constrained) so that it is comfortable to use on my phone.

### Acceptance Criteria

- Navigation state persists screen parameters (e.g., module ID, origin screen) to enable context-aware back navigation.
- The active tab is visually distinguished with a different color and label.

---

## 2. Home Dashboard

The home screen serves as the entry point, surfacing the most relevant daily actions.

### User Stories

- **US-2.1** As a user, I want to see a greeting with the app name when I open the app so that I feel welcomed.
- **US-2.2** As a user, I want a prominent "Check-in" card so that I can quickly start a reflection conversation about how I'm feeling today.
- **US-2.3** As a user, I want to see my habits scheduled for today with completion checkboxes so that I can track my daily practice at a glance.
- **US-2.4** As a user, I want to mark a habit as complete by tapping a checkmark so that I can track my progress for the day.
- **US-2.5** As a user, I want to see up to three recommended modules under "Continue My Journey" (in-progress first, then new) so that I know what to work on next.
- **US-2.6** As a user, I want to tap a module card to go to its detail page so that I can start or continue learning.
- **US-2.7** As a user, I want to access the Settings screen via an icon in the top-right corner so that I can configure the app.

### Acceptance Criteria

- The check-in card navigates to the chat interface with a pre-defined check-in prompt.
- Habit completion is stored with today's date and persists across sessions.
- "Continue My Journey" prioritizes modules that are in-progress over modules not yet started.

---

## 3. Educational Modules (Learn)

The Learn tab provides structured educational content organized by category, delivered as sequential steps or grouped sub-modules.

### User Stories

- **US-3.1** As a user, I want to browse all educational modules organized into three categories (Pain Understanding, Pain Factors/Triggers, Coping Strategies) so that I can choose topics relevant to me.
- **US-3.2** As a user, I want each module card to show a thumbnail, title, description, duration, and my progress (percentage or completion checkmark) so that I can make informed choices.
- **US-3.3** As a user, I want to open a module detail page that shows an overview, description, and list of topics or a start button so that I understand what I'll learn.
- **US-3.4** As a user, I want to view module content as sequential steps with next/previous navigation and a step counter so that I can go through lessons at my own pace.
- **US-3.5** As a user, I want to watch embedded videos (YouTube or local MP4) within module steps so that I can learn through visual content.
- **US-3.6** As a user, I want to listen to audio exercises (Google Drive or local files) within module steps so that I can follow guided practices.
- **US-3.7** As a user, I want my progress to be automatically saved when I scroll to the bottom of a step or finish an audio exercise so that I don't have to manually mark lessons complete.
- **US-3.8** As a user, I want to start an AI reflection conversation from a reflection prompt at the end of a module so that I can process what I've learned.
- **US-3.9** As a user, I want to use a text-to-speech button to have module content read aloud so that I can consume content hands-free.
- **US-3.10** As a user, I want to interact with custom embedded widgets (e.g., ElevenLabs AI voice coach) within certain modules so that I can practice with advanced tools.

### Acceptance Criteria

- Modules with sub-modules show a list of sub-module cards (with type icon: wrench for technique, book for knowledge).
- Modules without sub-modules show a "Start Module" button leading to sequential step navigation.
- Progress is tracked per step index (linear modules) and per sub-module ID (modular content).
- The step counter (e.g., "2 / 5") and navigation arrows are only shown for linear modules, not sub-modules.
- Text-to-speech uses the `audioScript` field when available, falling back to the step's `content`.

---

## 4. Practice & Habits

The Practice tab lets users manage daily habits and browse a searchable technique library.

### User Stories

- **US-4.1** As a user, I want to see all my habits listed and sorted by scheduled time so that I can follow my daily routine.
- **US-4.2** As a user, I want to add a new habit by picking from the technique library or creating a custom one so that I can build a personalized practice routine.
- **US-4.3** As a user, I want a multi-step habit creation wizard (choose source → enter details → set schedule) so that the process is guided and clear.
- **US-4.4** As a user, I want to set habit frequency (daily, weekly, or custom days), time of day, and notification preference so that I can plan my practice.
- **US-4.5** As a user, I want to edit or delete an existing habit via a three-dot menu so that I can adjust my routine over time.
- **US-4.6** As a user, I want to mark a habit as complete for today by tapping a checkmark so that I can track daily adherence.
- **US-4.7** As a user, I want to browse a searchable technique library with real-time filtering so that I can discover new practices.
- **US-4.8** As a user, I want to toggle techniques as favorites (heart icon) and filter the library to show only favorites so that I can quickly access preferred techniques.
- **US-4.9** As a user, I want to tap a library-based habit to open its corresponding module content so that I can practice the technique directly.
- **US-4.10** As a user, I want to add a technique to my habits directly from the module content screen (via a plus button) so that I can quickly adopt a new practice.

### Acceptance Criteria

- Habits distinguish between custom (pencil icon) and library-sourced (wrench icon).
- Each habit displays title, duration, frequency, and time-of-day badge.
- Habit completion dates are stored as an array of ISO date strings (YYYY-MM-DD).
- The technique library is populated from all sub-modules with `type: 'technique'` across all modules.
- Favorites persist in localStorage across sessions.
- The "Add to habits" flow from module content pre-fills the habit creation wizard and navigates to the Practice screen.

---

## 5. AI Chat & Reflections

The chat interface provides AI-powered coaching conversations for check-ins and module reflections.

### User Stories

- **US-5.1** As a user, I want to start a reflection conversation with an initial AI prompt relevant to the module I just completed so that the conversation is contextually meaningful.
- **US-5.2** As a user, I want to start a general check-in conversation from the home screen so that I can reflect on how I'm feeling without being tied to a specific module.
- **US-5.3** As a user, I want to type messages and send them by pressing Enter or tapping the send button so that I can have a natural conversation.
- **US-5.4** As a user, I want to see a loading indicator while the AI is generating a response so that I know the system is working.
- **US-5.5** As a user, I want AI responses to stream in progressively (real-time text updates) so that I don't wait for the full response before seeing anything.
- **US-5.6** As a user, I want the app to work offline with mock AI responses when the API is unavailable so that I can still use the reflection feature.
- **US-5.7** As a user, I want my chat session to be automatically summarized and saved when I close the conversation so that I can revisit my reflections later.
- **US-5.8** As a user, I want the AI summary to include a title, short summary, themes, emotions, and actionable steps so that I get structured insights from each conversation.

### Acceptance Criteria

- Messages are displayed in a chat bubble layout: user messages right-aligned (indigo), bot messages left-aligned (gray).
- Shift+Enter inserts a newline; Enter alone sends the message.
- If the Mia21 API returns a "Chat not initialized" error, the app automatically calls the initialization endpoint and retries.
- If AI summary generation fails, the app falls back to local keyword analysis (extracting themes like pain, stress, sleep and emotions like sadness, calm, gratitude from the transcript).
- Sessions are only saved if the user sent at least one message.
- Each module and sub-module can specify a custom `botId` and `spaceId` to use a specialized AI agent.

---

## 6. Insights (Chat History)

The Insights tab displays a timeline of past reflection sessions.

### User Stories

- **US-6.1** As a user, I want to see all my past chat sessions grouped by month so that I can browse my reflection history chronologically.
- **US-6.2** As a user, I want each history entry to show the date/time, title, summary preview, a theme badge, and an emotion badge so that I can quickly identify what each session was about.
- **US-6.3** As a user, I want to tap a history entry to view the full detail page with title, tags, summary, actionable steps, and the complete transcript so that I can revisit my reflections.
- **US-6.4** As a user, I want to expand or collapse the full transcript on the detail page so that I can control how much detail I see.
- **US-6.5** As a user, I want to delete a chat history entry so that I can remove sessions I no longer need.
- **US-6.6** As a user, I want to see an empty state message ("No journal entries yet...") when I have no history so that I understand the section's purpose.

### Acceptance Criteria

- History records are stored in IndexedDB and sorted by date descending.
- Deletion removes the record from IndexedDB and refreshes the list.
- The transcript shows user and bot messages in the same bubble styling as the live chat.

---

## 7. Settings

The Settings screen provides system information and diagnostic tools.

### User Stories

- **US-7.1** As a user, I want to see the app version and build information so that I know which version I'm using.
- **US-7.2** As a user, I want to test the API connection to the Mia21 service and see a success or failure status so that I can diagnose connectivity issues.
- **US-7.3** As a user, I want to read a privacy and security statement explaining that my data is stored locally so that I understand how my information is handled.

### Acceptance Criteria

- The API test sends a "Ping" message to `sendMessageToMia()` and reports the result.
- Success shows a green status; failure shows a red status with "Using offline mock mode" message.

---

## 8. Data Persistence

The app stores all user data locally on the device with no server-side sync.

### User Stories

- **US-8.1** As a user, I want a persistent unique user ID generated automatically on first use so that the AI service can maintain conversation context.
- **US-8.2** As a user, I want my module progress (completed steps and sub-modules) to persist across sessions so that I can pick up where I left off.
- **US-8.3** As a user, I want my habits, completion history, and favorite techniques to persist across sessions so that my personal data is never lost.
- **US-8.4** As a user, I want my chat history and session summaries stored in a local database so that I can access past reflections at any time.

### Acceptance Criteria

- User preferences (favorites, habits, progress, user ID) are stored in localStorage under namespaced keys (`sollevia_*`).
- Chat history is stored in IndexedDB (`SolleviaDB` v2, `chat_history` object store).
- All storage operations are wrapped in try-catch with safe fallback returns to prevent app crashes.

---

## 9. Accessibility & UX

Cross-cutting concerns that apply across all features.

### User Stories

- **US-9.1** As a user, I want module text content read aloud using text-to-speech so that I can consume content without reading.
- **US-9.2** As a user, I want to see loading states and animated indicators during AI response generation and summary creation so that I know the app is processing.
- **US-9.3** As a user, I want the app to gracefully fall back to offline mock mode when the AI API is unreachable so that core functionality remains available.
- **US-9.4** As a user, I want a mobile-optimized layout (max-width constrained, touch-friendly tap targets) so that the app is easy to use on a phone.

### Acceptance Criteria

- Text-to-speech uses the browser's Web Speech API.
- Mock AI responses include a simulated delay (1.5–2.5 seconds) to feel realistic.
- The app renders within a max-width container centered on larger screens.

---

## Module Content Map

| ID | Category | Title | Format | Sub-modules |
|---|---|---|---|---|
| und-1 | Understanding | What is Pain? | 3 steps | — |
| und-2 | Understanding | Understanding Chronic Pain | 3 steps | — |
| und-3 | Understanding | Thoughts, Emotions & Behavior | 3 steps | — |
| trig-1 | Triggers | Stress | 3 steps | — |
| trig-5 | Triggers | Anxiety | 3 steps | — |
| trig-3 | Triggers | Negative Cognitions | — | 3 (Patterns, Catastrophizing, Decatastrophizing) |
| cope-1 | Coping | Relaxation | — | 3 (Response, Deep Breathing, PMR) |
| cope-3 | Coping | Mindfulness | — | 4 (Intro, Body Scan, Breathing, Live Coaching) |
| cope-10 | Coping | Acceptance | — | 2 (Power of Acceptance, Somatic Tracking) |
| cope-11 | Coping | Navigating Medical Treatments | 3 steps | — |

---

*Document generated from codebase analysis — February 2026*
