import PremiumChartCard from "@/components/PremiumChartCard";
import Link from "next/link";

export default function AdminDashboard() {
  const chartData = {
    customers: [45, 52, 48, 70, 65, 85, 82],
    orders: [20, 35, 30, 45, 40, 55, 60],
    flour: [120, 150, 140, 180, 170, 210, 205],
    bread: [90, 110, 105, 130, 125, 145, 140],
    debtPayable: [500, 450, 600, 550, 700, 650, 800],
    debtReceivable: [1200, 1100, 1300, 1250, 1400, 1350, 1500],
    flourDebtPayable: [15, 20, 18, 25, 22, 30, 28],
    flourDebtReceivable: [40, 35, 45, 42, 50, 48, 55],
  };

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen">
      {/* Header Section from Image */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">لوحة التحكم</h1>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Welcome Admin Card */}
          <div className="flex-1 md:flex-none flex items-center justify-between gap-6 bg-white px-6 py-4 rounded-[22px] shadow-sm border border-gray-100 min-w-[240px]">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                   {/* User Icon Placeholder */}
                   <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                   </svg>
                </div>
                <div className="text-right">
                   <p className="text-[12px] text-gray-400 font-bold">مرحباً</p>
                   <p className="text-lg font-black text-gray-800">Admin</p>
                </div>
             </div>
             <div className="text-gray-300">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
               </svg>
             </div>
          </div>

          {/* Logout Button */}
          <Link
            href="/login"
            className="flex items-center gap-3 px-6 py-4 bg-white text-gray-600 rounded-[22px] border border-gray-100 hover:text-rose-600 hover:bg-rose-50 transition-all font-bold shadow-sm group"
          >
            <span>تسجيل الخروج</span>
            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Row 1: Primary Stats with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <PremiumChartCard 
          title="إجمالي العملاء" 
          value="١,٢٨٤" 
          subText="٦٩ عميل جديد خلال آخر ٧ أيام" 
          data={chartData.customers}
          color="emerald"
          type="sparkline"
          icon={<UsersIcon />}
        />
        <PremiumChartCard 
          title="إجمالي الطلبات" 
          value="٨٤٢" 
          subText="زيادة بنسبة ١٢٪ عن الشهر الماضي" 
          data={chartData.orders}
          color="blue"
          type="sparkline"
          icon={<CartIcon />}
        />
        <PremiumChartCard 
          title="الطحين المستخدم (كجم)" 
          value="٤,٢٥٠" 
          unit="kg"
          subText="استهلاك مستقر هذا الأسبوع" 
          data={chartData.flour}
          color="amber"
          type="sparkline"
          icon={<ScaleIcon />}
        />
        <PremiumChartCard 
          title="الخبز المنتج (كجم)" 
          value="٣,٨٢٠" 
          unit="kg"
          subText="كفاءة إنتاجية عالية" 
          data={chartData.bread}
          color="teal"
          type="sparkline"
          icon={<BreadIcon />}
        />
      </div>

      {/* Row 2: Secondary Financial/Stock Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <PremiumChartCard 
          title="إجمالي الدين المالي على الزبائن" 
          value="١٢,٤٠٠" 
          unit="₪"
          subText="أرصدة مالية قيد التحصيل" 
          data={chartData.debtPayable}
          color="rose"
          type="sparkline"
          icon={<AlertIcon />}
        />
        <PremiumChartCard 
          title="إجمالي الدين المالي للزبائن" 
          value="٨,٦٥٠" 
          unit="₪"
          subText="مستحقات لم يتم تسديدها بعد" 
          data={chartData.debtReceivable}
          color="emerald"
          type="sparkline"
          icon={<CashIcon />}
        />
        <PremiumChartCard 
          title="إجمالي دين الطحين على الزبائن" 
          value="٤٥٠" 
          unit="kg"
          subText="كميات طحين مرتقب عودتها" 
          data={chartData.flourDebtPayable}
          color="amber"
          type="sparkline"
          icon={<ScaleIcon />}
        />
        <PremiumChartCard 
          title="إجمالي دين الطحين للزبائن" 
          value="٢٨٠" 
          unit="kg"
          subText="رصيد طحين متبقي للعملاء" 
          data={chartData.flourDebtReceivable}
          color="blue"
          type="sparkline"
          icon={<ListIcon />}
        />
      </div>


      {/* Footer Branding or Quick Actions */}
      <div className="mt-20 border-t border-gray-100 pt-10 flex flex-col items-center">
         <div className="w-16 h-1 bg-gray-100 rounded-full mb-6"></div>
         <p className="text-gray-300 font-bold text-sm tracking-widest uppercase">مخبز السعادة البلدي</p>
      </div>
    </div>
  );
}

// Simple SVG Icons
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

function CashIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
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
