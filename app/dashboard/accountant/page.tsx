import { supabase } from "@/lib/supabase";

export default async function AccountantDashboard() {
  const [expensesRes, customersRes, posRecordsRes] = await Promise.all([
    supabase.from("expenses").select("id, category, amount, description, date").order("date", { ascending: false }).limit(10),
    supabase.from("customers").select("debt, total_paid"),
    supabase.from("pos_records").select("net"),
  ]);

  const expenses = expensesRes.data || [];
  const customers = customersRes.data || [];
  const posRecords = posRecordsRes.data || [];

  const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
  const totalPaid = customers.reduce((a, c) => a + c.total_paid, 0);
  const totalDebt = customers.reduce((a, c) => a + c.debt, 0);
  const totalNet = posRecords.reduce((a, r) => a + r.net, 0);
  const netProfit = totalPaid - totalExpenses;

  const expenseByCategory: Record<string, number> = {};
  expenses.forEach(e => {
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount;
  });
  const topCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const maxAmount = topCategories[0]?.[1] || 1;

  const financialStats = [
    { label: "إجمالي المسدّد من العملاء", value: `${totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪`, subText: "مجموع الدفعات المستلمة", color: "emerald" },
    { label: "إجمالي المصروفات", value: `${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪`, subText: `${expenses.length.toLocaleString('en-US')} عملية مصروف`, color: "rose" },
    { label: "صافي الأرباح المحتسبة", value: `${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪`, subText: "دخل - مصروفات", color: netProfit >= 0 ? "emerald" : "rose" },
    { label: "إجمالي الديون المستحقة", value: `${totalDebt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪`, subText: "أرصدة قيد التحصيل", color: "amber" },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">القسم المالي</h1>
          <p className="text-gray-500 mt-1">التقرير المالي لمخبز السعادة البلدي</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {financialStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm relative overflow-hidden">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{stat.label}</p>
            <div className="flex justify-between items-end">
              <h2 className={`text-2xl font-extrabold font-sans ${stat.color === "rose" ? "text-rose-600" : stat.color === "amber" ? "text-amber-700" : "text-gray-800"}`}>
                {stat.value}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg font-sans ${
                stat.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                stat.color === "rose" ? "bg-rose-50 text-rose-600" :
                "bg-amber-50 text-amber-600"
              }`}>
                {stat.subText}
              </span>
            </div>
            <div className={`absolute top-0 right-0 w-1 h-full ${
               stat.color === "emerald" ? "bg-emerald-500" :
               stat.color === "rose" ? "bg-rose-500" : "bg-amber-500"
            } opacity-20`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-800">آخر المصروفات المسجلة</h3>
          </div>
          <div className="space-y-4">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-100 text-rose-700">
                    ₪
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{exp.description}</p>
                    <p className="text-xs text-gray-400 font-sans">{exp.date} • {exp.category}</p>
                  </div>
                </div>
                <div className="text-lg font-extrabold text-rose-600 font-sans">
                  -{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">توزيع المصروفات</h3>
          <div className="space-y-6">
            {topCategories.map(([label, amount], i) => {
              const percent = Math.round((amount / maxAmount) * 100);
              const colors = ["bg-amber-600", "bg-blue-600", "bg-gray-400"];
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-gray-500">{label}</span>
                    <span className="text-gray-800 font-sans">{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₪</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[i]}`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
            <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-xs text-amber-900 leading-relaxed font-regular">
                <span className="font-bold">الصافي الموزع:</span> <span className="font-sans font-black">{totalNet.toLocaleString('en-US')}</span> قطعة خبز
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
