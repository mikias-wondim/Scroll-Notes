import type { Metadata } from "next";
import "@/styles/globals.css";
import { ThemeProvider } from "@/providers/ThemeProviders";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/Header";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
export const metadata: Metadata = {
  title: "Scroll Notes",
  description: "Modern notes app for your browser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-primary antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SidebarProvider>
            <AppSidebar />
            <div className="flex min-h-screen w-full flex-col">
              <div className="bg-background/80 supports-[backdrop-filter]:bg-background/60 dark:shadow-background/30 m:px-8 sticky top-0 right-0 left-0 z-50 flex h-16 w-full items-center gap-4 space-x-0 border-b px-3 shadow-sm backdrop-blur-sm dark:shadow-sm">
                <SidebarTrigger className="" />
                <Header />
              </div>
              <div className="flex flex-1 flex-col px-4 pt-10 xl:px-0">
                {children}
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
