import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import { editorialPreviewAllowed } from "../../../../content/editorial-preview";
import { editorialPreviewAssetNames } from "../../../../content/production-narrative";

/**
 * Media komposisi editorial hanya tersedia bila boundary bersama mengizinkan
 * preview. Vercel Production selalu tertutup, bahkan bila flag editorial
 * tertinggal aktif; preview deployment non-production tetap dapat diaktifkan
 * eksplisit. Route tetap ada di build, tetapi menjawab 404 saat boundary tutup.
 *
 * Daftar putihnya diturunkan dari naskah produksi (satu sumber kebenaran),
 * sehingga menambah slot siap tidak butuh sinkronisasi tangan di sini.
 */

export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
): Promise<NextResponse> {
  if (!editorialPreviewAllowed()) {
    return new NextResponse(null, { status: 404 });
  }

  const { filename } = await context.params;
  if (!editorialPreviewAssetNames().has(filename)) {
    return new NextResponse(null, { status: 404 });
  }

  const assetPath = path.join(
    process.cwd(),
    "editorial-preview",
    "journey",
    filename,
  );
  const body = await readFile(assetPath);
  return new NextResponse(body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "image/webp",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
