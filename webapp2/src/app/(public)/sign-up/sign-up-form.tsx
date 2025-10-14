import InputGroup from "@/components/FormElements/InputGroup";
import Link from "next/link";

export function SignUpForm() {
  return (
    <>
      <div>
        <h2 className="p-5 text-center text-xl font-medium text-dark dark:text-white">
          Sign up for an account
        </h2>

        <form action="#">
          <InputGroup
            label="Name"
            type="text"
            placeholder="Enter full name"
            className="mb-4.5"
          />

          <InputGroup
            label="Email"
            type="email"
            placeholder="Enter email address"
            className="mb-4.5"
          />

          <InputGroup
            label="Password"
            type="password"
            placeholder="Enter password"
            className="mb-4.5"
          />

          <InputGroup
            label="Re-type Password"
            type="password"
            placeholder="Re-type password"
            className="mb-5.5"
          />

          <button className="mt-10 flex w-full justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90">
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
