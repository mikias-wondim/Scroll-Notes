"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import LogoutButton from "./LogoutButton";
import { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

interface AuthButtonsProps {
  user: User | null;
}

export function AuthButtons({ user }: AuthButtonsProps) {
  const pathname = usePathname();
  const isLogin = pathname === "/login" || pathname === "/signup";
  return (
    <div className="flex gap-4">
      {user ? (
        <LogoutButton variant="outline" />
      ) : (
        !isLogin && (
          <>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </>
        )
      )}
    </div>
  );
}
