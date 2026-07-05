"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookmarkCheck, ChevronLeft } from "lucide-react";

export default function ResponsePage() {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

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

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Your question
            </p>
            <p className="text-sm text-muted-foreground italic">
              "My 5 year old keeps hitting other kids at daycare and I don't know what to do."
            </p>
          </div>

          <Card className="rounded-3xl border-border/60 shadow-sm">
            <CardContent className="space-y-6 p-6">

              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                  What's Happening
                </h2>
                <p className="text-sm leading-relaxed text-foreground">
                  At this age, hitting is often a communication problem rather than
                  a behavioural one. Your child may not yet have the words or emotional
                  regulation skills to express frustration, overwhelm, or a need for
                  space. This is developmentally normal and does not mean something
                  is wrong with your child.
                </p>
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                  What To Do Now
                </h2>
                <ul className="space-y-2 text-sm leading-relaxed text-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary font-medium shrink-0">1.</span>
                    Stay calm and get down to your child's level. Say clearly but
                    gently: "Hitting hurts. I won't let you hurt others."
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium shrink-0">2.</span>
                    Name the feeling you think they're having — "It looks like you
                    were feeling really frustrated." This builds emotional vocabulary
                    over time.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary font-medium shrink-0">3.</span>
                    Remove them from the situation briefly so they can regulate,
                    then reconnect warmly once they're calm.
                  </li>
                </ul>
              </div>

              <div className="h-px bg-border" />

              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-primary">
                  Longer Term
                </h2>
                <p className="text-sm leading-relaxed text-foreground">
                  Build a daily habit of naming emotions together — during calm
                  moments, not just when things go wrong. Books, role play, and
                  simple check-ins like "how is your body feeling right now?" help
                  children develop the emotional language they need to express
                  themselves without hitting.
                </p>
              </div>

              <div className="h-px bg-border" />

              <Button
                className="w-full rounded-2xl"
                variant={saved ? "outline" : "default"}
                onClick={() => setSaved(true)}
              >
                <BookmarkCheck className="h-4 w-4 mr-2" />
                {saved ? "Saved!" : "Save Response"}
              </Button>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}