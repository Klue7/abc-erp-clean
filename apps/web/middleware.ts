import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCurrentUserWithRole, hasCustomerAccess } from "./lib/auth";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

const isCustomerRoute = createRouteMatcher(["/customers(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (process.env.NEXT_PUBLIC_BYPASS_AUTH === "1") return;
  if (isPublicRoute(req)) return;
  
  auth.protect();
  
  if (isCustomerRoute(req) && process.env.NEXT_PUBLIC_BYPASS_AUTH !== "1") {
    try {
      const user = await getCurrentUserWithRole();
      if (!user || !hasCustomerAccess(user.role)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch (error) {
      console.error("Error checking user role:", error);
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)","/","/(api|trpc)(.*)"],
};
