import { NextResponse } from "next/server";
import { db, eq } from "@workspace/drizzle";
import {
  jhmWebSeries,
  jhmCountry,
  jhmSeriesType,
  jhmEpisode,
  jhmWsDubbing,
  jhmWsSubtitle,
  jhmWsRelease,
  jhmFeedback,
  jhmContract,
  jhmProdHouse,
  jhmLanguage,
  jhmViewerAct,
} from "@workspace/drizzle/jhm";

export async function GET(
  request: Request,
  { params }: { params: { seriesId: string } }
) {
  try {
    const { seriesId } = params;

    // Fetch basic series info
    const seriesData = await db
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
      .leftJoin(jhmSeriesType, eq(jhmWebSeries.typeId, jhmSeriesType.typeId))
      .where(eq(jhmWebSeries.seriesId, seriesId))
      .limit(1);

    if (seriesData.length === 0) {
      return NextResponse.json(
        { error: "Web series not found" },
        { status: 404 }
      );
    }

    // Fetch episodes
    const episodes = await db
      .select({
        episodeId: jhmEpisode.episodeId,
        epNumber: jhmEpisode.epNumber,
        epTitle: jhmEpisode.epTitle,
        plannedStart: jhmEpisode.plannedStart,
        plannedEnd: jhmEpisode.plannedEnd,
        viewersCount: jhmEpisode.viewersCount,
      })
      .from(jhmEpisode)
      .where(eq(jhmEpisode.seriesId, seriesId))
      .orderBy(jhmEpisode.epNumber);

    // Fetch dubbing languages
    const dubbingLanguages = await db
      .select({
        languageName: jhmLanguage.langName,
        languageCode: jhmLanguage.langCode,
      })
      .from(jhmWsDubbing)
      .leftJoin(
        jhmLanguage,
        eq(jhmWsDubbing.languageId, jhmLanguage.languageId)
      )
      .where(eq(jhmWsDubbing.seriesId, seriesId));

    // Fetch subtitle languages
    const subtitleLanguages = await db
      .select({
        languageName: jhmLanguage.langName,
        languageCode: jhmLanguage.langCode,
      })
      .from(jhmWsSubtitle)
      .leftJoin(
        jhmLanguage,
        eq(jhmWsSubtitle.languageId, jhmLanguage.languageId)
      )
      .where(eq(jhmWsSubtitle.seriesId, seriesId));

    // Fetch release information
    const releases = await db
      .select({
        releaseDate: jhmWsRelease.releaseDate,
        countryName: jhmCountry.countryName,
      })
      .from(jhmWsRelease)
      .leftJoin(jhmCountry, eq(jhmWsRelease.countryId, jhmCountry.countryId))
      .where(eq(jhmWsRelease.seriesId, seriesId));

    // Fetch feedback
    const feedback = await db
      .select({
        feedbackId: jhmFeedback.feedbackId,
        rating: jhmFeedback.rating,
        feedbackTxt: jhmFeedback.feedbackTxt,
        feedbackDate: jhmFeedback.feedbackDate,
        viewerName: jhmViewerAct.firstName,
        viewerLastName: jhmViewerAct.lastName,
      })
      .from(jhmFeedback)
      .leftJoin(jhmViewerAct, eq(jhmFeedback.viewerId, jhmViewerAct.viewerId))
      .where(eq(jhmFeedback.seriesId, seriesId))
      .orderBy(jhmFeedback.feedbackDate);

    // Fetch contracts
    const contracts = await db
      .select({
        contractId: jhmContract.contractId,
        contractYear: jhmContract.contractYear,
        startDate: jhmContract.startDate,
        endDate: jhmContract.endDate,
        perEpFee: jhmContract.perEpFee,
        statusCode: jhmContract.statusCode,
        isRenewed: jhmContract.isRenewed,
        houseName: jhmProdHouse.houseName,
      })
      .from(jhmContract)
      .leftJoin(jhmProdHouse, eq(jhmContract.houseId, jhmProdHouse.houseId))
      .where(eq(jhmContract.seriesId, seriesId));

    // Calculate average rating
    const avgRating =
      feedback.length > 0
        ? feedback.reduce((sum, f) => sum + Number(f.rating), 0) /
          feedback.length
        : 0;

    return NextResponse.json({
      series: seriesData[0],
      episodes,
      dubbingLanguages,
      subtitleLanguages,
      releases,
      feedback,
      contracts,
      avgRating: avgRating.toFixed(1),
    });
  } catch (error) {
    console.error("Error fetching web series details:", error);
    return NextResponse.json(
      { error: "Failed to fetch web series details" },
      { status: 500 }
    );
  }
}
