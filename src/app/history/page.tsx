"use client";

import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";

const mockHistory = [
  {
    id: "1",
    childName: "Amara",
    question: "My 5 year old keeps hitting other kids at daycare.",
    whatsHappening: "At this age, hitting is often a communication problem. Your child may not yet have the words to express frustration or overwhelm.",
    whatToDoNow: "Stay calm, get to their level, and say clearly: 'Hitting hurts. I won't let you hurt others.' Name the feeling you think they're having.",
    longerTerm: "Build a daily habit of naming emotions together during calm moments — books, role play, and simple check-ins help children develop emotional language.",
    savedAt: "Today",
  },
  {
    id: "2",
    childName: "Kofi",
    question: "My 8 year old refuses to do homework every single evening.",
    whatsHappening: "After a full school day, children are often mentally exhausted. Homework resistance is frequently about depletion, not defiance.",
    whatToDoNow: "Allow a 30-45 minute break after school before starting homework. Sit nearby for connection without hovering.",
    longerTerm: "Work together to create a consistent after-school routine that includes movement, a snack, and downtime before homework begins.",
    savedAt: "Yesterday",
  },
];

export default function HistoryPage() {
  const [history, setHistory] = useState(mockHistory);
  const [expanded, setExpanded] = useState<string | null>(null);

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

          {history.length === 0 ? (
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
                          {item.childName} · {item.savedAt}
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
                          onClick={() =>
                            setHistory(history.filter((h) => h.id !== item.id))
                          }
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
                          <p className="text-sm leading-relaxed">{item.whatsHappening}</p>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                            What To Do Now
                          </h3>
                          <p className="text-sm leading-relaxed">{item.whatToDoNow}</p>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                            Longer Term
                          </h3>
                          <p className="text-sm leading-relaxed">{item.longerTerm}</p>
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