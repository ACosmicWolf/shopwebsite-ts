import { AnimatedSpin } from "@/components/Icons";
import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  collection,
  deleteField,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ViewSubcategory() {
  const { user } = useAuth();
  const router = useRouter();
  const { categoryname } = router.query as { categoryname: string };

  const [subcategory, setSubcategory] = useState<Object[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [subcategoryToDelete, setSubcategoryToDelete] = useState<string>("");

  const fetchSubcategory = async () => {
    setLoading(true);

    // Fetch Subcategory from firestore database

    const document = query(collection(db, `userData/${user.uid}/category`));

    let subcategoryData: Object[] = [];

    interface Subcategory {
      [key: string]: Object;
    }

    await getDocs(document).then((querySnapshot) => {
      querySnapshot.forEach((doc: any) => {
        if (doc.id.trim() === categoryname.trim()) {
          for (let key in doc.data().subCategory) {
            let value = doc.data().subCategory[key];
            let obj: Subcategory = {
              name: key,
              makingPrice: value.makingPrice,
              paintingPrice: value.paintingPrice,
            };
            subcategoryData.push(obj);
          }
        }
      });
    });

    setSubcategory(subcategoryData);

    setLoading(false);
  };

  useEffect(() => {
    fetchSubcategory();
  }, []);

  const handleDeleteSubCategory = async (subcategory: string) => {
    setLoading(true);

    console.log(subcategory);

    try {
      // Delete Subcategory from firestore database

      const document = updateDoc(
        doc(db, `userData/${user.uid}/category/${categoryname}`),
        {
          [`subCategory.${subcategory}`]: deleteField(),
        }
      );
    } catch (error) {
      console.log(error);
    }

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
                            setSubcategoryToDelete(elem.name);
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
                    <th>1</th>
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
