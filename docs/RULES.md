# Development Rules
1. **Modularity:** One component per file.
2. **State Management:** Keep logic in `hooks/` and UI in `components/`.
3. **Consistency:** Always use Tailwind CSS for styling. Never hardcode colors; use defined theme variables.
4. **No Bloat:** Do not generate extra boilerplate or mock files unless requested.
5. **Efficiency:** Each task MUST be constrained to a single module/feature.
6. **Persistence:** Use `localStorage` as the primary data store for the demo.
7. **Traceability:** Always update `TASKS.md` with completion status after every prompt.