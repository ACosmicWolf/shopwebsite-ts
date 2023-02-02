import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatedSpin } from "../Icons";

export default function MakeItemsButton() {
  return (
    <Link href="/Add/makeitems" className="btn">
      Make Items
    </Link>
  );
}

export function MakeItemsForm() {
  const { user } = useAuth();

  const mistrySelect = useRef<HTMLSelectElement>(null);
  const categorySelect = useRef<HTMLSelectElement>(null);
  const subCategorySelect = useRef<HTMLSelectElement>(null);
  const quantityInput = useRef<HTMLInputElement>(null);
  const dateInput = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [mistrys, setMistrys] = useState<string[]>([]);

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const fetchData = async () => {
    let categoryData: string[] = [];

    (await getDocs(collection(db, "userData", user.uid, "category"))).forEach(
      (doc) => {
        categoryData.push(doc.id);
      }
    );

    setCategories(categoryData);

    let mistryData: string[] = [];

    (await getDocs(collection(db, "userData", user.uid, "employee"))).forEach(
      (doc) => {
        if (doc.data().type === "Mistry") mistryData.push(doc.id);
      }
    );

    setMistrys(mistryData);
  };

  const fetchSubcategories = async () => {
    let category: string = categorySelect.current?.value as string;

    await getDoc(doc(db, "userData", user.uid, "category", category)).then(
      (doc) => {
        console.log(doc.data());
        if (doc.exists()) {
          setSubCategories(Object.keys(doc.data().subCategory));
        } else {
          console.log("No such document!");
        }
      }
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItemFormSubmit = async () => {
    setLoading(true);
    const category: string = categorySelect.current?.value as string;
    const subCategory: string = subCategorySelect.current?.value as string;
    const mistry: string = mistrySelect.current?.value as string;
    const quantity: number = parseInt(quantityInput.current?.value as string);

    const date = dateInput.current?.value;

    console.log(category, subCategory, mistry, quantity, date);

    const reference = collection(db, "userData", user.uid, "items");

    try {
      let price = 0;

      // Get Price
      const q = query(
        collection(db, "userData", user.uid, "category"),
        where("name", "==", category)
      );

      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        price = doc.data().subCategory[subCategory].makingPrice;

        console.log(price);
      });

      await addDoc(reference, {
        category: category,
        subCategory: subCategory,
        mistry: mistry,
        quantity: quantity,
        date: date,
        painted: 0,
        available: true,
        price: price,
      });
      setSuccessMessage("Item Added Successfully!!");
    } catch (error: any) {
      console.log(error);
      setError(error.message);
    }

    // Reset Form
    if (mistrySelect.current) mistrySelect.current.value = "";
    if (categorySelect.current) categorySelect.current.value = "";
    if (subCategorySelect.current) subCategorySelect.current.value = "";
    if (quantityInput.current) quantityInput.current.value = "";
    if (dateInput.current) dateInput.current.value = "";

    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-center text-2xl font-bold p-4">Make Items</h2>

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

      {/* Form Card */}
      <div className="p-4">
        <div className="card bg-neutral">
          <div className="card-body">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddItemFormSubmit();
              }}
            >
              <select
                className="select w-full my-4"
                defaultValue=""
                ref={mistrySelect}
                required
                disabled={mistrys.length === 0 || loading}
              >
                <option disabled value="">
                  Select Mistry
                </option>
                {mistrys &&
                  mistrys.map((mistry) => (
                    <option key={mistry}>{mistry}</option>
                  ))}
              </select>
              <select
                className="select w-full my-4"
                defaultValue=""
                ref={categorySelect}
                required
                disabled={categories.length === 0 || loading}
                onChange={() => {
                  fetchSubcategories();
                }}
              >
                <option disabled value="">
                  Select Category
                </option>
                {categories &&
                  categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
              </select>
              <select
                className="select w-full my-4"
                defaultValue=""
                ref={subCategorySelect}
                required
                disabled={subCategories.length === 0 || loading}
              >
                <option disabled value="">
                  Select Sub Category
                </option>
                {subCategories &&
                  subCategories.map((subCategory) => (
                    <option key={subCategory}>{subCategory}</option>
                  ))}
              </select>

              <input
                required
                min={1}
                defaultValue={1}
                type="number"
                className="input w-full my-4"
                placeholder="Select Quantity"
                ref={quantityInput}
                disabled={loading}
              />

              <label htmlFor="date">Date:</label>
              <input
                ref={dateInput}
                name="date"
                required
                type="date"
                className="input w-full my-4"
                placeholder="Select Date"
                disabled={loading}
              />

              <button
                className="btn btn-primary w-full my-4"
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
