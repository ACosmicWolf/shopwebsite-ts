import { AddCategoryCard } from "@/components/AddCategory";
import AddEmployeeCard from "@/components/AddEmployee";

export default function Add() {
  return (
    <div className="p-4">
      <p className="text-2xl mb-4 text-center font-bold">Add</p>
      <AddCategoryCard />
      <AddEmployeeCard />
    </div>
  );
}
