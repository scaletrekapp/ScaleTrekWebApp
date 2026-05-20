"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/lib/supabase-client";

export default function EditProfilePage({ params: { lang } }: { params: { lang: string } }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user: authUser, isLoading, setUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState({ avatar: false, cover: false });
  const [form, setForm] = useState({
    handle: "", headline: "", bio: "", location: "", website: "", companyName: "", sector: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (isLoading) return;
    if (!authUser) { router.push(`/${lang}`); return; }
    setForm({
      handle: authUser.handle || "",
      headline: authUser.headline || "",
      bio: authUser.bio || "",
      location: authUser.location || "",
      website: authUser.website || "",
      companyName: authUser.companyName || "",
      sector: authUser.sector || "",
    });
  }, [authUser, isLoading, router, lang]);

  const uploadFile = async (file: File, type: "avatar" | "cover"): Promise<string | null> => {
    if (!authUser) return null;
    setUploading((p) => ({ ...p, [type]: true }));
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${type === "avatar" ? "avatars" : "covers"}/${authUser.id}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("profiles")
        .upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("profiles").getPublicUrl(path);
      return publicUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      return null;
    } finally {
      setUploading((p) => ({ ...p, [type]: false }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      uploadFile(file, "avatar").then((url) => {
        if (url && authUser) {
          setUser({ ...authUser, avatar: url });
        }
      });
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      uploadFile(file, "cover").then((url) => {
        if (url && authUser) {
          setUser({ ...authUser, coverUrl: url });
        }
      });
    }
  };

  const handleSave = async () => {
    if (!authUser) return;
    setSaving(true);
    setError("");
    try {
      await supabase.from("profiles").update({
        handle: form.handle,
        headline: form.headline || null,
        bio: form.bio || null,
        location: form.location || null,
        website: form.website || null,
        company_name: form.companyName || null,
        sector: form.sector || null,
        avatar_url: authUser.avatar || null,
        cover_url: authUser.coverUrl || null,
      }).eq("id", authUser.id);

      setUser({ ...authUser, ...form });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)" }}>
      <main className="max-w-page mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-heading" style={{ color: "var(--text-primary)" }}>{t("profile.edit.title")}</h1>
          {saved && <span className="text-caption text-emerald font-semibold">{t("profile.edit.saved")}</span>}
        </div>

        <div className="surface-card p-6 max-w-2xl">
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-ruby-muted border border-ruby/20 text-ruby text-body">{error}</div>
          )}

          <div className="space-y-6">
            {/* Avatar upload */}
            <div>
              <label className="block text-caption uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-violet/40 via-emerald/30 to-cyan/30">
                    <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
                      {(avatarPreview || authUser?.avatar) ? (
                        <img src={avatarPreview || authUser?.avatar || ""} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold" style={{ color: "var(--text-muted)" }}>
                          {authUser?.handle?.charAt(0).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>
                  </div>
                  {uploading.avatar && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-violet border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => avatarRef.current?.click()}
                  disabled={uploading.avatar}
                  className="btn-secondary btn-sm"
                >
                  {uploading.avatar ? "Uploading..." : "Change Photo"}
                </button>
              </div>
            </div>

            {/* Cover upload */}
            <div>
              <label className="block text-caption uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Cover Image</label>
              <div
                className="h-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden"
                style={{ borderColor: "var(--border-color)", backgroundColor: "color-mix(in srgb, var(--bg-tertiary) 40%, transparent)" }}
                onClick={() => coverRef.current?.click()}
              >
                {(coverPreview || authUser?.coverUrl) ? (
                  <img src={coverPreview || authUser?.coverUrl || ""} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: "var(--text-muted)" }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-caption" style={{ color: "var(--text-muted)" }}>Upload cover image</p>
                  </div>
                )}
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                />
              </div>
              {uploading.cover && <p className="text-caption mt-1" style={{ color: "var(--text-muted)" }}>Uploading cover...</p>}
            </div>

            {/* Form fields */}
            {(["handle", "headline", "bio", "location", "website", "company", "sector"] as const).map((field) => (
              <div key={field}>
                <label className="block text-caption uppercase tracking-wider mb-1.5" style={{ color: "var(--text-muted)" }}>
                  {t(`profile.edit.${field === "company" ? "company" : field === "handle" ? "handle" : field === "headline" ? "headline" : field === "bio" ? "bio" : field}`)}
                </label>
                {field === "bio" ? (
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  />
                ) : (
                  <input
                    type="text"
                    value={(form as any)[field === "company" ? "companyName" : field]}
                    onChange={(e) => {
                      const key = field === "company" ? "companyName" : field;
                      setForm({ ...form, [key]: e.target.value });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl"
                    style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                  />
                )}
              </div>
            ))}

            <button
              onClick={handleSave}
              disabled={saving || !form.handle}
              className="btn-primary btn-md w-full"
            >
              {saving ? t("profile.edit.saving") : t("profile.edit.save")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
