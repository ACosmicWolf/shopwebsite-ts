import { AnimatedSpin } from "@/components/Icons";
import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ViewSubcategory() {
  const { user } = useAuth();
  const router = useRouter();
  const { categoryname } = router.query as { categoryname: string };

  const [category, setCategory] = useState<string>("");

  const [subcategory, setSubcategory] = useState<Object[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [subcategoryToDelete, setSubcategoryToDelete] = useState<string>("");

  const correctCategoryName = async () => {
    await getDocs(collection(db, `userData/${user.uid}/category`)).then(
      (querySnapshot) => {
        querySnapshot.forEach((doc: any) => {
          if (doc.id.trim() === categoryname.trim()) {
            setCategory(doc.id);
          }
        });
      }
    );
  };

  const fetchSubcategory = async () => {
    setLoading(true);

    let category = "";

    await getDocs(collection(db, `userData/${user.uid}/category`)).then(
      (querySnapshot) => {
        querySnapshot.forEach((doc: any) => {
          if (doc.id.trim() === categoryname.trim()) {
            category = doc.id;
          }
        });
      }
    );

    // Fetch Subcategory from firestore database

    if (category !== "") {
      let subcategoryData: Object[] = [];

      const ref = collection(
        db,
        "userData",
        user.uid,
        "category",
        category,
        "subCategory"
      );

      await getDocs(ref).then((querySnapshot) => {
        querySnapshot.forEach((doc: any) => {
          let obj = {
            name: doc.data().name,
            makingPrice: doc.data().makingPrice,
            paintingPrice: doc.data().paintingPrice,
            id: doc.id,
          };
          subcategoryData.push(obj);
        });
      });

      setSubcategory(subcategoryData);
    }

    setLoading(false);
  };

  useEffect(() => {
    correctCategoryName();
    fetchSubcategory();
  }, []);

  const handleDeleteSubCategory = async (subcategory: string) => {
    setLoading(true);

    console.log(subcategory);

    console.log(categoryname);

    // Delete Subcategory from firestore database

    const docRef = doc(
      db,
      "userData",
      user.uid,
      "category",
      category,
      "subCategory",
      subcategory
    );

    await deleteDoc(docRef);

    await fetchSubcategory();
    setLoading(false);
  };

  return (
    <div className="p-4">
      <p className="text-2xl text-center font-bold mb-8">View Subcategory</p>

      {/* Show Category name */}
      <p className="text-xl text-center font-bold mb-8">{categoryname}</p>

      {/* Delete Modal */}
      <input type="checkbox" id="delete-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Are you sure you want to delete this sub-category? This action
            cannot be undone.
          </h3>
          <div className="modal-action">
            <label
              htmlFor="delete-modal"
              className="btn btn-outline"
              onClick={() => {
                setSubcategoryToDelete("");
              }}
            >
              Cancel
            </label>

            <label
              htmlFor="delete-modal"
              className="btn btn-error"
              onClick={() => {
                handleDeleteSubCategory(subcategoryToDelete);
              }}
            >
              Delete!
            </label>
          </div>
        </div>
      </div>

      {/* Refresh */}
      {subcategory.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              fetchSubcategory();
            }}
            className="btn btn-sm btn-outline"
          >
            Refresh
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        {!loading ? (
          <div>
            {subcategory.length > 0 ? (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th></th>
                    <th>Subcategory Name</th>
                    <th>Making Price</th>
                    <th>Painting Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {subcategory.map((elem: any, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{elem.name}</td>
                      <td>{elem.makingPrice}</td>
                      <td>{elem.paintingPrice}</td>
                      <td>
                        <label
                          onClick={() => {
                            setSubcategoryToDelete(elem.id);
                          }}
                          className="btn btn-sm btn-error"
                          htmlFor="delete-modal"
                        >
                          Delete
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th></th>
                    <th>Total Subcategories</th>
                    <th>{subcategory.length}</th>
                    <th></th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="flex justify-center">
                <p className="text-xl text-center font-bold mb-8">
                  No Subcategories Found
                </p>
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
