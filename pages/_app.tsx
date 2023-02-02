import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthContextProvider, useAuth } from "@/lib/AuthContext";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

const noAuthRoutes = ["/"];

import BottomNavbar from "@/components/BottomNavbar";
import Link from "next/link";
import { HamBurgerMenu, IconAccountCircleOutline } from "@/components/Icons";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const { logout } = useAuth();

  return (
    <AuthContextProvider>
      {noAuthRoutes.includes(router.pathname) ? (
        <Component {...pageProps} />
      ) : (
        <div>
          <div className="navbar bg-base-300">
            <div className="flex-1">
              <Link href="/Home" className="btn btn-ghost normal-case text-xl">
                MEHTA UDYOG
              </Link>
            </div>
            <div className="flex-none">
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <IconAccountCircleOutline width={30} height={30} />
                </label>
                <ul
                  tabIndex={0}
                  className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
                >
                  <li>
                    <button
                      onClick={() => {
                        try {
                          logout();
                          router.push("/");
                        } catch (err: any) {
                          console.log(err.message);
                        }
                      }}
                      className=" btn bg-error text-error-content"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <ProtectedRoute>
            <Component {...pageProps} />
          </ProtectedRoute>
          <BottomNavbar />
        </div>
      )}
    </AuthContextProvider>
  );
}
