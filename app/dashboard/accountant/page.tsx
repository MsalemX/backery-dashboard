"use client";

export default function AccountantDashboard() {
  const financialStats = [
    { label: "إجمالي الدخل الشهري", value: "٨٢,٤٠٠ ₪", subText: "+١٥٪ من الشهر الماضي", trend: "up", color: "emerald" },
    { label: "إجمالي المصاريف", value: "٢٤,١٥٠ ₪", subText: "-٥٪ تحسن في التكاليف", trend: "down", color: "rose" },
    { label: "صافي الأرباح", value: "٥٨,٢٥٠ ₪", subText: "أداء مالي مستقر", trend: "up", color: "emerald" },
    { label: "الضرائب المستحقة", value: "٤,١٢٠ ₪", subText: "تاريخ الاستحقاق: ٢٥ أغسطس", trend: "neutral", color: "amber" },
  ];

  const transactions = [
    { id: "TX1092", date: "٢٠٢٤/٠٨/٠٨", vendor: "مورد الدقيق الوطني", amount: "-٢,٥٠٠ ₪", type: "expense" },
    { id: "TX1093", date: "٢٠٢٤/٠٨/٠٨", vendor: "مبيعات الكاشير - وردية الصباح", amount: "+٤,٨٢٠ ₪", type: "income" },
    { id: "TX1094", date: "٢٠٢٤/٠٨/٠٧", vendor: "شركة المراعي - ألبان وزبدة", amount: "-١,٢٠٠ ₪", type: "expense" },
    { id: "TX1095", date: "٢٠٢٤/٠٨/٠٧", vendor: "مبيعات المتجر الإلكتروني", amount: "+١,١٥٠ ₪", type: "income" },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">القسم المالي</h1>
          <p className="text-gray-500 mt-1">مرحباً بك، التقرير المالي اليومي لمخبز السعادة البلدي</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-3 bg-emerald-700 text-white rounded-2xl font-bold hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20">
             تحميل تقرير PDF
           </button>
        </div>
      </div>

      {/* Financial Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {financialStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm relative overflow-hidden">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">{stat.label}</p>
            <div className="flex justify-between items-end">
              <h2 className={`text-2xl font-extrabold ${stat.color === "rose" ? "text-rose-600" : "text-gray-800"}`}>
                {stat.value}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                stat.color === "emerald" ? "bg-emerald-50 text-emerald-600" : 
                stat.color === "rose" ? "bg-rose-50 text-rose-600" : 
                "bg-amber-50 text-amber-600"
              }`}>
                {stat.subText}
              </span>
            </div>
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-1 h-full ${
               stat.color === "emerald" ? "bg-emerald-500" : 
               stat.color === "rose" ? "bg-rose-500" : "bg-amber-500"
            } opacity-20`}></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-800">كشف العمليات الأخيرة</h3>
            <button className="text-emerald-600 text-sm font-bold hover:underline">عرض سجل التدوير</button>
          </div>
          <div className="space-y-4">
            {transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tx.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {tx.type === "income" ? "+" : "-"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{tx.vendor}</p>
                    <p className="text-xs text-gray-400">{tx.date} • {tx.id}</p>
                  </div>
                </div>
                <div className={`text-lg font-extrabold ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                  {tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses Distribution */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">توزيع المصروفات</h3>
          <div className="space-y-6">
            {[
              { label: "المواد الخام", percent: 65, color: "bg-amber-600" },
              { label: "الرواتب", percent: 25, color: "bg-blue-600" },
              { label: "المرافق والخدمات", percent: 10, color: "bg-gray-400" },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="text-gray-800">{item.percent}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
            
            <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">ملاحظة:</span> تم احتساب ضريبة القيمة المضافة لكافة مبيعات اليوم آلياً. يرجى مراجعة الرصيد قبل الإغلاق.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
