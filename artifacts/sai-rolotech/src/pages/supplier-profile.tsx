import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SupplierProfile, Review } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Star, Shield, Crown, Zap, MapPin, Phone, Mail,
  Building2, CheckCircle2, Clock, Award, Calendar, Users,
  Globe, Truck, MessageSquare, ChevronRight
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

type TabType = "about" | "reviews" | "contact";

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`${onChange ? "cursor-pointer" : "cursor-default"}`}
          data-testid={`star-${star}`}
        >
          <Star
            className={`w-5 h-5 ${star <= value ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

function TrustBadgesLarge({ supplier }: { supplier: SupplierProfile }) {
  const badges = [
    { show: supplier.isPremium, label: "Premium Partner", icon: Crown, color: "bg-amber-100 text-amber-700 border-amber-200" },
    { show: supplier.isVerified, label: "Verified Supplier", icon: Shield, color: "bg-blue-100 text-blue-700 border-blue-200" },
    { show: supplier.isGstVerified, label: "GST Verified", icon: CheckCircle2, color: "bg-green-100 text-green-700 border-green-200" },
    { show: supplier.isTopRated, label: "Top Rated", icon: Award, color: "bg-purple-100 text-purple-700 border-purple-200" },
    { show: supplier.isFastResponder, label: "Fast Responder", icon: Zap, color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  ].filter((b) => b.show);

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <Badge key={badge.label} className={`text-[10px] gap-1 ${badge.color}`}>
          <badge.icon className="w-3 h-3" /> {badge.label}
        </Badge>
      ))}
    </div>
  );
}

function AboutTab({ supplier }: { supplier: SupplierProfile }) {
  const details = [
    { icon: Building2, label: "Business Type", value: supplier.businessType },
    { icon: Calendar, label: "Established", value: supplier.establishedYear },
    { icon: Users, label: "Employees", value: supplier.totalEmployees },
    { icon: Globe, label: "Service Area", value: supplier.serviceArea },
    { icon: Truck, label: "Delivery", value: supplier.deliveryCapability },
    { icon: Clock, label: "Response Time", value: supplier.responseTime },
    { icon: MapPin, label: "Location", value: `${supplier.city}, ${supplier.state}${supplier.pincode ? ` - ${supplier.pincode}` : ""}` },
  ].filter((d) => d.value);

  return (
    <div className="space-y-4">
      {supplier.description && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold text-sm mb-2">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-description">
              {supplier.description}
            </p>
          </CardContent>
        </Card>
      )}

      {supplier.specialization && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold text-sm mb-2">Specialization</h3>
            <div className="flex flex-wrap gap-1.5">
              {supplier.specialization.split(",").map((spec) => (
                <Badge key={spec.trim()} variant="secondary" className="text-xs">
                  {spec.trim()}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-3">Business Details</h3>
          <div className="space-y-3">
            {details.map((detail) => (
              <div key={detail.label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <detail.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{detail.label}</p>
                  <p className="text-sm font-medium">{detail.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {supplier.factoryAddress && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="font-semibold text-sm mb-2">Factory Address</h3>
            <p className="text-sm text-muted-foreground">{supplier.factoryAddress}</p>
            <p className="text-sm text-muted-foreground">{supplier.city}, {supplier.state} {supplier.pincode}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReviewsTab({ supplierId, supplier }: { supplierId: string; supplier: SupplierProfile }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    reviewerName: "",
    rating: 0,
    comment: "",
  });

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/suppliers", supplierId, "reviews"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: typeof reviewData) => {
      const res = await apiRequest("POST", `/api/suppliers/${supplierId}/reviews`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers", supplierId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers", supplierId] });
      queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
      setShowForm(false);
      setReviewData({ reviewerName: "", rating: 0, comment: "" });
      toast({ title: "Review submitted!" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const rating = parseFloat(supplier.rating || "0");

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-3xl font-bold">{rating > 0 ? rating : "-"}</span>
            <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
          </div>
          <p className="text-xs text-muted-foreground">{supplier.ratingCount || 0} reviews</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setShowForm(!showForm)}
            data-testid="button-write-review"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Write a Review
          </Button>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-sm mb-3">Your Review</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Rating</Label>
                <StarRating value={reviewData.rating} onChange={(v) => setReviewData({ ...reviewData, rating: v })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Your Name</Label>
                <Input
                  value={reviewData.reviewerName}
                  onChange={(e) => setReviewData({ ...reviewData, reviewerName: e.target.value })}
                  placeholder="Enter your name"
                  data-testid="input-reviewer-name"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Comment (Optional)</Label>
                <Textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  placeholder="Share your experience..."
                  rows={3}
                  data-testid="input-review-comment"
                />
              </div>
              <Button
                onClick={() => submitMutation.mutate(reviewData)}
                disabled={submitMutation.isPending || !reviewData.reviewerName || reviewData.rating === 0}
                className="w-full"
                data-testid="button-submit-review"
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews?.map((review) => (
            <Card key={review.id} data-testid={`card-review-${review.id}`}>
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold">
                      {review.reviewerName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{review.reviewerName}</p>
                      {review.isVerifiedBuyer && (
                        <Badge className="text-[9px] bg-green-100 text-green-700 gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified Buyer
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-xs text-muted-foreground mt-2">{review.comment}</p>
                )}
                {review.createdAt && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(review.createdAt).toLocaleDateString("en-IN")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          {(!reviews || reviews.length === 0) && (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function ContactTab({ supplier }: { supplier: SupplierProfile }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-3">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground">Phone</p>
                <a href={`tel:+91${supplier.phone}`} className="text-sm font-medium text-primary">
                  +91 {supplier.phone}
                </a>
              </div>
            </div>
            {supplier.alternatePhone && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">Alternate Phone</p>
                  <a href={`tel:+91${supplier.alternatePhone}`} className="text-sm font-medium">
                    +91 {supplier.alternatePhone}
                  </a>
                </div>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground">Email</p>
                  <a href={`mailto:${supplier.email}`} className="text-sm font-medium text-primary">
                    {supplier.email}
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {supplier.whatsapp && (
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => window.open(`https://wa.me/${supplier.whatsapp}`, "_blank")}
            data-testid="button-whatsapp"
          >
            <SiWhatsapp className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.open(`tel:+91${supplier.phone}`)}
          data-testid="button-call"
        >
          <Phone className="w-4 h-4 mr-2" />
          Call Now
        </Button>
      </div>
    </div>
  );
}

export default function SupplierProfilePage() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/supplier/:id");
  const [activeTab, setActiveTab] = useState<TabType>("about");

  const { data: supplier, isLoading } = useQuery<SupplierProfile>({
    queryKey: ["/api/suppliers", params?.id],
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setLocation("/suppliers")} className="p-2 rounded-lg hover:bg-accent">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-32 w-full rounded-lg mb-4" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setLocation("/suppliers")} className="p-2 rounded-lg hover:bg-accent">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Supplier Not Found</h1>
        </div>
      </div>
    );
  }

  const rating = parseFloat(supplier.rating || "0");

  const tabs: { id: TabType; label: string }[] = [
    { id: "about", label: "About" },
    { id: "reviews", label: `Reviews (${supplier.ratingCount || 0})` },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setLocation("/suppliers")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold truncate" data-testid="text-supplier-title">{supplier.companyName}</h1>
      </div>

      <Card className={`mb-4 ${supplier.isPremium ? "border-amber-200 bg-amber-50/30" : ""}`}>
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${
              supplier.isPremium ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
            }`}>
              {supplier.companyName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-base truncate">{supplier.companyName}</h2>
                {supplier.isPremium && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
              </div>
              <p className="text-xs text-muted-foreground">{supplier.ownerName} | {supplier.businessType}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{supplier.city}, {supplier.state}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            {rating > 0 ? (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" /> {rating}
                </div>
                <span className="text-xs text-muted-foreground">({supplier.ratingCount} reviews)</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No reviews yet</span>
            )}
            {supplier.establishedYear && (
              <span className="text-xs text-muted-foreground">Est. {supplier.establishedYear}</span>
            )}
          </div>

          <TrustBadgesLarge supplier={supplier} />
        </CardContent>
      </Card>

      <div className="flex gap-1 mb-4 bg-accent/50 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-xs font-medium py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground"
            }`}
            data-testid={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "about" && <AboutTab supplier={supplier} />}
      {activeTab === "reviews" && <ReviewsTab supplierId={supplier.id} supplier={supplier} />}
      {activeTab === "contact" && <ContactTab supplier={supplier} />}
    </div>
  );
}
