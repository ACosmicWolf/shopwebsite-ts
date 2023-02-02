import { useRouter } from "next/router";

export function AddCategoryCard() {
  const router = useRouter();
  return (
    <div className="card bg-primary text-primary-content shadow-2xl">
      <div className="card-body">
        <h2 className="card-title">Add Category</h2>
        <button
          onClick={() => {
            router.push("/Add/addcategory");
          }}
          className="btn"
        >
          Add Category
        </button>
        <button
          onClick={() => {
            router.push("/Add/addsubcategory");
          }}
          className="btn"
        >
          Add Subcategory
        </button>
      </div>
    </div>
  );
}
