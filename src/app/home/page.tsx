"use client";

import { useState } from "react";
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

const mockChildren = [
  { id: "1", name: "Amara", age: 5 },
  { id: "2", name: "Kofi", age: 8 },
];

const questionsRemaining = 10;

export default function HomePage() {
  const router = useRouter();
  const [childId, setChildId] = useState<string | undefined>(mockChildren[0]?.id);
  const [text, setText] = useState("");

  const disabled = !text.trim() || !childId || questionsRemaining <= 0;

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
                {mockChildren.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    You haven't added any children yet.{" "}
                    <button
                      className="font-medium text-primary hover:underline"
                      onClick={() => router.push("/profiles")}
                    >
                      Add one
                    </button>
                    .
                  </div>
                ) : (
                 <Select value={childId} onValueChange={(value) => setChildId(value ?? undefined)}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue placeholder="Select a child" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockChildren.map((c) => (
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
                <div className="flex justify-end text-xs text-muted-foreground">
                  {text.length}/1000
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  size="lg"
                  className="w-full rounded-2xl"
                  disabled={disabled}
                  onClick={() => router.push("/response")}
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