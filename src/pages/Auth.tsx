import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Info, Mail, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

// Define auth modes
const AUTH_MODES = {
  SIGN_UP: 'signup',
  SIGN_IN: 'login',
  FORGOT_PASSWORD: 'forgot_password',
  RESET_SUCCESS: 'reset_success'
};

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState(searchParams.get("mode") === AUTH_MODES.SIGN_UP ? 
    AUTH_MODES.SIGN_UP : AUTH_MODES.SIGN_IN);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [authError, setAuthError] = useState<{ message: string; isEmailTaken?: boolean } | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false); // New state for email checking
  const { toast } = useToast();
  const navigate = useNavigate();

  // For debugging
  useEffect(() => {
    console.log("Auth component mounted - mode: ", mode);
  }, []);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === AUTH_MODES.SIGN_UP) {
      setMode(AUTH_MODES.SIGN_UP);
    } else if (modeParam === AUTH_MODES.SIGN_IN || modeParam === AUTH_MODES.FORGOT_PASSWORD) {
      setMode(modeParam);
    } else {
      setMode(AUTH_MODES.SIGN_IN); // Default
    }

    const emailFromParams = searchParams.get("email");
    if (emailFromParams) {
      setEmail(decodeURIComponent(emailFromParams));
    }
  }, [searchParams]);

  // Function to check if email exists
  const checkIfEmailExists = async (email: string): Promise<boolean> => {
    setIsCheckingEmail(true);
    try {
      // Method 1: Try to sign in with a made-up password
      // This is a hack, but it works well to determine if an email exists
      // Supabase will return different error messages for "invalid password" vs "user not found"
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: "CheckingIfEmailExists123!", // This isn't a real attempt to log in, just checking if email exists
      });

      if (error) {
        console.log("Email check response:", error.message);

        // If error message mentions "invalid login" or "password" but not "email", 
        // the email exists but password was wrong (as expected)
        if (
          (error.message.toLowerCase().includes("invalid login") || 
           error.message.toLowerCase().includes("password")) && 
          !error.message.toLowerCase().includes("user not found") &&
          !error.message.toLowerCase().includes("email not confirmed")
        ) {
          return true; // Email exists
        }
        
        // If error mentions "not found" or specifically says "user not found", email doesn't exist
        if (error.message.toLowerCase().includes("not found")) {
          return false; // Email does not exist
        }

        // Method 2: As a fallback, check if email exists via reset password
        // Some Supabase configurations might not give clear error messages in the method above
        // This is a more reliable way to check
        const { error: resetError, data } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });
        
        // Supabase generally returns no error even for non-existent emails when requesting password reset
        // But if it does return an error like "email not found", we can catch it
        if (resetError && resetError.message.toLowerCase().includes("not found")) {
          return false; // Email does not exist
        }
        
        // If we reached here and got no definitive answer, we'll assume email exists
        // This is safer than allowing duplicates - they can always try to sign up normally if wrong
        return true;
      }
      
      // If login doesn't give an error (extremely unlikely but possible), email exists
      return true;
    } catch (e) {
      console.error("Error checking email:", e);
      // In case of unknown errors, we'll err on the side of caution and assume the email exists
      return true;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      console.log("Auth operation starting - mode:", mode); // Debug log

      if (mode === AUTH_MODES.SIGN_UP) {
        // First check if email already exists
        const emailExists = await checkIfEmailExists(email);
        
        if (emailExists) {
          // If email exists, show message without attempting signup
          setAuthError({ 
            message: "This email already has an account.", 
            isEmailTaken: true 
          });
          setLoading(false);
          return; // Exit early
        }
        
        // If email doesn't exist, proceed with signup
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          // Debug: Log the exact error for troubleshooting
          console.log("Supabase signup error:", error.message, error);
          throw error;
        } else {
          // Sign-up was successful, show confirmation message
          setSignupSuccess(true);
        }
      } else if (mode === AUTH_MODES.SIGN_IN) {
        // Login logic, unchanged
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Signed In!",
          description: "Welcome back! Redirecting...",
        });
      } else if (mode === AUTH_MODES.FORGOT_PASSWORD) {
        // Handle password reset request
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });
        
        if (error) throw error;
        
        // Show success message
        setMode(AUTH_MODES.RESET_SUCCESS);
        // Keep the email for reference in success message
      }
    } catch (error: any) {
      console.log("Auth error:", error.message, error);
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

  // Handle email change - clear any email-taken error when user edits email
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // If there was an email-taken error, clear it when the user starts editing
    if (authError?.isEmailTaken) {
      setAuthError(null);
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

  // Handle mode switching
  const switchToSignIn = () => {
    setMode(AUTH_MODES.SIGN_IN);
    setSignupSuccess(false);
    setAuthError(null);
  };

  const switchToSignUp = () => {
    setMode(AUTH_MODES.SIGN_UP);
    setAuthError(null);
  };

  const switchToForgotPassword = () => {
    setMode(AUTH_MODES.FORGOT_PASSWORD);
    setAuthError(null);
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
              onClick={switchToSignIn}
            >
              Return to Sign In
            </Button>
          </div>
        ) : mode === AUTH_MODES.RESET_SUCCESS ? (
          // Password reset email sent confirmation
          <div className="space-y-4">
            <div className="flex justify-center">
              <Mail className="h-12 w-12 text-blue-500" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-muted-foreground">
                We've sent password reset instructions to <strong>{email}</strong>.
                Please check your inbox and follow the link to reset your password.
              </p>
            </div>
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Next steps</AlertTitle>
              <AlertDescription className="text-blue-700">
                After clicking the link in the email, you'll be able to create a new password.
                If you don't receive the email, check your spam folder.
              </AlertDescription>
            </Alert>
            <Button 
              variant="outline" 
              className="w-full mt-4 flex items-center justify-center gap-2"
              onClick={switchToSignIn}
            >
              <ArrowLeft className="h-4 w-4" /> Return to Sign In
            </Button>
          </div>
        ) : (
          // Normal auth form
          <>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">
                {mode === AUTH_MODES.SIGN_UP 
                  ? "Create an account" 
                  : mode === AUTH_MODES.FORGOT_PASSWORD
                  ? "Reset your password"
                  : "Welcome back"}
              </h1>
              <p className="text-muted-foreground">
                {mode === AUTH_MODES.SIGN_UP
                  ? "Enter your details to get started"
                  : mode === AUTH_MODES.FORGOT_PASSWORD
                  ? "Enter your email to receive reset instructions"
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
                        onClick={switchToSignIn}
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
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className={isCheckingEmail ? "pr-10" : ""}
                    disabled={loading || isCheckingEmail}
                  />
                  {isCheckingEmail && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {mode !== AUTH_MODES.FORGOT_PASSWORD && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    min={6}
                    disabled={loading}
                  />
                  {mode === AUTH_MODES.SIGN_UP && (
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || isCheckingEmail}
              >
                {loading || isCheckingEmail ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isCheckingEmail ? "Checking Email..." : "Loading..."}
                  </span>
                ) : mode === AUTH_MODES.SIGN_UP 
                  ? "Sign Up" 
                  : mode === AUTH_MODES.FORGOT_PASSWORD
                  ? "Send Reset Instructions"
                  : "Sign In"}
              </Button>
            </form>

            <div className="text-center space-y-4">
              {/* Forgot password link - only show for login mode */}
              {mode === AUTH_MODES.SIGN_IN && (
                <div>
                  <button
                    type="button"
                    onClick={switchToForgotPassword}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Toggle between sign in and sign up */}
              <div>
                {mode === AUTH_MODES.FORGOT_PASSWORD ? (
                  <button
                    type="button"
                    onClick={switchToSignIn}
                    className="text-sm text-primary hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="h-3 w-3" /> Back to Sign In
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={mode === AUTH_MODES.SIGN_UP ? switchToSignIn : switchToSignUp}
                    className="text-sm text-primary hover:underline"
                  >
                    {mode === AUTH_MODES.SIGN_UP
                      ? "Already have an account? Sign in"
                      : "Don't have an account? Sign up"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Auth;
