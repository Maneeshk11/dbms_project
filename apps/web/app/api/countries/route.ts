import { NextResponse } from "next/server";
import { db } from "@workspace/drizzle";
import { jhmCountry } from "@workspace/drizzle/jhm";

export async function GET() {
  try {
    const countries = await db.select().from(jhmCountry);
    return NextResponse.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    return NextResponse.json(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}
