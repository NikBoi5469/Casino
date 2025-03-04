import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DeveloperFooter } from "@/components/developer-footer";

export default function AuthPage({ mode = "login" }: { mode?: "login" | "register" }) {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const form = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px] grid md:grid-cols-2 gap-8 items-center">
        <div className="text-center md:text-left space-y-4">
          <h1 className="text-4xl font-bold text-primary">$OMO CASINO</h1>
          <p className="text-lg text-muted-foreground">
            Welcome to the next generation of online gaming. Experience the thrill of our casino games with cutting-edge technology and seamless gameplay.
          </p>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {mode === "login" ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {mode === "login" 
                ? "Enter your credentials to continue"
                : "Sign up to start playing"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  mode === "login" 
                    ? loginMutation.mutate(data)
                    : registerMutation.mutate(data)
                )}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                >
                  {mode === "login" ? "Login" : "Register"}
                </Button>
                <div className="text-center text-sm">
                  {mode === "login" ? (
                    <Link href="/auth/register" className="text-primary hover:underline">
                      Don't have an account? Register here
                    </Link>
                  ) : (
                    <Link href="/auth/login" className="text-primary hover:underline">
                      Already have an account? Login here
                    </Link>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <DeveloperFooter />
    </div>
  );
}