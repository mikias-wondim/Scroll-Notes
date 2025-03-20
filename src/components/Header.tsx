import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/ModeToggle";
import { getUser } from "@/auth/server";
import { AuthButtons } from "@/components/AuthButtons";

async function Header() {
  const user = await getUser();

  return (
    <header className="flex w-full items-center justify-between">
      <Link href={"/"} className="flex items-center gap-2">
        <Image
          src={"/logo.png"}
          alt="Scroll Notes"
          width={40}
          height={40}
          className="dark:invert"
        />
        <h1 className="font-heading flex flex-col items-start gap-0 text-lg leading-none font-bold">
          Scroll
          <span className="text-muted-foreground">Notes</span>
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        <AuthButtons user={user} />
        <ModeToggle />
      </div>
    </header>
  );
}

export default Header;
