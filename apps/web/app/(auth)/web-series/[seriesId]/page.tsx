"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  MessageSquare,
  Star,
  Tv,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

type WebSeriesDetail = {
  seriesId: string;
  seriesName: string;
  releaseDate: string | null;
  episodeCnt: number | null;
  typeName: string;
  countryName: string;
  averageRating?: number;
  totalReviews?: number;
  description?: string; // If you add this field later
};

type Feedback = {
  feedbackId: string;
  rating: number;
  feedbackTxt: string;
  feedbackDate: string;
  viewerName: string;
  viewerId: string;
};

export default function SeriesDetailPage({
  params,
}: {
  params: Promise<{ seriesId: string }>;
}) {
  const { seriesId } = use(params);
  const router = useRouter();
  const [series, setSeries] = useState<WebSeriesDetail | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Feedback form state
  const [userRating, setUserRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch series details (which includes feedback and rating)
        const seriesRes = await fetch(`/api/web-series/${seriesId}`);
        if (!seriesRes.ok) {
          if (seriesRes.status === 404) throw new Error("Series not found");
          throw new Error("Failed to fetch series details");
        }
        const data = await seriesRes.json();

        // Flatten the response for the component state
        setSeries({
          ...data.series,
          averageRating: Number(data.avgRating),
          totalReviews: data.feedback.length,
        });

        // Set feedbacks from the main response
        setFeedbacks(data.feedback);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [seriesId]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    if (!feedbackText.trim()) {
      toast.error("Please write a review");
      return;
    }

    setSubmittingFeedback(true);
    try {
      const response = await fetch(`/api/web-series/${seriesId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: userRating,
          feedbackTxt: feedbackText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      toast.success("Review submitted successfully!");
      setFeedbackText("");
      setUserRating(0);
      setShowFeedbackForm(false);

      // Refresh series data to get updated feedback and rating
      const seriesRes = await fetch(`/api/web-series/${seriesId}`);
      if (seriesRes.ok) {
        const data = await seriesRes.json();
        setSeries({
          ...data.series,
          averageRating: Number(data.avgRating),
          totalReviews: data.feedback.length,
        });
        setFeedbacks(data.feedback);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit feedback"
      );
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${interactive ? "cursor-pointer transition-transform hover:scale-110" : ""} ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            onClick={() => interactive && setUserRating(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-red-500 text-lg font-medium">
          Error: {error || "Series not found"}
        </p>
        <Button variant="outline" onClick={() => router.push("/web-series")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Series
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Poster & Key Info */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white h-[400px] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="text-center z-10 p-6">
              <Tv className="w-24 h-24 mx-auto mb-4 opacity-80" />
              <h1 className="text-3xl font-bold mb-2">{series.seriesName}</h1>
              <Badge variant="secondary" className="mt-2 text-lg px-3 py-1">
                {series.typeName}
              </Badge>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Country:</span>
                <span>{series.countryName}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Release Date:</span>
                <span>
                  {series.releaseDate
                    ? new Date(series.releaseDate).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "TBA"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Episodes:</span>
                <span>{series.episodeCnt || "TBA"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Stats & Overview */}
          <div className="flex flex-wrap gap-4 items-center justify-between bg-muted/30 p-6 rounded-xl border">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                Average Rating
              </p>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold">
                  {series.averageRating
                    ? series.averageRating.toFixed(1)
                    : "N/A"}
                </span>
                <div className="space-y-1">
                  {renderStars(Math.round(series.averageRating || 0))}
                  <p className="text-xs text-muted-foreground">
                    {series.totalReviews || 0} reviews
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            >
              <Star className="mr-2 h-4 w-4" />
              Rate & Review
            </Button>
          </div>

          {/* Feedback Form */}
          {showFeedbackForm && (
            <Card className="border-primary/20 shadow-md animate-in slide-in-from-top-4 fade-in duration-300">
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
                <CardDescription>
                  Share your thoughts about {series.seriesName}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmitFeedback}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Rating</label>
                    <div className="p-2 border rounded-md w-fit bg-muted/20">
                      {renderStars(userRating, true)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Review</label>
                    <Textarea
                      placeholder="What did you think about this series?"
                      value={feedbackText}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFeedbackText(e.target.value)
                      }
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFeedbackForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submittingFeedback}>
                    {submittingFeedback ? "Submitting..." : "Submit Review"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* Reviews Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Reviews
              </h2>
            </div>

            <Separator />

            {feedbacks.length === 0 ? (
              <div className="text-center py-12 bg-muted/10 rounded-xl border border-dashed">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-lg font-medium">No reviews yet</h3>
                <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                  Be the first to share your thoughts on this series!
                </p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => setShowFeedbackForm(true)}
                >
                  Write a review
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {feedbacks.map((feedback) => (
                  <Card key={feedback.feedbackId} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {feedback.viewerName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-sm">
                              {feedback.viewerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                feedback.feedbackDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="bg-muted/30 px-2 py-1 rounded-full border">
                          {renderStars(Math.round(feedback.rating))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {feedback.feedbackTxt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
