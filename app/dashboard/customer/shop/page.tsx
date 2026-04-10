"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type BreadType = { id: number; name: string; price: number; description?: string };

export default function CustomerShop() {
  const [products, setProducts] = useState<BreadType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<BreadType | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "cod">("cod");
  const [buying, setBuying] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from("bread_types").select("*").order("name");
    setProducts(data || []);
    setLoading(false);
  };

  const handleOpenCheckout = (product: BreadType) => {
    setSelectedProduct(product);
    setShowCheckout(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedProduct) return;
    setBuying(true);
    setMessage("");

    try {
      // 1. Get current customer from localStorage
      const savedName = localStorage.getItem("userName");
      if (!savedName) throw new Error("يرجى تسجيل الدخول أولاً");

      const { data: customer, error: customerErr } = await supabase
        .from("customers")
        .select("*")
        .eq("name", savedName)
        .single();

      if (customerErr || !customer) throw new Error("لم يتم العثور على بيانات الزبون المرتبطة بحسابك");

      // 2. Create Order in the 'orders' table
      const { error: orderErr } = await supabase.from("orders").insert({
        customer_id: customer.id,
        item_name: selectedProduct.name,
        quantity: 1,
        total_amount: selectedProduct.price,
        payment_method: paymentMethod,
        order_status: "pending",
        payment_status: "unpaid",
        order_date: new Date().toISOString().split("T")[0],
      });

      if (orderErr) throw orderErr;

      setMessage(`تم إرسال طلب ${selectedProduct.name} بنجاح! يرجى انتظار تأكيد الأدمن.`);
      setShowCheckout(false);
      setTimeout(() => setMessage(""), 5000);
    } catch (error: any) {
      console.error(error);
      setMessage("حدث خطأ أثناء إرسال الطلب.");
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري تحميل المتجر...</div>;

  return (
    <div className="p-8 pb-20 bg-[#f9fafb] min-h-screen font-sans">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">متجر المخبز</h1>
          <p className="text-gray-500 mt-2 font-medium">اختر منتجاتك الطازجة وحدد طريقة الدفع</p>
        </div>
        {message && (
          <div className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-2xl font-bold animate-bounce text-sm">
            {message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group p-6">
            <div className="relative h-48 mb-6 rounded-[32px] overflow-hidden bg-amber-50 flex items-center justify-center">
               <span className="text-6xl group-hover:scale-110 transition-transform duration-500">🥖</span>
            </div>
            <div className="space-y-2 mb-6">
              <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
              <p className="text-gray-400 text-sm font-medium">خبز طازج من الفرن البلدي</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-black text-amber-900">
                {product.price} <span className="text-sm">₪</span>
              </div>
              <button
                onClick={() => handleOpenCheckout(product)}
                className="px-8 py-3 rounded-2xl font-bold bg-amber-800 text-white hover:bg-amber-900 shadow-lg shadow-amber-900/20 transition-all transform active:scale-95"
              >
                شراء
              </button>
            </div>
          </div>
        ))}
      </div>

      {showCheckout && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[48px] w-full max-w-lg p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-black mb-4">تأكيد الطلب</h2>
            <p className="text-gray-500 mb-8 font-medium">أنت تطلب <span className="text-amber-800 font-bold">{selectedProduct.name}</span> بسعر <span className="font-bold">{selectedProduct.price} ₪</span></p>
            
            <div className="space-y-4 mb-10">
              <label className="block text-sm font-black text-black mb-2">طريقة الدفع</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`py-6 rounded-[24px] font-black border-2 transition-all ${
                    paymentMethod === "cod" ? "bg-amber-50 border-amber-800 text-amber-900" : "bg-gray-50 border-transparent text-gray-400"
                  }`}
                >
                  <div className="mb-1 text-2xl">💵</div>
                  دفع عند التسليم
                </button>
                <button
                  onClick={() => setPaymentMethod("credit")}
                  className={`py-6 rounded-[24px] font-black border-2 transition-all ${
                    paymentMethod === "credit" ? "bg-amber-50 border-amber-800 text-amber-900" : "bg-gray-50 border-transparent text-gray-400"
                  }`}
                >
                  <div className="mb-1 text-2xl">📝</div>
                  شراء بالدين
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleConfirmOrder}
                disabled={buying}
                className="flex-1 py-5 bg-amber-800 text-white rounded-[24px] font-black text-xl hover:bg-amber-900 shadow-2xl shadow-amber-900/30 transform active:scale-95 disabled:opacity-50"
              >
                {buying ? "جاري الإرسال..." : "تأكيد الطلب"}
              </button>
              <button
                onClick={() => setShowCheckout(false)}
                className="px-8 py-5 bg-gray-100 text-gray-500 rounded-[24px] font-black text-xl hover:bg-gray-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
