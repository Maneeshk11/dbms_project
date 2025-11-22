import { NextResponse } from "next/server";
import { db, eq } from "@workspace/drizzle";
import { jhmViewerAct, jhmCountry } from "@workspace/drizzle/jhm";
import { auth } from "@workspace/auth/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userName = session.user.name || "Unknown User";
    const userEmail = session.user.email || "unknown@example.com";

    // Check if viewer account already exists
    const existingViewer = await db
      .select()
      .from(jhmViewerAct)
      .where(eq(jhmViewerAct.userId, userId))
      .limit(1);

    if (existingViewer.length > 0) {
      return NextResponse.json(
        {
          message: "Viewer account already exists",
          viewerId: existingViewer[0]?.viewerId,
        },
        { status: 200 }
      );
    }

    // Get a default country
    const defaultCountry = await db
      .select({ countryId: jhmCountry.countryId })
      .from(jhmCountry)
      .limit(1);

    if (defaultCountry.length === 0) {
      return NextResponse.json(
        { error: "No countries available in database" },
        { status: 500 }
      );
    }

    const defaultCountryId = defaultCountry[0]?.countryId;
    if (!defaultCountryId) {
      return NextResponse.json(
        { error: "Invalid country data" },
        { status: 500 }
      );
    }

    // Create viewer account
    const viewerId = uuidv4();
    const accountId = `acc_${userId.slice(0, 8)}`;

    // Parse name into first and last name
    const nameParts = userName.split(" ");
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.slice(1).join(" ") || "User";

    await db.insert(jhmViewerAct).values({
      viewerId,
      userId,
      accountId,
      firstName,
      lastName,
      streetAddr: "Address not provided",
      city: "City not provided",
      state: "State not provided",
      zipCode: 10001, // Must be > 0
      openDate: new Date().toISOString().split("T")[0],
      emailAddr: userEmail,
      monthlyFee: 0,
      countryId: defaultCountryId,
    } as any);

    return NextResponse.json(
      { message: "Viewer account created successfully", viewerId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating viewer account:", error);
    return NextResponse.json(
      { error: "Failed to create viewer account" },
      { status: 500 }
    );
  }
}
