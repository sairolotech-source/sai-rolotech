import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { SupplierProfile } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Search, Star, Shield, Crown, Zap, MapPin, Phone,
  Building2, CheckCircle2, Clock, ChevronRight, Award
} from "lucide-react";

function TrustBadges({ supplier }: { supplier: SupplierProfile }) {
  return (
    <div className="flex flex-wrap gap-1">
      {supplier.isPremium && (
        <Badge className="text-[9px] bg-amber-100 text-amber-700 border-amber-200 gap-0.5">
          <Crown className="w-2.5 h-2.5" /> Premium
        </Badge>
      )}
      {supplier.isVerified && (
        <Badge className="text-[9px] bg-blue-100 text-blue-700 border-blue-200 gap-0.5">
          <Shield className="w-2.5 h-2.5" /> Verified
        </Badge>
      )}
      {supplier.isGstVerified && (
        <Badge className="text-[9px] bg-green-100 text-green-700 border-green-200 gap-0.5">
          <CheckCircle2 className="w-2.5 h-2.5" /> GST
        </Badge>
      )}
      {supplier.isTopRated && (
        <Badge className="text-[9px] bg-purple-100 text-purple-700 border-purple-200 gap-0.5">
          <Award className="w-2.5 h-2.5" /> Top Rated
        </Badge>
      )}
      {supplier.isFastResponder && (
        <Badge className="text-[9px] bg-cyan-100 text-cyan-700 border-cyan-200 gap-0.5">
          <Zap className="w-2.5 h-2.5" /> Fast
        </Badge>
      )}
    </div>
  );
}

function SupplierCard({ supplier, onClick }: { supplier: SupplierProfile; onClick: () => void }) {
  const rating = parseFloat(supplier.rating || "0");

  return (
    <Card
      className={`cursor-pointer hover-elevate transition-all ${supplier.isPremium ? "border-amber-200 bg-amber-50/30" : ""}`}
      onClick={onClick}
      data-testid={`card-supplier-${supplier.id}`}
    >
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 text-lg font-bold ${
            supplier.isPremium ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
          }`}>
            {supplier.companyName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="font-semibold text-sm truncate" data-testid={`text-supplier-name-${supplier.id}`}>
                {supplier.companyName}
              </h3>
              {supplier.isPremium && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3" /> {supplier.city}, {supplier.state}
              </span>
              <span className="flex items-center gap-0.5">
                <Building2 className="w-3 h-3" /> {supplier.businessType}
              </span>
            </div>
            <TrustBadges supplier={supplier} />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                {rating > 0 ? (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5 bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-semibold">
                      <Star className="w-3 h-3 fill-current" /> {rating}
                    </div>
                    <span className="text-[10px] text-muted-foreground">({supplier.ratingCount} reviews)</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground">No reviews yet</span>
                )}
              </div>
              {supplier.responseTime && (
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-3 h-3" /> {supplier.responseTime}
                </span>
              )}
            </div>
            {supplier.specialization && (
              <p className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1">{supplier.specialization}</p>
            )}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Suppliers() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");

  const { data: suppliers, isLoading } = useQuery<SupplierProfile[]>({
    queryKey: ["/api/suppliers"],
  });

  const filteredSuppliers = suppliers?.filter((s) => {
    const matchesSearch = !search ||
      s.companyName.toLowerCase().includes(search.toLowerCase()) ||
      s.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase());
    const matchesState = stateFilter === "all" || s.state === stateFilter;
    return matchesSearch && matchesState;
  });

  const states = [...new Set(suppliers?.map((s) => s.state) || [])];

  return (
    <div className="pb-24 px-4">
      <div className="flex items-center gap-3 pt-4 pb-3">
        <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold" data-testid="text-suppliers-title">Suppliers</h1>
          <p className="text-xs text-muted-foreground">Verified machine manufacturers & traders</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by company, specialization, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search-suppliers"
          />
        </div>
        <Select value={stateFilter} onValueChange={setStateFilter}>
          <SelectTrigger data-testid="select-state-filter">
            <SelectValue placeholder="Filter by state" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {states.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <p className="text-xs text-muted-foreground">
          {filteredSuppliers?.length || 0} suppliers found
        </p>
        <div className="flex-1" />
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Crown className="w-3 h-3 text-amber-500" /> Premium first
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-3">
                <div className="flex gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSuppliers?.map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              onClick={() => setLocation(`/supplier/${supplier.id}`)}
            />
          ))}
          {filteredSuppliers?.length === 0 && (
            <Card>
              <CardContent className="pt-6 pb-6 text-center">
                <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No suppliers found</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
