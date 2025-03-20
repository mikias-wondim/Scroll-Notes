import { getUser } from "@/auth/server";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { prisma } from "@/db/prisma";
import { Note } from "@prisma/client";
import Link from "next/link";
import SidebarGroupContent from "./SidebarGroupContent";

async function AppSidebar() {
  const user = await getUser();

  let notes: Note[] = [];
  if (user) {
    notes = await prisma.note.findMany({
      where: {
        authorId: user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  return (
    <Sidebar>
      <SidebarHeader className="mt-3 mb-2 text-center text-lg">
        {user ? (
          "Your Notes"
        ) : (
          <p>
            <Link href="/login" className="underline">
              Login
            </Link>{" "}
            to see your notes
          </p>
        )}
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar border-t">
        <SidebarGroup>
          {user && <SidebarGroupContent notes={notes} />}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
