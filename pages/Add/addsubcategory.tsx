import { AnimatedSpin } from "@/components/Icons";
import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

export default function AddCategory() {
  const { user } = useAuth();

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const makingPriceRef = useRef<HTMLInputElement>(null);
  const paintingPriceRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<string[]>([]);

  const handleAddSubCategory = async () => {
    setLoading(true);

    if (inputRef.current?.value === "" || selectRef.current?.value === "") {
      setError(
        "Sub-Category name and Category are required. Please Select Them"
      );
    } else {
      let subCategoryName: string = inputRef.current?.value as string;

      let category: string = selectRef.current?.value as string;

      let makingPrice: number = Number(makingPriceRef.current?.value);
      let paintingPrice: number = Number(paintingPriceRef.current?.value);

      /* Add Sub-Category in firestore database */
      const document = doc(db, "userData", user.uid, "category", category);

      await getDoc(document).then(async (categoryDoc) => {
        if (categoryDoc.exists()) {
          console.log("=> Document Exists");
          console.info("=> 👌 Everything Ok till now!");

          // Add Sub-Category to collection
          try {
            await setDoc(
              doc(db, "userData", user.uid, "category", category),
              {
                subCategory: {
                  [subCategoryName]: {
                    name: subCategoryName,
                    makingPrice: makingPrice,
                    paintingPrice: paintingPrice,
                    stock: 0,
                  },
                },
              },
              { merge: true }
            );
            setSuccessMessage("Sub-Category Added Successfully");
            console.info("=> 👌 Sub-Category Added Successfully");
          } catch (error: any) {
            setError(error.message);
          }
        } else {
          // doc.data() will be undefined in this case
          // Should not happen
          // Something f**ked up
          console.warn("=> Document does not exist! Something went wrong!");
          setError("Category does not exist. Something went wrong!");
        }
      });

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      if (selectRef.current) {
        selectRef.current.value = "";
      }
    }

    setLoading(false);
  };

  const fetchCategories = async () => {
    const querySnapshot = await getDocs(
      collection(db, "userData", user.uid, "category")
    );

    const categoryData: string[] = [];

    querySnapshot.forEach((doc) => {
      categoryData.push(doc.id);
    });

    setCategories(categoryData);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div>
      <h2 className="font-bold text-2xl p-4">Add New Sub-Category</h2>

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
          <h2 className="card-title  mb-5">Add Sub-Category!</h2>
          <select
            className="select select-bordered w-full max-w-xs"
            defaultValue=""
            ref={selectRef}
          >
            <option disabled value="">
              Select Category
            </option>
            {categories.map((category) => {
              return (
                <option key={category} value={category}>
                  {category}
                </option>
              );
            })}
          </select>

          <input
            ref={inputRef}
            type="text"
            placeholder="Enter Sub-Category Name"
            className="input input-bordered w-full max-w-xs mt-5"
          />

          <input
            ref={makingPriceRef}
            type="number"
            placeholder="Enter Making Price"
            className="input input-bordered w-full max-w-xs mt-5"
          />

          <input
            ref={paintingPriceRef}
            type="number"
            placeholder="Enter Painting Price"
            className="input input-bordered w-full max-w-xs mt-5"
          />

          <div className="card-actions w-full justify-between">
            <button
              className="btn btn-primary w-auto"
              onClick={() => {
                handleAddSubCategory();
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
