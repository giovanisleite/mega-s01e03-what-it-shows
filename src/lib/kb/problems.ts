// What a merged ticket really holds: one row per problem, not per subject line.
// causes.ts places a report by tenant and channel; that is how the desk counts, and these rows keep
// its counts. It cannot see a report whose body describes a different symptom. The desk marks those
// by hand in desk-notes.json; here they get a row of their own (`shift`) instead of a footnote, and
// stay counted where the desk files them.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'shift' | 'unplaced';

// What each problem looks like to the person who reports it.
export const SYMPTOM: Record<Problem, string> = {
  parser: 'day and month swapped (7 April shows as 4 July)',
  hint: 'day and month swapped, on dates typed into the booking-v3 form',
  shift: 'date one day early (12 May shows as 11 May)',
  unplaced: 'no tenant on file: cannot tell',
};

export type ProblemRow = {
  problem: Problem;
  reports: Report[];
  // Of these, how many the desk files under another row (`shift` reports sit under `parser`).
  alsoIn: Partial<Record<Problem, number>>;
  // Of these, how many show this row's symptom. Differs from reports.length only where a row
  // holds reports the desk read differently.
  showing: number;
  tenants: number;
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

function row(problem: Problem, rs: Report[], shift: Set<string>, tenantOf: (r: Report) => Tenant | undefined): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  const alsoIn: ProblemRow['alsoIn'] = {};
  if (problem === 'shift') {
    for (const r of rs) {
      const filed = causeOf(r, tenantOf(r)) ?? 'unplaced';
      alsoIn[filed] = (alsoIn[filed] ?? 0) + 1;
    }
  }
  return {
    problem,
    reports: rs,
    alsoIn,
    showing: problem === 'shift' ? rs.length : rs.filter((r) => !shift.has(r.id)).length,
    tenants: new Set(rs.map((r) => r.tenant)).size,
    channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
  };
}

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemRow[] {
  const shift = new Set(oneDayMove);
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const byCause = new Map<Problem, Report[]>();
  for (const r of merged) {
    const c = causeOf(r, tenantOf(r)) ?? 'unplaced';
    byCause.set(c, [...(byCause.get(c) ?? []), r]);
  }
  const rows = [...byCause.entries()].map(([p, rs]) => row(p, rs, shift, tenantOf));
  const moved = merged.filter((r) => shift.has(r.id));
  if (moved.length) rows.push(row('shift', moved, shift, tenantOf));
  return rows.sort((a, b) => b.reports.length - a.reports.length);
}
