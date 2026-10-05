import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function FacultyLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: grant } = await supabase
    .from("faculty_grants")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!grant) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}
