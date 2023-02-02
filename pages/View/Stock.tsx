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
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ViewCategories() {
  const { user } = useAuth();

  const [stock, setStock] = useState<Object[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const fetchStock = async () => {
    setLoading(true);

    const querySnapshot = await getDocs(
      collection(db, "userData", user.uid, "category")
    );

    const stockData: Object[] = [];

    querySnapshot.forEach((doc) => {
      Object.keys(doc.data().subCategory).forEach((subCategory: any) => {
        if (doc.data().subCategory[subCategory].stock > 0) {
          stockData.push({
            category: doc.id,
            subCategory: subCategory,
            stock: doc.data().subCategory[subCategory].stock,
          });
        }
      });
    });

    console.log(stockData);

    setStock(stockData);
    setLoading(false);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <div className="p-4">
      <p className="text-2xl text-center font-bold mb-8">View Stock</p>

      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            fetchStock();
          }}
          className="btn btn-sm btn-outline"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        {!loading ? (
          <div>
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
                  {stock.map((e: any, indx) => (
                    <tr key={indx}>
                      <th>{indx + 1}</th>
                      <td>{e.category}</td>
                      <td>{e.subCategory}</td>
                      <td>{e.stock}</td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <th></th>
                    <th>Total Stock</th>
                    {/* Total stock = all stock values of each object */}
                    <th className="text-xl text-primary">
                      {stock.reduce((acc: number, curr: any) => {
                        return acc + curr.stock;
                      }, 0)}
                    </th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div>
                <p className="font-bold text-2xl">No Stock!!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            <AnimatedSpin />
          </div>
        )}
      </div>
    </div>
  );
}
