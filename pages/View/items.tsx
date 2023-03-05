import { AnimatedSpin } from "@/components/Icons";
import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export default function ViewItems() {
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);

  const [items, setItems] = useState<any[]>([]);

  const [itemToDelete, setItemToDelete] = useState<string>("");

  const fetchItems = async () => {
    setLoading(true);

    let items: Object[] = [];

    (await getDocs(collection(db, "userData", user.uid, "items"))).forEach(
      (doc) => {
        let date = new Date(doc.data().date);
        items.push({
          category: doc.data().category,
          subCategory: doc.data().subCategory,
          quantity: doc.data().quantity,
          date: `${date.getDate()}/${
            date.getMonth() + 1
          }/${date.getFullYear()}`,
          available: doc.data().quantity - doc.data().painted,
          mistry: doc.data().mistry,
          id: doc.id,
        });
      }
    );

    setItems(items);

    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDeleteItem = async (id: string) => {
    setLoading(true);

    const ref = doc(db, "userData", user.uid, "items", id);
    await getDoc(ref).then(async (doc) => {
      if (doc.exists()) {
        await deleteDoc(ref);
      } else {
        console.log("No such document!");
      }
    });

    await fetchItems();

    setLoading(false);
  };

  return (
    <div className="mb-20">
      <h2 className="text-center font-bold text-2xl p-4">View Items</h2>

      <input type="checkbox" id="delete-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Are you sure you want to delete this item? This action cannot be
            undone.
          </h3>
          <div className="modal-action">
            <label
              htmlFor="delete-modal"
              className="btn btn-outline"
              onClick={() => {
                setItemToDelete("");
              }}
            >
              Cancel
            </label>

            <label
              htmlFor="delete-modal"
              className="btn btn-error"
              onClick={() => {
                setLoading(true);
                handleDeleteItem(itemToDelete);
              }}
            >
              Delete!
            </label>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      {items.length > 0 && (
        <div className="m-4">
          <button
            onClick={() => {
              fetchItems();
            }}
            className="btn btn-sm btn-outline"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center">
            <AnimatedSpin />
          </div>
        ) : items.length > 0 ? (
          <table className="table w-full">
            <thead>
              <tr>
                <th></th>
                <th className="text-left">Category</th>
                <th className="text-left">Sub-Category</th>
                <th className="text-left">Date</th>
                <th className="text-left">Mistry</th>
                <th className="text-left">Quantity</th>
                <th className="text-left">Available</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <th>{index + 1}</th>
                  <td>{item.category}</td>
                  <td>{item.subCategory}</td>
                  <td>{item.date}</td>
                  <td>{item.mistry}</td>
                  <td>{item.quantity}</td>
                  <td>{item.available}</td>
                  <td>
                    <label
                      htmlFor="delete-modal"
                      onClick={() => {
                        setItemToDelete(item.id);
                      }}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <th></th>
              <td>Total Items</td>
              {/* Total items = each item's quantity */}
              <td className="text-xl text-primary">
                {items.reduce((acc, item) => {
                  return acc + item.quantity;
                }, 0)}
              </td>
              <td></td>
              <td></td>
              <td>Total Available Items</td>
              <td className="text-xl text-primary">
                {
                  // Total available items = each item's available quantity
                  items.reduce((acc, item) => {
                    return acc + item.available;
                  }, 0)
                }
              </td>
              <td></td>
            </tfoot>
          </table>
        ) : (
          <div className="flex justify-center items-center">
            <h3 className="text-center font-bold text-lg">
              No items found. Add some items to view them here.
            </h3>
          </div>
        )}
      </div>
    </div>
  );
}
