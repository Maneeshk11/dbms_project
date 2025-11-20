"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Card } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";

type ProductionHouse = {
  houseId: string;
  houseName: string;
  yearEstab: string;
  streetAddr: string;
  city: string;
  state: string;
  zipCode: string;
  countryName: string;
};

export default function ProductionHousesPage() {
  const [productionHouses, setProductionHouses] = useState<ProductionHouse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProductionHouses() {
      try {
        const response = await fetch("/api/production-houses");
        if (!response.ok) {
          throw new Error("Failed to fetch production houses");
        }
        const data = await response.json();
        setProductionHouses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchProductionHouses();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold mb-4">Production Houses</h1>
        <Card className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-4">Production Houses</h1>
        <Card className="p-6">
          <p className="text-red-500">Error: {error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Production Houses</h1>
        <p className="text-muted-foreground">
          Total: {productionHouses.length} production houses
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>House ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Year Established</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Country</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productionHouses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No production houses found
                </TableCell>
              </TableRow>
            ) : (
              productionHouses.map((house) => (
                <TableRow key={house.houseId}>
                  <TableCell className="font-medium">{house.houseId}</TableCell>
                  <TableCell>{house.houseName}</TableCell>
                  <TableCell>
                    {new Date(house.yearEstab).getFullYear()}
                  </TableCell>
                  <TableCell>
                    {house.streetAddr}, {house.city}, {house.state}{" "}
                    {house.zipCode}
                  </TableCell>
                  <TableCell>{house.countryName || "N/A"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
