"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ListTodo, LayoutGrid, List } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { useEntity } from "@/lib/hooks/use-entity";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskKanbanBoard } from "@/components/tasks/task-kanban-board";
import type { Task, TaskWithRelations, TaskStatus, TaskPriority } from "@/types";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/types";

const STATUS_FILTERS: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "a_faire", label: "À faire" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "annule", label: "Annulé" },
];

const STATUS_COLORS: Record<TaskStatus, string> = {
  a_faire: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  en_cours: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  termine: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  annule: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  basse: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  normale: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  haute: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  urgente: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

type ViewMode = "kanban" | "table";

interface TachesViewProps {
  initialTasks: TaskWithRelations[];
}

export function TachesView({ initialTasks }: TachesViewProps) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const { activeEntity } = useEntity();

  const fetchTasks = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select("*, clients(id, first_name, last_name), properties(id, title, reference)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des tâches.");
    } else {
      setTasks((data ?? []) as TaskWithRelations[]);
    }
  }, []);

  const entityTasks = useMemo(
    () => activeEntity ? tasks.filter((t) => t.entity_id === activeEntity.id) : tasks,
    [tasks, activeEntity]
  );

  const filteredTasks = useMemo(
    () =>
      statusFilter === "all"
        ? entityTasks
        : entityTasks.filter((t) => t.status === statusFilter),
    [entityTasks, statusFilter]
  );

  const handleCreate = useCallback(() => {
    setEditingTask(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((task: TaskWithRelations) => {
    setEditingTask(task);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (task: TaskWithRelations) => {
      if (!confirm(`Supprimer la tâche "${task.title}" ?`)) return;

      const supabase = createClient();
      const { error } = await supabase.from("tasks").delete().eq("id", task.id);
      if (error) {
        toast.error("Erreur lors de la suppression.");
      } else {
        toast.success("Tâche supprimée.");
        fetchTasks();
      }
    },
    [fetchTasks]
  );

  const handleStatusChange = useCallback(
    async (id: string, status: TaskStatus) => {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );

      const supabase = createClient();
      const { error } = await supabase
        .from("tasks")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        toast.error("Erreur lors de la mise à jour du statut.");
        fetchTasks();
      } else {
        toast.success("Statut mis à jour.");
      }
    },
    [fetchTasks]
  );

  const handleSaved = useCallback(() => {
    setDialogOpen(false);
    setEditingTask(null);
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ListTodo className="h-6 w-6" />
            Tâches
          </h1>
          <p className="text-muted-foreground">
            {filteredTasks.length} tâche{filteredTasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border bg-muted p-0.5">
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2.5"
              onClick={() => setViewMode("kanban")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2.5"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-1" />
            Nouvelle tâche
          </Button>
        </div>
      </div>

      {/* Status filter tabs (only in table view) */}
      {viewMode === "table" && (
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      )}

      {/* Content */}
      {viewMode === "kanban" ? (
        <TaskKanbanBoard
          tasks={entityTasks}
          onStatusChange={handleStatusChange}
          onCardClick={handleEdit}
        />
      ) : filteredTasks.length === 0 ? (
        <div className="text-muted-foreground text-sm py-8 text-center">
          Aucune tâche trouvée.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Client / Bien</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Échéance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {task.title}
                  </TableCell>
                  <TableCell className="text-sm">
                    {task.clients && (
                      <Link href={`/clients/${task.clients.id}`} className="text-primary hover:underline">
                        {task.clients.first_name} {task.clients.last_name}
                      </Link>
                    )}
                    {task.clients && task.properties && <span className="mx-1">·</span>}
                    {task.properties && (
                      <Link href={`/biens/${task.properties.id}`} className="text-primary hover:underline">
                        {task.properties.reference || task.properties.title}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={STATUS_COLORS[task.status]}
                    >
                      {TASK_STATUS_LABELS[task.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={PRIORITY_COLORS[task.priority]}
                    >
                      {TASK_PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.due_date
                      ? format(new Date(task.due_date), "dd MMM yyyy", {
                          locale: fr,
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(task)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Task form dialog */}
      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSaved={handleSaved}
      />
    </div>
  );
}
