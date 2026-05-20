const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = "https://ifgftpvzwxbmiyelsjre.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmZ2Z0cHZ6d3hibWl5ZWxzanJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDM0MDcsImV4cCI6MjA5NDY3OTQwN30.f8uKSPHUyXLysukICbftfxX89Uvi8shl7FHxvE2vzqQ";

const EMAIL = "scaletrek.admin+test@gmail.com";
const PASSWORD = "ScaleTrekAdmin2026!";
const HANDLE = "ScaleTrekAdmin";

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Sign up
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: EMAIL,
    password: PASSWORD,
    options: {
      data: { username: HANDLE, name: "ScaleTrek Admin", role: "super_admin" },
    },
  });

  if (signUpError) {
    if (signUpError.message.includes("already registered")) {
      console.log("User already exists — signing in to promote...");
    } else {
      console.error("Signup failed:", signUpError.message);
      process.exit(1);
    }
  } else {
    console.log("User created:", signUpData.user?.email);
  }

  // 2. Sign in
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  });

  if (signInError) {
    console.error("Sign in failed:", signInError.message);
    process.exit(1);
  }

  console.log("Signed in as:", signInData.user?.email);
  const token = signInData.session?.access_token;

  // 3. Update profile role to super_admin
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role: "super_admin" })
    .eq("id", signInData.user.id);

  if (updateError) {
    console.error("Role update failed:", updateError.message);
    process.exit(1);
  }

  // 4. Verify
  const { data: profile } = await supabase
    .from("profiles")
    .select("handle, role")
    .eq("id", signInData.user.id)
    .single();

  console.log("Profile updated:", profile?.handle, "→", profile?.role);
  console.log("\n✅ Admin account ready!");
  console.log("   Email:", EMAIL);
  console.log("   Password:", PASSWORD);
  console.log("   Role: super_admin");
}

main().catch(console.error);
