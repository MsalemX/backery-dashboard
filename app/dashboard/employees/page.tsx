"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Employee = { id: number; name: string; email: string; role: string; status: string };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Worker");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data } = await supabase.from("employees").select("*").order("id");
    if (data) setEmployees(data);
    setLoading(false);
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Insert into employees table
    const { error: empError } = await supabase.from("employees").insert({
      name: newName,
      email: newEmail,
      role: newRole,
      status: "نشط",
    });

    if (!empError) {
      // 2. Insert into users table for login
      const { error: userError } = await supabase.from("users").insert({
        full_name: newName,
        email: newEmail,
        password: newPassword,
        role: newRole.toLowerCase(), // Store role in lowercase for the login system
      });

      if (userError) {
        console.error("Error creating user login account:", userError);
      }

      fetchEmployees();
      setShowForm(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
    }
  };

  const handleDelete = async (id: number) => {
    // Note: In a real system you should also delete the corresponding user record
    await supabase.from("employees").delete().eq("id", id);
    setEmployees(employees.filter(e => e.id !== id));
  };

  if (loading) return <div className="p-8 text-center text-gray-400 font-bold">جاري التحميل...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">إدارة الموظفين</h1>
          <p className="text-gray-500 mt-1">إضافة وإدارة صلاحيات المديرين والعاملين</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-amber-800 text-white rounded-2xl font-bold hover:bg-amber-900 transition-all shadow-lg shadow-amber-900/20 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-sm font-bold text-gray-400">الاسم</th>
              <th className="px-8 py-5 text-sm font-bold text-gray-400">البريد الإلكتروني</th>
              <th className="px-8 py-5 text-sm font-bold text-gray-400">الدور</th>
              <th className="px-8 py-5 text-sm font-bold text-gray-400">الحالة</th>
              <th className="px-8 py-5 text-sm font-bold text-gray-400 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-900 font-bold">
                      {emp.name.charAt(0)}
                    </div>
                    <span className="font-bold text-gray-800">{emp.name}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-gray-500">{emp.email}</td>
                <td className="px-8 py-5 font-medium text-gray-700">{emp.role}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${emp.status === 'نشط' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {emp.status}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleDelete(emp.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-black">إضافة موظف جديد</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-black mb-2">الاسم الكامل</label>
                <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black" placeholder="أدخل الاسم..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-2">البريد الإلكتروني</label>
                <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans text-black" placeholder="name@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-2">كلمة المرور</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black" placeholder="أدخل كلمة المرور..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-black mb-2">الدور الوظيفي</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-black">
                  <option value="Admin">Admin - مدير</option>
                  <option value="Worker">Worker - عامل</option>
                </select>
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-amber-800 text-white rounded-xl font-bold hover:bg-amber-900 transition-all shadow-lg shadow-amber-900/20">
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
