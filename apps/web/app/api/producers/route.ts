import { NextResponse } from "next/server";
import { db, eq } from "@workspace/drizzle";
import { jhmProducer, jhmCountry } from "@workspace/drizzle/jhm";
import { auth } from "@workspace/auth/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const producers = await db
      .select({
        producerId: jhmProducer.producerId,
        firstName: jhmProducer.firstName,
        lastName: jhmProducer.lastName,
        phoneNo: jhmProducer.phoneNo,
        emailAddr: jhmProducer.emailAddr,
        streetAddr: jhmProducer.streetAddr,
        city: jhmProducer.city,
        state: jhmProducer.state,
        zipCode: jhmProducer.zipCode,
        countryName: jhmCountry.countryName,
      })
      .from(jhmProducer)
      .leftJoin(jhmCountry, eq(jhmProducer.countryId, jhmCountry.countryId));

    return NextResponse.json(producers);
  } catch (error) {
    console.error("Error fetching producers:", error);
    return NextResponse.json(
      { error: "Failed to fetch producers" },
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
      producerId,
      firstName,
      lastName,
      phoneNo,
      emailAddr,
      streetAddr,
      city,
      state,
      zipCode,
      countryId,
    } = body;

    // Validate required fields
    if (
      !producerId ||
      !firstName ||
      !lastName ||
      !phoneNo ||
      !emailAddr ||
      !streetAddr ||
      !city ||
      !state ||
      !zipCode ||
      !countryId
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Insert new producer
    await db.insert(jhmProducer).values({
      producerId,
      firstName,
      lastName,
      phoneNo,
      emailAddr,
      streetAddr,
      city,
      state,
      zipCode,
      countryId,
    });

    return NextResponse.json(
      { message: "Producer created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating producer:", error);
    return NextResponse.json(
      { error: "Failed to create producer" },
      { status: 500 }
    );
  }
}
