"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Search, Star, Calendar, Tv } from "lucide-react";

type WebSeries = {
  seriesId: string;
  seriesName: string;
  releaseDate: string | null;
  episodeCnt: number | null;
  typeName: string;
  countryName: string;
  averageRating?: number;
  totalReviews?: number;
};

type SeriesType = {
  typeId: string;
  typeName: string;
};

type Country = {
  countryId: string;
  countryName: string;
};

export default function WebSeriesPage() {
  const router = useRouter();
  const [webSeries, setWebSeries] = useState<WebSeries[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<WebSeries[]>([]);
  const [seriesTypes, setSeriesTypes] = useState<SeriesType[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch web series
        const seriesRes = await fetch("/api/web-series");
        if (!seriesRes.ok) throw new Error("Failed to fetch web series");
        const seriesData = await seriesRes.json();

        // Fetch series types for filtering
        const typesRes = await fetch("/api/series-types");
        if (!typesRes.ok) throw new Error("Failed to fetch series types");
        const typesData = await typesRes.json();

        // Fetch countries for filtering
        const countriesRes = await fetch("/api/countries");
        if (!countriesRes.ok) throw new Error("Failed to fetch countries");
        const countriesData = await countriesRes.json();

        setWebSeries(seriesData);
        setFilteredSeries(seriesData);
        setSeriesTypes(typesData);
        setCountries(countriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Filter and sort series
  useEffect(() => {
    let filtered = webSeries.filter((series) => {
      const matchesSearch = series.seriesName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        selectedType === "all" || series.typeName === selectedType;
      const matchesCountry =
        selectedCountry === "all" || series.countryName === selectedCountry;

      return matchesSearch && matchesType && matchesCountry;
    });

    // Sort series
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.seriesName.localeCompare(b.seriesName);
        case "release":
          if (!a.releaseDate && !b.releaseDate) return 0;
          if (!a.releaseDate) return 1;
          if (!b.releaseDate) return -1;
          return (
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime()
          );
        case "rating":
          const aRating = a.averageRating || 0;
          const bRating = b.averageRating || 0;
          return bRating - aRating;
        default:
          return 0;
      }
    });

    setFilteredSeries(filtered);
  }, [webSeries, searchQuery, selectedType, selectedCountry, sortBy]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Web Series</h1>
            <p className="text-muted-foreground">
              Discover and rate your favorite series
            </p>
          </div>
        </div>

        {/* Filters skeleton */}
        <div className="flex gap-4 flex-wrap">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-6">
          <p className="text-red-500 text-center">Error: {error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Web Series</h1>
          <p className="text-muted-foreground">
            Discover and rate your favorite series • {filteredSeries.length}{" "}
            series available
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {seriesTypes.map((type) => (
              <SelectItem key={type.typeId} value={type.typeName}>
                {type.typeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country.countryId} value={country.countryName}>
                {country.countryName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="release">Release Date</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Series Grid */}
      {filteredSeries.length === 0 ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-8 text-center">
            <Tv className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No series found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or search query.
            </p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredSeries.map((series) => (
            <Card
              key={series.seriesId}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(`/web-series/${series.seriesId}`)}
            >
              {/* Placeholder for poster - you can add actual posters later */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Tv className="w-12 h-12 text-white/80" />
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {series.seriesName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {series.typeName}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {series.countryName}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Tv className="w-4 h-4" />
                      <span>{series.episodeCnt || "TBA"} episodes</span>
                    </div>
                    {series.releaseDate && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(series.releaseDate).getFullYear()}
                        </span>
                      </div>
                    )}
                  </div>

                  /* {/* Rating display */}
                  {/* <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {series.averageRating ? (
                        <>
                          {renderStars(series.averageRating)}
                          <span className="text-sm font-medium">
                            {series.averageRating.toFixed(1)}
                          </span>
                        </>
                      ) : (
                        // <span className="text-sm text-muted-foreground">
                        //   No ratings yet
                        // </span>
                      )}
                    </div>
                    {series.totalReviews && series.totalReviews > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {series.totalReviews} review
                        {series.totalReviews !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div> */} */
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
