import { AnimatedSpin } from "@/components/Icons";
import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

export default function AdvancePayment() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState<string[]>([]);

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const employeeSelectRef = useRef<HTMLSelectElement>(null);
  const quanityRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);

  const fetchEmployees = async () => {
    await getDocs(collection(db, "userData", user.uid, "employee")).then(
      (querySnapshot) => {
        const data = querySnapshot.docs.map((doc) => doc.id);
        setEmployees(data);
      }
    );
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const employeeName: string = employeeSelectRef.current?.value as string;
    const quantity = quanityRef.current?.value;
    const date = dateRef.current?.value;

    if (employeeName === "" || quantity === "" || date === "") {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    // Add Advance Payment in firestore database

    const ref = collection(
      db,
      "userData",
      user.uid,
      "employee",
      employeeName,
      "advancePayment"
    );

    await addDoc(ref, {
      amount: quantity,
      date: date,
    });

    // empty the fields
    employeeSelectRef.current!.value = "";
    quanityRef.current!.value = "";
    dateRef.current!.value = "";

    setLoading(false);
    setSuccessMessage("Advance Payment Added Successfully");
  };

  return (
    <div>
      <h2 className="text-center p-4 text-2xl font-bold">Advance Payment</h2>

      <div>
        {error && (
          <div className="p-4">
            <div className="alert alert-error shadow-lg">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
                <button
                  onClick={() => {
                    setError("");
                  }}
                  className="btn btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="alert shadow-lg">
            <div>
              <AnimatedSpin />
              <span>Adding Advance Payment. Please Wait a moment.</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="p-4">
            <div className="alert alert-success shadow-lg">
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current flex-shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{successMessage}</span>
                <button
                  onClick={() => {
                    setSuccessMessage("");
                  }}
                  className="btn btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="card bg-neutral text-neutral-content">
          <div className="card-body">
            <form
              onSubmit={(e) => {
                handleSubmit(e);
              }}
            >
              <label htmlFor="employeeSelect" className="label">
                Employee:{" "}
              </label>
              <select
                className="select w-full"
                name="employeeSelect"
                defaultValue=""
                disabled={employees.length === 0}
                required
                ref={employeeSelectRef}
              >
                <option disabled value="">
                  Select Employee
                </option>
                {employees.map((employee) => (
                  <option key={employee} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>

              <label htmlFor="amount" className="label">
                Amount:{" "}
              </label>
              <input
                type="number"
                className="input w-full"
                name="amount"
                placeholder="Amount"
                required
                ref={quanityRef}
              />

              <label htmlFor="date" className="label">
                Date:{" "}
              </label>
              <input
                type="date"
                className="input w-full"
                name="date"
                placeholder="Date"
                required
                ref={dateRef}
              />

              <button className="btn btn-primary mt-4" type="submit">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
