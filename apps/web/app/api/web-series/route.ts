import { NextResponse } from "next/server";
import { db, eq } from "@workspace/drizzle";
import {
  jhmWebSeries,
  jhmCountry,
  jhmSeriesType,
} from "@workspace/drizzle/jhm";

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
