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

type Country = {
  countryId: string;
  countryName: string;
};

export default function ProducersPage() {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    producerId: "",
    firstName: "",
    lastName: "",
    phoneNo: "",
    emailAddr: "",
    streetAddr: "",
    city: "",
    state: "",
    zipCode: "",
    countryId: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch data sequentially to avoid exhausting the database connection pool
        const producersRes = await fetch("/api/producers");
        if (!producersRes.ok) throw new Error("Failed to fetch producers");
        const producersData = await producersRes.json();
        setProducers(producersData);

        const countriesRes = await fetch("/api/countries");
        if (!countriesRes.ok) throw new Error("Failed to fetch countries");
        const countriesData = await countriesRes.json();
        setCountries(countriesData);

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
      const response = await fetch("/api/producers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create producer");
      }

      toast.success("Producer created successfully");
      setOpen(false);
      setFormData({
        producerId: "",
        firstName: "",
        lastName: "",
        phoneNo: "",
        emailAddr: "",
        streetAddr: "",
        city: "",
        state: "",
        zipCode: "",
        countryId: "",
      });

      // Refresh producers list
      const producersRes = await fetch("/api/producers");
      const producersData = await producersRes.json();
      setProducers(producersData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

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
        <div>
          <h1 className="text-3xl font-bold">Producers</h1>
          <p className="text-muted-foreground">
            Total: {producers.length} producers
          </p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Producer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Producer</DialogTitle>
                  <DialogDescription>
                    Add a new producer to the database.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="producerId">Producer ID *</Label>
                      <Input
                        id="producerId"
                        value={formData.producerId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            producerId: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNo">Phone Number *</Label>
                      <Input
                        id="phoneNo"
                        value={formData.phoneNo}
                        onChange={(e) =>
                          setFormData({ ...formData, phoneNo: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailAddr">Email *</Label>
                    <Input
                      id="emailAddr"
                      type="email"
                      value={formData.emailAddr}
                      onChange={(e) =>
                        setFormData({ ...formData, emailAddr: e.target.value })
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
                    {submitting ? "Creating..." : "Create Producer"}
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
