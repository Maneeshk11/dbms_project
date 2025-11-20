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

type Producer = {
  producerId: string;
  firstName: string;
  lastName: string;
  phoneNo: string;
  emailAddr: string;
  streetAddr: string;
  city: string;
  state: string;
  zipCode: string;
  countryName: string;
};

export default function ProducersPage() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducers() {
      try {
        const response = await fetch("/api/producers");
        if (!response.ok) {
          throw new Error("Failed to fetch producers");
        }
        const data = await response.json();
        setProducers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchProducers();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold mb-4">Producers</h1>
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
        <h1 className="text-3xl font-bold mb-4">Producers</h1>
        <Card className="p-6">
          <p className="text-red-500">Error: {error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Producers</h1>
        <p className="text-muted-foreground">
          Total: {producers.length} producers
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producer ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Country</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {producers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No producers found
                </TableCell>
              </TableRow>
            ) : (
              producers.map((producer) => (
                <TableRow key={producer.producerId}>
                  <TableCell className="font-medium">
                    {producer.producerId}
                  </TableCell>
                  <TableCell>
                    {producer.firstName} {producer.lastName}
                  </TableCell>
                  <TableCell>{producer.emailAddr}</TableCell>
                  <TableCell>{producer.phoneNo}</TableCell>
                  <TableCell>
                    {producer.streetAddr}, {producer.city}, {producer.state}{" "}
                    {producer.zipCode}
                  </TableCell>
                  <TableCell>{producer.countryName || "N/A"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
