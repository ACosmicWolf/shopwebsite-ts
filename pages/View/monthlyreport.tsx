import GenerateReport from "@/components/GenerateMonthlyReport";
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

interface PdfData {
  date: string;
  items: string[][];
  total: number;
  advances: number;
  calculated: number;
  employeeName: string;
  employeeType: string;
}

const formatDate = (date: Date) => {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export default function MonthlyReport() {
  const { user } = useAuth();
  const [months, setMonths] = useState<object[]>([]);
  const [employees, setEmployees] = useState<object[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [pdfData, setPdfData] = useState<PdfData>();

  const handleGenerateReport = async () => {
    if (pdfData) {
      GenerateReport(
        pdfData.date,
        pdfData.items,
        pdfData.total,
        pdfData.advances,
        pdfData.calculated,
        pdfData.employeeName,
        pdfData.employeeType
      );
    }
  };

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

  const [advances, setAdvances] = useState<object[]>([]);

  const getReportData = async () => {
    setLoading(true);

    setReportData([]);
    setAdvances([]);
    setPdfData(undefined);

    const date = new Date(monthRef.current?.value as string);
    const employeeData = JSON.parse(employeeRef.current?.value as string);

    console.log(date, employeeData);

    let tempReportData: object[] = [];

    let pdfItems: PdfData = {
      // DD/MM/YYYY
      date: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
      items: [],
      total: 0,
      advances: 0,
      calculated: 0,
      employeeName: employeeData.name,
      employeeType: employeeData.type,
    };

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

            pdfItems.total += data.price;
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

          pdfItems.total += data.price;
        }
      });
    }

    // Get Advances of selected employee

    let advanceData: object[] = [];

    const advancesRef = collection(
      db,
      "userData",
      user.uid,
      "employee",
      employeeData.id,
      "advancePayment"
    );

    (await getDocs(advancesRef)).forEach((d) => {
      const data = d.data();

      let tempDate = new Date(data.date);

      if (
        tempDate.getFullYear() === date.getFullYear() &&
        tempDate.getMonth() === date.getMonth()
      ) {
        advanceData.push({
          amount: data.amount,
          date: data.date,
        });
        pdfItems.advances += data.amount;
      }
    });

    setAdvances(advanceData);

    tempReportData.map((item: any) => {
      pdfItems.items.push([
        item.category,
        item.subcategory,
        formatDate(new Date(item.date)),
        item.price,
        item.quantity,
        item.quantity * item.price,
      ]);
    });

    pdfItems.calculated = pdfItems.total - pdfItems.advances;

    setReportData(tempReportData);

    setPdfData(pdfItems);

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

      {/* Generate Pdf Button */}

      {pdfData && (
        <div className="p-4">
          <button
            className="btn btn-outline"
            onClick={() => {
              handleGenerateReport();
            }}
          >
            Generate PDF
          </button>
        </div>
      )}

      {reportData.length > 0 && (
        <div className="m-4">
          <h3 className="text-center text-xl font-bold">Report</h3>

          <table className="table table-normal w-full mt-4">
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
                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>Advance</th>
                  <th>
                    {advances.reduce(
                      (acc: any, item: any) => acc + item.amount,
                      0
                    )}
                  </th>
                </tr>
                <tr>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th></th>
                  <th>Calculated</th>
                  <th>
                    {reportData.reduce(
                      (acc: any, item: any) => acc + item.price * item.quantity,
                      0
                    ) -
                      advances.reduce(
                        (acc: any, item: any) => acc + item.amount,
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
