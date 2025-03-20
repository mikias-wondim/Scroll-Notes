import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "@/components/ModeToggle";
import { getUser } from "@/auth/server";
import { AuthButtons } from "@/components/AuthButtons";

async function Header() {
  const user = await getUser();

  return (
    <header className="m:px-8 bg-background/80 supports-[backdrop-filter]:bg-background/60 dark:shadow-background/30 sticky top-0 right-0 left-0 z-50 flex h-20 items-center justify-between border-b px-3 shadow-sm backdrop-blur-sm dark:shadow-sm">
      <Link href={"/"} className="flex items-center gap-2">
        <Image
          src={"/logo.png"}
          alt="Scroll Notes"
          width={50}
          height={50}
          className="dark:invert"
        />
        <h1 className="font-heading flex flex-col items-center gap-0 text-xl leading-none font-bold">
          Scroll
          <span className="text-muted-foreground font-light">Notes</span>
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
