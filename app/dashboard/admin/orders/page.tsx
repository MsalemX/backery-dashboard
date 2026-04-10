"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: number;
  customer_id: number;
  item_name: string;
  quantity: number;
  total_amount: number;
  payment_method: string;
  order_status: string;
  payment_status: string;
  order_date: string;
  customers?: { name: string; debt: number };
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, customers(name, debt)")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ order_status: newStatus })
      .eq("id", order.id);

    if (!error) {
      // If payment method is credit and order is marked as delivered, update customer debt
      if (newStatus === "delivered" && order.payment_method === "credit" && order.order_status !== "delivered") {
        const currentDebt = order.customers?.debt || 0;
        await supabase
          .from("customers")
          .update({ debt: currentDebt + order.total_amount })
          .eq("id", order.customer_id);
      }
      fetchOrders();
    }
  };

  const handlePaymentUpdate = async (orderId: number, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ payment_status: newStatus })
      .eq("id", orderId);

    if (!error) {
      fetchOrders();
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري تحميل الطلبات...</div>;

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">إدارة الطلبات</h1>
          <p className="text-gray-500 mt-2 font-medium">متابعة طلبات الزبائن، تأكيد التوصيل والتحصيل المالي</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden text-right">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-8 py-6">رقم الطلب</th>
                <th className="px-8 py-6">الزبون</th>
                <th className="px-8 py-6">المنتج</th>
                <th className="px-8 py-6">المبلغ</th>
                <th className="px-8 py-6">طريقة الدفع</th>
                <th className="px-8 py-6">حالة الطلب</th>
                <th className="px-8 py-6">حالة الدفع</th>
                <th className="px-8 py-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 text-gray-400 font-sans font-bold">#{order.id}</td>
                  <td className="px-8 py-6 font-bold text-gray-800">{order.customers?.name || "مجهول"}</td>
                  <td className="px-8 py-6 font-medium text-gray-600">{order.item_name}</td>
                  <td className="px-8 py-6 font-black text-amber-900">{order.total_amount} ₪</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black ${
                      order.payment_method === 'credit' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {order.payment_method === 'credit' ? 'بالدين' : 'عند التسليم'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black ${
                      order.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                      order.order_status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {order.order_status === 'delivered' ? 'تم التوصيل' : 
                       order.order_status === 'pending' ? 'جاري التنفيذ' : 'ملغي'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black ${
                      order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {order.payment_status === 'paid' ? 'مدفوع' : 'غير مدفوع'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-2 justify-center">
                      {order.order_status !== 'delivered' && (
                        <button
                          onClick={() => handleStatusUpdate(order, 'delivered')}
                          className="px-4 py-2 bg-emerald-700 text-white text-[10px] font-black rounded-lg hover:bg-emerald-800 transition-all uppercase"
                        >
                          تأكيد التوصيل
                        </button>
                      )}
                      {order.payment_status !== 'paid' && (
                        <button
                          onClick={() => handlePaymentUpdate(order.id, 'paid')}
                          className="px-4 py-2 bg-amber-800 text-white text-[10px] font-black rounded-lg hover:bg-amber-900 transition-all uppercase"
                        >
                          تم الدفع
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
