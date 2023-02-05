import { AnimatedSpin } from "@/components/Icons";
import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-daisyui";

export default function ViewAdvances() {
  const { user } = useAuth();

  const [employees, setEmployees] = useState<object[]>([]);

  const [advances, setAdvances] = useState<object[]>([]);

  const [visible, setVisible] = useState<boolean>(false);

  const [advanceToDelete, setAdvanceToDelete] = useState<string>("");

  const [employeeId, setEmployeeId] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const toggleVisible = () => {
    setVisible(!visible);
  };

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

  const fetchAdvances = async (employeeId: string) => {
    setLoading(true);

    const advancesRef = collection(
      db,
      "userData",
      user.uid,
      "employee",
      employeeId,
      "advancePayment"
    );

    let advancesData: object[] = [];

    const advancesSnap = await getDocs(advancesRef);

    advancesSnap.forEach((doc) => {
      let date = new Date(doc.data().date);

      advancesData.push({
        amount: doc.data().amount,
        // dd/mm/yyyy
        date:
          date.getDate() +
          1 +
          "/" +
          (date.getMonth() + 1) +
          "/" +
          date.getFullYear(),
        id: doc.id,
      });
    });

    setAdvances(advancesData);
    setLoading(false);
  };

  const deleteAdvance = async (id: string) => {
    setLoading(true);
    const advancesRef = doc(
      db,
      "userData",
      user.uid,
      "employee",
      employeeId,
      "advancePayment",
      id
    );

    await deleteDoc(advancesRef);

    fetchAdvances(employeeId);
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-center text-2xl font-bold p-4">View Advances</h2>

      <div className="font-sans">
        <Modal open={visible}>
          <Modal.Header className="font-bold">
            Are you sure you want to delete this advance?
          </Modal.Header>

          <Modal.Body>
            This action cannot be undone. This will permanently delete the
            advance.
          </Modal.Body>

          <Modal.Actions>
            <Button
              onClick={() => {
                setAdvanceToDelete("");
                toggleVisible();
              }}
            >
              Cancel
            </Button>
            <Button
              color="error"
              onClick={() => {
                toggleVisible();
                deleteAdvance(advanceToDelete);
              }}
            >
              Delete
            </Button>
          </Modal.Actions>
        </Modal>
      </div>

      {/* Select Employee */}

      <div className="p-4">
        <div className="card card-normal bg-neutral">
          <div className="card-body">
            <div className="mb-3 flex flex-col">
              <label htmlFor="employee" className="form-label m-2">
                Employee:
              </label>
              <select
                className="select"
                id="employee"
                onChange={(e) => {
                  fetchAdvances(e.target.value);
                  setEmployeeId(e.target.value);
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Select Employee
                </option>
                {employees.map((employee: any) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Advances Table */}
      {advances.length > 0 ? (
        !loading ? (
          <div className="p-4 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th></th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {advances.map((advance: any) => (
                  <tr key={advance.id}>
                    <td></td>
                    <td>{advance.date}</td>
                    <td>{advance.amount}</td>
                    <td>
                      <button
                        className="btn btn-error"
                        onClick={() => {
                          setAdvanceToDelete(advance.id);
                          toggleVisible();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td>Total</td>
                  <td className="text-xl text-primary">
                    {advances.reduce((total: number, advance: any) => {
                      return total + advance.amount;
                    }, 0)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <AnimatedSpin />
          </div>
        )
      ) : (
        <div className="p-4">
          <div className="card card-normal bg-neutral">
            <div className="card-body">
              <div className="mb-3 flex flex-col">
                <p className="text-center">No advances found</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
