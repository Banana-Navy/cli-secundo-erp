import type { TaskStatus, TaskPriority, VisitStatus, InterestStatus, ContactType } from "@/types";

// ── Pipeline (client_property_interests) ──────────────────────────

export const pipelineStatusColors: Record<InterestStatus, { color: string; bgColor: string; dotColor: string }> = {
  interesse:        { color: "text-gray-700 dark:text-gray-300",   bgColor: "bg-gray-100 dark:bg-gray-800",     dotColor: "bg-gray-400" },
  visite_planifiee: { color: "text-blue-700 dark:text-blue-300",   bgColor: "bg-blue-50 dark:bg-blue-950",      dotColor: "bg-blue-400" },
  offre_faite:      { color: "text-purple-700 dark:text-purple-300", bgColor: "bg-purple-50 dark:bg-purple-950", dotColor: "bg-purple-400" },
  refuse:           { color: "text-orange-700 dark:text-orange-300", bgColor: "bg-orange-50 dark:bg-orange-950", dotColor: "bg-orange-400" },
  achete:           { color: "text-green-700 dark:text-green-300", bgColor: "bg-green-50 dark:bg-green-950",     dotColor: "bg-green-400" },
};

export const pipelineBadgeColors: Record<InterestStatus, string> = {
  interesse:        "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  visite_planifiee: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  offre_faite:      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  refuse:           "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  achete:           "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

// ── Tasks ─────────────────────────────────────────────────────────

export const taskStatusColors: Record<TaskStatus, string> = {
  a_faire:  "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  en_cours: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  termine:  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  annule:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export const taskPriorityColors: Record<TaskPriority, string> = {
  basse:    "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
  normale:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  haute:    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  urgente:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

// ── Visits (Agenda) ───────────────────────────────────────────────

export const visitCalendarColors: Record<VisitStatus, string> = {
  planifiee: "bg-blue-500 text-white",
  confirmee: "bg-green-500 text-white",
  effectuee: "bg-gray-400 text-white",
  annulee:   "bg-red-500 text-white",
};

// ── Documents ─────────────────────────────────────────────────────

export const documentCategoryColors: Record<string, string> = {
  contrat:     "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  facture:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  compromis:   "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  acte:        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  photo:       "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  plan:        "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  diagnostic:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  autre:       "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
};

// ── Interactions (contacts) ───────────────────────────────────────

export const interactionTypeColors: Record<ContactType, string> = {
  appel:  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  email:  "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  visite: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  note:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};
