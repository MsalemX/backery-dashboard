import { supabase } from "./lib/supabase";

async function checkData() {
  const { data: customers, error: cErr } = await supabase.from("customers").select("name, debt, total_paid");
  console.log("Customers Table Data:", customers);
  
  const { data: txs, error: tErr } = await supabase.from("customer_transactions").select("type, amount");
  console.log("Transactions Table Data:", txs);
  
  if (customers) {
    const calculatedTotalPaid = customers.reduce((sum, c) => sum + (c.total_paid || 0), 0);
    console.log("Calculated Total Paid from Customers Table:", calculatedTotalPaid);
  }
}

checkData();
