import { NextResponse } from "next/server";
import { db, eq, and } from "@workspace/drizzle";
import { jhmFeedback, jhmViewerAct } from "@workspace/drizzle/jhm";
import { auth } from "@workspace/auth/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;

    const feedback = await db
      .select({
        feedbackId: jhmFeedback.feedbackId,
        rating: jhmFeedback.rating,
        feedbackTxt: jhmFeedback.feedbackTxt,
        feedbackDate: jhmFeedback.feedbackDate,
        viewerName: jhmViewerAct.firstName,
        viewerLastName: jhmViewerAct.lastName,
        viewerId: jhmFeedback.viewerId,
      })
      .from(jhmFeedback)
      .leftJoin(jhmViewerAct, eq(jhmFeedback.viewerId, jhmViewerAct.viewerId))
      .where(eq(jhmFeedback.seriesId, seriesId))
      .orderBy(jhmFeedback.feedbackDate);

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const body = await request.json();
    const { rating, feedbackTxt } = body;

    // Get current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get viewer account for current user
    const viewer = await db
      .select({ viewerId: jhmViewerAct.viewerId })
      .from(jhmViewerAct)
      .where(eq(jhmViewerAct.userId, session.user.id))
      .limit(1);

    if (viewer.length === 0) {
      return NextResponse.json(
        { error: "No viewer account found for user" },
        { status: 404 }
      );
    }

    const viewerId = viewer[0]?.viewerId;
    if (!viewerId) {
      return NextResponse.json(
        { error: "Invalid viewer account" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!rating || !feedbackTxt) {
      return NextResponse.json(
        { error: "Rating and feedback text are required" },
        { status: 400 }
      );
    }

    // Validate rating is between 1 and 5
    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Generate feedback ID and date
    const feedbackId = uuidv4();
    const feedbackDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Insert new feedback
    await db.insert(jhmFeedback).values({
      feedbackId: feedbackId,
      rating: String(ratingNum),
      feedbackTxt: feedbackTxt as string,
      feedbackDate: feedbackDate,
      seriesId: seriesId,
      viewerId: viewerId as string,
    } as any); // Type assertion to bypass schema mismatch

    return NextResponse.json(
      { message: "Feedback created successfully", feedbackId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    await params; // seriesId not needed for PUT, but we await params for Next.js 15
    const body = await request.json();
    const { feedbackId, rating, feedbackTxt } = body;

    // Get current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get viewer account for current user
    const viewer = await db
      .select({ viewerId: jhmViewerAct.viewerId })
      .from(jhmViewerAct)
      .where(eq(jhmViewerAct.userId, session.user.id))
      .limit(1);

    if (viewer.length === 0) {
      return NextResponse.json(
        { error: "No viewer account found for user" },
        { status: 404 }
      );
    }

    const viewerId = viewer[0]?.viewerId;
    if (!viewerId) {
      return NextResponse.json(
        { error: "Invalid viewer account" },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!feedbackId || !rating || !feedbackTxt) {
      return NextResponse.json(
        { error: "feedbackId, rating, and feedbackTxt are required" },
        { status: 400 }
      );
    }

    // Check if the feedback belongs to the current user
    const existingFeedback = await db
      .select({ viewerId: jhmFeedback.viewerId })
      .from(jhmFeedback)
      .where(eq(jhmFeedback.feedbackId, feedbackId))
      .limit(1);

    if (existingFeedback.length === 0) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
      );
    }

    if (existingFeedback[0]?.viewerId !== viewerId) {
      return NextResponse.json(
        { error: "You can only edit your own feedback" },
        { status: 403 }
      );
    }

    // Validate rating is between 1 and 5
    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Update feedback
    await db
      .update(jhmFeedback)
      .set({
        rating: String(ratingNum), // numeric type expects string
        feedbackTxt,
        feedbackDate: new Date().toISOString().split("T")[0], // Update date on edit
      })
      .where(
        and(
          eq(jhmFeedback.feedbackId, feedbackId),
          eq(jhmFeedback.viewerId, viewerId)
        )
      );

    return NextResponse.json(
      { message: "Feedback updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { error: "Failed to update feedback" },
      { status: 500 }
    );
  }
}
