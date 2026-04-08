import PremiumChartCard from "@/components/PremiumChartCard";
import { supabase } from "@/lib/supabase";

export default async function AdminDashboard() {
  const [customersRes, expensesRes, inventoryRes, posRecordsRes] = await Promise.all([
    supabase.from("customers").select("id, debt, total_paid"),
    supabase.from("expenses").select("amount"),
    supabase.from("inventory").select("stock, threshold"),
    supabase.from("pos_records").select("taken, returned, net"),
  ]);

  const customers = customersRes.data || [];
  const expenses = expensesRes.data || [];
  const inventory = inventoryRes.data || [];
  const posRecords = posRecordsRes.data || [];

  const totalCustomers = customers.length;
  const totalDebt = customers.reduce((a, c) => a + c.debt, 0);
  const totalPaid = customers.reduce((a, c) => a + c.total_paid, 0);
  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const lowStockCount = inventory.filter(i => i.stock <= i.threshold).length;
  const totalDistributed = posRecords.reduce((a, r) => a + r.net, 0);

  const chartData = {
    customers: [40, 45, 50, 55, 60, 65, totalCustomers],
    expenses: [1000, 1200, 1100, 1400, 1300, 1600, totalExpenses],
    debt: [500, 600, 550, 700, 650, 800, totalDebt],
    paid: [1000, 1100, 1200, 1300, 1200, 1400, totalPaid],
    bread: [80, 90, 100, 110, 105, 120, totalDistributed],
    flour: [120, 140, 130, 160, 150, 170, lowStockCount * 10],
    flourDebt: [30, 28, 25, 22, 18, 15, 12],
    blank: [0, 0, 0, 0, 0, 0, 0],
  };

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">لوحة التحكم</h1>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-gray-400 font-bold text-sm bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
            نظام الإدارة المركزي
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <PremiumChartCard
          title="إجمالي العملاء"
          value={totalCustomers.toLocaleString()}
          subText="عدد العملاء المسجلين"
          data={chartData.customers}
          color="emerald"
          type="sparkline"
          icon={<UsersIcon />}
        />
        <PremiumChartCard
          title="إجمالي الموزع (صافي)"
          value={totalDistributed.toLocaleString()}
          subText="قطعة خبز موزعة"
          data={chartData.bread}
          color="blue"
          type="sparkline"
          icon={<CartIcon />}
        />
        <PremiumChartCard
          title="أصناف ناقصة"
          value={lowStockCount.toString()}
          unit="صنف"
          subText="تحت الحد الأدنى في المخزون"
          data={chartData.flour}
          color="amber"
          type="sparkline"
          icon={<ScaleIcon />}
        />
        <PremiumChartCard
          title="إجمالي المسدّد"
          value={totalPaid.toFixed(0)}
          unit="₪"
          subText="مدفوعات العملاء"
          data={chartData.paid}
          color="teal"
          type="sparkline"
          icon={<BreadIcon />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <PremiumChartCard
          title="إجمالي الدين على الزبائن"
          value={totalDebt.toFixed(0)}
          unit="₪"
          subText="أرصدة مالية قيد التحصيل"
          data={chartData.debt}
          color="rose"
          type="sparkline"
          icon={<AlertIcon />}
        />
        <PremiumChartCard
          title="إجمالي المصروفات"
          value={totalExpenses.toLocaleString()}
          unit="₪"
          subText="إجمالي تكاليف التشغيل"
          data={chartData.expenses}
          color="rose"
          type="sparkline"
          icon={<ReceiptIcon />}
        />
        <PremiumChartCard
          title="عملاء مدينون"
          value={customers.filter(c => c.debt > 0).length.toString()}
          subText="عميل لديه رصيد مدين"
          data={chartData.flourDebt}
          color="amber"
          type="sparkline"
          icon={<ScaleIcon />}
        />
        <PremiumChartCard
          title="عملاء بدون دين"
          value={customers.filter(c => c.debt === 0).length.toString()}
          subText="عميل رصيده صفر"
          data={chartData.blank}
          color="blue"
          type="sparkline"
          icon={<ListIcon />}
        />
      </div>

      <div className="mt-20 border-t border-gray-100 pt-10 flex flex-col items-center">
         <div className="w-16 h-1 bg-gray-100 rounded-full mb-6"></div>
         <p className="text-gray-300 font-bold text-sm tracking-widest uppercase">مخبز السعادة البلدي</p>
      </div>
    </div>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function ScaleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" />
    </svg>
  );
}
function BreadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.703 2.703 0 01-3 0 2.703 2.703 0 01-3 0 2.703 2.703 0 01-3 0 2.701 2.701 0 01-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21H3V6a2 2 0 012-2h14a2 2 0 012 2v15z" />
    </svg>
  );
}
function AlertIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}
