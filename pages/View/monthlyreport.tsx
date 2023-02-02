import { db } from "@/firebase";
import { useAuth } from "@/lib/AuthContext";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

const AllMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// TODO: WTF IS THE ARRAY OF OBJECTS EMPTY AFTER ADDING STUFF TO IT

export default function MonthlyReport() {
  const { user } = useAuth();
  const [months, setMonths] = useState<object[]>([]);
  const [employees, setEmployees] = useState<object[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const fetchMonths = async () => {
    setLoading(true);

    // Fetch months from db

    let monthData: object[] = [];
    let noDuplicate: string[] = [];

    // Get the months from the items made

    const itemsRef = collection(db, "userData", user.uid, "items");

    (await getDocs(itemsRef)).forEach((doc) => {
      const data = doc.data();

      let tempDate = new Date(data.date);

      let formattedDate = `${tempDate.getFullYear()} ${
        AllMonths[tempDate.getMonth()]
      }`;

      if (!noDuplicate.includes(formattedDate)) {
        noDuplicate.push(formattedDate);
        monthData.push({
          month: formattedDate,
          date: tempDate,
        });
      }
    });

    // Get the months from the paintedItems

    const paintedItemsRef = collection(
      db,
      "userData",
      user.uid,
      "paintedItems"
    );

    (await getDocs(paintedItemsRef)).forEach((doc) => {
      const data = doc.data();

      let tempDate = new Date(data.date);

      let formattedDate = `${tempDate.getFullYear()} ${
        AllMonths[tempDate.getMonth()]
      }`;

      if (!noDuplicate.includes(formattedDate)) {
        noDuplicate.push(formattedDate);
        monthData.push({
          month: formattedDate,
          date: tempDate,
        });
      }
    });

    setMonths(monthData);

    setLoading(false);
  };

  const fetchEmployees = async () => {
    setLoading(true);

    // Fetch employees from db

    let employeeData: object[] = [];

    const employeeRef = collection(db, "userData", user.uid, "employee");

    (await getDocs(employeeRef)).forEach((doc) => {
      employeeData.push({
        name: doc.data().name,
        id: doc.id,
        type: doc.data().type,
      });
    });

    setEmployees(employeeData);

    setLoading(false);
  };

  useEffect(() => {
    fetchMonths();
    fetchEmployees();
  }, []);

  const monthRef = useRef<HTMLSelectElement>(null);
  const employeeRef = useRef<HTMLSelectElement>(null);

  const [reportData, setReportData] = useState<object[]>([]);

  const getReportData = async () => {
    setLoading(true);

    const date = new Date(monthRef.current?.value as string);
    const employeeData = JSON.parse(employeeRef.current?.value as string);

    console.log(date, employeeData);

    let tempReportData: object[] = [];

    // get items if employee is a mistry else get paintedItems if employee is a painter

    if (employeeData.type === "Mistry") {
      console.log("=> mistry");
      const itemsRef = collection(db, "userData", user.uid, "items");

      // Get all the items made by the employee in the selected month

      await getDocs(itemsRef).then((querySnapshot) => {
        querySnapshot.forEach((d) => {
          const data = d.data();

          let tempDate = new Date(data.date);

          if (
            tempDate.getFullYear() === date.getFullYear() &&
            tempDate.getMonth() === date.getMonth() &&
            data.mistry === employeeData.id
          ) {
            tempReportData.push({
              category: data.category,
              subcategory: data.subCategory,
              quantity: data.quantity,
              date: data.date,
              price: data.price,
            });
          }
        });
      });
    } else {
      console.log("=> painter");
      const paintedItemsRef = collection(
        db,
        "userData",
        user.uid,
        "paintedItems"
      );

      // Get all the items painted by the employee in the selected month

      (await getDocs(paintedItemsRef)).forEach((d) => {
        const data = d.data();

        let tempDate = new Date(data.date);

        if (
          tempDate.getFullYear() === date.getFullYear() &&
          tempDate.getMonth() === date.getMonth() &&
          data.painter === employeeData.id
        ) {
          // get the price of the item from subcategory in category collection

          tempReportData.push({
            category: data.category,
            subcategory: data.subCategory,
            quantity: data.quantity,
            date: data.date,
            price: data.price,
          });
        }
      });
    }

    console.log(tempReportData);
    setReportData(tempReportData);

    setLoading(false);
  };

  return (
    <div>
      <h2 className="p-4 text-center text-2xl font-bold">Monthly Report</h2>

      <form
        className="m-4"
        onSubmit={(e) => {
          e.preventDefault();
          getReportData();
        }}
      >
        <select
          className="select select-primary w-full"
          defaultValue=""
          disabled={loading}
          required
          ref={monthRef}
        >
          <option value="">Select Month</option>
          {months &&
            months.map((month: any) => (
              <option key={month.date} value={month.date}>
                {month.month}
              </option>
            ))}
        </select>

        <select
          className="select select-primary w-full my-4"
          defaultValue=""
          disabled={loading}
          required
          ref={employeeRef}
        >
          <option value="">Select Employee</option>
          {employees &&
            employees.map((employee: any) => (
              <option value={JSON.stringify(employee)} key={employee.name}>
                {employee.name}
              </option>
            ))}
        </select>

        <button className="btn btn-primary w-full" type="submit">
          Generate Report
        </button>
      </form>

      {reportData.length > 0 && (
        <div className="m-4">
          <h3 className="text-center text-xl font-bold">Report</h3>

          <table className="table table-compact w-full mt-4">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{JSON.parse(employeeRef.current?.value as string).name}</td>
                <td>{JSON.parse(employeeRef.current?.value as string).type}</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-center text-xl font-bold">Items</h3>
          <div className="overflow-x-auto">
            <table className="table table-normal w-full mt-4">
              <thead>
                <tr>
                  <th></th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Date</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item: any, indx) => (
                  <tr key={indx}>
                    <th></th>
                    <td>{item.category}</td>
                    <td>{item.subcategory}</td>
                    <td>{item.quantity}</td>
                    <td>{item.price}</td>
                    <td>{item.date}</td>
                    <td>{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>Total</th>
                  <th>
                    {reportData.reduce(
                      (acc: any, item: any) => acc + item.price * item.quantity,
                      0
                    )}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
