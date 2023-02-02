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

  const router = useRouter();

  const [categories, setCategories] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(true);

  const [categoryToDelete, setCategoryToDelete] = useState<string>("");

  const fetchCategories = async () => {
    setLoading(true);

    const querySnapshot = await getDocs(
      collection(db, "userData", user.uid, "category")
    );

    const categoryData: string[] = [];

    querySnapshot.forEach((doc) => {
      categoryData.push(doc.id);
    });

    setCategories(categoryData);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = async (category: string) => {
    console.log(category);

    const document = doc(db, "userData", user.uid, "category", category);

    await getDoc(document).then(async (doc) => {
      if (doc.exists()) {
        await deleteDoc(document);
        fetchCategories();
      } else {
        console.log("No such document!");
      }
    });
  };

  return (
    <div className="p-4">
      <p className="text-2xl text-center font-bold mb-8">View Categories</p>

      {/* Refresh Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            fetchCategories();
          }}
          className="btn btn-sm btn-outline"
        >
          Refresh
        </button>
      </div>

      <input type="checkbox" id="delete-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Are you sure you want to delete this category? This action cannot be
            undone.
          </h3>
          <div className="modal-action">
            <label
              htmlFor="delete-modal"
              className="btn btn-outline"
              onClick={() => {
                setCategoryToDelete("");
              }}
            >
              Cancel
            </label>

            <label
              htmlFor="delete-modal"
              className="btn btn-error"
              onClick={() => {
                setLoading(true);
                handleDeleteCategory(categoryToDelete);
              }}
            >
              Delete!
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {!loading ? (
          <div>
            {categories.length > 0 ? (
              <table className="table w-full">
                <thead>
                  <tr>
                    <th></th>
                    <th>Category</th>
                    <th>Subcategories</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, indx) => (
                    <tr key={indx}>
                      <th>{indx + 1}</th>
                      <td>{category}</td>
                      <td>
                        <button
                          className="btn btn-sm"
                          onClick={() => {
                            console.log(category);
                            router.push(`/View/Subcategory/${category}`);
                          }}
                        >
                          Subcategories
                        </button>
                      </td>
                      <td>
                        <label
                          className="btn btn-sm btn-error"
                          onClick={() => {
                            /* handleDeleteCategory(category); */
                            setCategoryToDelete(category);
                          }}
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
                    <th>Total Categories</th>
                    <th>{categories.length}</th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div>
                <p className="font-bold text-2xl">No Categories!!</p>
                <Link
                  href="/Add/addcategory"
                  className="btn btn-primary btn-sm m-2"
                >
                  Add Categories
                </Link>
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
