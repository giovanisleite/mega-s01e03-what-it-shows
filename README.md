# S01E03 · what it shows — #4471, split

The support desk merged 412 date reports into one ticket, #4471, and marked it known: one bug,
one fix queued. Read by what each report shows, #4471 holds three problems:

| problem | reports | ticket | state |
|---|---|---|---|
| `parser`: day and month swapped, any channel | 379 (desk count; 374 show the swap, 5 are the one-day moves of #3) | #1 | closed: fixed upstream |
| `hint`: day and month swapped, booking-v3 form only | 33 | #2 | closed: won't fix, booking-v3 retired |
| `shift`: date one day early (time zone) | 5 | #3 | **open**: no fix yet |

- New kb page: [`src/routes/kb/incidents/4471/split/+page.svx`](src/routes/kb/incidents/4471/split/+page.svx)
- Its logic: [`src/lib/kb/problems.ts`](src/lib/kb/problems.ts), [`src/lib/kb/ProblemTable.svelte`](src/lib/kb/ProblemTable.svelte)
- The page as the desk sees it: [`rendered/kb/incidents/4471/split.html`](rendered/kb/incidents/4471/split.html)

Build: `npm install && npm run build` (SvelteKit + mdsvex, static output in `build/`).

---

# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.
