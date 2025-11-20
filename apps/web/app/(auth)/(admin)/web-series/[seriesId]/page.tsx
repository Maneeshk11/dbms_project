"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowLeft,
  Calendar,
  Film,
  Globe,
  Languages,
  MessageSquare,
  Star,
  FileText,
} from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";

type WebSeriesDetail = {
  series: {
    seriesId: string;
    seriesName: string;
    releaseDate: string | null;
    episodeCnt: number | null;
    typeName: string;
    countryName: string;
  };
  episodes: Array<{
    episodeId: string;
    epNumber: string;
    epTitle: string;
    plannedStart: string | null;
    plannedEnd: string | null;
    viewersCount: string | null;
  }>;
  dubbingLanguages: Array<{
    languageName: string;
    languageCode: string;
  }>;
  subtitleLanguages: Array<{
    languageName: string;
    languageCode: string;
  }>;
  releases: Array<{
    releaseDate: string;
    countryName: string;
  }>;
  feedback: Array<{
    feedbackId: string;
    rating: string;
    feedbackTxt: string;
    feedbackDate: string;
    viewerName: string;
    viewerLastName: string;
  }>;
  contracts: Array<{
    contractId: string;
    contractYear: string;
    startDate: string;
    endDate: string;
    perEpFee: string;
    statusCode: string;
    isRenewed: string;
    houseName: string;
  }>;
  avgRating: string;
};

export default function WebSeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<WebSeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/web-series/${params.seriesId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch web series details");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    if (params.seriesId) {
      fetchData();
    }
  }, [params.seriesId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card className="p-6">
          <p className="text-red-500">Error: {error || "Series not found"}</p>
        </Card>
      </div>
    );
  }

  const { series } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Web Series
          </Button>
          <h1 className="text-4xl font-bold tracking-tight">
            {series.seriesName}
          </h1>
          <p className="text-lg text-muted-foreground">
            {series.typeName || "Type not specified"}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.avgRating && parseFloat(data.avgRating) > 0
                ? data.avgRating
                : "N/A"}
              {data.avgRating && parseFloat(data.avgRating) > 0 && (
                <span className="text-sm font-normal">/5.0</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.feedback.length} review
              {data.feedback.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Episodes</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {series.episodeCnt || data.episodes.length || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Total episodes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Languages</CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.dubbingLanguages.length + data.subtitleLanguages.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.dubbingLanguages.length} audio,{" "}
              {data.subtitleLanguages.length} subtitles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Release Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {series.releaseDate
                ? new Date(series.releaseDate).getFullYear()
                : "TBA"}
            </div>
            <p className="text-xs text-muted-foreground">
              {series.countryName || "Country not specified"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Episodes Section */}
      {data.episodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Episodes
            </CardTitle>
            <CardDescription>
              Complete list of all episodes in this series
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Episode #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Planned Start</TableHead>
                  <TableHead>Planned End</TableHead>
                  <TableHead className="text-right">Viewers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.episodes.map((episode) => (
                  <TableRow key={episode.episodeId}>
                    <TableCell className="font-medium">
                      {episode.epNumber}
                    </TableCell>
                    <TableCell>{episode.epTitle}</TableCell>
                    <TableCell>
                      {episode.plannedStart
                        ? new Date(episode.plannedStart).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {episode.plannedEnd
                        ? new Date(episode.plannedEnd).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      {episode.viewersCount
                        ? Number(episode.viewersCount).toLocaleString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Languages & Releases Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Available Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              Available Languages
            </CardTitle>
            <CardDescription>
              Audio dubbing and subtitle options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.dubbingLanguages.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Audio Dubbing</h4>
                <div className="flex flex-wrap gap-2">
                  {data.dubbingLanguages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                    >
                      {lang.languageName}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.subtitleLanguages.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-sm">Subtitles</h4>
                <div className="flex flex-wrap gap-2">
                  {data.subtitleLanguages.map((lang, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10"
                    >
                      {lang.languageName}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.dubbingLanguages.length === 0 &&
              data.subtitleLanguages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No language information available
                </p>
              )}
          </CardContent>
        </Card>

        {/* International Releases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              International Releases
            </CardTitle>
            <CardDescription>Release dates by country</CardDescription>
          </CardHeader>
          <CardContent>
            {data.releases.length > 0 ? (
              <div className="space-y-2">
                {data.releases.map((release, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b last:border-0"
                  >
                    <span className="font-medium">{release.countryName}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(release.releaseDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No release information available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feedback Section */}
      {data.feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Viewer Feedback
            </CardTitle>
            <CardDescription>Reviews and ratings from viewers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.feedback.map((fb) => (
              <div key={fb.feedbackId} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">
                      {fb.viewerName} {fb.viewerLastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Number(fb.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(fb.feedbackDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {fb.feedbackTxt}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contracts Section */}
      {data.contracts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Production Contracts
            </CardTitle>
            <CardDescription>Contracts with production houses</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Production House</TableHead>
                  <TableHead>Contract Year</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Per Episode Fee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Renewed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.contracts.map((contract) => (
                  <TableRow key={contract.contractId}>
                    <TableCell className="font-medium">
                      {contract.houseName}
                    </TableCell>
                    <TableCell>
                      {new Date(contract.contractYear).getFullYear()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(contract.startDate).toLocaleDateString()} -{" "}
                      {new Date(contract.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      ${Number(contract.perEpFee).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          contract.statusCode === "ACTIVE"
                            ? "bg-green-50 text-green-700 ring-green-600/20"
                            : "bg-gray-50 text-gray-700 ring-gray-600/20"
                        }`}
                      >
                        {contract.statusCode}
                      </span>
                    </TableCell>
                    <TableCell>
                      {contract.isRenewed === "Y" ? "Yes" : "No"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
