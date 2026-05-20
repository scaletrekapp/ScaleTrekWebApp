import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = createAdminClient();

    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === "profiles");

    if (!exists) {
      const { error } = await supabase.storage.createBucket("profiles", {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
      });
      if (error) throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
