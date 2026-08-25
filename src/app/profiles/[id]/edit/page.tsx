"use client";

import { useEffect, useState } from "react";
import {useRouter , useParams} from "next/navigation";
import {TopNav} from "@/components/TopNav";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent} from "@/components/ui/card";
import {createBrowserClient} from "@supabase/ssr";
import {ChevronLeft} from "lucide-react";

export default function EditChildPage() {
    const router= useRouter();
    const params = useParams();
    const id =params.id as string;

    const [name, setName]= useState("");
    const [age, setAge]= useState("");
    const [notes, setNotes]= useState("");
    const [error, setError]= useState("");
    const [loading, setLoading]= useState(false);
    const [fetching, setFetching]= useState(true);

    useEffect(() => {
        const fetchChild = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );

            const {data, error}= await supabase
                .from("children")
                .select("*")
                .eq("id", id)
                .single();
            
            if (error || !data) {
                router.push("/profiles");
                return;
            }

            setName(data.name);
            setAge(data.age.toString());
            setNotes(data.notes || "");
            setFetching(false);
        };

        fetchChild();
    }, [id]);

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
        if (!notes.trim()) {
            setError("Personality notes are required");
            return;
        }
        setLoading(true);
        setError("");

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase
            .from("children")
            .update({
                name : name.trim(),
                age : ageNum,
                notes : notes.trim(),
            })
            .eq("id", id);

        if (error) {
            setError("Could not update profile. Please try again.");
            setLoading(false);
            return;
        }

        router.push("/profiles");
    };
    
    if (fetching) {
        return (
            <div className="min-h-screen bg-background">
                <TopNav />
                <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
                    <p className="text-muted-foregorund text-sm">Loading...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <TopNav />
            <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
                <div className="space-y-6">
                    <button 
                        onClick = {() => router.push("/profiles")}
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back to Profiles
                    </button>

                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold tracking-tight">Edit Child Profile</h1>
                        <p className="text-muted-foreground text-sm">
                            Update your child's information below.
                        </p>
                    </div>

                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardContent className= "space-y-4 p-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <Input
                                    placeholder="e.g. Sophiana"
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
                                    Personality Notes
                                </label>
                                <Textarea
                                    placeholder="e.g. My child is shy and sensitive."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value.slice(0, 350))}
                                    rows={4}
                                    className="rounded-2xl resize-none"
                                />
                                <p className="text-sm text-muted-foreground text-right">
                                    {notes.length}/350
                                </p>
                            </div>
                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}
                            <Button
                                className="w-full rounded-2xl"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={!name.trim() || !age || !notes.trim() || loading}
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}