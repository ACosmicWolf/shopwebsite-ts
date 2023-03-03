import { AnimatedSpin } from "@/components/Icons";
import ItemsCard from "@/components/Items";
import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useAuth();

  const [sales, setSales] = useState<string>();
  const [advances, setAdvances] = useState<string>();

  const fetchData = async () => {
    const salesRef = collection(db, "userData", user.uid, "sales");

    const salesSnap = await getDocs(salesRef);

    let salesTotal: number = 0;

    salesSnap.forEach((doc) => {
      salesTotal += parseInt(doc.data().price);
    });

    setSales(String(salesTotal));

    const advancesRef = collection(db, "userData", user.uid, "employee");

    const advancesSnap = await getDocs(advancesRef);

    let advancesTotal: number = 0;

    advancesSnap.forEach(async (doc) => {
      console.log(doc.data());

      const advancePayment = collection(
        db,
        "userData",
        user.uid,
        "employee",
        doc.id,
        "advancePayment"
      );

      await getDocs(advancePayment)
        .then((advancePaymentSnap) => {
          advancePaymentSnap.forEach((doc) => {
            advancesTotal += parseInt(doc.data().amount);
          });
        })
        .then(() => {
          setAdvances(String(advancesTotal));
        });
    });
  };

  const fixPrice = async () => {
    await getDocs(collection(db, "userData", user.uid, "items")).then(
      (querySnapshot) => {
        querySnapshot.forEach(async (d) => {
          let price = 0;

          await getDocs(collection(db, "userData", user.uid, "category")).then(
            (document1) => {
              document1.forEach(async (document) => {
                console.log(document.data().name.trim());
                if (document.data().name.trim() === d.data().category.trim()) {
                  await getDocs(
                    collection(
                      db,
                      "userData",
                      user.uid,
                      "category",
                      document.id,
                      "subCategory"
                    )
                  ).then((subCategory) => {
                    subCategory.forEach(async (subcategory) => {
                      if (
                        subcategory.data().name.trim() ===
                        d.data().subCategory.trim()
                      ) {
                        price = subcategory.data().makingPrice;

                        await updateDoc(
                          doc(db, "userData", user.uid, "items", d.id),
                          {
                            price: price,
                          }
                        );
                      }
                    });
                  });
                }
              });
            }
          );
        });
      }
    );
  };

  useEffect(() => {
    fetchData();
    fixPrice();
  }, []);

  return (
    <div className="p-4 mb-10">
      <p className="text-2xl text-center font-bold">Dashboard</p>

      <div className="overflow-x-auto">
        <div className="stats shadow w-full">
          <div className="stat place-items-center">
            <div className="stat-title">Sales</div>
            <div className="stat-value">
              {sales ? <p>₹ {sales}</p> : <AnimatedSpin />}
            </div>
            <div className="stat-desc">This Month</div>
          </div>

          <div className="stat place-items-center">
            <div className="stat-title">Advances</div>
            <div className="stat-value">
              {advances ? <p>₹ {advances}</p> : <AnimatedSpin />}
            </div>
            <div className="stat-desc">This Month</div>
          </div>
        </div>
      </div>

      <ItemsCard />

      <div className="card bg-accent text-accent-content mb-10">
        <div className="card-body">
          <h2 className="card-title">Sales</h2>
          <div className="card-subtitle">
            Add a sale or view previous sales.
          </div>

          <Link href="/Add/Sales" className="btn">
            Add Sale
          </Link>

          <Link href="/View/Sales" className="btn">
            View Sales
          </Link>
        </div>
      </div>

      <div className="card bg-secondary text-secondary-content">
        <div className="card-body">
          <h2 className="card-title">Monthly Report</h2>
          <div className="card-subtitle">Monthly report for the month</div>

          <Link href="/View/monthlyreport" className="btn">
            Monthly Report
          </Link>
        </div>
      </div>

      <div className="card bg-secondary text-secondary-content my-10">
        <div className="card-body">
          <h2 className="card-title">Advance Payment</h2>
          <div className="card-subtitle">
            Pay payment in advance to employees.
          </div>

          <Link href="/Add/advancepayment" className="btn">
            Advance Payment
          </Link>

          <Link href="/View/advances" className="btn">
            View Advances
          </Link>
        </div>
      </div>
    </div>
  );
}
