"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/TopNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handlePasswordChange = () => {
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordError("");
    setShowPasswordForm(false);
    // password update logic coming later
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="space-y-6">

          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your account and preferences.
            </p>
          </div>

          {/* Account */}
          <Card className="rounded-3xl border-border/60 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold">Account</h2>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                  Email
                </p>
                <p className="text-sm">parent@example.com</p>
              </div>

              {!showPasswordForm ? (
                <Button
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setShowPasswordForm(true)}
                >
                  Change Password
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">New Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="rounded-2xl"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="rounded-2xl"
                      onClick={handlePasswordChange}
                    >
                      Update Password
                    </Button>
                    <Button
                      variant="ghost"
                      className="rounded-2xl"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Privacy Notice */}
          <Card className="rounded-3xl border-border/60 shadow-sm">
            <CardContent className="p-6 space-y-2">
              <h2 className="font-semibold">Privacy Notice</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                ParentWise collects your email address, child profiles, and the
                questions you ask. This information is used solely to personalise
                your parenting advice. Your questions are processed by OpenAI to
                generate responses. We do not sell or share your data with any
                third parties. You can delete your account and all associated data
                at any time from this page.
              </p>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="rounded-3xl border-destructive/30 shadow-sm">
            <CardContent className="p-6 space-y-3">
              <h2 className="font-semibold text-destructive">Danger Zone</h2>
              <p className="text-sm text-muted-foreground">
                Deleting your account is permanent and cannot be undone. All your
                child profiles and saved responses will be deleted immediately.
              </p>
              <Button
                variant="destructive"
                className="rounded-2xl"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </Button>
            </CardContent>
          </Card>

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <Card className="rounded-3xl border-border/60 shadow-lg w-full max-w-sm">
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg">Are you sure?</h2>
              <p className="text-sm text-muted-foreground">
                This will permanently delete your account, all child profiles,
                and all saved responses. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="rounded-2xl flex-1"
                  onClick={() => {
                    // delete account logic coming later
                    router.push("/login");
                  }}
                >
                  Yes, delete everything
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl flex-1"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}