# AI Workflow

This project was developed with active AI assistance during planning, design, implementation, and refactoring. The main AI tool used was Codex with the GPT-5.5 model. AI was used as a productivity and review tool, but the final architecture and implementation decisions were not accepted blindly. The workflow was iterative and human-driven.

## 1. Requirement Understanding

The first step was to provide the full case study requirements to AI and use it to break down the problem space. At this stage, AI helped transform the raw brief into a more structured understanding of:

- the weekly leaderboard lifecycle,
- the required data flow between PostgreSQL, Redis, and MongoDB,
- the expected frontend behavior,
- deployment and production-readiness expectations.

## 2. Initial Project Planning

After the requirements were introduced, AI was asked to generate:

- `AGENTS.md`
- `ROADMAP.md`

These files were used as the initial planning baseline, not as final documents. After generation, both files were reviewed manually and revised to better match the intended implementation direction.

## 3. Human Review and Technical Decisions

After the first AI-generated plan, several decisions were made manually and then pushed back into the codebase through follow-up changes. The main human-driven decisions were:

- rename `api` and `web` style folders to `server` and `client`,
- avoid using a `packages` folder at the beginning, then later reintroduce `packages/shared` only when duplication became real,
- use Express.js for the backend,
- use Prisma for PostgreSQL access and schema management,
- use Chakra UI for the frontend,
- keep backend structure modular and layered with `routers`, `controllers`, `services`, `repositories`, and `validators`,
- remove the wallet table idea and keep the current player balance in `players.total_money`,
- use player name instead of player id in the leaderboard query flow,
- separate cron execution into its own `apps/cron` application instead of keeping it inside the API process,
- simplify the database model by merging weekly leaderboard result tables into a single `weekly_leaderboard_winners` table,
- remove flows that were out of current scope, such as API-based earning ingestion and idempotency handling.

These choices were made after evaluating AI suggestions against maintainability, simplicity, production readiness, and the actual scope of the case study.

## 4. AI-Assisted Implementation

Codex with GPT-5.5 was then used during implementation as a coding assistant for:

- generating and updating folder structures,
- refactoring backend modules,
- reorganizing cron logic into a separate app,
- extracting shared pure utilities into `packages/shared`,
- adjusting Prisma schema and related service/repository code,
- improving frontend structure and UI behavior,
- preparing deployment-related guidance and operational notes.

The implementation was not done in a single pass. Generated code was reviewed manually before being kept as part of the project. When Codex produced code that was too broad, too complex, or not aligned with the intended architecture, it was corrected through follow-up prompts and manual review. This included checking naming, folder boundaries, Prisma model changes, service responsibilities, frontend component structure, and whether the implementation still matched `ROADMAP.md`.

## 5. Where Human Judgment Overrode AI

Several parts of the project changed substantially after review:

- MongoDB usage was narrowed and redefined to fit the project better.
- Some earlier persistence ideas were simplified because they created unnecessary complexity for the case study.
- API scope was reduced where needed to avoid implementing flows that were not essential to the final submission.
- The cron architecture was separated from the API app for a cleaner production model.
- UI behavior and component structure were revised multiple times based on direct feedback rather than accepting the first generated version.

In other words, AI accelerated the work, but the final direction came from deliberate human review and repeated technical decisions.

## 6. Summary

AI was used in this project as:

- a planning assistant,
- a code generation and refactoring assistant,
- a technical discussion partner,
- a documentation helper.

The final result reflects a mixed workflow: Codex with GPT-5.5 helped move faster, but architecture, scope control, naming, structure, code review, and tradeoff decisions were reviewed and shaped manually throughout the project.
