import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, Mail, AlertCircle } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [authError, setAuthError] = useState<{ message: string; isEmailTaken?: boolean } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "signup") {
      setIsSignUp(true);
    } else if (mode === "login") {
      setIsSignUp(false);
    }

    const emailFromParams = searchParams.get("email");
    if (emailFromParams) {
      setEmail(decodeURIComponent(emailFromParams));
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          // Check if error indicates the email is already registered
          if (error.message.toLowerCase().includes("email already registered") || 
              error.message.toLowerCase().includes("user already registered") ||
              error.message.toLowerCase().includes("already exists") ||
              error.message.toLowerCase().includes("already in use")) {
            setAuthError({ 
              message: "This email is already registered with us.", 
              isEmailTaken: true 
            });
          } else {
            throw error;
          }
        } else {
          // Sign-up was successful, show confirmation message
          setSignupSuccess(true);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Signed In!",
          description: "Welcome back! Redirecting...",
        });
      }
    } catch (error: any) {
      setAuthError({ message: error.message });
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Email Sent",
        description: "Confirmation email has been resent.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        {signupSuccess ? (
          // Sign-up success confirmation message
          <div className="space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-muted-foreground">
                We've sent a confirmation link to <strong>{email}</strong>.
                Please check your inbox and click the link to activate your account.
              </p>
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Mail className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Email not received?</AlertTitle>
              <AlertDescription className="text-blue-700">
                Check your spam or junk folder, or{" "}
                <button 
                  onClick={handleResendConfirmation} 
                  className="text-blue-600 font-medium hover:underline"
                  disabled={loading}
                >
                  click here to resend
                </button>.
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => {
                setIsSignUp(false);
                setSignupSuccess(false);
              }}
            >
              Return to Sign In
            </Button>
          </div>
        ) : (
          // Normal auth form
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">
                {isSignUp ? "Create an account" : "Welcome back"}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp
                  ? "Enter your details to get started"
                  : "Enter your credentials to continue"}
              </p>
            </div>

            {authError && (
              <Alert 
                variant={authError.isEmailTaken ? "default" : "destructive"}
                className={authError.isEmailTaken ? "bg-blue-50 border-blue-200" : ""}
              >
                {authError.isEmailTaken ? (
                  <Info className="h-4 w-4 text-blue-600" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {authError.isEmailTaken ? "Account Already Exists" : "Authentication Error"}
                </AlertTitle>
                <AlertDescription>
                  {authError.isEmailTaken ? (
                    <>
                      This email already has an account. Would you like to{" "}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        sign in instead
                      </button>
                      ?
                    </>
                  ) : (
                    authError.message
                  )}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  min={6}
                />
                {isSignUp && (
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthError(null);
                }}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Auth;
