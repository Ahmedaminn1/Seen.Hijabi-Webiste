"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function uploadProductImage(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "لم يتم اختيار ملف" };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPG أو PNG أو WebP",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "حجم الصورة كبير جداً — الحد الأقصى هو 5 ميجابايت",
      };
    }

    const supabase = createAdminClient();
    const bucketName = "product-images";

    // Check if bucket exists, create if not
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b: { name: string }) => b.name === bucketName);

    if (!bucketExists) {
      const { error: createErr } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      });
      if (createErr) {
        console.warn("[upload] Could not auto-create bucket:", createErr.message);
      }
    }

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${nanoid(8)}.${ext}`;
    const filePath = `products/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("[upload] Supabase storage upload error:", uploadError);
      return {
        success: false,
        error: `فشل رفع الصورة: ${uploadError.message}`,
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err) {
    console.error("[upload] Unexpected error during upload:", err);
    return {
      success: false,
      error: "حدث خطأ غير متوقع أثناء رفع الصورة",
    };
  }
}

