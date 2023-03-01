import { AnimatedSpin } from "@/components/Icons";
import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

export default function Sales() {
  const { user } = useAuth();

  const quanityRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);

  const [stock, setStock] = useState<object[]>([]);

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const fetchStock = async () => {
    let stockData: any = [];

    await getDocs(collection(db, "userData", user.uid, "category")).then(
      (categoryDocs) => {
        categoryDocs.forEach(async (categoryDoc) => {
          await getDocs(
            collection(
              db,
              "userData",
              user.uid,
              "category",
              categoryDoc.id,
              "subCategory"
            )
          )
            .then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                console.log(doc.data());
                if (doc.data().stock > 0) {
                  stockData.push({
                    category: categoryDoc.id,
                    subCategory: doc.data().name,
                    stock: doc.data().stock,
                  });
                }
              });
            })
            .then(() => {
              setStock(stockData);
            });
        });
      }
    );
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const [max, setMax] = useState<number>(0);

  const [selected, setSelected] = useState<Object>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const quantity = quanityRef.current?.value || 0;
    const date = dateRef.current?.value;
    const price = priceRef.current?.value as string;

    if (quantity === "" || date === "" || price === "" || !selected) {
      setError("All fields are required");
      return;
    }

    const selectedStock: any = selected;

    // Add Sales in firestore database

    const salesRef = collection(db, "userData", user.uid, "sales");

    await addDoc(salesRef, {
      quantity: quantity,
      date: date,
      price: parseInt(price),
      category: selectedStock.category,
      subCategory: selectedStock.subCategory,
    });

    // Update Stock

    const ref = doc(
      db,
      "userData",
      user.uid,
      "category",
      selectedStock.category
    );

    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      await updateDoc(ref, {
        [`subCategory.${selectedStock.subCategory}.stock`]:
          selectedStock.stock - Number(quantity),
      });
      setMax(selectedStock.stock - Number(quantity));
      quanityRef.current!.max = String(selectedStock.stock - Number(quantity));
    }

    // empty the fields
    quanityRef.current!.value = "";
    dateRef.current!.value = "";
    priceRef.current!.value = "";

    await fetchStock();

    setLoading(false);
    setSuccessMessage("Sales Added Successfully");
  };

  return (
    <div>
      <h2 className="text-center font-bold text-2xl p-4">Sales</h2>

      {/* Messages */}
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
      </div>

      <div className="p-4">
        <div className="card bg-neutral text-neutral-content">
          <div className="card-body">
            <form
              onSubmit={(e) => {
                handleSubmit(e);
              }}
            >
              {/* Stock Table Select */}
              <label htmlFor="stockTableSelect" className="label">
                Select Stock:{" "}
              </label>

              <div className="overflow-x-auto">
                {stock.length > 0 ? (
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Category</th>
                        <th>Subcategory</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stock &&
                        stock.map((item: any, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="radio"
                                className="radio"
                                onChange={() => {
                                  setSelected(item);
                                  setMax(item.stock);
                                  if (quanityRef.current) {
                                    quanityRef.current.max = item.stock;
                                    if (quanityRef.current.value > item.stock) {
                                      quanityRef.current.value = item.stock;
                                    }
                                  }
                                }}
                              />
                            </td>
                            <td>{item.category}</td>
                            <td>{item.subCategory}</td>
                            <td>{item.stock}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4">
                    <h2 className="text-2xl font-bold">No Stock Available.</h2>
                  </div>
                )}
              </div>

              {/* Quantity */}

              <label htmlFor="quanity" className="label">
                Quantity:{" "}
              </label>

              <input
                type="number"
                className="input w-full"
                name="quanity"
                placeholder="Quantity"
                required
                ref={quanityRef}
                onChange={() => {
                  if (quanityRef.current) {
                    if (Number(quanityRef.current.value) > max) {
                      quanityRef.current.value = String(max);
                    }
                  }
                }}
              />

              {/* Max Quanity Display */}

              <label className="label">Max Quantity: {max || 0}</label>

              {/* Price */}
              <label htmlFor="price" className="label">
                Price:{" "}
              </label>

              <input
                type="number"
                className="input w-full"
                name="price"
                placeholder="Price"
                required
                ref={priceRef}
              />

              {/* Date */}
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

              {/* Submit Button */}

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
