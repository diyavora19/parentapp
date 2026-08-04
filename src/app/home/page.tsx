"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBrowserClient } from "@supabase/ssr";

type Child = {
  id: string;
  name: string;
  age: number;
};

export default function HomePage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [childId, setChildId] = useState<string | undefined>(undefined);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [questionsRemaining, setQuestionsRemaining] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("children")
        .select("id, name, age")
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setChildren(data);
        setChildId(data[0].id);
      }

      const today = new Date().toISOString().split("T")[0];
      const { data: usage } = await supabase
        .from("daily_usage")
        .select("count")
        .eq("user_id", user.id)
        .eq("date", today)
        .single();

      if (usage) {
        setQuestionsRemaining(10 - usage.count);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const selectedChild = children.find((c) => c.id === childId);
  const disabled = !text.trim() || !childId || questionsRemaining <= 0 || text.length < 10;

  const handleSubmit = () => {
    if (!selectedChild) return;
    sessionStorage.setItem(
      "parentwise:query",
      JSON.stringify({
        childId,
        childName: selectedChild.name,
        age: selectedChild.age,
        question: text,
      })
    );
    router.push("/response");
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              How can we help today?
            </h1>
            <p className="text-muted-foreground">
              Pick a child, then describe what's going on. We'll offer warm,
              grounded guidance.
            </p>
          </div>

          <Card className="rounded-3xl border-border/60 shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Child</label>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : children.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    You haven't added any children yet.{" "}
                    <button
                      className="font-medium text-primary hover:underline"
                      onClick={() => router.push("/profiles/new")}
                    >
                      Add one
                    </button>
                    .
                  </div>
                ) : (
                  <Select
                    value={childId}
                    onValueChange={(value) => setChildId(value ?? undefined)}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue>
                        {selectedChild
                          ? `${selectedChild.name} · ${selectedChild.age}`
                          : "Select a child"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {children.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} · {c.age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 1000))}
                  rows={8}
                  placeholder="Describe what's happening with your child..."
                  className="resize-none rounded-2xl text-base"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{text.length < 10 && text.length > 0 ? "Minimum 10 characters" : ""}</span>
                  <span>{text.length}/1000</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  size="lg"
                  className="w-full rounded-2xl"
                  disabled={disabled}
                  onClick={handleSubmit}
                >
                  Get Advice
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  {questionsRemaining} of 10 questions remaining today
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}