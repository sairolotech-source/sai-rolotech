import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, LogIn, UserPlus, Factory, Eye, EyeOff, Mail, ShieldCheck, Clock, KeyRound } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getRoleRedirectPath } from "@/lib/role-redirect";

type AuthStep = "login" | "register" | "verify-email" | "pending-approval" | "verify-2fa";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { user, login, register, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<AuthStep>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingUserId, setPendingUserId] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    phone: "",
    role: "buyer",
    companyName: "",
    location: "",
    state: "",
  });

  if (isAuthenticated && user) {
    setLocation(getRoleRedirectPath(user.role));
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/auth/register", formData);
      const data = await res.json();
      if (data.requiresEmailVerification) {
        setPendingUserId(data.userId);
        setPendingEmail(data.email || formData.email);
        setStep("verify-email");
        toast({ title: "OTP sent to your email!" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", {
        username: formData.username,
        password: formData.password,
        deviceFingerprint: navigator.userAgent,
      });
      const data = await res.json();

      if (data.requires2FA) {
        setPendingUserId(data.userId);
        setStep("verify-2fa");
        toast({ title: "2FA code sent to your email" });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        toast({ title: "Welcome back!" });
        const redirectPath = data.role ? getRoleRedirectPath(data.role) : "/";
        setLocation(redirectPath);
      }
    } catch (err: any) {
      let msg = err.message || "Login failed";
      try {
        const errData = JSON.parse(err.message);
        msg = errData.message || msg;
        if (errData.requiresEmailVerification) {
          setPendingEmail(errData.email || "");
          setPendingUserId(errData.userId || "");
          setStep("verify-email");
          return;
        }
        if (errData.requiresApproval) {
          setStep("pending-approval");
          return;
        }
        if (errData.deviceRestricted) {
          msg = "This device is not authorized for your account. Contact admin.";
        }
      } catch {}
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/auth/verify-email", {
        userId: pendingUserId,
        email: pendingEmail,
        code: otpCode,
      });
      const data = await res.json();
      setOtpCode("");
      if (data.requiresApproval) {
        setStep("pending-approval");
        toast({ title: "Email verified! Awaiting admin approval." });
      } else {
        toast({ title: "Email verified!" });
        setStep("login");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Invalid OTP", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify2FA = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/auth/verify-2fa", {
        userId: pendingUserId,
        code: otpCode,
        deviceFingerprint: navigator.userAgent,
      });
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Welcome back!" });
      const redirectPath = data.role ? getRoleRedirectPath(data.role) : "/";
      setLocation(redirectPath);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Invalid 2FA code", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async (purpose: string) => {
    try {
      await apiRequest("POST", "/api/auth/resend-otp", { email: pendingEmail, purpose });
      toast({ title: "New OTP sent!" });
    } catch {
      toast({ title: "Failed to resend OTP", variant: "destructive" });
    }
  };

  if (step === "verify-email") {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep("register")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back-verify">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold" data-testid="text-verify-title">Verify Email</h1>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Mail className="w-7 h-7 text-emerald-600" />
          </div>
        </div>
        <p className="text-center text-muted-foreground text-sm mb-1">We sent a 6-digit OTP to</p>
        <p className="text-center font-semibold text-sm mb-6" data-testid="text-otp-email">{pendingEmail}</p>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Enter OTP Code</Label>
              <Input
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
                data-testid="input-otp-code"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleVerifyEmail}
              disabled={otpCode.length !== 6 || isSubmitting}
              data-testid="button-verify-otp"
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>

            <button
              onClick={() => handleResendOTP("email_verify")}
              className="w-full text-sm text-primary hover:underline text-center py-2"
              data-testid="button-resend-otp"
            >
              Didn't receive? Resend OTP
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "verify-2fa") {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep("login")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back-2fa">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold" data-testid="text-2fa-title">Two-Factor Authentication</h1>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
        </div>
        <p className="text-center text-muted-foreground text-sm mb-6">Enter the 2FA code sent to your registered email</p>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>2FA Code</Label>
              <Input
                value={otpCode}
                onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
                data-testid="input-2fa-code"
              />
            </div>

            <Button
              className="w-full"
              onClick={handleVerify2FA}
              disabled={otpCode.length !== 6 || isSubmitting}
              data-testid="button-verify-2fa"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {isSubmitting ? "Verifying..." : "Verify & Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "pending-approval") {
    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep("login")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back-approval">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold" data-testid="text-approval-title">Pending Approval</h1>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock className="w-7 h-7 text-amber-600" />
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <h2 className="text-lg font-bold" data-testid="text-pending-heading">Account Pending Approval</h2>
            <p className="text-sm text-muted-foreground">
              Your email has been verified successfully. Your account is now pending admin approval.
            </p>
            <p className="text-sm text-muted-foreground">
              You will be able to login once an admin approves your account. You'll receive an email notification when approved.
            </p>
            <div className="pt-4">
              <Button variant="outline" onClick={() => setStep("login")} data-testid="button-back-to-login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLogin = step === "login";

  return (
    <div className="pb-24 px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setLocation("/")} className="p-2 rounded-lg hover:bg-accent" data-testid="button-back">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold" data-testid="text-auth-title">{isLogin ? "Login" : "Create Account"}</h1>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
          <Factory className="w-7 h-7 text-primary-foreground" />
        </div>
      </div>
      <p className="text-center text-muted-foreground text-sm mb-6">
        {isLogin ? "Sign in to your Sai Rolotech account" : "Join Sai Rolotech industrial ecosystem"}
      </p>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  data-testid="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="your@email.com"
                    data-testid="input-email"
                  />
                  <p className="text-[10px] text-muted-foreground">OTP will be sent to this email for verification</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger data-testid="select-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Machine Buyer</SelectItem>
                      <SelectItem value="vendor">Machine Vendor / Manufacturer</SelectItem>
                      <SelectItem value="supplier">Machine Supplier / Dealer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.role === "vendor" && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      data-testid="input-company"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="location">City / Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    data-testid="input-location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Select value={formData.state} onValueChange={(val) => setFormData({ ...formData, state: val })}>
                    <SelectTrigger data-testid="select-state">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Delhi", "Uttar Pradesh", "Haryana", "Rajasthan", "Maharashtra", "Gujarat", "Punjab", "Madhya Pradesh", "Bihar", "West Bengal", "Tamil Nadu", "Karnataka", "Telangana", "Andhra Pradesh", "Other"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              data-testid="button-submit-auth"
            >
              {isSubmitting ? "Please wait..." : (
                <>
                  {isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  {isLogin ? "Login" : "Create Account"}
                </>
              )}
            </Button>
          </form>

          {isLogin && (
            <div className="mt-3 p-3 bg-accent/50 rounded-lg">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Secured with Email OTP verification, Admin approval, 2FA, and device-based login protection.
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 text-center">
            <button
              onClick={() => setStep(isLogin ? "register" : "login")}
              className="text-sm text-primary hover:underline"
              data-testid="button-switch-mode"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
