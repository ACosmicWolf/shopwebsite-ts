import { AnimatedSpin } from "@/components/Icons";
import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import { addDoc, collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useRef, useState } from "react";

export default function AddCategory() {
  const { user } = useAuth();

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddCategory = async () => {
    setLoading(true);
    if (inputRef.current?.value === "") {
      setError("Category name is required");
      setLoading(false);
    } else {
      let categoryName: string = inputRef.current?.value as string;
      /* Add Category in firestore database */

      if (categoryName) {
        const docRef = await getDoc(doc(db, "userData", user.uid));

        try {
          if (!docRef.exists()) {
            await setDoc(doc(db, "userData", user.uid), {
              email: user.email,
              uid: user.uid,
            });
          }

          await getDoc(
            doc(db, "userData", user.uid, "category", categoryName)
          ).then(async (categoryDoc) => {
            if (categoryDoc.exists()) {
              console.log("Document Already Exists");
            } else {
              // doc.data() will be undefined in this case
              console.log("Document does not exist! Creating...");
              await setDoc(
                doc(db, "userData", user.uid, "category", categoryName),
                {
                  name: categoryName,
                }
              );
            }
          });
        } catch (error: any) {
          setError(error.message);
        }
      }

      setLoading(false);

      setSuccessMessage("Category Added Successfully");

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      <h2 className="font-bold text-2xl p-4">Add New Category</h2>

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

      <div className="card m-8 bg-neutral text-neutral-content">
        <div className="card-body items-center text-center">
          <h2 className="card-title  mb-5">Add Category!</h2>
          <input
            type="text"
            placeholder="Category Name"
            className="input input-bordered  mb-5"
            disabled={loading}
            ref={inputRef}
          />
          <div className="card-actions w-full justify-between">
            <button
              className="btn btn-primary w-auto"
              onClick={() => {
                handleAddCategory();
              }}
              disabled={loading}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
