import { supabase } from "../lib/supabase";

async function checkSchema() {
  const { data, error } = await supabase.from("users").select("*").limit(1);
  console.log("Users sample:", data);
  if (error) console.error("Users error:", error);

  const { data: cusData, error: cusError } = await supabase.from("customers").select("*").limit(1);
  console.log("Customers sample:", cusData);
  if (cusError) console.error("Customers error:", cusError);
}

checkSchema();
