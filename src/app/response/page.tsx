"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookmarkCheck, ChevronLeft, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

type Response = {
  whatsHappening: string;
  whatToDoNow: string;
  longerTerm: string;
};

export default function ResponsePage() {
  const router = useRouter();
  const [response, setResponse] = useState<Response | null>(null);
  const [question, setQuestion] = useState("");
  const [childName, setChildName] = useState("");
  const [childId, setChildId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [specialMessage, setSpecialMessage] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("parentwise:query");
    if (!raw) {
      router.push("/home");
      return;
    }

    const { childId, childName, age, question, notes } = JSON.parse(raw);
    setQuestion(question);
    setChildName(childName);
    setChildId(childId);

    const fetchResponse = async () => {
      // Check and increment rate limit
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const { data: usage } = await supabase
        .from("daily_usage")
        .select("count")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (usage && usage.count >= 10) {
        setError("You've reached your 10 questions for today. Come back tomorrow.");
        setLoading(false);
        return;
      }

      // Call the API
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, childName, age, notes }),
      });

      const data = await res.json();

      if (data.crisis) {
        setSpecialMessage(data.response);
        setLoading(false);
        return;
      }

      if (data.notParenting) {
        setSpecialMessage(data.response);
        setLoading(false);
        return;
      }

      if (data.error) {
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setResponse(data);

      // Increment daily usage
      if (usage) {
        await supabase
          .from("daily_usage")
          .update({ count: usage.count + 1 })
          .eq("user_id", user.id)
          .eq("date", today);
      } else {
        await supabase
          .from("daily_usage")
          .insert({ user_id: user.id, date: today, count: 1 });
      }

      setLoading(false);
    };

    fetchResponse();
  }, []);

  const handleSave = async () => {
    if (!response) return;
    setSaving(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("saved_responses").insert({
      user_id: user.id,
      child_id: childId,
      question,
      whats_happening: response.whatsHappening,
      what_to_do_now: response.whatToDoNow,
      longer_term: response.longerTerm,
    });

    if (!error) setSaved(true);
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="space-y-6">

          <button
            onClick={() => router.push("/home")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </button>

          {question && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                Your question
              </p>
              <p className="text-sm text-muted-foreground italic">
                "{question}"
              </p>
            </div>
          )}

          {loading ? (
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 space-y-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Finding the best guidance for you...
                </p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="flex items-center justify-center py-16">
                <p className="text-sm text-destructive">{error}</p>
              </CardContent>
            </Card>
          ) : specialMessage ? (
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="p-6">
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {specialMessage}
                </p>
              </CardContent>
            </Card>
          ) : response ? (
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                    What's Happening
                  </h2>
                  <p className="text-sm leading-relaxed">{response.whatsHappening}</p>
                </div>

                <div className="h-px bg-border" />

                <div className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                    What To Do Now
                  </h2>
                  <p className="text-sm leading-relaxed">{response.whatToDoNow}</p>
                </div>

                <div className="h-px bg-border" />

                <div className="space-y-2">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                    Longer Term
                  </h2>
                  <p className="text-sm leading-relaxed">{response.longerTerm}</p>
                </div>

                <div className="h-px bg-border" />

                <Button
                  className="w-full rounded-2xl"
                  variant={saved ? "outline" : "default"}
                  onClick={handleSave}
                  disabled={saved || saving}
                >
                  <BookmarkCheck className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : saved ? "Saved!" : "Save Response"}
                </Button>
              </CardContent>
            </Card>
          ) : null}

        </div>
      </main>
    </div>
  );
}