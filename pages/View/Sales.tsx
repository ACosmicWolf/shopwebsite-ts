import { AnimatedSpin } from "@/components/Icons";
import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

const AllMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// format date to DD MM YYYY

const formatDate = (date: Date) => {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export default function ViewSales() {
  const { user } = useAuth();

  const [loading, setLoading] = useState<boolean>(false);

  const monthRef = useRef<HTMLSelectElement>(null);

  const [months, setMonths] = useState<object[]>([]);

  const [salesTableData, setSalesTableData] = useState<object[]>([]);

  const fetchMonths = async () => {
    const ref = collection(db, "userData", user.uid, "sales");

    let monthsData: object[] = [];

    let noDuplicateMonths: string[] = [];

    await getDocs(ref).then((querySnapshot) => {
      querySnapshot.docs.map((doc) => {
        let data = doc.data();

        let date = new Date(data.date);

        let formattedDate =
          AllMonths[date.getMonth()] + " " + date.getFullYear();

        if (!noDuplicateMonths.includes(formattedDate)) {
          noDuplicateMonths.push(formattedDate);
          monthsData.push({
            month: formattedDate,
            date: date,
          });
        }
      });
    });

    console.log(monthsData);

    setMonths(monthsData);
  };

  useEffect(() => {
    fetchMonths();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    const selectedMonth: any = monthRef.current?.value;

    console.log(selectedMonth);

    const ref = collection(db, "userData", user.uid, "sales");

    let salesData: object[] = [];

    if (selectedMonth === "All") {
      // Fetch all sales
      await getDocs(ref).then((querySnapshot) => {
        querySnapshot.docs.map((doc) => {
          let data = doc.data();
          salesData.push({
            date: formatDate(new Date(data.date)),
            category: data.category,
            subcategory: data.subCategory,
            quantity: data.quantity,
            price: data.price,
            id: doc.id,
          });
        });
      });
    } else {
      // Fetch sales of selected month

      let date = new Date(selectedMonth);

      await getDocs(ref).then((querySnapshot) => {
        querySnapshot.docs.map((doc) => {
          let data = doc.data();

          let docDate = new Date(data.date);

          if (
            docDate.getMonth() === date.getMonth() &&
            docDate.getFullYear() === date.getFullYear()
          ) {
            console.log(data);

            salesData.push({
              date: formatDate(new Date(data.date)),
              category: data.category,
              subcategory: data.subCategory,
              quantity: data.quantity,
              price: data.price,
              id: doc.id,
            });
          }
        });
      });
    }

    setSalesTableData(salesData);

    setLoading(false);
  };

  const [saleToDelete, setSaleToDelete] = useState<string>("");

  const handleDeleteSale = async (id: string) => {
    setLoading(true);

    const ref = doc(db, "userData", user.uid, "sales", id);

    try {
      await getDoc(ref).then(async (d) => {
        if (d.exists()) {
          let data = d.data();

          const categoryRef = collection(
            db,
            "userData",
            user.uid,
            "category",
            data.category,
            "subCategory"
          );

          await getDocs(categoryRef).then(async (document1) => {
            document1.forEach(async (document) => {
              if (document.data().name === data.subCategory) {
                await updateDoc(document.ref, {
                  stock: increment(data.quantity),
                });
              }
            });
          });

          await deleteDoc(ref).then(() => {
            console.log("Document successfully deleted!");
          });
        }
      });
    } catch (e) {
      console.log(e);
    }

    fetchSales();
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-center text-2xl font-bold p-4">Sales</h2>

      <div className="p-4">
        <div className="card bg-neutral">
          <div className="card-body">
            {/* Select Month */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchSales();
              }}
            >
              <label htmlFor="monthSelect" className="label">
                Select Month:{" "}
              </label>
              <select
                id="monthSelect"
                className="select select-bordered w-full max-w-xs"
                name="monthSelect"
                defaultValue=""
                required
                ref={monthRef}
              >
                <option disabled value="">
                  Select Month
                </option>
                <option>All</option>
                {months &&
                  months.map((month: any) => (
                    <option key={month.date} value={month.date}>
                      {month.month}
                    </option>
                  ))}
              </select>

              <button
                type="submit"
                className="btn btn-primary mt-4"
                disabled={loading}
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>

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
                setSaleToDelete("");
              }}
            >
              Cancel
            </label>

            <label
              htmlFor="delete-modal"
              className="btn btn-error"
              onClick={() => {
                setLoading(true);
                /* setSaleToDelete(itemToDelete); */
                handleDeleteSale(saleToDelete);
              }}
            >
              Delete!
            </label>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      {salesTableData.length > 0 && (
        <div className="m-4">
          <button
            onClick={() => {
              fetchSales();
            }}
            className="btn btn-sm btn-outline"
          >
            Refresh
          </button>
        </div>
      )}

      {salesTableData.length > 0 && (
        <div className="overflow-x-auto">
          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center">
              <AnimatedSpin />
            </div>
          ) : (
            <table className="table w-full">
              <thead>
                <tr>
                  <th></th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {salesTableData &&
                  salesTableData.map((sale: any) => (
                    <tr key={sale.id}>
                      <td></td>
                      <td>{sale.date}</td>
                      <td>{sale.category}</td>
                      <td>{sale.subcategory}</td>
                      <td>{sale.quantity}</td>
                      <td>{sale.price}</td>
                      <td>
                        <label
                          htmlFor="delete-modal"
                          className="btn btn-error"
                          onClick={() => {
                            setSaleToDelete(sale.id);
                          }}
                        >
                          Delete
                        </label>
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td className="font-bold">Total</td>
                  <td>
                    {salesTableData.reduce(
                      (acc: any, curr: any) => acc + parseInt(curr.quantity),
                      0
                    )}
                  </td>
                  <td className="font-bold text-xl">
                    {salesTableData.reduce(
                      (acc: any, curr: any) => acc + curr.price,
                      0
                    )}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
