import { NextResponse } from "next/server";
import { db, eq } from "@workspace/drizzle";
import { jhmProducer, jhmCountry } from "@workspace/drizzle/jhm";

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
