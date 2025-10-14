"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import Link from "next/link";
import { useState } from "react";
import {  toast } from "react-toastify";
import { redirect } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// example: https://api.roommitra.com

async function signUpUser({ name, email, password }) {
  const res = await fetch(`${API_BASE_URL}/user/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to sign up");
  }

  return res.json(); // { user: { ... } }
}

export function SignUpForm() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const { name, email, password, repeatPassword } = data;

    if (password != repeatPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      const result = await signUpUser({ name, email, password });
      console.log("User signed up:", result.user);
      toast("User signed up successfully!");
      setTimeout(() => {
        redirect("/login");
      }, 4000);
    } catch (err) {
      toast.error(
        "Error signing up user" + (err?.message && `: ${err.message}`),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div>
        <h2 className="p-5 text-center text-xl font-medium text-dark dark:text-white">
          Sign up for an account
        </h2>

        <form onSubmit={handleSubmit}>
          <InputGroup
            label="Name"
            type="text"
            placeholder="Enter full name"
            className="mb-4.5"
            handleChange={handleChange}
            name="name"
            required={true}
          />

          <InputGroup
            label="Email"
            type="email"
            placeholder="Enter email address"
            className="mb-4.5"
            handleChange={handleChange}
            name="email"
            required={true}
          />

          <InputGroup
            label="Password"
            type="password"
            placeholder="Enter password"
            className="mb-4.5"
            handleChange={handleChange}
            name="password"
            required={true}
          />

          <InputGroup
            label="Re-type Password"
            type="password"
            placeholder="Re-type password"
            className="mb-5.5"
            handleChange={handleChange}
            name="repeatPassword"
            required={true}
          />

          <button className="mt-10 flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90">
            Sign Up
            {loading && (
              <span className="inline-block size-3 h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-primary hover:text-primary/50 dark:text-primary dark:hover:text-primary/50"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
