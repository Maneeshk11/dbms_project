import { NextResponse } from "next/server";
import { db } from "@workspace/drizzle";
import { jhmSeriesType } from "@workspace/drizzle/jhm";

export async function GET() {
  try {
    const seriesTypes = await db.select().from(jhmSeriesType);
    return NextResponse.json(seriesTypes);
  } catch (error) {
    console.error("Error fetching series types:", error);
    return NextResponse.json(
      { error: "Failed to fetch series types" },
      { status: 500 }
    );
  }
}
