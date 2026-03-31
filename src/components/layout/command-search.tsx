"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, User } from "lucide-react";
import { GringoLogo } from "@/components/ui/gringo-logo";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

function AiLogo({ size = 20 }: { size?: number }) {
  return <GringoLogo size={size} />;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = useCallback(async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.ok
          ? data.answer
          : data.error ?? "Une erreur est survenue.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Erreur de connexion au serveur.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Trigger button styled as a search bar */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 h-9 w-full max-w-sm rounded-full border border-border/60 bg-white px-3 text-sm text-muted-foreground transition-colors hover:border-ring hover:bg-accent/50 dark:bg-input/30"
      >
        <GringoLogo size={22} />
        <span className="flex-1 text-left">Ask Gringo...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border/80 bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-xs">&#8984;</span>K
        </kbd>
      </button>

      {/* Mobile trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <GringoLogo size={22} />
        <span className="sr-only">GringoAI</span>
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton
          className="flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b bg-sidebar px-5 py-4 rounded-t-[1.25rem]">
            <AiLogo size={36} />
            <div>
              <DialogTitle className="text-base font-semibold text-white">
                GringoAI
              </DialogTitle>
              <p className="text-xs text-sidebar-foreground/60">
                Assistant intelligent Secundo
              </p>
            </div>
          </div>

          {/* Messages area */}
          <ScrollArea
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-4"
            style={{ maxHeight: "calc(85vh - 10rem)" }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4">
                  <AiLogo size={56} />
                </div>
                <h3 className="text-sm font-semibold mb-1">
                  Comment puis-je vous aider ?
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Posez vos questions sur les clients, les biens, les visites,
                  les statistiques... GringoAI interroge votre base de données
                  pour vous.
                </p>
                <div className="mt-6 grid gap-2 w-full max-w-xs">
                  {[
                    "Combien de biens sont disponibles ?",
                    "Quels clients sont actifs ?",
                    "Quel est le prix moyen des villas ?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setInput(suggestion);
                        setTimeout(() => inputRef.current?.focus(), 50);
                      }}
                      className="rounded-xl border border-border/60 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  {msg.role === "user" ? (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="size-4 text-primary" />
                    </div>
                  ) : (
                    <div className="shrink-0">
                      <AiLogo size={32} />
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_th]:bg-background/60 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_th]:border-b [&_th]:border-border/60 [&_td]:px-2 [&_td]:py-1.5 [&_td]:border-b [&_td]:border-border/30">
                        <ReactMarkdown
                          components={{
                            a: ({ href, children }) => (
                              <Link
                                href={href ?? "#"}
                                onClick={() => setOpen(false)}
                                className="text-primary underline underline-offset-2 hover:text-primary/80"
                              >
                                {children}
                              </Link>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="shrink-0">
                    <AiLogo size={32} />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Gringo réfléchit...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="border-t p-4">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                disabled={isLoading}
                className="h-10 flex-1 rounded-full border border-border/60 bg-background px-4 text-sm placeholder:text-muted-foreground outline-none transition-colors focus:border-ring disabled:opacity-50 dark:bg-input/30"
              />
              <Button
                size="icon"
                className="size-10 shrink-0 rounded-full"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                <span className="sr-only">Envoyer</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
