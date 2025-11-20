import { NextResponse } from "next/server";
import { db } from "@workspace/drizzle";
import { jhmViewerAct } from "@workspace/drizzle/jhm";

export async function GET() {
  try {
    const viewers = await db.select().from(jhmViewerAct);
    return NextResponse.json(viewers);
  } catch (error) {
    console.error("Error fetching viewers:", error);
    return NextResponse.json(
      { error: "Failed to fetch viewers" },
      { status: 500 }
    );
  }
}
