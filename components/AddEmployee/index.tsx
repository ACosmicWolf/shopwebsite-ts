import Link from "next/link";

export default function AddEmployeeCard() {
  return (
    <div className="my-4">
      <div className="card bg-secondary text-secondary-content shadow-2xl">
        <div className="card-body">
          <h2 className="card-title">Add Employee</h2>
          <Link href="/Add/addemployee" className="btn">
            Add Employee
          </Link>
        </div>
      </div>
    </div>
  );
}
