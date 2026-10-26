# AGENTS.md

## Project Overview

Monorepo for a costume rental and sales management system with AI/AR virtual try-on.

- `frontend/`: Next.js, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query
- `backend/`: Express, TypeScript, MongoDB/Mongoose
- Follow the existing feature-folder and layered architecture. Inspect nearby code before making changes.

## General Rules

- Make focused, minimal changes; avoid unrelated refactors; avoid UI/UX changes unless explicitely told so.
- Reuse existing components, hooks, services, types, and utilities.
- Match the code style and conventions already used in the relevant folder.
- Do not add dependencies or change environment/configuration settings without a clear need.
- Never expose secrets, credentials, tokens, or private customer data.
- Do not claim tests or checks passed unless you actually ran them.
- Do not input 5+ line comments, keep it concise.
- Do not perform tasks outside your scope.
- Always use Plan mode and ask further questions for clarity.

## TypeScript

- Keep types explicit and accurate; avoid `any` and unsafe type assertions.
- Prefer handling nullable values safely over using non-null assertions (`!`).
- Keep API request/response types consistent between frontend and backend.
- In backend ESM relative imports, follow the existing `.js` extension convention.

## Frontend

- Use the App Router and existing feature-folder structure.
- Build UI with existing shadcn/ui components and Tailwind utilities before creating new primitives.
- Keep components focused; move reusable logic into hooks or feature utilities where appropriate.
- Use TanStack Query for server state. Keep query keys consistent, handle loading/error states, and invalidate or update affected queries after mutations.
- Preserve responsive layouts and existing accessibility patterns.

## Backend

- Follow the existing layered flow: routes → controllers → services → repositories → models.
- Keep HTTP handling in controllers, business rules in services, and database access in repositories.
- Validate inputs and enforce authentication/authorization on protected operations.
- Use consistent error handling and response shapes.
- Use Mongoose update operators correctly (`$set`, `$unset`, `$push`, etc.) and prefer atomic operations for concurrent updates.

## Before Finishing

1. Review the changed code for regressions and security issues.
2. Run relevant type checks, linting, and manual/API tests when available.
3. Report what changed, what checks were run, and any remaining concerns.
