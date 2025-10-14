import Link from "next/link";
import SigninWithPassword from "../SigninWithPassword";

export default function Login() {
  return (
    <>
      <div>
        <h2 className="p-5 text-center text-xl font-medium text-dark dark:text-white">
          Sign in to your account
        </h2>
        <SigninWithPassword />
      </div>

      <div className="mt-6 text-center">
        <p>
          Don’t have any account?{" "}
          <Link href="/auth/sign-up" className="text-primary">
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
}
