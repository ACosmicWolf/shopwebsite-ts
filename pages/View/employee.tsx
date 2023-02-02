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

export default function ViewEmployee() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState<Object[]>([]);

  const [employeeToDelete, setEmployeeToDelete] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);

  const fetchEmployees = async () => {
    setLoading(true);

    const ref = collection(db, "userData", user.uid, "employee");

    const docs = await getDocs(ref);

    let employeeData: Object[] = [];

    docs.forEach((doc) => {
      employeeData.push({
        name: doc.data().name,
        type: doc.data().type,
      });
    });

    setEmployees(employeeData);

    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDeleteEmployee = async (employee: string) => {
    setLoading(true);

    const ref = doc(db, "userData", user.uid, "employee", employee);
    await getDoc(ref).then(async (doc) => {
      if (doc.exists()) {
        await deleteDoc(ref);
      } else {
        console.log("No such document!");
      }
    });

    await fetchEmployees();

    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-center p-4 text-2xl font-bold">Employees</h2>

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
                setEmployeeToDelete("");
              }}
            >
              Cancel
            </label>

            <label
              htmlFor="delete-modal"
              className="btn btn-error"
              onClick={() => {
                setLoading(true);
                handleDeleteEmployee(employeeToDelete);
              }}
            >
              Delete!
            </label>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="m-4">
        <button
          onClick={() => {
            fetchEmployees();
          }}
          className="btn btn-sm btn-outline"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center">
            <AnimatedSpin />
          </div>
        ) : (
          <div>
            {employees.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Employee Type</th>
                    <th>Delete</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((employee: any, index) => (
                    <tr key={index}>
                      <th>{index + 1}</th>
                      <td>{employee.name}</td>
                      <td>{employee.type}</td>
                      <td>
                        <label
                          className="btn btn-sm btn-error"
                          htmlFor="delete-modal"
                          onClick={() => {
                            setEmployeeToDelete(employee.name);
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
                    <th></th>
                    <th>Total Employees</th>
                    <th>{employees.length}</th>
                    <th></th>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div className="flex justify-center">
                <h3 className="text-center text-xl font-bold">
                  No Employees Found
                </h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
