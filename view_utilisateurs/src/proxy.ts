import { type NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from "@/i18n/routing";
import { runMiddlewares } from "./utils/middleware-utils";
 
// Middleware de next-intl
const intlMiddleware = createMiddleware(routing);
 
export async function proxy(request: NextRequest) {
  return await runMiddlewares(request, [
    async (req) => intlMiddleware(req), // Exécuter le middleware de next-intl
    // Autres middlewares
  ]);
}
 
export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|trpc|_next|_vercel|.*\\..*|manifest\\.webmanifest).*)',
 
    // Match all pathnames within `{/:locale}/users`
    // However, match all pathnames within `/users`, optionally with a locale prefix
    '/([\\w-]+)?/users/(.+)',
 
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
  ],
};