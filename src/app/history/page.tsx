"use client";

import { useEffect, useState, useCallback } from "react";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface SavedResponse {
  id: string;
  child_id: string;
  question: string;
  whats_happening: string;
  what_to_do_now: string;
  longer_term: string;
  created_at: string;
  childName: string;
}

// Raw shape returned by the Supabase join before we flatten it
interface SavedResponseRow {
  id: string;
  child_id: string;
  question: string;
  whats_happening: string;
  what_to_do_now: string;
  longer_term: string;
  created_at: string;
  children: { name: string } | null;
}

function formatSavedAt(createdAt: string): string {
  const created = new Date(createdAt);
  const now = new Date();

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(created, now)) return "Today";
  if (isSameDay(created, yesterday)) return "Yesterday";

  return created.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: created.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export default function HistoryPage() {
  const supabase = createClient();

  const [history, setHistory] = useState<SavedResponse[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [itemPendingDelete, setItemPendingDelete] = useState<SavedResponse | null>(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("saved_responses")
      .select(
        "id, child_id, question, whats_happening, what_to_do_now, longer_term, created_at, children(name)"
      )
      .order("created_at", { ascending: false })
      .returns<SavedResponseRow[]>();

    if (fetchError) {
      setError("We couldn't load your saved responses. Please try refreshing the page.");
      setIsLoading(false);
      return;
    }

    const flattened: SavedResponse[] = (data ?? []).map((row) => ({
      id: row.id,
      child_id: row.child_id,
      question: row.question,
      whats_happening: row.whats_happening,
      what_to_do_now: row.what_to_do_now,
      longer_term: row.longer_term,
      created_at: row.created_at,
      // A child may have since been deleted (cascade would've removed this
      // row too, but guard anyway in case of stale data or future FK changes)
      childName: row.children?.name ?? "Unknown child",
    }));

    setHistory(flattened);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleConfirmDelete = async () => {
    if (!itemPendingDelete) return;

    const itemId = itemPendingDelete.id;
    setDeleteError(null);
    setDeletingId(itemId);
    setItemPendingDelete(null);

    const previousHistory = history;
    setHistory((prev) => prev.filter((h) => h.id !== itemId));

    const { error: deleteErr } = await supabase
      .from("saved_responses")
      .delete()
      .eq("id", itemId);

    if (deleteErr) {
      setHistory(previousHistory);
      setDeleteError("Couldn't delete this saved response. Please try again.");
    }

    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="space-y-6">

          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Saved Responses</h1>
            <p className="text-muted-foreground text-sm">
              Advice you've saved for later reference.
            </p>
          </div>

          {deleteError && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {deleteError}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground text-sm">Loading saved responses...</p>
            </div>
          ) : error ? (
            <Card className="rounded-3xl border-destructive/30 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <p className="text-destructive text-sm">{error}</p>
                <Button variant="outline" className="rounded-2xl" onClick={fetchHistory}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          ) : history.length === 0 ? (
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="flex items-center justify-center py-16">
                <p className="text-muted-foreground text-sm">
                  No saved responses yet. Get some advice and save what helps.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id} className="rounded-3xl border-border/60 shadow-sm">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                          {item.childName} · {formatSavedAt(item.created_at)}
                        </p>
                        <p className="text-sm font-medium">"{item.question}"</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-2xl"
                          disabled={deletingId === item.id}
                          onClick={() =>
                            setExpanded(expanded === item.id ? null : item.id)
                          }
                        >
                          {expanded === item.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-2xl text-destructive hover:text-destructive"
                          disabled={deletingId === item.id}
                          onClick={() => setItemPendingDelete(item)}
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {expanded === item.id && (
                      <div className="space-y-4 pt-2 border-t border-border">
                        <div className="space-y-1">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                            What's Happening
                          </h3>
                          <p className="text-sm leading-relaxed">{item.whats_happening}</p>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                            What To Do Now
                          </h3>
                          <p className="text-sm leading-relaxed">{item.what_to_do_now}</p>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                            Longer Term
                          </h3>
                          <p className="text-sm leading-relaxed">{item.longer_term}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

        </div>
      </main>

      <AlertDialog
        open={itemPendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setItemPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this saved response?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this saved advice for{" "}
              {itemPendingDelete?.childName}. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}