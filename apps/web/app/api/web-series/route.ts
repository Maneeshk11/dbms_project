import { NextResponse } from "next/server";
import { db, eq } from "@workspace/drizzle";
import {
  jhmWebSeries,
  jhmCountry,
  jhmSeriesType,
} from "@workspace/drizzle/jhm";
import { auth } from "@workspace/auth/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const webSeries = await db
      .select({
        seriesId: jhmWebSeries.seriesId,
        seriesName: jhmWebSeries.seriesName,
        releaseDate: jhmWebSeries.releaseDate,
        episodeCnt: jhmWebSeries.episodeCnt,
        typeName: jhmSeriesType.typeName,
        countryName: jhmCountry.countryName,
      })
      .from(jhmWebSeries)
      .leftJoin(jhmCountry, eq(jhmWebSeries.countryId, jhmCountry.countryId))
      .leftJoin(jhmSeriesType, eq(jhmWebSeries.typeId, jhmSeriesType.typeId));

    return NextResponse.json(webSeries);
  } catch (error) {
    console.error("Error fetching web series:", error);
    return NextResponse.json(
      { error: "Failed to fetch web series" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { seriesId, seriesName, releaseDate, episodeCnt, typeId, countryId } =
      body;

    // Validate required fields
    if (!seriesId || !seriesName || !typeId || !countryId) {
      return NextResponse.json(
        { error: "seriesId, seriesName, typeId, and countryId are required" },
        { status: 400 }
      );
    }

    // Insert new web series
    await db.insert(jhmWebSeries).values({
      seriesId,
      seriesName,
      releaseDate: releaseDate || null,
      episodeCnt: episodeCnt || null,
      typeId,
      countryId,
    });

    return NextResponse.json(
      { message: "Web series created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating web series:", error);
    return NextResponse.json(
      { error: "Failed to create web series" },
      { status: 500 }
    );
  }
}
