// What a merged ticket really holds: one row per problem, not per subject line.
// causes.ts places a report by tenant and channel. That cannot see a report whose body describes a
// different symptom. The desk marks those by hand in desk-notes.json; here they count as their own
// problem instead of a footnote under `parser`.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'shift' | 'unplaced';

// What each problem looks like to the person who reports it.
export const SYMPTOM: Record<Problem, string> = {
  parser: 'day and month swapped (7 April shows as 4 July)',
  hint: 'day and month swapped, on dates typed into the booking-v3 form',
  shift: 'date one day early (12 May shows as 11 May)',
  unplaced: 'no tenant on file: cannot tell',
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: ReadonlySet<string>): Problem {
  if (oneDayMove.has(r.id)) return 'shift';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemRow = {
  problem: Problem;
  reports: Report[];
  tenants: number;
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemRow[] {
  const shift = new Set(oneDayMove);
  const byProblem = new Map<Problem, Report[]>();
  for (const r of uniqueById(all).filter((r) => r.mergedInto === ticket)) {
    const p = problemOf(r, tenantOf(r), shift);
    byProblem.set(p, [...(byProblem.get(p) ?? []), r]);
  }
  return [...byProblem.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
      };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
}
