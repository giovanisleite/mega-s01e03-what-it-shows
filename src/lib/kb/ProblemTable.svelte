<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { splitTicket, SYMPTOM, type Problem } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // issues: problem → URL of the ticket filed for it. state: problem → where it stands, in words.
  let {
    ticket,
    issues = {},
    state = {},
  }: { ticket: number; issues?: Partial<Record<Problem, string>>; state?: Partial<Record<Problem, string>> } = $props();

  const rows = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const total = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket).length);
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
  const ticketLabel = (url: string) => url.replace(/^.*\/issues\//, '#');
</script>

<p class="sum">
  <strong>{total}</strong> reports merged into #{ticket} ·
  <strong>{rows.length}</strong> {rows.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>what people see</th><th>tenants</th><th>seen</th><th>ticket</th><th>state</th></tr>
  </thead>
  <tbody>
    {#each rows as r (r.problem)}
      <tr class:open={state[r.problem]?.startsWith('open')}>
        <td><code>{r.problem}</code></td>
        <td>
          <strong>{r.reports.length}</strong>
          {#if r.showing !== r.reports.length}<span class="muted"><br />{r.reports.length - r.showing} of them: <code>shift</code></span>{/if}
          {#each Object.entries(r.alsoIn) as [p, n] (p)}<span class="muted"><br />filed under <code>{p}</code> by the desk</span>{/each}
        </td>
        <td>{SYMPTOM[r.problem]}<br /><span class="muted">{channels(r.channels)}</span></td>
        <td>{r.tenants}</td>
        <td class="muted">{r.firstSeen} → {r.lastSeen}</td>
        <td>
          {#if issues[r.problem]}<a href={issues[r.problem]}>{ticketLabel(issues[r.problem]!)}</a>{:else}<span class="none">none yet</span>{/if}
        </td>
        <td>{state[r.problem] ?? ''}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
  .open td { background: var(--warn-bg); }
  .open td:last-child { color: var(--warn); font-weight: 600; }
</style>
