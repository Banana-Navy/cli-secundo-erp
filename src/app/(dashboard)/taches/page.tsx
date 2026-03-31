"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, ListTodo } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
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
import type { Task, TaskStatus, TaskPriority } from "@/types";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/types";

const STATUS_FILTERS: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "a_faire", label: "A faire" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Termine" },
  { value: "annule", label: "Annule" },
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

export default function TachesPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const supabase = createClient();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des taches.");
    } else {
      setTasks((data ?? []) as Task[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTasks =
    statusFilter === "all"
      ? tasks
      : tasks.filter((t) => t.status === statusFilter);

  function handleCreate() {
    setEditingTask(null);
    setDialogOpen(true);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  async function handleDelete(task: Task) {
    if (!confirm(`Supprimer la tache "${task.title}" ?`)) return;

    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) {
      toast.error("Erreur lors de la suppression.");
    } else {
      toast.success("Tache supprimee.");
      fetchTasks();
    }
  }

  function handleSaved() {
    setDialogOpen(false);
    setEditingTask(null);
    fetchTasks();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ListTodo className="h-6 w-6" />
            Taches
          </h1>
          <p className="text-muted-foreground">
            {filteredTasks.length} tache{filteredTasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Nouvelle tache
        </Button>
      </div>

      {/* Status filter tabs */}
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

      {/* Tasks table */}
      {loading ? (
        <div className="text-muted-foreground text-sm py-8 text-center">
          Chargement...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-muted-foreground text-sm py-8 text-center">
          Aucune tache trouvee.
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Priorite</TableHead>
                <TableHead>Echeance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {task.title}
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
