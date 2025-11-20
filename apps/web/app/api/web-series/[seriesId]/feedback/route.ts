import { NextResponse } from "next/server";
import { db, eq } from "@workspace/drizzle";
import { jhmFeedback } from "@workspace/drizzle/jhm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  try {
    const { seriesId } = await params;
    const body = await request.json();
    const { feedbackId, rating, feedbackTxt, feedbackDate, viewerId } = body;

    // Validate required fields
    if (!feedbackId || !rating || !feedbackTxt || !feedbackDate || !viewerId) {
      return NextResponse.json(
        { error: "All fields are required" },
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

    // Insert new feedback
    await db.insert(jhmFeedback).values({
      feedbackId,
      rating: String(ratingNum), // numeric type expects string
      feedbackTxt,
      feedbackDate,
      seriesId,
      viewerId,
    });

    return NextResponse.json(
      { message: "Feedback created successfully" },
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

    // Validate required fields
    if (!feedbackId || !rating || !feedbackTxt) {
      return NextResponse.json(
        { error: "feedbackId, rating, and feedbackTxt are required" },
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

    // Update feedback
    await db
      .update(jhmFeedback)
      .set({
        rating: String(ratingNum), // numeric type expects string
        feedbackTxt,
      })
      .where(eq(jhmFeedback.feedbackId, feedbackId));

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
