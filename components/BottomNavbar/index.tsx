import { HomeIcon, IconPlus, IconView } from "@/components/Icons";
import { useRouter } from "next/router";

export default function BottomNavbar() {
  const router = useRouter();

  return (
    <div className="w-screen fixed bottom-0 p-2 bg-base-100 transition-all flex justify-between items-center px-10">
      <a
        onClick={(e) => {
          e.preventDefault();
          router.push("/Add");
        }}
      >
        <IconPlus />
      </a>
      <a
        className="bg-gradient-to-r from-sky-600 to-cyan-600 p-4 rounded-full transition-all active:scale-90"
        onClick={(e) => {
          e.preventDefault();
          router.push("/Home");
        }}
      >
        <HomeIcon />
      </a>
      <a
        onClick={(e) => {
          e.preventDefault();
          router.push("/View");
        }}
      >
        <IconView />
      </a>
    </div>
  );
}
