export interface BriefData {
  objective: string;
  audience: string;
  budget: string;
  deadline: string;
  tech_constraints: string;
  references: string;
  summary: string;
}

export interface BriefProject {
  id: string;
  name: string;
  createdAt: string;
  status: "pending" | "completed";
  briefData?: BriefData;
  notes?: string; // freelance notes injected into AI context
}

export interface MeetingNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  linkedProjectId?: string;
}

const PROJECTS_KEY = "contextdrop_projects";
const AUTH_KEY = "contextdrop_auth";
const MEETING_NOTES_KEY = "contextdrop_meeting_notes";

function randomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function generateProjectId(): string {
  return `projet-${randomId()}`;
}

export function generateNoteId(): string {
  return `note-${randomId()}`;
}

// ── Projects ─────────────────────────────────────────────────

export function getProjects(): BriefProject[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getProject(id: string): BriefProject | null {
  return getProjects().find((p) => p.id === id) ?? null;
}

export function saveProject(project: BriefProject): void {
  const projects = getProjects().filter((p) => p.id !== project.id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify([project, ...projects]));
}

export function deleteProject(id: string): void {
  const projects = getProjects().filter((p) => p.id !== id);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function completeBrief(id: string, briefData: BriefData): void {
  const project = getProject(id);
  if (!project) return;
  saveProject({ ...project, status: "completed", briefData });
}

export function saveProjectNotes(id: string, notes: string): void {
  const project = getProject(id);
  if (!project) return;
  saveProject({ ...project, notes });
}

// ── Meeting Notes ─────────────────────────────────────────────

export function getMeetingNotes(): MeetingNote[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MEETING_NOTES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getMeetingNote(id: string): MeetingNote | null {
  return getMeetingNotes().find((n) => n.id === id) ?? null;
}

export function saveMeetingNote(note: MeetingNote): void {
  const notes = getMeetingNotes().filter((n) => n.id !== note.id);
  localStorage.setItem(MEETING_NOTES_KEY, JSON.stringify([note, ...notes]));
}

export function deleteMeetingNote(id: string): void {
  const notes = getMeetingNotes().filter((n) => n.id !== id);
  localStorage.setItem(MEETING_NOTES_KEY, JSON.stringify(notes));
}

// ── Auth ──────────────────────────────────────────────────────

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(AUTH_KEY);
}

export function login(email: string): void {
  localStorage.setItem(AUTH_KEY, email);
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getAuthEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(AUTH_KEY) ?? "";
}
