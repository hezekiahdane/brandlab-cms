import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap } from "lucide-react";

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  if (user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Brandlab</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Multi-tenant content management platform
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm login={login} toast={toast} navigate={navigate} />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm
                register={register}
                toast={toast}
                navigate={navigate}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>Demo accounts available after first load:</p>
            <p className="mt-1 font-mono">
              kim@brandlab.io / password123
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-12">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Streamline your social media workflow
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Manage multiple brands, collaborate across teams, and publish
            content across all platforms from a single, powerful interface.
          </p>
          <div className="space-y-3">
            {[
              "Multi-brand workspace management",
              "Role-based content approval workflow",
              "Cross-platform content publishing",
              "Real-time hashtag analytics",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({
  login,
  toast,
  navigate,
}: {
  login: (email: string, password: string) => Promise<void>;
  toast: any;
  navigate: (to: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-login-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="input-login-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            data-testid="button-login"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterForm({
  register,
  toast,
  navigate,
}: {
  register: (email: string, name: string, password: string) => Promise<void>;
  toast: any;
  navigate: (to: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, name, password);
      navigate("/");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: err.message || "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="register-name">Full Name</Label>
            <Input
              id="register-name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              data-testid="input-register-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-register-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              data-testid="input-register-password"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            data-testid="button-register"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
