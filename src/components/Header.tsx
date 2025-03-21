import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/ModeToggle";
import { getUser } from "@/auth/server";
import { AuthButtons } from "@/components/AuthButtons";
import { getUserDetails } from "@/app/actions/users";
import { User } from "@supabase/supabase-js";

async function Header() {
  const user = await getUser();
  let userDetails:
    | {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        username: string;
        email: string;
      }
    | undefined;
  if (user) {
    const response = await getUserDetails(user.id);
    if (response.success) {
      userDetails = response.user;
    }
  }
  return (
    <header className="flex w-full items-center justify-between">
      <Link href={"/"} className="flex items-center gap-2">
        <Image
          src={"/logo.png"}
          alt="Scroll Notes"
          width={40}
          height={40}
          className="-rotate-y-180 dark:invert"
        />
        <h1 className="font-heading hidden flex-col items-start gap-0 text-lg leading-none font-bold sm:flex">
          Scroll
          <span className="text-muted-foreground tracking-[0.1em]">Notes</span>
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        <AuthButtons user={user} userDetails={userDetails} />
        <ModeToggle />
      </div>
    </header>
  );
}

export default Header;
