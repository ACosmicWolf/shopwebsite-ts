import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function ViewAdvances() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState<object[]>([]);

  const fetchData = async () => {
    const employeesRef = collection(db, "userData", user.uid, "employee");

    let employeeData: object[] = [];

    await getDocs(employeesRef).then((employeesSnap) => {
      employeesSnap.forEach((doc) => {
        employeeData.push({
          name: doc.data().name,
          id: doc.id,
        });
      });

      setEmployees(employeeData);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-center text-2xl font-bold p-4">View Advances</h2>

      {/* Select Employee */}

      <div className="p-4">
        <div className="card">
          <div className="card-body">
            <form>
              <div className="mb-3">
                <label htmlFor="employee" className="form-label">
                  Employee
                </label>
                <select className="form-select" id="employee">
                  {employees.map((employee: any) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
