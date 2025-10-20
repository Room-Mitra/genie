"use client";

import InputGroup from "@/components/FormElements/InputGroup";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

async function signUpUser({ firstName, lastName, email, password }) {
  const res = await fetch(`/api/user/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ firstName, lastName, email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to sign up");
  }

  return res.json(); // { user: { ... } }
}

export function SignUpForm() {
  const router = useRouter();

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

    const { firstName, lastName, email, password, repeatPassword } = data;

    if (password != repeatPassword) {
      toast.error("Passwords don't match");
      return;
    }

    try {
      await signUpUser({ firstName, lastName, email, password });
      toast("User signed up successfully!");
      router.replace("/login");
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
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <InputGroup
              label="First Name"
              type="text"
              placeholder="Enter first name"
              className="mb-4.5"
              handleChange={handleChange}
              name="firstName"
              required={true}
            />
            <InputGroup
              label="Last Name"
              type="text"
              placeholder="Enter last name"
              className="mb-4.5 sm:ml-4"
              handleChange={handleChange}
              name="lastName"
              required={true}
            />
          </div>

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
            showPasswordToggle={true}
          />

          <InputGroup
            label="Re-type Password"
            type="password"
            placeholder="Re-type password"
            className="mb-5.5"
            handleChange={handleChange}
            name="repeatPassword"
            required={true}
            showPasswordToggle={true}
          />

          <div className="mb-4.5">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
            >
              Sign Up
              {loading && (
                <span className="inline-block size-3 h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent" />
              )}
            </button>
          </div>
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
