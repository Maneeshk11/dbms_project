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

type Country = {
  countryId: string;
  countryName: string;
};

export default function ProductionHousesPage() {
  const [productionHouses, setProductionHouses] = useState<ProductionHouse[]>(
    []
  );
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    houseId: "",
    houseName: "",
    yearEstab: "",
    streetAddr: "",
    city: "",
    state: "",
    zipCode: "",
    countryId: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [housesRes, countriesRes, sessionRes] = await Promise.all([
          fetch("/api/production-houses"),
          fetch("/api/countries"),
          getSession(),
        ]);

        if (!housesRes.ok || !countriesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const housesData = await housesRes.json();
        const countriesData = await countriesRes.json();

        setProductionHouses(housesData);
        setCountries(countriesData);
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
      const response = await fetch("/api/production-houses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create production house");
      }

      toast.success("Production house created successfully");
      setOpen(false);
      setFormData({
        houseId: "",
        houseName: "",
        yearEstab: "",
        streetAddr: "",
        city: "",
        state: "",
        zipCode: "",
        countryId: "",
      });

      // Refresh list
      const housesRes = await fetch("/api/production-houses");
      const housesData = await housesRes.json();
      setProductionHouses(housesData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold">Production Houses</h1>
          <p className="text-muted-foreground">
            Total: {productionHouses.length} production houses
            {isAdmin ? " (Admin)" : "(Not Admin)"}
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Production House
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Production House</DialogTitle>
                  <DialogDescription>
                    Add a new production house to the database.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="houseId">House ID *</Label>
                      <Input
                        id="houseId"
                        value={formData.houseId}
                        onChange={(e) =>
                          setFormData({ ...formData, houseId: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="houseName">House Name *</Label>
                      <Input
                        id="houseName"
                        value={formData.houseName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            houseName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearEstab">Year Established *</Label>
                    <Input
                      id="yearEstab"
                      type="date"
                      value={formData.yearEstab}
                      onChange={(e) =>
                        setFormData({ ...formData, yearEstab: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="streetAddr">Street Address *</Label>
                    <Input
                      id="streetAddr"
                      value={formData.streetAddr}
                      onChange={(e) =>
                        setFormData({ ...formData, streetAddr: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Zip Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countryId">Country *</Label>
                    <select
                      id="countryId"
                      value={formData.countryId}
                      onChange={(e) =>
                        setFormData({ ...formData, countryId: e.target.value })
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
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Production House"}
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
