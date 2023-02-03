import { HomeIcon, IconPlus, IconView } from "@/components/Icons";
import Link from "next/link";
import { useRouter } from "next/router";

export default function BottomNavbar() {
  const router = useRouter();

  return (
    <div className="btm-nav bg-base-300 z-50">
      <Link href={"/Add"}>
        <IconPlus />
      </Link>
      <Link href={"/Home"}>
        <p className="bg-gradient-to-r from-sky-600 to-cyan-600 p-4 rounded-full transition-all active:scale-90">
          <HomeIcon />
        </p>
      </Link>
      <Link href={"/View"}>
        <IconView />
      </Link>
    </div>
  );
}
