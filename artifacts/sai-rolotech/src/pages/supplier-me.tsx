import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { SupplierProfile } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Building2, MapPin, Phone, Mail, Crown, Shield,
  CheckCircle2, Award, Zap, Clock, AlertCircle, Loader2, LogOut,
  Star, Users, Package, Settings, Eye, ChevronRight
} from "lucide-react";
import { FreemiumBadge, FreemiumLimitsBar, LockedFeatureOverlay } from "@/components/FreemiumBadge";
import BusinessDiscussion from "@/components/BusinessDiscussion";

export default function SupplierMe() {
  const [, setLocation] = useLocation();
  const { user, isSupplier, isAdmin, isLoading: authLoading, logout } = useAuth();

  const { data: suppliers } = useQuery<SupplierProfile[]>({
    queryKey: ["/api/suppliers"],
    enabled: !!user,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSupplier && !isAdmin) {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Supplier Portal</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="font-semibold">Access Denied</p>
            <p className="text-sm text-muted-foreground mt-1">You need a supplier account to access this portal.</p>
            <Button onClick={() => setLocation("/auth")} className="mt-4" data-testid="button-login">Login as Supplier</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const myProfile = suppliers?.find(s =>
    s.userId === user?.id ||
    s.companyName.toLowerCase() === user?.companyName?.toLowerCase() ||
    s.phone === user?.phone
  );

  const handleLogout = async () => {
    await logout.mutateAsync();
    setLocation("/");
  };

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold" data-testid="text-supplier-portal-title">Supplier Portal</h1>
            <p className="text-xs text-muted-foreground">Welcome, {user?.name || user?.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <FreemiumBadge isPaid={false} />
          <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {myProfile ? (
        <>
          <Card className={`mb-4 ${myProfile.isPremium ? "border-amber-200 bg-amber-50/30" : ""}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${
                  myProfile.isPremium ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                }`}>
                  {myProfile.companyName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-bold text-base truncate">{myProfile.companyName}</h2>
                    {myProfile.isPremium && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{myProfile.ownerName}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{myProfile.city}, {myProfile.state}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {myProfile.isVerified && (
                  <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-200 gap-0.5">
                    <Shield className="w-2.5 h-2.5" /> Verified
                  </Badge>
                )}
                {myProfile.isGstVerified && (
                  <Badge className="text-[9px] bg-green-100 text-green-700 border-green-200 gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> GST
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={() => setLocation(`/supplier/${myProfile.id}`)}
            data-testid="button-view-public-profile"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Public Profile
            <ChevronRight className="w-4 h-4 ml-auto" />
          </Button>
        </>
      ) : (
        <Card className="mb-4 border-dashed">
          <CardContent className="pt-6 pb-6 text-center">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-semibold mb-1">Set Up Your Supplier Profile</p>
            <p className="text-xs text-muted-foreground mb-3">Create your public profile to get listed on Sai Rolotech</p>
            <p className="text-[10px] text-muted-foreground">Contact admin to set up your profile: +91 9090-486-262</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon: Package, label: "My Machines", desc: "Manage listings", path: "/catalog" },
          { icon: Star, label: "Reviews", desc: "Customer feedback", path: myProfile ? `/supplier/${myProfile.id}` : "#" },
          { icon: Users, label: "Enquiries", desc: "Customer requests", locked: true },
          { icon: Settings, label: "Settings", desc: "Profile settings", locked: true },
        ].map(item => (
          <Card
            key={item.label}
            className={`cursor-pointer hover:bg-accent/30 transition-all ${item.locked ? "opacity-60" : ""}`}
            onClick={() => !item.locked && item.path && setLocation(item.path)}
            data-testid={`card-${item.label.toLowerCase().replace(" ", "-")}`}
          >
            <CardContent className="pt-4 pb-3 px-3">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                {item.locked && <FreemiumBadge isPaid={true} compact />}
              </div>
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FreemiumLimitsBar current={myProfile ? 1 : 0} max={3} label="Machine Listings (Free Tier)" />

      <Card className="mt-4 border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold">Upgrade to PRO</h3>
            <FreemiumBadge isPaid={true} />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              "Unlimited Listings",
              "AI Quotation PDF",
              "Analytics Dashboard",
              "Priority Badge",
            ].map(f => (
              <div key={f} className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-300">
                <Crown className="w-3 h-3 shrink-0" />
                {f}
              </div>
            ))}
          </div>
          <Button size="sm" className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 border-0">
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            Upgrade Now
          </Button>
        </CardContent>
      </Card>

      {myProfile && (
        <div className="mt-6">
          <BusinessDiscussion
            entityType="supplier"
            entityId={myProfile.id}
            title="Business Discussion"
          />
        </div>
      )}
    </div>
  );
}
