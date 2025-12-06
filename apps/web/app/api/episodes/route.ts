import { NextResponse } from "next/server";
import { db, eq, sql } from "@workspace/drizzle";
import { jhmEpisode } from "@workspace/drizzle/jhm";
import { auth } from "@workspace/auth/auth";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const seriesId = searchParams.get("seriesId");
    const nextId = searchParams.get("nextId");

    // Handle fetching next available episode ID
    if (nextId === "true") {
      const maxEpisode = await db.execute(
        sql`SELECT MAX(CAST(SUBSTRING(episode_id, 2) AS INTEGER)) as max_id FROM jhm_episode WHERE episode_id LIKE 'E%'`
      );

      // Fix: Drizzle's execute returns an array-like object or specific type depending on driver
      // For postgres.js / node-postgres it is typically rows array
      const maxId = Number(maxEpisode[0]?.max_id) || 0;
      const nextEpisodeId = `E${(maxId + 1).toString().padStart(3, "0")}`;

      return NextResponse.json({ nextId: nextEpisodeId });
    }

    if (!seriesId) {
      return NextResponse.json(
        { error: "seriesId is required" },
        { status: 400 }
      );
    }

    const episodes = await db
      .select()
      .from(jhmEpisode)
      .where(eq(jhmEpisode.seriesId, seriesId))
      .orderBy(jhmEpisode.epNumber);

    return NextResponse.json(episodes);
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return NextResponse.json(
      { error: "Failed to fetch episodes" },
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
    const {
      episodeId,
      epNumber,
      epTitle,
      plannedStart,
      plannedEnd,
      viewersCount,
      seriesId,
    } = body;

    // Validate required fields
    if (!episodeId || !epNumber || !epTitle || !seriesId) {
      return NextResponse.json(
        { error: "episodeId, epNumber, epTitle, and seriesId are required" },
        { status: 400 }
      );
    }

    await db.insert(jhmEpisode).values({
      episodeId,
      epNumber,
      epTitle,
      plannedStart: plannedStart || null,
      plannedEnd: plannedEnd || null,
      viewersCount: viewersCount || 0,
      seriesId,
    });

    return NextResponse.json(
      { message: "Episode created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating episode:", error);
    return NextResponse.json(
      { error: "Failed to create episode" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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
    const {
      episodeId,
      epNumber,
      epTitle,
      plannedStart,
      plannedEnd,
      viewersCount,
      seriesId,
    } = body;

    if (!episodeId) {
      return NextResponse.json(
        { error: "episodeId is required" },
        { status: 400 }
      );
    }

    await db
      .update(jhmEpisode)
      .set({
        epNumber,
        epTitle,
        plannedStart: plannedStart || null,
        plannedEnd: plannedEnd || null,
        viewersCount: viewersCount || 0,
        seriesId,
      })
      .where(eq(jhmEpisode.episodeId, episodeId));

    return NextResponse.json(
      { message: "Episode updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating episode:", error);
    return NextResponse.json(
      { error: "Failed to update episode" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const episodeId = searchParams.get("episodeId");

    if (!episodeId) {
      return NextResponse.json(
        { error: "episodeId is required" },
        { status: 400 }
      );
    }

    await db.delete(jhmEpisode).where(eq(jhmEpisode.episodeId, episodeId));

    return NextResponse.json(
      { message: "Episode deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting episode:", error);
    return NextResponse.json(
      { error: "Failed to delete episode" },
      { status: 500 }
    );
  }
}
