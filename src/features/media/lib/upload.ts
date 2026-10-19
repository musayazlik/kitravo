/**
 * Upload adapter. The UI only knows this signature, so swapping the simulation
 * for UploadThing is a one-file change:
 *
 *   const { startUpload } = useUploadThing("mediaUploader", {
 *     onUploadProgress: (percent) => onProgress(percent),
 *   });
 *   await startUpload([await toWebp(file)]);
 *
 * Images are converted to WebP in the browser before upload (see the source project's
 * lib/webp.ts), so storage only ever receives optimised files.
 */
export async function uploadFile(file: File, onProgress: (percent: number) => void, signal?: AbortSignal) {
  const steps = 12 + Math.round(file.size / 400_000);
  for (let step = 1; step <= steps; step++) {
    if (signal?.aborted) throw new DOMException("Upload cancelled", "AbortError");
    await new Promise((resolve) => setTimeout(resolve, 90 + (step % 3) * 40));
    onProgress(Math.round((step / steps) * 100));
  }
}

export const ACCEPTED_TYPES = {
  "image/*": [".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"],
  "video/*": [".mp4", ".webm"],
  "application/pdf": [".pdf"],
};

export const MAX_FILE_SIZE = 64 * 1024 * 1024;
