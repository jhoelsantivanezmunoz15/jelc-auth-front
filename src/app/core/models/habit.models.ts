// ─── Domain ────────────────────────────────────────────────────────────────

export interface Habit {
  id: number;
  name: string;
}

// ─── Requests ──────────────────────────────────────────────────────────────

export interface CreateHabitRequest {
  name: string;
}

// ─── Responses ─────────────────────────────────────────────────────────────

export interface HabitResponse {
  habit: Habit;
}
