import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SupplierProfile, Review, Product } from "@shared/schema";
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
  Globe, Truck, MessageSquare, ChevronRight, Play,
  ExternalLink, Share2, Image as ImageIcon, Video
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { motion } from "framer-motion";
import BusinessDiscussion from "@/components/BusinessDiscussion";
import { FreemiumBadge, LockedFeatureOverlay, FreemiumLimitsBar } from "@/components/FreemiumBadge";

type TabType = "about" | "products" | "gallery" | "reviews" | "contact";

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

function SupplierBanner({ supplier }: { supplier: SupplierProfile }) {
  const rating = parseFloat(supplier.rating || "0");

  return (
    <div className="relative mb-4" data-testid="supplier-banner">
      <div
        className="h-[200px] rounded-2xl overflow-hidden relative"
        style={{
          background: supplier.isPremium
            ? "linear-gradient(135deg, #F59E0B, #D97706, #B45309)"
            : "linear-gradient(135deg, #0077FF, #00D4FF, #0055CC)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-32 h-32 rounded-full border-2 border-white/20" />
          <div className="absolute bottom-4 right-4 w-24 h-24 rounded-full border-2 border-white/20" />
          <div className="absolute top-12 right-12 w-16 h-16 rounded-full border border-white/10" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-end gap-4">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-white/30 ${
              supplier.isPremium ? "bg-amber-800 text-amber-100" : "bg-blue-800 text-blue-100"
            }`}>
              {supplier.logo ? (
                <img src={supplier.logo} alt={supplier.companyName} className="w-full h-full object-cover rounded-xl" />
              ) : (
                supplier.companyName.charAt(0)
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-white text-lg font-bold truncate drop-shadow-lg">{supplier.companyName}</h1>
                {supplier.isPremium && <Crown className="w-5 h-5 text-amber-300 shrink-0" />}
              </div>
              <p className="text-white/70 text-xs truncate">{supplier.ownerName} | {supplier.businessType}</p>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-white/60" />
                  <span className="text-white/70 text-[11px]">{supplier.city}, {supplier.state}</span>
                </div>
                {rating > 0 && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span className="text-white text-[11px] font-semibold">{rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsTab({ supplier }: { supplier: SupplierProfile }) {
  const [, setLocation] = useLocation();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const supplierProducts = products?.filter(p =>
    p.description?.toLowerCase().includes(supplier.companyName.toLowerCase()) ||
    p.name?.toLowerCase().includes(supplier.companyName.toLowerCase())
  ).slice(0, 10) || [];

  const allProducts = products?.slice(0, 6) || [];
  const displayProducts = supplierProducts.length > 0 ? supplierProducts : allProducts;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Machines & Products</h3>
        <Badge variant="secondary" className="text-[10px]">{displayProducts.length} items</Badge>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2.5">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <Skeleton className="w-full aspect-[4/3] m-1.5 rounded-md" />
              <div className="p-2">
                <Skeleton className="h-3 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5">
          {displayProducts.map(product => (
            <Card
              key={product.id}
              className="cursor-pointer hover-elevate"
              onClick={() => setLocation("/catalog")}
              data-testid={`card-supplier-product-${product.id}`}
            >
              <div className="relative m-1.5 rounded-md overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full aspect-[4/3] object-cover" />
                {product.videoUrl && (
                  <Badge className="absolute top-1 right-1 bg-red-600/80 text-white text-[8px] px-1 py-0 border-0">
                    <Play className="w-2 h-2 mr-0.5" />Video
                  </Badge>
                )}
              </div>
              <div className="px-2 pb-2">
                <h4 className="text-[10px] font-bold line-clamp-2 leading-tight mb-1">{product.name}</h4>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-[8px] px-1 py-0">{product.machineType}</Badge>
                </div>
                {product.estimatedPrice && (
                  <p className="text-xs font-bold text-primary mt-1">
                    ₹{Number(product.estimatedPrice) >= 1 ? `${product.estimatedPrice}L` : `${(Number(product.estimatedPrice) * 100000).toLocaleString()}`}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No products listed yet</p>
          </CardContent>
        </Card>
      )}

      {!supplier.isPremium && (
        <FreemiumLimitsBar current={displayProducts.length} max={3} label="Machine Listings" />
      )}
    </div>
  );
}

function GalleryTab({ supplier }: { supplier: SupplierProfile }) {
  const demoVideos = [
    { title: "Basic Shutter Patti Machine", url: "https://youtube.com/shorts/LPEQldD5c6g" },
    { title: "Medium Model Machine Demo", url: "https://youtube.com/shorts/1DbpzyxH6sw" },
    { title: "Advance Model Machine", url: "https://youtu.be/Q8kiahPsCe0" },
  ];

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          Experience Videos
        </h3>
        <div className="space-y-3">
          {demoVideos.map((video, i) => {
            const ytId = getYouTubeId(video.url);
            return (
              <Card key={i} className="overflow-hidden cursor-pointer hover-elevate" data-testid={`card-video-${i}`}>
                <div className="relative">
                  {ytId && (
                    <img
                      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                      <Play className="w-6 h-6 text-red-600 ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-medium drop-shadow-lg">{video.title}</p>
                  </div>
                </div>
                <CardContent className="py-2 px-3">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Watch on YouTube
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {!supplier.isPremium && (
        <LockedFeatureOverlay featureName="Unlimited Photo Gallery">
          <Card>
            <CardContent className="pt-4 pb-4">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Photo Gallery
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-square rounded-lg bg-accent/50" />
                ))}
              </div>
            </CardContent>
          </Card>
        </LockedFeatureOverlay>
      )}
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
              {supplier.specialization.split(",").map((spec: string) => (
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

      <div className="pt-2">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <FreemiumBadge isPaid={false} />
          Free Tier Features
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Basic Profile", free: true },
            { label: "3 Machine Listings", free: true },
            { label: "Standard Contact", free: true },
            { label: "Unlimited Listings", free: false },
            { label: "AI Quotation", free: false },
            { label: "Analytics Dashboard", free: false },
            { label: "Priority Badge", free: false },
            { label: "Video Gallery", free: false },
          ].map(f => (
            <div key={f.label} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${f.free ? "bg-green-50 dark:bg-green-950/20" : "bg-accent/30 opacity-60"}`}>
              {f.free ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
              ) : (
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              )}
              <span className={f.free ? "text-green-700 dark:text-green-300" : "text-muted-foreground"}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
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
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold">{rating > 0 ? rating.toFixed(1) : "—"}</p>
              <div className="flex gap-0.5 mt-1 justify-center">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{supplier.ratingCount || 0} reviews</p>
            </div>
            <div className="flex-1">
              <Button
                size="sm"
                className="w-full"
                onClick={() => setShowForm(!showForm)}
                data-testid="button-write-review"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Write a Review
              </Button>
            </div>
          </div>
        </div>
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-bold text-primary">
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
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
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
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
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

      <div className="grid grid-cols-2 gap-2">
        {supplier.whatsapp && (
          <Button
            className="h-12 bg-green-600 hover:bg-green-700 font-semibold"
            onClick={() => window.open(`https://wa.me/${supplier.whatsapp}?text=${encodeURIComponent(`Hi ${supplier.companyName}, I found you on Sai Rolotech. I would like to discuss.`)}`, "_blank")}
            data-testid="button-whatsapp"
          >
            <SiWhatsapp className="w-5 h-5 mr-2" />
            WhatsApp
          </Button>
        )}
        <Button
          variant="outline"
          className="h-12 font-semibold"
          onClick={() => window.open(`tel:+91${supplier.phone}`)}
          data-testid="button-call"
        >
          <Phone className="w-5 h-5 mr-2" />
          Call Now
        </Button>
      </div>

      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="pt-4 pb-4 text-center">
          <Share2 className="w-5 h-5 text-primary mx-auto mb-2" />
          <p className="text-xs font-semibold mb-1">Share this Supplier</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: supplier.companyName,
                  text: `Check out ${supplier.companyName} on Sai Rolotech`,
                  url: window.location.href,
                });
              }
            }}
            data-testid="button-share-supplier"
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Share Profile
          </Button>
        </CardContent>
      </Card>
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
        <Skeleton className="h-[200px] w-full rounded-2xl mb-4" />
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

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: "about", label: "About", icon: Building2 },
    { id: "products", label: "Products", icon: Building2 },
    { id: "gallery", label: "Videos", icon: Play },
    { id: "reviews", label: `Reviews`, icon: Star },
    { id: "contact", label: "Contact", icon: Phone },
  ];

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b px-4 py-3 flex items-center gap-3">
        <button onClick={() => setLocation("/suppliers")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-bold truncate flex-1" data-testid="text-supplier-title">{supplier.companyName}</h1>
        <Button size="icon" variant="ghost" onClick={() => {
          if (navigator.share) {
            navigator.share({ title: supplier.companyName, url: window.location.href });
          }
        }}>
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-4 pt-4">
        <SupplierBanner supplier={supplier} />

        <div className="mb-3">
          <TrustBadgesLarge supplier={supplier} />
        </div>

        <div className="flex gap-0.5 mb-4 bg-accent/50 p-1 rounded-xl overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 text-[11px] font-medium py-2 px-2 rounded-lg transition-colors whitespace-nowrap ${
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
        {activeTab === "products" && <ProductsTab supplier={supplier} />}
        {activeTab === "gallery" && <GalleryTab supplier={supplier} />}
        {activeTab === "reviews" && <ReviewsTab supplierId={supplier.id} supplier={supplier} />}
        {activeTab === "contact" && <ContactTab supplier={supplier} />}

        {activeTab !== "contact" && (
          <div className="mt-6">
            <BusinessDiscussion
              entityType="supplier"
              entityId={supplier.id}
              title="Business Discussion"
            />
          </div>
        )}
      </div>
    </div>
  );
}
