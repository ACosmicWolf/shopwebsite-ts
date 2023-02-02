import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const { user, login } = useAuth();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string>("");

  const router = useRouter();

  if (user) {
    return (
      <>
        <p>
          <p className="text-xl m-5">
            SIGNED IN AS <span className="text-primary">{user.email}</span>
          </p>
        </p>

        <Link href="/Home" className="btn btn-primary m-4">
          Home
        </Link>
      </>
    );
  } else {
    return (
      <div className="bg-base-100">
        <p>Not signed in</p>

        {error && <p>{error}</p>}

        <div className="card bg-neutral">
          <div className="card-body">
            <form
              className="flex flex-col"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await login(username, password);
                  console.log("Signed in");
                } catch (err: any) {
                  setError(err.message);
                }
              }}
            >
              <label htmlFor="username">Username</label>
              <input
                className="input"
                type="text"
                name="username"
                id="username"
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
              <label htmlFor="password">Password</label>
              <input
                className="input"
                type="password"
                name="password"
                id="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
              <button type="submit" className="btn btn-primary">
                Sign in
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
