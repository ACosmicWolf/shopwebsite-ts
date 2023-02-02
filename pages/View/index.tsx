import Link from "next/link";
import { useRouter } from "next/router";

export default function View() {
  const router = useRouter();

  return (
    <div className="p-4 overflow-y-auto mb-6">
      <p className="text-2xl text-center font-bold mb-8">View</p>

      {/* View Items */}
      <div className="card bg-primary text-primary-content shadow-2xl my-4">
        <div className="card-body">
          <h2 className="card-title">Items</h2>
          <Link href="/View/Stock" className="btn">
            View Stock
          </Link>
          <Link href="/View/items" className="btn">
            View Items
          </Link>
          <Link href="/View/PaintedItems" className="btn">
            View Painted Items
          </Link>
        </div>
      </div>

      {/* View Category */}
      <div className="card bg-accent text-accent-content shadow-2xl my-4">
        <div className="card-body">
          <h2 className="card-title">View Category</h2>
          <button
            onClick={() => {
              router.push("/View/category");
            }}
            className="btn"
          >
            View Categories
          </button>
        </div>
      </div>

      {/* View Employees */}
      <div className="card bg-secondary text-secondary-content shadow-2xl mt-5  my-10">
        <div className="card-body">
          <h2 className="card-title">View Employees</h2>
          <button
            onClick={() => {
              router.push("/View/employee");
            }}
            className="btn"
          >
            View Employees
          </button>
        </div>
      </div>
    </div>
  );
}
