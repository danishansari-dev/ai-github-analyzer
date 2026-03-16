# Codebase Audit — Roast Report

Full scan of `ai-github-analyzer` (frontend + backend). No sugarcoating.

---

## 1. CODE QUALITY & LOGIC BUGS

─────────────

🔴 **CRITICAL** — [backend/services/github_service.py:184–199] — `get_top_repos_with_readme` has **no return statement**. It mutates `top_3` in place but never returns it. The router does `repos_with_readmes = await asyncio.to_thread(github_svc.get_top_repos_with_readme, username)` and therefore **always gets `None`**. The LLM and resume bullets then receive an empty list; README-based analysis and resume bullets are never based on real README data.  
**Fix:** Add `return top_3` at the end of `get_top_repos_with_readme` (after the for-loop).

🔴 **CRITICAL** — [frontend/src/pages/Results.jsx:26] — `username = rawUsername.split('#')[0].trim()` will **throw** if the user hits `/results` (no param) or a route without `:username`. `useParams()` can return `undefined` for the param.  
**Fix:** Guard: `const username = rawUsername ? String(rawUsername).split('#')[0].trim() : '';` and early-return or redirect when `!username`.

🔴 **CRITICAL** — [frontend/src/pages/Results.jsx] — **`ResumeBullets` is never imported or rendered.** The backend sends `resume_bullets` and the component exists, but the results page does not show it. The “hero feature” of the app is missing from the UI.  
**Fix:** Import `ResumeBullets` and render it in the results layout, e.g. `<ResumeBullets resume_bullets={data.resume_bullets} />`.

🔴 **CRITICAL** — [frontend/src/components/ProfileCard.jsx] — Docstring says it displays “strengths and gaps”, but the component **never renders `stack.strengths` or any gaps**. The API returns them; the UI does not. In roast mode, “strengths” are the roast one-liners — they are never shown.  
**Fix:** Add a section that renders `(stack?.strengths || [])` and, if you have gaps in the schema/API, render those too.

🔴 **CRITICAL** — [frontend/src/components/ui/canvas.ts:22–32] — In `n.prototype.update` you do `(e = this.offset + Math.sin(this.phase) * this.amplitude)`. `e` is **never declared** (no `let`/`var`), so it becomes an implicit global. `value()` returns that global. This is fragile and wrong.  
**Fix:** Declare a module-level variable (e.g. `let _value: number`) and set/return that instead of `e`.

🟡 **WARNING** — [frontend/src/pages/Results.jsx:35] — `toast` and `setToast` are defined but **`setToast` is never called** anywhere. The toast UI will never appear.  
**Suggestion:** Either remove the toast state and the toast JSX, or wire `setToast` to the copy actions (e.g. in a shared callback or when you add ResumeBullets, call `setToast('Copied!')` and clear after a timeout).

🟡 **WARNING** — [backend/routers/analyze.py:138–151] — When `role_fit` is flat (no nested `scores`), you rebuild it with **only 5 roles** and drop `top_3_roles`. The LLM prompt asks for 50+ roles; if the model returns a flat structure you discard the rest and lose `top_3_roles`.  
**Suggestion:** In the flat case, build `scores` from all keys that look like role scores (e.g. exclude only `top_role`, `top_role_label`, `reasoning`, `top_3_roles`) and preserve `top_3_roles` if present.

🟡 **WARNING** — [frontend/src/components/ui/canvas.ts] — `renderCanvas()` adds document/window listeners (`mousemove`, `touchstart`, `resize`, `orientationchange`, `focus`, `blur`) and starts a `requestAnimationFrame(render)` loop. There is **no cleanup** when the user leaves the Home page. The loop and listeners keep running; if the canvas node is removed, you can get errors and leaks.  
**Suggestion:** Export a `destroyCanvas()` (or return one from `renderCanvas`) that removes listeners and stops the rAF loop, and call it from a `useEffect` cleanup in Home.jsx.

🟡 **WARNING** — [frontend/src/pages/Home.jsx:242] — Typo in class: `bg-white/5/5` is invalid; the second `/5` makes it nonsense. You also have duplicate `rounded-2xl` and `backdrop-blur-sm` on the same div.  
**Suggestion:** Use `bg-white/5` once and remove the duplicate Tailwind classes.

🟡 **WARNING** — [backend/services/llm_service.py:252–255] — In roast mode you set `result["stack"]["roast_lines"]` in the post-process, but the **prompt asks for “strengths”** (roast observations). The schema `StackAnalysis` only has `strengths`. So `roast_lines` is redundant and not in the response model; the roast content is in `strengths`. Either document that roast mode reuses `strengths` or add `roast_lines` to the schema and have the frontend use it when in roast mode.

🟡 **WARNING** — [frontend/src/pages/Results.jsx:38–42] — When `starRequired` is true you set `setLoading(false)` and return from the effect without ever fetching. After the user clicks “I already starred” you set `setStarRequired(false)` and bump `startTrigger`, so the effect runs again and **then** fetches. That’s correct, but the initial state is confusing: `loading` is true, then immediately false, and no loading UI is shown for the “gate” case. Consider renaming or splitting state so “waiting for star” isn’t represented as “loading”.

🔵 **MINOR** — [frontend/src/App.jsx:14–28] — `useEffect` for track-visit has an empty dependency array; `apiUrl` is from `import.meta.env` and is effectively constant. Fine; no change needed. If you ever add more deps, include them.

🔵 **MINOR** — [frontend/src/components/ProfileCard.jsx:23–32] — Large comment block about followers/following and schemas is outdated (you do have them in the response). Remove or shorten to avoid noise.

🔵 **MINOR** — [backend/models/schemas.py:5] — Comment says “Claude’s dynamic JSON”; you use Groq. Update the comment.

🔵 **MINOR** — [frontend/src/demo.tsx] — Demo component importing `OrbitingSkills`; not used in the app routes. Either remove or wire to a `/demo` route so it’s not dead code.

---

## 2. PERFORMANCE PROBLEMS

─────────────

🟡 **WARNING** — [frontend/src/pages/Results.jsx:116–162] — `topLanguages` is derived from `data` on every render with a non-trivial filter/slice. Same for `getScoreGradient(scoreProgress)` used in JSX. If `data` or `scoreProgress` don’t change often, wrap in `useMemo` to avoid recomputing every time.

🟡 **WARNING** — [frontend/src/pages/Home.jsx:43–66] — Counter animation uses `setInterval` and two state updates per tick (`setDisplayAnalyzed`, `setDisplayVisitors`). For 40 steps over 1.5s that’s a lot of re-renders. Consider a single state object or ref + one setState per tick.

🟡 **WARNING** — [frontend/src/components/SpotlightCard.jsx:29–42] — `GlowCard` attaches a **document-level** `pointermove` listener. Every instance adds another. On a page with many cards (e.g. Results) this multiplies. Consider a single document listener and dispatching to card refs, or only enabling on hover/focus.

🔵 **MINOR** — [frontend/src/components/OrbitingSkills.jsx:120–151] — `requestAnimationFrame` is correctly cleaned up in the effect return. Good. No change.

🔵 **MINOR** — [frontend/src/components/FloatingParticlesBackground.jsx] — Effect deps list is long but correct; resize and listeners are cleaned up. Fine.

---

## 3. UI / UX PROBLEMS

─────────────

🟡 **WARNING** — [frontend/src/components/GitHubStats.jsx:35] — `baseUrl = 'http://github-profile-summary-cards.vercel.app/...'` uses **HTTP**. On a site served over HTTPS this can cause mixed content blocking or warnings.  
**Suggestion:** Use `https://` for the summary cards API.

🟡 **WARNING** — [frontend/src/pages/Results.jsx:191–212] — Print styles override many classes with `!important` and brittle selectors (e.g. `.text-gray-400`, `.bg-white\\/\\[0\\.02\\]`). Easy to break when you change Tailwind.  
**Suggestion:** Use a print-specific class like `.print\:bg-gray-50` and minimal overrides, or a dedicated print stylesheet.

🟡 **WARNING** — [frontend/src/pages/Results.jsx:364–365] — “I already starred” button uses `border-white/5` on both border and bg; very low contrast.  
**Suggestion:** Slightly stronger border (e.g. `border-white/10`) so it’s visible.

🔵 **MINOR** — [frontend/src/pages/Home.jsx:136–155] — Form input has `id="github-username-input"` and the button has `id="analyze-button"`; no visible `<label for="...">`. Add a proper label for a11y (can be visually hidden).

🔵 **MINOR** — [frontend/src/components/ResumeBullets.jsx:84–86] — Copy button is small and only fully visible on group hover; on touch devices discoverability is poor. Consider always showing a subtle “Copy” or icon.

🔵 **MINOR** — [frontend/src/pages/Home.jsx:339–354] — Footer tech badges (FastAPI, Groq AI, React) look clickable but have no href or onClick. Either make them links or remove hover styles so they don’t look interactive.

---

## 4. ACCESSIBILITY (A11Y)

─────────────

🟡 **WARNING** — [frontend/src/components/OrbitingSkills.jsx:248–259] — Skill badges are `<div>` with hover and click; no keyboard access, no role, no aria-label.  
**Suggestion:** Use `<button type="button">` or add `role="button"` and `tabIndex={0}` and handle Enter/Space, plus `aria-label={item.name}`.

🟡 **WARNING** — [frontend/src/components/SpotlightCard.jsx:151–166] — Inline `<style dangerouslySetInnerHTML>` is used for glow pseudo-elements. The card itself is a div; if it’s clickable or interactive, ensure focus visible and aria attributes are on the interactive element.

🔵 **MINOR** — [frontend/src/components/ProfileCard.jsx:56–59] — Avatar has `alt={\`${username}'s avatar\`}`. Good.  
🔵 **MINOR** — [frontend/src/pages/Home.jsx:163–165] — Roast toggle has `aria-label="Toggle roast mode"`. Good.

---

## 5. SECURITY & DATA HANDLING

─────────────

🟡 **WARNING** — [frontend/.env.production] — Contains `VITE_API_URL=https://ai-github-analyzer-production.up.railway.app`. If this file is committed, it’s not a secret (Vite embeds it in the client bundle), but the URL is hardcoded. Prefer build-time env (e.g. Vercel env vars) so you don’t commit environment-specific URLs.  
**Suggestion:** Add `.env.production` to `.gitignore` if it isn’t already, and rely on the host’s env.

🔵 **MINOR** — [backend/main.py:18–21] — CORS is restricted to your frontend origin and localhost. Good.  
🔵 **MINOR** — No `dangerouslySetInnerHTML` with user content in the frontend; only SpotlightCard’s fixed CSS. No raw HTML from API. Good.

---

## 6. PROJECT STRUCTURE & ARCHITECTURE

─────────────

🟡 **WARNING** — [frontend/src] — **Naming inconsistency:** `ProfileCard.jsx`, `RoleScoreCard.jsx`, `RepoShowcase.jsx` (PascalCase) vs `glowing-effect.tsx`, `orbiting-skills.tsx` (kebab-case).  
**Suggestion:** Pick one (e.g. PascalCase for components) and rename for consistency.

🟡 **WARNING** — [frontend/src/pages/Results.jsx] — Single file is ~410 lines and handles URL params, star gate, fetch, errors, layout, and all result sections. Consider extracting: custom hook for `useAnalysis(username, isRoast, startTrigger)`, and a presentational component for the result grid.

🟡 **WARNING** — [backend/routers/analyze.py:50] — OG endpoint does `from routers.analyze import cache_service`. Circular-ish: main mounts analyze router and also imports from it for the OG route. It works but couples the OG route to the router module. Prefer importing `CacheService` from `services.cache_service` in main and instantiating there (or a shared app state).

🔵 **MINOR** — [frontend/src/components/ui/button.tsx] and [frontend/src/components/ui/glowing-effect.tsx] — Not used anywhere in the main app (only in glowing-effect-demo). Either use them or move to a “demos” or “playground” folder.

🔵 **MINOR** — [frontend/vite.config.js:23–29] — Proxy only forwards `/api`. Backend is at `/api/*`. Frontend uses `fetch(\`${apiUrl}/api/...\`)`. When `apiUrl` is empty (dev), the request goes to same origin and the proxy handles it. Good. When `apiUrl` is set (prod), full URL is used. Consistent.

---

## 7. SPECIFIC TO THIS PROJECT (AI GITHUB ANALYZER)

─────────────

🔴 **CRITICAL** — **GitHub README data never reaches the LLM.** Because `get_top_repos_with_readme` returns nothing, `repos_with_readmes` is always `None`/empty. Resume bullets and README-based context are generated with **no README content**. Fix the return value in `github_service.get_top_repos_with_readme` first.

🔴 **CRITICAL** — **Resume bullets are never shown.** Backend sends `resume_bullets`; the only component that can display them (`ResumeBullets`) is never rendered. Users never see the “resume-ready bullets” feature.

🔴 **CRITICAL** — **Strengths (and roast one-liners) are never shown.** API returns `stack.strengths`; ProfileCard (and the rest of the app) never render them. In roast mode the strengths are the roast lines; they’re still missing from the UI.

🟡 **WARNING** — **Groq prompt asks for 50+ role scores but PRD specifies only 5.** The PRD explicitly limits Role Fit Score to exactly 5 roles (ML Engineer, Backend Developer, Frontend Developer, MLOps Engineer, Full Stack Developer). The backend normalization keeps 5 roles, which aligns with the PRD, but the LLM prompt itself is violating the PRD by asking for 50+ roles.
**Fix:** Update the LLM prompt to only evaluate the 5 standard roles defined in the PRD.

🟡 **WARNING** — **Redis caching:** Cache key is `username` or `username:roast`; TTL is 60 minutes (in-memory). No cache stampede protection. If 100 people hit the same uncached user at once, you run 100 analyses. Consider a short-lived lock or “loading” placeholder per key.

🟡 **WARNING** — **Analysis result validation:** You build `FullAnalysisResponse(...)` from the LLM and GitHub data. If the LLM omits a required field (e.g. `reasoning` in `RoleFitAnalysis`), Pydantic can raise and the request returns 500. Consider defaults for optional-looking fields (e.g. `reasoning: str = ""`) or a try/except and a sanitized error response.

🟡 **WARNING** — **Misleading PDF/PNG export copy:** The codebase mentions a “shareable PNG card generator”, but the PRD explicitly lists "Downloadable PDF report" as **Out of Scope (v1)**.
**Fix:** Remove the misleading copy claiming PDF/PNG export functionality, as "copy URL" is the only required sharing method for v1.

🟡 **WARNING** — **Share URL:** Backend OG and redirect use `https://ai-github-analyzer.vercel.app/results/{username}`. If the user is in roast mode, the URL should include `?mode=roast` so that when someone opens the link they see the same mode. Currently the OG endpoint doesn’t pass mode; the redirect is always to `/results/{username}`. So shared roast links would open in normal mode.  
**Fix:** Include query in OG url and redirect, e.g. when generating the page for roast, use `.../results/{username}?mode=roast`.

🟡 **WARNING** — **Roast vs normal:** Cache keys are separate (`username` vs `username:roast`). Backend and frontend both use `mode=roast`. No evidence of roast data bleeding into normal; isolation is fine. But roast-specific content (`strengths` as roast lines) is not rendered because strengths aren’t rendered at all.

🟡 **WARNING** — **Career role scores:** Scores are produced by the LLM from repo/stack/README context. Because README data is currently empty (see above), the model has less evidence; scores are still “from” the API but with reduced input. Once READMEs are fixed, scores will be better grounded. No evidence they’re made up; the pipeline is just underfed.

---

## SUMMARY

───────

- **Critical:** 6  
- **Warning:** 24  
- **Minor:** 12  

**Top 3 things to fix first:**

1. **Add `return top_3` in `get_top_repos_with_readme`** (github_service.py). Without it, READMEs and resume bullets are never based on real data.
2. **Render `ResumeBullets` on the Results page** and pass `data.resume_bullets`. Right now the main value prop is invisible.
3. **Guard `rawUsername` in Results.jsx** and optionally redirect when missing, so `/results` or invalid routes don’t throw.

After that: show `stack.strengths` (and roast lines) in the UI, fix the LLM prompt to only ask for 5 roles as per PRD, and replace HTTP with HTTPS for the GitHub stats cards.

---

## 8. MISSING PRD REQUIREMENTS

─────────────

🔴 **CRITICAL** — **Gaps not rendered:** PRD requires "gaps: 2–3 notable missing signals (tests, documentation, etc.)" to be displayed. The API returns them based on the schema, but neither `ProfileCard` nor any other component renders them in the UI.

🟡 **WARNING** — **Shareable Badge:** The PRD mentions a shareable badge function (e.g. "I'm 84% ML Engineer" badge = natural social sharing). There is currently no badge generator implemented beyond simple URL sharing.

🟡 **WARNING** — **SlowAPI Rate Limiting:** PRD specifies "Rate Limiting: SlowAPI (FastAPI middleware)" to prevent abuse. This needs to be verified or implemented in the FastAPI backend, as it was not noted in the initial audit.
