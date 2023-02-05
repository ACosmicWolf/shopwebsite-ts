import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatedSpin } from "../Icons";

export default function PaintItemsButton() {
  return (
    <Link href={"/Add/paintitems"} className="btn">
      Paint Items
    </Link>
  );
}

export function PaintItemsForm() {
  const { user } = useAuth();

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [selectedItem, setSelectedItem] = useState<string>("");

  const dateInput = useRef<HTMLInputElement>(null);
  const painterSelect = useRef<HTMLSelectElement>(null);
  const quantityInput = useRef<HTMLInputElement>(null);

  const [painters, setPainters] = useState<string[]>([]);

  const [items, setItems] = useState<Object[]>([]);

  const fetchData = async () => {
    let q = query(
      collection(db, "userData", user.uid, "employee"),
      where("type", "==", "Painter")
    );

    let painterData: string[] = [];

    (await getDocs(q)).forEach((doc) => {
      painterData.push(doc.id);
    });

    setPainters(painterData);

    const q2 = query(
      collection(db, "userData", user.uid, "items"),
      where("available", "==", true)
    );

    let itemData: Object[] = [];

    (await getDocs(q2)).forEach((doc) => {
      itemData.push({
        id: doc.id,
        category: doc.data().category,
        subCategory: doc.data().subCategory,
        quantity: doc.data().quantity - doc.data().painted,
        date: doc.data().date,
        mistry: doc.data().mistry,
      });
    });

    console.log(itemData);

    setItems(itemData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePaintItems = async () => {
    setLoading(true);

    const date = dateInput.current?.value;
    const painter: string = painterSelect.current?.value as string;

    const itemID: string = selectedItem;

    const quantity: number = quantityInput.current?.valueAsNumber as number;

    if (!date || !painter || !itemID) {
      setError("Please fill all the fields");
      setLoading(false);
      return;
    }

    const itemRef = doc(db, "userData", user.uid, "items", itemID);

    const itemData = (await getDoc(itemRef)).data();

    let category = "";

    try {
      if (itemData) {
        await getDocs(collection(db, `userData/${user.uid}/category`)).then(
          (querySnapshot) => {
            querySnapshot.forEach((doc: any) => {
              if (doc.id.trim() === itemData.category.trim()) {
                category = doc.id;
              }
            });
          }
        );

        if (itemData.quantity - itemData.painted === quantity) {
          await updateDoc(itemRef, {
            available: false,
            painted: itemData.painted + quantity,
          });
        } else {
          await updateDoc(itemRef, {
            painted: itemData.painted + quantity,
          });
        }

        const paintItemRef = collection(
          db,
          "userData",
          user.uid,
          "paintedItems"
        );

        // Get Price
        const q = query(
          collection(
            db,
            "userData",
            user.uid,
            "category",
            category,
            "subCategory"
          )
        );

        let price = 0;

        await getDocs(q).then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.data().name.trim() === itemData.subCategory.trim()) {
              price = doc.data().paintingPrice;
            }
          });
        });

        console.log(price);

        await addDoc(paintItemRef, {
          date: date,
          painter: painter,
          itemId: itemID,
          quantity: quantity,
          mistry: itemData?.mistry,
          category: category,
          subCategory: itemData?.subCategory,
          price: price,
        });

        let subCategory = "";

        await getDocs(
          collection(
            db,
            "userData",
            user.uid,
            "category",
            category,
            "subCategory"
          )
        ).then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (doc.data().name.trim() === itemData.subCategory.trim()) {
              subCategory = doc.id;
            }
          });
        });

        const subCategoryRef = doc(
          db,
          "userData",
          user.uid,
          "category",
          category,
          "subCategory",
          subCategory
        );

        await updateDoc(subCategoryRef, {
          stock: increment(quantity),
        });
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      return;
    }

    setSuccessMessage("Item Painted Successfully");

    // clear the form
    dateInput.current!.value = "";
    painterSelect.current!.value = "";
    quantityInput.current!.value = "";

    await fetchData();

    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-center text-2xl font-bold p-4">Paint Items</h2>

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

      {/* Form */}
      <div className="p-4 ">
        <div className="card bg-neutral">
          <div className="card-body overflow-x-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedItem === "") {
                  setError("Please Select an Item");
                } else {
                  handlePaintItems();
                }
              }}
            >
              <label htmlFor="item">Item:</label>
              <div
                className="overflow-x-auto w-full form-control"
                aria-required
              >
                {items.length === 0 ? (
                  <div className="text-center">No Items Available</div>
                ) : (
                  <table className="table table-compact">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Category</th>
                        <th>Subcategory</th>
                        <th>Quantity</th>
                        <th>Mistry</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any) => {
                        return (
                          <tr key={item.id}>
                            <th>
                              <input
                                type="radio"
                                name="item"
                                value={item.id}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItem(e.target.value);
                                    if (quantityInput.current !== null) {
                                      quantityInput.current.max = item.quantity;
                                      if (
                                        quantityInput.current.valueAsNumber >
                                        item.quantity
                                      ) {
                                        quantityInput.current.value =
                                          item.quantity;
                                      }
                                    }
                                  }
                                }}
                              />
                            </th>
                            <td>{item.category}</td>
                            <td>{item.subCategory}</td>
                            <td>{item.quantity}</td>
                            <td>{item.mistry}</td>
                            <td>{item.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <label htmlFor="painter">Painter:</label>
              <select
                ref={painterSelect}
                name="painter"
                required
                className="input w-full my-4"
                disabled={painters.length === 0 || loading}
                defaultValue=""
              >
                <option value="" disabled>
                  Select Painter
                </option>
                {painters.map((painter) => (
                  <option key={painter} value={painter}>
                    {painter}
                  </option>
                ))}
              </select>

              <label htmlFor="quantity">Quantity:</label>
              <input
                ref={quantityInput}
                name="quantity"
                required
                type="number"
                className="input w-full my-4"
                placeholder="Enter Quantity"
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
                disabled={loading || selectedItem === ""}
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
