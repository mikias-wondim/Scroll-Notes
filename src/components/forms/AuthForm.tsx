"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  loginSchema,
  signupSchema,
  type LoginFormData,
  type SignupFormData,
} from "@/validations/auth";
import { login, signup } from "@/app/actions/users";
import { Loader2 } from "lucide-react";
import { CardContent, CardFooter } from "../ui/card";
import Link from "next/link";
import { toast } from "sonner";

interface AuthFormProps {
  type: "login" | "signup";
}

function AuthForm({ type }: AuthFormProps) {
  const isLogin = type === "login";
  const router = useRouter();

  const form = useForm<LoginFormData | SignupFormData>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(isLogin ? {} : { username: "", confirmPassword: "" }),
    },
  });

  const onSubmit = async (data: LoginFormData | SignupFormData) => {
    const result = await (isLogin
      ? login(data as LoginFormData)
      : signup(data as SignupFormData));

    if (result.success) {
      if (isLogin) {
        toast.success("Logged in successfully", {
          description: "Welcome back!",
        });
      } else {
        toast.success("Account created successfully", {
          description: "Your account has been created successfully.",
        });
      }
      router.replace("/");
    } else {
      if (isLogin) {
        toast.error("Login failed", {
          description: result.error,
        });
      } else {
        if (result?.error?.includes("User already exists")) {
          toast.error("User already exists", {
            description: result.error,
          });
        } else {
          toast.error("Signup failed", {
            description: result.error,
          });
        }
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CardContent className="space-y-4">
          {!isLogin && (
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
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
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isLogin && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLogin ? (
              "Login"
            ) : (
              "Sign Up"
            )}
          </Button>
          <p className="text-xs">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              href={isLogin ? "/signup" : "/login"}
              className="text-blue-500 hover:underline"
            >
              {isLogin ? "Sign Up" : "Login"}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Form>
  );
}

export default AuthForm;
