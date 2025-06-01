"use client";

import { useUser } from "@clerk/clerk-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Settings, Shield } from "lucide-react";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { user } = useUser();

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Avatar and Basic Info */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                {user.firstName?.[0] ||
                  user.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}
              </div>
              <CardTitle className="text-xl">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.firstName || "User"}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" />
                {user.emailAddresses[0]?.emailAddress}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Account Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">User ID</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {user.id.slice(0, 8)}...
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Member since
                </span>
                <span className="text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(user.createdAt!).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Email verified
                </span>
                <Badge
                  variant={
                    user.emailAddresses[0]?.verification?.status === "verified"
                      ? "default"
                      : "destructive"
                  }
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {user.emailAddresses[0]?.verification?.status === "verified"
                    ? "Verified"
                    : "Unverified"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Two-factor auth
                </span>
                <Badge
                  variant={user.twoFactorEnabled ? "default" : "secondary"}
                >
                  {user.twoFactorEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // Open Clerk's user profile modal
                window.open(`${window.location.origin}/user`, "_blank");
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Account
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
