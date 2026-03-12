import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Gift, Copy, Users, Crown, Star, Check, Send, UserPlus, Trophy, Lock, Unlock } from "lucide-react";
import { motion } from "framer-motion";

interface ReferralData {
  code: string;
  count: number;
  rewards: { id: string; rewardType: string; isUnlocked: boolean; unlockedAt: string | null }[];
  referrals: { id: string; referredName: string | null; referredPhone: string | null; status: string; createdAt: string }[];
}

export default function ReferEarn() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const { data, isLoading } = useQuery<ReferralData>({
    queryKey: ["/api/referral/my-code"],
    enabled: !!user,
  });

  const inviteMutation = useMutation({
    mutationFn: async (body: { name: string; phone: string }) => {
      const res = await apiRequest("POST", "/api/referral/invite", body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referral/my-code"] });
      setName("");
      setPhone("");
      toast({ title: "Invite sent!", description: "Your referral has been recorded." });
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/referral/join", { code });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/referral/my-code"] });
      setJoinCode("");
      toast({ title: "Code applied!", description: "You've successfully used a referral code." });
      apiRequest("POST", "/api/referral/check-rewards").catch(() => {});
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const copyCode = async () => {
    if (!data?.code) return;
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      toast({ title: "Copied!", description: "Referral code copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Code: " + data.code, description: "Share this code with friends" });
    }
  };

  const shareViaWhatsApp = () => {
    if (!data?.code) return;
    const text = `Join Sai Rolotech Industrial App! Use my referral code: ${data.code}\nDownload now and get access to Roll Forming tools, GP Coil rates & more.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  if (!user) {
    return (
      <div className="pb-24 px-4">
        <div className="pt-4 pb-3">
          <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-refer-title">
            <Gift className="w-5 h-5 text-primary" />
            Refer & Earn
          </h1>
        </div>
        <Card className="p-8 text-center">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-2">Please login to access referral rewards</p>
        </Card>
      </div>
    );
  }

  const count = data?.count || 0;
  const tier1Unlocked = count >= 5;
  const tier2Unlocked = count >= 10;
  const progressPercent = Math.min((count / 10) * 100, 100);

  return (
    <div className="pb-24 px-4">
      <div className="pt-4 pb-3">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2" data-testid="text-refer-title">
          <Gift className="w-5 h-5 text-primary" />
          Refer & Earn
        </h1>
        <p className="text-sm text-muted-foreground">Invite friends and unlock premium rewards</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-5 mb-4 bg-gradient-to-br from-primary/10 to-cyan-500/10 border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Your Referral Code</p>
              <p className="text-2xl font-bold tracking-widest mt-1" data-testid="text-referral-code">
                {isLoading ? "..." : data?.code || "---"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyCode} data-testid="button-copy-code">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={shareViaWhatsApp} data-testid="button-share-whatsapp">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium">{count} joined</span>
                <span className="text-xs text-muted-foreground">Goal: 10</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`p-4 text-center ${tier1Unlocked ? "border-amber-500/50 bg-amber-500/5" : ""}`}>
            <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${tier1Unlocked ? "bg-amber-500/20" : "bg-muted"}`}>
              {tier1Unlocked ? <Unlock className="w-5 h-5 text-amber-500" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
            </div>
            <p className="text-xs font-bold mb-0.5">5 Invites</p>
            <p className="text-[10px] text-muted-foreground">Bonus Features</p>
            {tier1Unlocked && <Badge className="mt-1.5 text-[9px] bg-amber-500 border-0">UNLOCKED</Badge>}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`p-4 text-center ${tier2Unlocked ? "border-purple-500/50 bg-purple-500/5" : ""}`}>
            <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${tier2Unlocked ? "bg-purple-500/20" : "bg-muted"}`}>
              {tier2Unlocked ? <Crown className="w-5 h-5 text-purple-500" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
            </div>
            <p className="text-xs font-bold mb-0.5">10 Invites</p>
            <p className="text-[10px] text-muted-foreground">1 Month Premium</p>
            {tier2Unlocked && <Badge className="mt-1.5 text-[9px] bg-purple-500 border-0">UNLOCKED</Badge>}
          </Card>
        </motion.div>
      </div>

      <Card className="p-4 mb-4 border-cyan-500/20 bg-cyan-500/5">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <Gift className="w-4 h-4 text-cyan-500" />
          Have a Referral Code?
        </h3>
        <div className="flex gap-2">
          <Input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Enter code e.g. SAIAB12CD"
            className="h-9 text-sm flex-1"
            data-testid="input-join-code"
          />
          <Button
            onClick={() => joinMutation.mutate(joinCode)}
            disabled={!joinCode.trim() || joinMutation.isPending}
            className="shrink-0"
            data-testid="button-apply-code"
          >
            {joinMutation.isPending ? "..." : "Apply"}
          </Button>
        </div>
      </Card>

      <Card className="p-4 mb-4">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-primary" />
          Invite Someone
        </h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Friend's name"
              className="h-9 text-sm"
              data-testid="input-invite-name"
            />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="h-9 text-sm"
              maxLength={10}
              data-testid="input-invite-phone"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => inviteMutation.mutate({ name, phone })}
            disabled={!name.trim() || !phone.trim() || inviteMutation.isPending}
            data-testid="button-send-invite"
          >
            <Send className="w-4 h-4 mr-2" />
            {inviteMutation.isPending ? "Sending..." : "Send Invite"}
          </Button>
        </div>
      </Card>

      {data?.referrals && data.referrals.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Your Referrals ({data.referrals.length})
          </h3>
          <div className="space-y-2">
            {data.referrals.map((ref) => (
              <div key={ref.id} className="flex items-center justify-between py-2 border-b border-dashed last:border-0">
                <div>
                  <p className="text-sm font-medium">{ref.referredName || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{ref.referredPhone}</p>
                </div>
                <Badge variant={ref.status === "joined" ? "default" : "secondary"} className="text-[10px]">
                  {ref.status === "joined" ? "Joined" : "Invited"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
