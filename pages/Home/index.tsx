import ItemsCard from "@/components/Items";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4">
      <p className="text-2xl text-center font-bold">Dashboard</p>
      <ItemsCard />

      <div className="card bg-secondary text-secondary-content">
        <div className="card-body">
          <h2 className="card-title">Monthly Report</h2>
          <div className="card-subtitle">Sales report for the month</div>

          <Link href="/View/monthlyreport" className="btn">
            Monthly Report
          </Link>
        </div>
      </div>
    </div>
  );
}
