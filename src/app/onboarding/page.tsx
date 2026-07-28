"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createBrowserClient } from "@supabase/ssr";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "addChild">("welcome");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter your child's name");
      return;
    }
    const ageNum = parseInt(age);
    if (!age || isNaN(ageNum) || ageNum < 0 || ageNum > 18) {
      setError("Please enter a valid age between 0 and 18");
      return;
    }
    setLoading(true);
    setError("");

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error: insertError } = await supabase.from("children").insert({
      user_id: user.id,
      name: name.trim(),
      age: ageNum,
      notes: notes.trim() || null,
    });

    if (insertError) {
      setError("Could not save profile. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/home");
  };

  if (step === "welcome") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10 text-primary mx-auto">
            <Sprout className="h-8 w-8" />
          </span>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to ParentWise
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ParentWise gives you warm, grounded parenting guidance based on
              Jai Institute methodology. To get started, tell us about your child.
            </p>
          </div>
          <Button
            className="w-full rounded-2xl"
            size="lg"
            onClick={() => setStep("addChild")}
          >
            Add your first child
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Tell us about your child
          </h1>
          <p className="text-sm text-muted-foreground">
            This helps us personalise every answer for you
          </p>
        </div>

        <Card className="rounded-3xl border-border/60 shadow-sm">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Child's name</label>
              <Input
                placeholder="e.g. Amara"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 50))}
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Age</label>
              <Input
                type="number"
                placeholder="e.g. 5"
                min={0}
                max={18}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Personality notes{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Textarea
                placeholder="e.g. very sensitive, loves animals, gets overwhelmed easily..."
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                rows={4}
                className="rounded-2xl resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {notes.length}/500
              </p>
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              className="w-full rounded-2xl"
              size="lg"
              onClick={handleSubmit}
              disabled={!name.trim() || !age || loading}
            >
              {loading ? "Saving..." : "Done, let's go"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}