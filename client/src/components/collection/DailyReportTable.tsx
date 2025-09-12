interface DailyReportTableProps {
  date: string;
  data: any;
}
import { useNavigate } from 'react-router-dom';
export const DailyReportTable = ({ date, data }: DailyReportTableProps) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-x-auto">
      <table className="w-full min-w-max border-collapse">
        {/* Row 1: Date Header (full width, 12 columns) */}
        <thead>
          <tr>
            <th
              colSpan={12}
              className="bg-slate-800 text-white p-2 text-center font-semibold text-sm"
            >
              {date}
            </th>
          </tr>
        </thead>

        {/* Row 2: Summary Header (12 columns split: 3+3+3+3) */}
        <thead>
          <tr className="bg-gray-50">
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Customers: {data.summary.customers}
            </th>
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Amount: ₹{data.summary.amount}
            </th>
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Discount: ₹{data.summary.discount}
            </th>
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Total Payment: ₹{data.summary.totalPayment}
            </th>
          </tr>
        </thead>

        {/* Row 3: Main Content (12 columns: 4 for areas + 8 for customer details) */}
        <tbody>
          <tr>
            {/* Left Column: AreaWiseTable (4 columns) */}
            <td
              colSpan={4}
              className="p-2 bg-gray-50 border border-gray-200 align-top"
            >
              <div className="space-y-2">
                {Object.entries(data.areas).map(
                  ([area, areaData]: [string, any]) => (
                    <div key={area} className="bg-gray-100 rounded p-1">
                      <div className="font-semibold text-gray-800 mb-1 bg-gray-200 p-1 rounded text-xs text-center">
                        {area}
                      </div>

                      <table className="w-full border-collapse bg-white rounded text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-1 text-xs font-medium">
                              Mode
                            </th>
                            <th className="border border-gray-300 p-1 text-xs font-medium">
                              Cust
                            </th>
                            <th className="border border-gray-300 p-1 text-xs font-medium">
                              Amt
                            </th>
                            <th className="border border-gray-300 p-1 text-xs font-medium">
                              Disc
                            </th>
                            <th className="border border-gray-300 p-1 text-xs font-medium">
                              Pay
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {areaData.modes.map((mode: any, index: number) => (
                            <tr key={index}>
                              <td className="border border-gray-300 p-1 text-xs">
                                {mode.mode}
                              </td>
                              <td className="border border-gray-300 p-1 text-xs text-center">
                                {mode.customers}
                              </td>
                              <td className="border border-gray-300 p-1 text-xs">
                                ₹{mode.amount}
                              </td>
                              <td className="border border-gray-300 p-1 text-xs">
                                ₹{mode.discount}
                              </td>
                              <td className="border border-gray-300 p-1 text-xs">
                                ₹{mode.payment}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-yellow-100 font-semibold">
                            <td className="border border-gray-300 p-1 text-xs">
                              Total
                            </td>
                            <td className="border border-gray-300 p-1 text-xs text-center">
                              {areaData.modes.reduce(
                                (sum: number, mode: any) =>
                                  sum + mode.customers,
                                0
                              )}
                            </td>
                            <td className="border border-gray-300 p-1 text-xs">
                              ₹
                              {areaData.modes.reduce(
                                (sum: number, mode: any) => sum + mode.amount,
                                0
                              )}
                            </td>
                            <td className="border border-gray-300 p-1 text-xs">
                              ₹
                              {areaData.modes.reduce(
                                (sum: number, mode: any) => sum + mode.discount,
                                0
                              )}
                            </td>
                            <td className="border border-gray-300 p-1 text-xs">
                              ₹
                              {areaData.modes.reduce(
                                (sum: number, mode: any) => sum + mode.payment,
                                0
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            </td>

            {/* Right Column: CustomerDetails (8 columns) */}
            <td colSpan={8} className="p-2 border border-gray-200 align-top">
              <div className="text-gray-800 font-medium mb-2 text-xs">
                Customer Details
              </div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-24">
                      Name
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-16">
                      Area
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-16">
                      Prev Bal
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-16">
                      Paid
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-12">
                      Disc
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-16">
                      Curr Bal
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-24">
                      Collected By
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-20">
                      Cust Code
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-20">
                      Stb No
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-20">
                      Card No
                    </th>
                    {/* <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs min-w-12">
                      Portal
                    </th> */}
                  </tr>
                </thead>
                <tbody>
                  {data.customerDetails.map((customer: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-1 border border-gray-100 text-xs">
                        <a
                          href=""
                          className="text-blue-600 hover:underline"
                          onClick={() =>
                            navigate(`/customers/${customer?._id}`)
                          }
                        >
                          {customer.name}
                        </a>
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        {customer.area}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        ₹{customer.previousBalance}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        ₹{customer.paidAmount}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        ₹{customer.discount}
                      </td>
                      <td
                        className={`p-1 border border-gray-100 text-xs ${
                          customer.currentBalance > 0
                            ? 'text-red-600'
                            : customer.currentBalance < 0
                            ? 'text-green-600'
                            : ''
                        }`}
                      >
                        ₹{customer.currentBalance}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        {customer.collectedBy}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        {customer.customerCode}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        {customer.stbNo}
                      </td>
                      <td className="p-1 border border-gray-100 text-xs">
                        {customer.cardNo}
                      </td>
                      {/* <td className="p-1 border border-gray-100 text-xs text-center">
                        {customer.portalRecharge ? '☑' : '☐'}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
