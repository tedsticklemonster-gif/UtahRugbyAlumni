export type RecurrenceRule = "weekly" | "biweekly" | "monthly" | "annual";

interface Occurrence {
  starts_at: Date;
  ends_at: Date | null;
}

/**
 * Generate occurrences for a recurring event.
 * Returns dates for instances between `after` and `until` (exclusive of the original).
 */
export function generateOccurrences(
  startsAt: Date,
  endsAt: Date | null,
  rule: RecurrenceRule,
  after: Date,
  until: Date
): Occurrence[] {
  const duration = endsAt ? endsAt.getTime() - startsAt.getTime() : null;
  const occurrences: Occurrence[] = [];

  let current = new Date(startsAt);

  // Advance to the first occurrence after `after`
  while (current <= after) {
    current = nextDate(current, rule);
  }

  while (current <= until) {
    occurrences.push({
      starts_at: new Date(current),
      ends_at: duration !== null ? new Date(current.getTime() + duration) : null,
    });
    current = nextDate(current, rule);
  }

  return occurrences;
}

function nextDate(date: Date, rule: RecurrenceRule): Date {
  const next = new Date(date);

  switch (rule) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "annual":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}
