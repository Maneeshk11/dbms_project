import { NextResponse } from "next/server";
import { db, eq } from "@workspace/drizzle";
import { jhmViewerAct } from "@workspace/drizzle/jhm";
import { auth } from "@workspace/auth/auth";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Find viewer account for the current user
    const viewer = await db
      .select({
        viewerId: jhmViewerAct.viewerId,
        firstName: jhmViewerAct.firstName,
        lastName: jhmViewerAct.lastName,
      })
      .from(jhmViewerAct)
      .where(eq(jhmViewerAct.userId, session.user.id))
      .limit(1);

    if (viewer.length === 0) {
      return NextResponse.json(
        { error: "No viewer account found for user" },
        { status: 404 }
      );
    }

    return NextResponse.json(viewer[0]);
  } catch (error) {
    console.error("Error fetching current viewer:", error);
    return NextResponse.json(
      { error: "Failed to fetch current viewer" },
      { status: 500 }
    );
  }
}
