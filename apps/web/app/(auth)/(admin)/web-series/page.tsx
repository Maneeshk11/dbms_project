"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { getSession } from "@/server/auth";

type WebSeries = {
  seriesId: string;
  seriesName: string;
  releaseDate: string | null;
  episodeCnt: number | null;
  typeName: string;
  countryName: string;
};

type Country = {
  countryId: string;
  countryName: string;
};

type SeriesType = {
  typeId: string;
  typeName: string;
};

export default function WebSeriesPage() {
  const router = useRouter();
  const [webSeries, setWebSeries] = useState<WebSeries[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [seriesTypes, setSeriesTypes] = useState<SeriesType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    seriesId: "",
    seriesName: "",
    releaseDate: "",
    episodeCnt: "",
    typeId: "",
    countryId: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch data sequentially to avoid exhausting the database connection pool
        const seriesRes = await fetch("/api/web-series");
        if (!seriesRes.ok) throw new Error("Failed to fetch web series");
        const seriesData = await seriesRes.json();
        setWebSeries(seriesData);

        const countriesRes = await fetch("/api/countries");
        if (!countriesRes.ok) throw new Error("Failed to fetch countries");
        const countriesData = await countriesRes.json();
        setCountries(countriesData);

        const typesRes = await fetch("/api/series-types");
        if (!typesRes.ok) throw new Error("Failed to fetch series types");
        const typesData = await typesRes.json();
        setSeriesTypes(typesData);

        const sessionRes = await getSession();
        setIsAdmin(
          sessionRes && "user" in sessionRes
            ? sessionRes.user?.isAdmin || false
            : false
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        seriesId: formData.seriesId,
        seriesName: formData.seriesName,
        releaseDate: formData.releaseDate || null,
        episodeCnt: formData.episodeCnt ? parseInt(formData.episodeCnt) : null,
        typeId: formData.typeId,
        countryId: formData.countryId,
      };

      const response = await fetch("/api/web-series", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create web series");
      }

      toast.success("Web series created successfully");
      setOpen(false);
      setFormData({
        seriesId: "",
        seriesName: "",
        releaseDate: "",
        episodeCnt: "",
        typeId: "",
        countryId: "",
      });

      // Refresh list
      const seriesRes = await fetch("/api/web-series");
      const seriesData = await seriesRes.json();
      setWebSeries(seriesData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold">Web Series</h1>
          <p className="text-muted-foreground">
            Total: {webSeries.length} series
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Web Series
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Web Series</DialogTitle>
                  <DialogDescription>
                    Add a new web series to the database.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seriesId">Series ID *</Label>
                      <Input
                        id="seriesId"
                        value={formData.seriesId}
                        onChange={(e) =>
                          setFormData({ ...formData, seriesId: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seriesName">Series Name *</Label>
                      <Input
                        id="seriesName"
                        value={formData.seriesName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seriesName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="typeId">Series Type *</Label>
                      <select
                        id="typeId"
                        value={formData.typeId}
                        onChange={(e) =>
                          setFormData({ ...formData, typeId: e.target.value })
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        required
                      >
                        <option value="">Select a type</option>
                        {seriesTypes.map((type) => (
                          <option key={type.typeId} value={type.typeId}>
                            {type.typeName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="countryId">Country *</Label>
                      <select
                        id="countryId"
                        value={formData.countryId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            countryId: e.target.value,
                          })
                        }
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        required
                      >
                        <option value="">Select a country</option>
                        {countries.map((country) => (
                          <option
                            key={country.countryId}
                            value={country.countryId}
                          >
                            {country.countryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="releaseDate">Release Date</Label>
                      <Input
                        id="releaseDate"
                        type="date"
                        value={formData.releaseDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            releaseDate: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="episodeCnt">Episode Count</Label>
                      <Input
                        id="episodeCnt"
                        type="number"
                        min="1"
                        value={formData.episodeCnt}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            episodeCnt: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Web Series"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
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
                <TableRow
                  key={series.seriesId}
                  onClick={() => router.push(`/web-series/${series.seriesId}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">
                    {series.seriesId}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {series.seriesName}
                  </TableCell>
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
