import PremiumChartCard from "@/components/PremiumChartCard";
import { api } from "@/lib/api";

export default async function AdminDashboard() {
  try {
    const [customers, transactions, production] = await Promise.all([
      api.get('/customers'),
      api.get('/customer-transactions'),
      api.get('/production-logs'),
    ]);

    const totalCustomers = customers.length;
    const totalOrders = transactions.length;
    const totalFlourUsed = production.reduce((a: number, p: any) => a + (p.flour_used || 0), 0);
    const totalBreadProduced = production.reduce((a: number, p: any) => a + (p.quantity_produced || 0), 0);
    
    const totalDebtMoneyOn = customers.reduce((a: number, c: any) => a + (c.debt || 0), 0);
    const totalCreditMoneyFor = customers.reduce((a: number, c: any) => a + (c.financial_credit || 0), 0);
    
    const totalFlourDebtOn = customers.reduce((a: number, c: any) => a + (c.flour_debt || 0), 0);
    const totalFlourCreditFor = customers.reduce((a: number, c: any) => a + (c.flour_credit || 0), 0);

    // Chart data mocks
    const chartData = {
      customers: [totalCustomers - 2, totalCustomers],
      orders: [totalOrders - 10, totalOrders],
      flour: [totalFlourUsed * 0.9, totalFlourUsed],
      bread: [totalBreadProduced * 0.9, totalBreadProduced],
      debtMoney: [totalDebtMoneyOn * 1.1, totalDebtMoneyOn],
      creditMoney: [totalCreditMoneyFor * 0.8, totalCreditMoneyFor],
      flourDebt: [totalFlourDebtOn * 1.05, totalFlourDebtOn],
      flourCredit: [totalFlourCreditFor * 0.95, totalFlourCreditFor],
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
          value={totalCustomers.toLocaleString('en-US')}
          subText="إجمالي الزبائن المسجلين"
          data={chartData.customers}
          color="blue"
          icon={<UsersIcon />}
        />
        <PremiumChartCard
          title="إجمالي الطلبات"
          value={totalOrders.toLocaleString('en-US')}
          subText="إجمالي حركات البيع والتحصيل"
          data={chartData.orders}
          color="amber"
          icon={<CartIcon />}
        />
        <PremiumChartCard
          title="الطحين المستخدم"
          value={totalFlourUsed.toLocaleString('en-US')}
          unit="كجم"
          subText="إجمالي سحب الإنتاج"
          data={chartData.flour}
          color="emerald"
          icon={<ScaleIcon />}
        />
        <PremiumChartCard
          title="الخبز المنتج"
          value={totalBreadProduced.toLocaleString('en-US')}
          unit="قطعة"
          subText="إجمالي ما تم خبزه"
          data={chartData.bread}
          color="teal"
          icon={<BreadIcon />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <PremiumChartCard
          title="إجمالي الدين (عليهم)"
          value={totalDebtMoneyOn.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          unit="₪"
          subText="الديون المالية المستحقة"
          data={chartData.debtMoney}
          color="rose"
          icon={<AlertIcon />}
        />
        <PremiumChartCard
          title="إجمالي الرصيد (لهم)"
          value={totalCreditMoneyFor.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          unit="₪"
          subText="أرصدة الزبائن المقدمة"
          data={chartData.creditMoney}
          color="emerald"
          icon={<ReceiptIcon />}
        />
        <PremiumChartCard
          title="دين طحين (عليهم)"
          value={totalFlourDebtOn.toLocaleString('en-US')}
          unit="كجم"
          subText="كميات طحين مستحقة"
          data={chartData.flourDebt}
          color="amber"
          icon={<ScaleIcon />}
        />
        <PremiumChartCard
          title="رصيد طحين (لهم)"
          value={totalFlourCreditFor.toLocaleString('en-US')}
          unit="كجم"
          subText="كميات طحين مودعة"
          data={chartData.flourCredit}
          color="blue"
          icon={<ListIcon />}
        />
      </div>

      <div className="mt-20 border-t border-gray-100 pt-10 flex flex-col items-center">
         <div className="w-16 h-1 bg-gray-100 rounded-full mb-6"></div>
         <p className="text-gray-300 font-bold text-sm tracking-widest uppercase">مخبز السعادة البلدي</p>
      </div>
    </div>
    );
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    return (
      <div className="p-8 bg-[#f9fafb] min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-black text-red-600">حدث خطأ في تحميل البيانات</h1>
          <p className="text-gray-600 mt-2">يرجى المحاولة مرة أخرى لاحقاً</p>
        </div>
      </div>
    );
  }
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
