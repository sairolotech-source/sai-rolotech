import { useQuery } from "@tanstack/react-query";
import type { Dealer, Operator } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Phone, MapPin, Star, ExternalLink, Briefcase, User, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

function DealerCard({ dealer }: { dealer: Dealer }) {
  return (
    <Card className="p-4 mx-4 mb-3" data-testid={`card-dealer-${dealer.id}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate" data-testid={`text-dealer-name-${dealer.id}`}>
            {dealer.name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground truncate">{dealer.location}</p>
          </div>
        </div>
        {dealer.rating && (
          <div className="flex items-center gap-1 shrink-0 bg-amber-500/10 px-2 py-1 rounded-md">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{dealer.rating}</span>
            {dealer.ratingCount && (
              <span className="text-xs text-muted-foreground">({dealer.ratingCount})</span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {dealer.dailyRate && (
          <div className="bg-muted/50 rounded-md p-2">
            <p className="text-xs text-muted-foreground">Daily Rate</p>
            <p className="text-sm font-semibold">{dealer.dailyRate}/kg</p>
            {dealer.rateGauge && <p className="text-xs text-muted-foreground">{dealer.rateGauge}</p>}
          </div>
        )}
        {dealer.state && (
          <div className="bg-muted/50 rounded-md p-2">
            <p className="text-xs text-muted-foreground">State</p>
            <p className="text-sm font-semibold">{dealer.state}</p>
          </div>
        )}
      </div>

      {dealer.gstNo && (
        <p className="text-xs text-muted-foreground mb-3 font-mono">GST: {dealer.gstNo}</p>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" asChild data-testid={`button-call-dealer-${dealer.id}`}>
          <a href={`tel:${dealer.phone}`}>
            <Phone className="w-4 h-4 mr-1" />
            Call
          </a>
        </Button>
        <Button size="sm" className="flex-1" asChild data-testid={`button-whatsapp-dealer-${dealer.id}`}>
          <a href={`https://wa.me/${dealer.phone}`} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
        </Button>
        {dealer.mapUrl && (
          <Button size="icon" variant="outline" asChild data-testid={`button-map-dealer-${dealer.id}`}>
            <a href={dealer.mapUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
}

function OperatorCard({ operator }: { operator: Operator }) {
  return (
    <Card className="p-4 mx-4 mb-3" data-testid={`card-operator-${operator.id}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm" data-testid={`text-operator-name-${operator.id}`}>{operator.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Briefcase className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{operator.experience}</p>
          </div>
          {operator.specialization && (
            <p className="text-xs text-muted-foreground mt-1">{operator.specialization}</p>
          )}
          {operator.location && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{operator.location}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <Button size="sm" variant="outline" className="w-full" asChild data-testid={`button-call-operator-${operator.id}`}>
          <a href={`tel:${operator.phone}`}>
            <Phone className="w-4 h-4 mr-1" />
            Contact
          </a>
        </Button>
      </div>
    </Card>
  );
}

export default function Directory() {
  const [search, setSearch] = useState("");

  const { data: dealers, isLoading: loadingDealers } = useQuery<Dealer[]>({
    queryKey: ["/api/dealers"],
  });

  const { data: operators, isLoading: loadingOperators } = useQuery<Operator[]>({
    queryKey: ["/api/operators"],
  });

  const filteredDealers = dealers?.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredOperators = operators?.filter(o =>
    !search || o.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold mb-1" data-testid="text-directory-title">Directory</h1>
        <p className="text-sm text-muted-foreground">Find steel dealers and machine operators</p>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search dealers or operators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-directory-search"
          />
        </div>
      </div>

      <Tabs defaultValue="dealers" className="px-4">
        <TabsList className="w-full">
          <TabsTrigger value="dealers" className="flex-1" data-testid="tab-dealers">
            Steel Dealers ({filteredDealers.length})
          </TabsTrigger>
          <TabsTrigger value="operators" className="flex-1" data-testid="tab-operators">
            Operators ({filteredOperators.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dealers" className="mt-4 -mx-4">
          {loadingDealers ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 mx-4 mb-3">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 flex-1" />
                </div>
              </Card>
            ))
          ) : filteredDealers.length > 0 ? (
            filteredDealers.map(dealer => <DealerCard key={dealer.id} dealer={dealer} />)
          ) : (
            <div className="text-center py-12 px-4">
              <User className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No dealers found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="operators" className="mt-4 -mx-4">
          {loadingOperators ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 mx-4 mb-3">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </Card>
            ))
          ) : filteredOperators.length > 0 ? (
            filteredOperators.map(operator => <OperatorCard key={operator.id} operator={operator} />)
          ) : (
            <div className="text-center py-12 px-4">
              <User className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No operators found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
