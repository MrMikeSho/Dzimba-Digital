import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiClient } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Loader2, User, Phone } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import { toast } from "@/components/ui/use-toast";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Register() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(
    searchParams.get("role") === "landlord" ? "landlord" : "tenant"
  );
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const destination = () => {
    const back = safeReturnTo();
    if (back !== "/") return back;
    return role === "landlord" ? "/list-property" : "/";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (phone.replace(/\D/g, "").length < 9) {
      setError("Please enter a phone number we can reach you on (WhatsApp is best)");
      return;
    }
    setLoading(true);
    try {
      const result = await apiClient.auth.register({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim(),
        role,
      });
      if (result.needsConfirmation) {
        setShowConfirm(true);
      } else {
        window.location.href = destination();
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      await apiClient.auth.verifyOtp({ email: email.trim(), otpCode });
      window.location.href = destination();
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await apiClient.auth.resendOtp(email.trim());
      toast({
        title: "Email sent",
        description: "Check your inbox (and spam folder) for the new email.",
      });
    } catch (err) {
      setError(err.message || "Failed to resend email");
    }
  };

  if (showConfirm) {
    return (
      <AuthLayout
        icon={Mail}
        title="Check your email"
        subtitle={`We sent a confirmation to ${email}`}
        footer={
          <Link to="/login" className="text-primary font-medium hover:underline">
            Back to log in
          </Link>
        }
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <p className="text-sm text-muted-foreground text-center mb-6">
          Tap the link in the email to confirm your account, then log in. If the
          email shows a 6-digit code instead, enter it below.
        </p>
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify code"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't get the email?{" "}
          <button
            type="button"
            onClick={handleResend}
            className="text-primary font-medium hover:underline"
          >
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  const roleBtn = (value, label, hint) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      className={`flex-1 text-left rounded-lg border p-3 transition-colors ${
        role === value
          ? "border-primary bg-primary/5"
          : "border-border hover:border-foreground/40"
      }`}
      aria-pressed={role === value}
    >
      <span className="block text-sm font-medium">{label}</span>
      <span className="block text-xs text-muted-foreground mt-0.5">{hint}</span>
    </button>
  );

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={
              "/login" +
              (safeReturnTo() !== "/"
                ? "?returnTo=" + encodeURIComponent(safeReturnTo())
                : "")
            }
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          {roleBtn("tenant", "I'm looking to rent", "Tenant")}
          {roleBtn("landlord", "I have a property", "Landlord")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="name"
              autoComplete="name"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (WhatsApp)</Label>
          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="0771 234 567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
