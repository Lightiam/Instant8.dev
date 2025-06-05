import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.username || !formData.password) {
      setError("Username and password are required");
      setIsLoading(false);
      return;
    }

    const success = await login(formData.username, formData.password);
    
    if (success) {
      setLocation("/dashboard");
    } else {
      setError("Invalid username or password");
    }
    
    setIsLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900 border-slate-800">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Link href="/">
              <h1 className="text-2xl font-bold text-white">Instanti8.dev</h1>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center text-white">Sign in</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            {error && (
              <div className="text-red-400 text-sm text-center">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
