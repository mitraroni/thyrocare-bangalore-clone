import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
 
export async function middleware(request: NextRequest) {
  // Temporarily allow all requests to pass through to prevent login redirect loops
  return NextResponse.next();
}
 
export const config = {
  // Disable middleware by not matching any routes
  matcher: [],
};