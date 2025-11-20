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
import {
  ArrowLeft,
  Calendar,
  Film,
  Globe,
  Languages,
  MessageSquare,
  Star,
  FileText,
  Plus,
  Edit,
  Eye,
} from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";
import { toast } from "sonner";

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

type Viewer = {
  viewerId: string;
  firstName: string;
  lastName: string;
};

export default function WebSeriesDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<WebSeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [addFeedbackOpen, setAddFeedbackOpen] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [editFeedbackId, setEditFeedbackId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [feedbackForm, setFeedbackForm] = useState({
    feedbackId: "",
    rating: "5",
    feedbackTxt: "",
    viewerId: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [seriesRes, viewersRes] = await Promise.all([
          fetch(`/api/web-series/${params.seriesId}`),
          fetch("/api/viewers"),
        ]);

        if (!seriesRes.ok) {
          throw new Error("Failed to fetch web series details");
        }

        const result = await seriesRes.json();
        setData(result);

        if (viewersRes.ok) {
          const viewersData = await viewersRes.json();
          setViewers(viewersData);
        }
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

  const handleAddFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        feedbackId: feedbackForm.feedbackId || `FB-${Date.now()}`,
        rating: Number(feedbackForm.rating),
        feedbackTxt: feedbackForm.feedbackTxt,
        feedbackDate: new Date().toISOString().split("T")[0],
        viewerId: feedbackForm.viewerId,
      };

      const response = await fetch(
        `/api/web-series/${params.seriesId}/feedback`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add feedback");
      }

      toast.success("Feedback added successfully");
      setAddFeedbackOpen(false);
      setFeedbackForm({
        feedbackId: "",
        rating: "5",
        feedbackTxt: "",
        viewerId: "",
      });

      // Refresh data
      const seriesRes = await fetch(`/api/web-series/${params.seriesId}`);
      if (seriesRes.ok) {
        const result = await seriesRes.json();
        setData(result);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFeedbackId) return;

    setSubmitting(true);

    try {
      const payload = {
        feedbackId: editFeedbackId,
        rating: Number(feedbackForm.rating),
        feedbackTxt: feedbackForm.feedbackTxt,
      };

      const response = await fetch(
        `/api/web-series/${params.seriesId}/feedback`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update feedback");
      }

      toast.success("Feedback updated successfully");
      setEditFeedbackId(null);
      setFeedbackForm({
        feedbackId: "",
        rating: "5",
        feedbackTxt: "",
        viewerId: "",
      });

      // Refresh data
      const seriesRes = await fetch(`/api/web-series/${params.seriesId}`);
      if (seriesRes.ok) {
        const result = await seriesRes.json();
        setData(result);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (feedback: WebSeriesDetail["feedback"][0]) => {
    setEditFeedbackId(feedback.feedbackId);
    setFeedbackForm({
      feedbackId: feedback.feedbackId,
      rating: feedback.rating,
      feedbackTxt: feedback.feedbackTxt,
      viewerId: "",
    });
  };

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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Viewer Feedback
              </CardTitle>
              <CardDescription>
                Reviews and ratings from viewers
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {data.feedback.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewAllOpen(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View All ({data.feedback.length})
                </Button>
              )}
              <Dialog open={addFeedbackOpen} onOpenChange={setAddFeedbackOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feedback
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <form onSubmit={handleAddFeedback}>
                    <DialogHeader>
                      <DialogTitle>Add Feedback</DialogTitle>
                      <DialogDescription>
                        Share your thoughts about this web series
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="viewerId">Viewer *</Label>
                        <select
                          id="viewerId"
                          value={feedbackForm.viewerId}
                          onChange={(e) =>
                            setFeedbackForm({
                              ...feedbackForm,
                              viewerId: e.target.value,
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          required
                        >
                          <option value="">Select a viewer</option>
                          {viewers.map((viewer) => (
                            <option
                              key={viewer.viewerId}
                              value={viewer.viewerId}
                            >
                              {viewer.firstName} {viewer.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rating">Rating *</Label>
                        <select
                          id="rating"
                          value={feedbackForm.rating}
                          onChange={(e) =>
                            setFeedbackForm({
                              ...feedbackForm,
                              rating: e.target.value,
                            })
                          }
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          required
                        >
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Very Good</option>
                          <option value="3">3 - Good</option>
                          <option value="2">2 - Fair</option>
                          <option value="1">1 - Poor</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="feedbackTxt">Your Feedback *</Label>
                        <textarea
                          id="feedbackTxt"
                          value={feedbackForm.feedbackTxt}
                          onChange={(e) =>
                            setFeedbackForm({
                              ...feedbackForm,
                              feedbackTxt: e.target.value,
                            })
                          }
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          placeholder="Write your feedback here..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="feedbackId">
                          Feedback ID (Optional)
                        </Label>
                        <Input
                          id="feedbackId"
                          value={feedbackForm.feedbackId}
                          onChange={(e) =>
                            setFeedbackForm({
                              ...feedbackForm,
                              feedbackId: e.target.value,
                            })
                          }
                          placeholder="Leave empty to auto-generate"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setAddFeedbackOpen(false);
                          setFeedbackForm({
                            feedbackId: "",
                            rating: "5",
                            feedbackTxt: "",
                            viewerId: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Adding..." : "Add Feedback"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.feedback.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No feedback yet. Be the first to share your thoughts!
            </p>
          ) : (
            <>
              {data.feedback.slice(0, 3).map((fb) => (
                <div
                  key={fb.feedbackId}
                  className="border-b pb-4 last:border-0"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(fb)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {fb.feedbackTxt}
                  </p>
                </div>
              ))}
              {data.feedback.length > 3 && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing 3 of {data.feedback.length} reviews. Click "View All"
                  to see all feedback.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View All Feedback Dialog */}
      <Dialog open={viewAllOpen} onOpenChange={setViewAllOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Feedback</DialogTitle>
            <DialogDescription>
              Complete list of all feedback for this series
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {data.feedback.map((fb) => (
              <div key={fb.feedbackId} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setViewAllOpen(false);
                      startEdit(fb);
                      setAddFeedbackOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {fb.feedbackTxt}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Feedback Dialog */}
      {editFeedbackId && (
        <Dialog
          open={!!editFeedbackId}
          onOpenChange={(open) => {
            if (!open) {
              setEditFeedbackId(null);
              setFeedbackForm({
                feedbackId: "",
                rating: "5",
                feedbackTxt: "",
                viewerId: "",
              });
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleEditFeedback}>
              <DialogHeader>
                <DialogTitle>Edit Feedback</DialogTitle>
                <DialogDescription>
                  Update your feedback for this web series
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-rating">Rating *</Label>
                  <select
                    id="edit-rating"
                    value={feedbackForm.rating}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        rating: e.target.value,
                      })
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    required
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-feedbackTxt">Your Feedback *</Label>
                  <textarea
                    id="edit-feedbackTxt"
                    value={feedbackForm.feedbackTxt}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        feedbackTxt: e.target.value,
                      })
                    }
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    placeholder="Write your feedback here..."
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditFeedbackId(null);
                    setFeedbackForm({
                      feedbackId: "",
                      rating: "5",
                      feedbackTxt: "",
                      viewerId: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Updating..." : "Update Feedback"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
