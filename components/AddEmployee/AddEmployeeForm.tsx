import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useRef, useState } from "react";
import { AnimatedSpin } from "../Icons";

export default function AddEmployeeForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);

  const [error, setError] = useState<string>();

  const [successMessage, setSuccessMessage] = useState<string>();

  const handleFormSubmit = async () => {
    setLoading(true);
    const employeeName: string = inputRef.current?.value as string;
    const employeeType: string = selectRef.current?.value as string;

    console.log(employeeName, employeeType);

    try {
      const ref = doc(db, "userData", user.uid, "employee", employeeName);

      await getDoc(ref).then(async (employeeDoc) => {
        if (employeeDoc.exists()) {
          setError("Employee Already Exists.");
        } else {
          await setDoc(ref, {
            name: employeeName,
            type: employeeType,
          });

          setSuccessMessage("Added Employee Successfully.");
        }
      });
    } catch (err: any) {
      setError(err.message);
    }

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (selectRef.current) {
      selectRef.current.value = "";
    }

    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center p-4">Add Employee</h2>

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
            <span>Adding Category Please Wait a moment.</span>
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

      <div className="p-4">
        <div className="card bg-neutral text-neutral-content">
          <div className="card-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleFormSubmit();
              }}
            >
              <input
                className="input w-full"
                placeholder="Employee Name"
                required
                ref={inputRef}
                disabled={loading}
              />
              <select
                className="select w-full my-4"
                defaultValue=""
                required
                ref={selectRef}
                disabled={loading}
              >
                <option disabled value="">
                  Select Employee Type
                </option>
                <option>Painter</option>
                <option>Mistry</option>
              </select>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
