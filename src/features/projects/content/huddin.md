# Huddin

A Discord-style community platform for the Lodos ecosystem, built at
[Lodos](https://lodos.io) alongside [Gathin](https://gathin.com). One home for a
community; channels, direct messages, live voice and video, announcements,
galleries, and shared task lists, on a Next.js BFF that fronts the shared
backend.

**[huddin.com →](https://huddin.com)**

![Huddin landing](/projects/huddin/feature-page.png)

## What I built

6 merged PRs on the frontend, May to July 2026, mostly the bridge between Huddin
and its sibling app.

- Built the **cross-app DM bridge**: a message sent from the sibling platform
  arrives as a context card with an info icon and a link back to its origin, in
  a wire format the existing chat renderer accepts without changes.
- Fixed **chat bubble layout**; toolbar position, contrast on incoming bubbles,
  link and attachment alignment.
- Added **chat-appearance and language settings** that sync to the backend.
- Fixed the **discover / invite flow**; modal reopen, and a backend-driven
  pending state for private channels.
- Gated **channel visibility** across the two apps behind an `isToGather` flag,
  with three-way public / shared / private semantics in the BFF.

## One platform, many communities

The same channels, voice, and shared spaces flex to fit a book club, a course
cohort, a studio, or a remote team. Channels carry real-time chat with file
uploads, reactions, and typing indicators; direct messages add read receipts
and 1-on-1 calls; announcements, galleries, and discover round it out.

![One platform for any community](/projects/huddin/general-features.png)

## Shared task lists

Channel checklists for the things a community actually has to coordinate;
weekly events, project handoffs, recurring chores. Tasks carry subtasks,
assignees, due dates, status and priority, reactions and labels, and a per-task
audit timeline with live presence. Any task can be referenced in chat through a
`<task:...>` mention chip.

![Channel checklists](/projects/huddin/task-managment.png)

## Voice rooms

Persistent voice/video rooms attached to every channel. Members drop in and out
at will; the connected strip travels with them as they read other channels, and
voice intent survives a page reload so a refresh never kicks anyone out. Low
latency and clear audio through a LiveKit SFU.

![Persistent voice rooms](/projects/huddin/voice-room-showcase.png)

## Stack

Next.js 15 (App Router), React 19, TypeScript in strict mode. Real-time
messaging over Socket.IO; voice and video over LiveKit. CSS modules, six
languages. A Next BFF whitelists every backend response shape and keeps
service-account credentials server-side.
