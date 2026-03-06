/**
 * Call tracking utility — localStorage-based since backend has no call tracking API.
 * Stores call events with pharmacyId and timestamp.
 */

const STORAGE_KEY = "pharmanuit_calls";
const MAX_AGE_DAYS = 60;

interface CallEvent {
  pharmacyId: string;
  timestamp: number;
}

function loadCalls(): CallEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CallEvent[];
  } catch {
    return [];
  }
}

function saveCalls(calls: CallEvent[]): void {
  // Prune entries older than MAX_AGE_DAYS
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const pruned = calls.filter((c) => c.timestamp >= cutoff);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

/**
 * Record a call event for a pharmacy.
 */
export function recordCall(pharmacyId: bigint): void {
  const calls = loadCalls();
  calls.push({ pharmacyId: pharmacyId.toString(), timestamp: Date.now() });
  saveCalls(calls);
}

/**
 * Count calls for a pharmacy in the last 24 hours.
 */
export function getCallsToday(pharmacyId: bigint): number {
  const calls = loadCalls();
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return calls.filter(
    (c) => c.pharmacyId === pharmacyId.toString() && c.timestamp >= cutoff,
  ).length;
}

/**
 * Count calls for a pharmacy in the last 30 days.
 */
export function getCallsThisMonth(pharmacyId: bigint): number {
  const calls = loadCalls();
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return calls.filter(
    (c) => c.pharmacyId === pharmacyId.toString() && c.timestamp >= cutoff,
  ).length;
}

/**
 * Total all calls ever recorded (up to 60 days).
 */
export function getTotalCalls(): number {
  return loadCalls().length;
}

/**
 * Returns call stats per pharmacy (today + this month).
 */
export function getCallsStatsForAllPharmacies(): {
  pharmacyId: string;
  today: number;
  month: number;
}[] {
  const calls = loadCalls();
  const nowMs = Date.now();
  const cutoffDay = nowMs - 24 * 60 * 60 * 1000;
  const cutoffMonth = nowMs - 30 * 24 * 60 * 60 * 1000;

  const byId: Record<string, { today: number; month: number }> = {};
  for (const call of calls) {
    if (!byId[call.pharmacyId]) {
      byId[call.pharmacyId] = { today: 0, month: 0 };
    }
    if (call.timestamp >= cutoffDay) byId[call.pharmacyId].today++;
    if (call.timestamp >= cutoffMonth) byId[call.pharmacyId].month++;
  }

  return Object.entries(byId).map(([pharmacyId, stats]) => ({
    pharmacyId,
    ...stats,
  }));
}
