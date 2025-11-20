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

type WebSeries = {
  seriesId: string;
  seriesName: string;
  releaseDate: string | null;
  episodeCnt: number | null;
  typeName: string;
  countryName: string;
};

export default function WebSeriesPage() {
  const [webSeries, setWebSeries] = useState<WebSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWebSeries() {
      try {
        const response = await fetch("/api/web-series");
        if (!response.ok) {
          throw new Error("Failed to fetch web series");
        }
        const data = await response.json();
        setWebSeries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchWebSeries();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold mb-4">Web Series</h1>
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
        <h1 className="text-3xl font-bold mb-4">Web Series</h1>
        <Card className="p-6">
          <p className="text-red-500">Error: {error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Web Series</h1>
        <p className="text-muted-foreground">
          Total: {webSeries.length} series
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Series ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Episodes</TableHead>
              <TableHead>Country</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webSeries.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No web series found
                </TableCell>
              </TableRow>
            ) : (
              webSeries.map((series) => (
                <TableRow key={series.seriesId}>
                  <TableCell className="font-medium">
                    {series.seriesId}
                  </TableCell>
                  <TableCell>{series.seriesName}</TableCell>
                  <TableCell>{series.typeName || "N/A"}</TableCell>
                  <TableCell>
                    {series.releaseDate
                      ? new Date(series.releaseDate).toLocaleDateString()
                      : "TBA"}
                  </TableCell>
                  <TableCell>{series.episodeCnt || "N/A"}</TableCell>
                  <TableCell>{series.countryName || "N/A"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
