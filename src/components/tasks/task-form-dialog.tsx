"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { taskSchema, type TaskSchemaType } from "@/lib/validations/task";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/types";
import type { Task, TaskStatus, TaskPriority } from "@/types";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSaved: () => void;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSaved,
}: TaskFormDialogProps) {
  const supabase = createClient();

  const form = useForm<TaskSchemaType>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "a_faire",
      priority: "normale",
      due_date: "",
      client_id: "",
      property_id: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (task) {
        form.reset({
          title: task.title,
          description: task.description ?? "",
          status: task.status,
          priority: task.priority,
          due_date: task.due_date ?? "",
          client_id: task.client_id ?? "",
          property_id: task.property_id ?? "",
        });
      } else {
        form.reset({
          title: "",
          description: "",
          status: "a_faire",
          priority: "normale",
          due_date: "",
          client_id: "",
          property_id: "",
        });
      }
    }
  }, [open, task, form]);

  async function onSubmit(values: TaskSchemaType) {
    const payload = {
      ...values,
      due_date: values.due_date || null,
      client_id: values.client_id || null,
      property_id: values.property_id || null,
    };

    if (task) {
      const { error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("id", task.id);

      if (error) {
        toast.error("Erreur lors de la mise a jour.");
        return;
      }
      toast.success("Tache mise a jour.");
    } else {
      const { error } = await supabase.from("tasks").insert(payload);

      if (error) {
        toast.error("Erreur lors de la creation.");
        return;
      }
      toast.success("Tache creee.");
    }

    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {task ? "Modifier la tache" : "Nouvelle tache"}
          </DialogTitle>
          <DialogDescription>
            {task
              ? "Modifiez les informations de la tache."
              : "Remplissez les informations pour creer une nouvelle tache."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de la tache" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description (optionnel)"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status & Priority row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(
                          Object.entries(TASK_STATUS_LABELS) as [
                            TaskStatus,
                            string,
                          ][]
                        ).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorite</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Priorite" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(
                          Object.entries(TASK_PRIORITY_LABELS) as [
                            TaskPriority,
                            string,
                          ][]
                        ).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Due date */}
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Echeance</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Enregistrement..."
                  : task
                    ? "Mettre a jour"
                    : "Creer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
