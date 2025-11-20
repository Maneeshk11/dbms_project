import { NextResponse } from "next/server";
import { db, eq } from "@workspace/drizzle";
import { jhmProdHouse, jhmCountry } from "@workspace/drizzle/jhm";
import { auth } from "@workspace/auth/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const productionHouses = await db
      .select({
        houseId: jhmProdHouse.houseId,
        houseName: jhmProdHouse.houseName,
        yearEstab: jhmProdHouse.yearEstab,
        streetAddr: jhmProdHouse.streetAddr,
        city: jhmProdHouse.city,
        state: jhmProdHouse.state,
        zipCode: jhmProdHouse.zipCode,
        countryName: jhmCountry.countryName,
      })
      .from(jhmProdHouse)
      .leftJoin(jhmCountry, eq(jhmProdHouse.countryId, jhmCountry.countryId));

    return NextResponse.json(productionHouses);
  } catch (error) {
    console.error("Error fetching production houses:", error);
    return NextResponse.json(
      { error: "Failed to fetch production houses" },
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
      houseId,
      houseName,
      yearEstab,
      streetAddr,
      city,
      state,
      zipCode,
      countryId,
    } = body;

    // Validate required fields
    if (
      !houseId ||
      !houseName ||
      !yearEstab ||
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

    // Insert new production house
    await db.insert(jhmProdHouse).values({
      houseId,
      houseName,
      yearEstab,
      streetAddr,
      city,
      state,
      zipCode,
      countryId,
    });

    return NextResponse.json(
      { message: "Production house created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating production house:", error);
    return NextResponse.json(
      { error: "Failed to create production house" },
      { status: 500 }
    );
  }
}
