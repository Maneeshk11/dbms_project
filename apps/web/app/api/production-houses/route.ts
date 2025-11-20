import { NextResponse } from "next/server";
import { db, eq } from "@workspace/drizzle";
import { jhmProdHouse, jhmCountry } from "@workspace/drizzle/jhm";

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
