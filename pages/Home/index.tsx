import ItemsCard from "@/components/Items";
import Link from "next/link";

export default function Home() {
  return (
    <div className="p-4 mb-10">
      <p className="text-2xl text-center font-bold">Dashboard</p>
      <ItemsCard />

      <div className="card bg-accent text-accent-content mb-10">
        <div className="card-body">
          <h2 className="card-title">Sales</h2>
          <div className="card-subtitle">
            Add a sale or view previous sales.
          </div>

          <Link href="/Add/Sales" className="btn">
            Add Sale
          </Link>

          <Link href="/View/Sales" className="btn">
            View Sales
          </Link>
        </div>
      </div>

      <div className="card bg-secondary text-secondary-content">
        <div className="card-body">
          <h2 className="card-title">Monthly Report</h2>
          <div className="card-subtitle">Monthly report for the month</div>

          <Link href="/View/monthlyreport" className="btn">
            Monthly Report
          </Link>
        </div>
      </div>

      <div className="card bg-secondary text-secondary-content my-10">
        <div className="card-body">
          <h2 className="card-title">Advance Payment</h2>
          <div className="card-subtitle">
            Pay payment in advance to employees.
          </div>

          <Link href="/Add/advancepayment" className="btn">
            Advance Payment
          </Link>
        </div>
      </div>
    </div>
  );
}
