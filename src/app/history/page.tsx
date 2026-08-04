"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

type SavedResponse = {
  id: string;
  question: string;
  whats_happening: string;
  what_to_do_now: string;
  longer_term: string;
  created_at: string;
  children: { name: string };
};

export default function HistoryPage() {
  const [history, setHistory] = useState<SavedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data } = await supabase
        .from("saved_responses")
        .select("id, question, whats_happening, what_to_do_now, longer_term, created_at, children(name)")
        .order("created_at", { ascending: false });

      if (data) setHistory(data as unknown as SavedResponse[]);
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase
      .from("saved_responses")
      .delete()
      .eq("id", id);

    if (!error) {
      setHistory(history.filter((h) => h.id !== id));
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

          {loading ? (
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="flex items-center justify-center py-16">
                <p className="text-muted-foreground text-sm">Loading...</p>
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
                          {item.children?.name} · {formatDate(item.created_at)}
                        </p>
                        <p className="text-sm font-medium">"{item.question}"</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-2xl"
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
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}