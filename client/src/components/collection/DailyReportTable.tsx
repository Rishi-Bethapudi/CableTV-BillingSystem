interface DailyReportTableProps {
  date: string;
  data: any;
}
import { useNavigate } from 'react-router-dom';

export const DailyReportTable = ({ date, data }: DailyReportTableProps) => {
  const navigate = useNavigate();

  // Safe defaults
  const summary = data?.summary || {
    customers: 0,
    amount: 0,
    discount: 0,
    totalPayment: 0,
  };

  const areas = data?.areas || {};
  const customerDetails = data?.customerDetails || [];

  const strongDay = summary.amount >= 5000;

  return (
    <div className="bg-white rounded-lg shadow-sm mb-4 overflow-x-auto">
      <table className="w-full min-w-max border-collapse">
        {/* Row 1: Date Header */}
        <thead>
          <tr>
            <th
              colSpan={12}
              className={`bg-slate-800 text-white p-2 text-center font-semibold text-sm ${
                strongDay ? 'ring-2 ring-yellow-300 ring-offset-1' : ''
              }`}
            >
              {date}
            </th>
          </tr>
        </thead>

        {/* Row 2: Summary */}
        <thead>
          <tr className="bg-gray-50">
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Customers: {summary.customers}
            </th>
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Amount: ₹{summary.amount}
            </th>
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Discount: ₹{summary.discount}
            </th>
            <th
              colSpan={3}
              className="p-2 text-left font-semibold text-gray-800 border border-gray-200 text-xs"
            >
              Total Payment: ₹{summary.totalPayment}
            </th>
          </tr>
        </thead>

        {/* Row 3: Main Content */}
        <tbody>
          <tr>
            {/* AreaWise */}
            <td
              colSpan={4}
              className="p-2 bg-gray-50 border border-gray-200 align-top"
            >
              <div className="space-y-2">
                {Object.entries(areas).length > 0 ? (
                  Object.entries(areas).map(
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
                            {(areaData?.modes?.length
                              ? areaData.modes
                              : [
                                  {
                                    mode: 'N/A',
                                    customers: 0,
                                    amount: 0,
                                    discount: 0,
                                    payment: 0,
                                  },
                                ]
                            ).map((mode: any, idx: number) => (
                              <tr key={idx}>
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
                          </tbody>
                        </table>
                      </div>
                    ),
                  )
                ) : (
                  <div className="text-center text-gray-500 text-xs">
                    No area data
                  </div>
                )}
              </div>
            </td>

            {/* Customer Details */}
            <td colSpan={8} className="p-2 border border-gray-200 align-top">
              <div className="text-gray-800 font-medium mb-2 text-xs">
                Customer Details
              </div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs">
                      Name
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs">
                      Area
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs">
                      Prev Bal
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs">
                      Paid
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs">
                      Disc
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs">
                      Curr Bal
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs">
                      Collected By
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs">
                      Cust Code
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs">
                      Stb No
                    </th>
                    <th className="p-1 text-left font-semibold text-gray-800 border border-gray-200 text-xs">
                      Card No
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customerDetails.length > 0 ? (
                    customerDetails.map((customer: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-1 border border-gray-100 text-xs">
                          <a
                            href="#"
                            className="text-blue-600 hover:underline"
                            onClick={() =>
                              navigate(`/customers/${customer?.id}`)
                            }
                          >
                            {customer.name || 'N/A'}
                          </a>
                        </td>
                        <td className="p-1 border border-gray-100 text-xs">
                          {customer.area || 'N/A'}
                        </td>
                        <td className="p-1 border border-gray-100 text-xs">
                          ₹{customer.previousBalance || 0}
                        </td>
                        <td className="p-1 border border-gray-100 text-xs">
                          ₹{customer.paidAmount || 0}
                        </td>
                        <td className="p-1 border border-gray-100 text-xs">
                          ₹{customer.discount || 0}
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
                          ₹{customer.currentBalance || 0}
                        </td>
                        <td className="p-1 border border-gray-100 text-xs">
                          {customer.collectedBy || 'N/A'}
                        </td>
                        <td className="p-1 border border-gray-100 text-xs">
                          {customer.customerCode || 'N/A'}
                        </td>
                        <td className="p-1 border border-gray-100 text-xs">
                          {customer.stbNo || 'N/A'}
                        </td>
                        <td className="p-1 border border-gray-100 text-xs">
                          {customer.cardNo || 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={10}
                        className="text-center text-gray-500 text-xs"
                      >
                        No customer data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
