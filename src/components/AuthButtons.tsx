"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import LogoutButton from "./LogoutButton";
import { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
interface AuthButtonsProps {
  user: User | null;
  userDetails:
    | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        username: string;
        email: string;
      }
    | undefined;
}

export function AuthButtons({ user, userDetails }: AuthButtonsProps) {
  const pathname = usePathname();
  const isLogin = pathname === "/login" || pathname === "/signup";
  return (
    <div className="flex gap-4">
      {user ? (
        <div className="flex items-center gap-2">
          {userDetails && <span>{userDetails.username}</span>}
          <LogoutButton variant="outline" />
        </div>
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
