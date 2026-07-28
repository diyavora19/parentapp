"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

type Child = {
  id: string;
  name: string;
  age: number;
  notes: string | null;
};

export default function ProfilesPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChildren = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session user:", session?.user?.id);

      const { data, error } = await supabase
        .from("children")
        .select("*")
        .order("created_at", { ascending: true });

      console.log("Data:", data);
      console.log("Error:", error);

      if (error) {
        setError("Could not load profiles");
      } else {
        setChildren(data || []);
      }
      setLoading(false);
    };

    fetchChildren();
  }, []);

  const handleDelete = async (id: string) => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase
      .from("children")
      .delete()
      .eq("id", id);

    if (!error) {
      setChildren(children.filter((c) => c.id !== id));
    }
  };

  const canAdd = children.length < 3;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="space-y-6">

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">Child Profiles</h1>
              <p className="text-muted-foreground text-sm">
                Add up to 3 children to personalise your advice.
              </p>
            </div>
            <Button
              className="rounded-2xl"
              disabled={!canAdd}
              onClick={() => router.push("/profiles/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Child
            </Button>
          </div>

          {loading ? (
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="flex items-center justify-center py-16">
                <p className="text-muted-foreground text-sm">Loading profiles...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="flex items-center justify-center py-16">
                <p className="text-destructive text-sm">{error}</p>
              </CardContent>
            </Card>
          ) : children.length === 0 ? (
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <p className="text-muted-foreground text-sm">
                  You haven't added any children yet.
                </p>
                <Button
                  className="rounded-2xl"
                  onClick={() => router.push("/profiles/new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add your first child
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {children.map((child) => (
                <Card key={child.id} className="rounded-3xl border-border/60 shadow-sm">
                  <CardContent className="flex items-start justify-between p-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-lg">{child.name}</h2>
                        <span className="text-sm text-muted-foreground">
                          · {child.age} years old
                        </span>
                      </div>
                      {child.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {child.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-2xl"
                        onClick={() => router.push(`/profiles/${child.id}/edit`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-2xl text-destructive hover:text-destructive"
                        onClick={() => handleDelete(child.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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