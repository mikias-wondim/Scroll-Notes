"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/users";
interface LogoutButtonProps {
  variant?: "default" | "outline" | "ghost" | "link";
  className?: string;
}

function LogoutButton({ className, variant = "outline" }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);

    const result = await logout();

    if (result.success) {
      toast.success("Logged out successfully", {
        description: "You have been logged out successfully",
      });
    } else {
      toast.error("Failed to log out", {
        description: result.error,
      });
    }

    router.replace("/login");

    setLoading(false);
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      className={cn(className, "px-1.5 text-xs")}
      disabled={loading}
      size="sm"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Log Out"}
    </Button>
  );
}

export default LogoutButton;
