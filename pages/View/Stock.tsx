import GenerateStock from "@/components/GenerateStock";
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

interface StockPDF {
  stock: string[][];
  totalQuantity: number;
}

export default function ViewCategories() {
  const { user } = useAuth();

  const [stock, setStock] = useState<Object[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [stockPdf, setStockPdf] = useState<StockPDF>({
    stock: [],
    totalQuantity: 0,
  });

  const generateStockPdf = () => {
    if (stockPdf.stock.length > 0) {
      GenerateStock(stockPdf.stock, stockPdf.totalQuantity);
    }
  };

  const fetchStock = async () => {
    setLoading(true);

    const querySnapshot = await getDocs(
      collection(db, "userData", user.uid, "category")
    );

    const stockData: Object[] = [];

    let stockPdfData: string[][] = [];

    querySnapshot.forEach(async (doc) => {
      const subcategoryQuerySnapshot = collection(
        db,
        "userData",
        user.uid,
        "category",
        doc.id,
        "subCategory"
      );

      let totalStock = 0;
      await getDocs(subcategoryQuerySnapshot)
        .then((subCategoryDocs) => {
          subCategoryDocs.forEach((subCategoryDoc) => {
            totalStock += subCategoryDoc.data().stock;

            stockData.push({
              category: doc.data().name,
              subCategory: subCategoryDoc.data().name,
              stock: subCategoryDoc.data().stock,
            });

            stockPdfData.push([
              doc.data().name,
              subCategoryDoc.data().name,
              subCategoryDoc.data().stock,
            ]);

            console.log(subCategoryDoc.data());
          });
        })
        .then(() => {
          stockPdfData.sort(sortFunction);

          function sortFunction(a: any, b: any) {
            if (a[1] === b[1]) {
              return 0;
            } else {
              return a[1] < b[1] ? -1 : 1;
            }
          }

          console.log(stockPdfData);

          setStockPdf({
            stock: stockPdfData,
            totalQuantity: totalStock,
          });

          console.log(totalStock);

          stockData.sort((a: any, b: any) =>
            a.subCategory > b.subCategory
              ? 1
              : b.subCategory > a.subCategory
              ? -1
              : 0
          );

          setStock(stockData);
        });
    });

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

      {/* Generate PDF Button */}
      {stockPdf.stock.length > 0 && (
        <div className="flex justify-end mb-4">
          <button onClick={generateStockPdf} className="btn btn-sm btn-primary">
            Generate PDF
          </button>
        </div>
      )}

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
