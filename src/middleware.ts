import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  try {
    const response = await updateSession(request);
    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    // Return the original request on error instead of failing
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const isAuthRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup";

  if (isAuthRoute) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Continue without redirecting
    }
  }

  const { searchParams, pathname } = new URL(request.url);

  if (!searchParams.get("noteId") && pathname === "/") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          // Add timeout to fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

          const fetchNewestNote = async () => {
            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/fetch-newest-note?userId=${user.id}`,
                { signal: controller.signal },
              );
              clearTimeout(timeoutId);

              if (!response.ok) {
                throw new Error(
                  `API responded with status: ${response.status}`,
                );
              }

              return await response.json();
            } catch (error) {
              console.error("Failed to fetch newest note:", error);
              return { newestNoteId: null };
            }
          };

          const { newestNoteId } = await fetchNewestNote();

          if (newestNoteId) {
            const url = request.nextUrl.clone();
            url.searchParams.set("noteId", newestNoteId);
            return NextResponse.redirect(url);
          } else {
            // Add timeout to second fetch request
            const createController = new AbortController();
            const createTimeoutId = setTimeout(
              () => createController.abort(),
              5000,
            );

            try {
              const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/create-new-note?userId=${user.id}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  signal: createController.signal,
                },
              );
              clearTimeout(createTimeoutId);

              if (!response.ok) {
                throw new Error(
                  `API responded with status: ${response.status}`,
                );
              }

              const { noteId } = await response.json();
              const url = request.nextUrl.clone();
              url.searchParams.set("noteId", noteId);
              return NextResponse.redirect(url);
            } catch (error) {
              console.error("Failed to create new note:", error);
              // Continue without a noteId rather than failing
            }
          }
        } catch (error) {
          console.error("Note fetching error:", error);
          // Continue without a noteId rather than failing
        }
      }
    } catch (error) {
      console.error("User check error:", error);
      // Continue without redirecting
    }
  }

  return supabaseResponse;
}
