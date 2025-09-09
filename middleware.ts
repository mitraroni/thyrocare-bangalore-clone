import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
  // Read bearer token from cookie and forward as Authorization header for session lookup
  const token = request.cookies.get("bearer_token")?.value;
  const headers = new Headers(request.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

	const session = await auth.api.getSession({
		headers,
	});
 
	if (!session) {
		return NextResponse.redirect(new URL("/login", request.url));
	}
 
	return NextResponse.next();
}
 
export const config = {
  matcher: ["/admin/:path*"],
};