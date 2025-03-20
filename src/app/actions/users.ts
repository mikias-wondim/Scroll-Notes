"use server";

import { createClient } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import { LoginFormData, SignupFormData } from "@/validations/auth";

export async function login(data: LoginFormData) {
  try {
    const { auth } = await createClient();
    const { error } = await auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}

export async function signup(data: SignupFormData) {
  const { auth } = await createClient();
  let authUser = null;

  try {
    // Check if username is already taken before creating auth user
    const existingUser = await prisma.user.findUnique({
      where: { username: data.username },
    });

    if (existingUser) {
      return { success: false, error: "Username is already taken" };
    }

    // Check if email is already taken in Prisma
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      return { success: false, error: "User already exists with this email" };
    }

    // If username and email are available, proceed with auth signup
    const {
      error: signUpError,
      data: { user },
    } = await auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (signUpError) {
      throw new Error(signUpError.message);
    }

    const userId = user?.id;
    if (!userId) {
      throw new Error("User ID not found");
    }

    authUser = user;

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: data.email,
        username: data.username,
      },
    });

    return { success: true, newUser };
  } catch (error) {
    // If we have created an auth user but something else failed, sign them out
    if (authUser) {
      await auth.signOut();
    }
    return { success: false, error: handleError(error) };
  }
}

export async function logout() {
  try {
    const { auth } = await createClient();
    const { error } = await auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: handleError(error) };
  }
}
