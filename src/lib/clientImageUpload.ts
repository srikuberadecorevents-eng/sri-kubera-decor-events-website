import imageCompression from "browser-image-compression";

export interface UploadResult {
  id: string;
  url_card: string;
  url_full: string;
  url: string;
  path_card: string;
  path_full: string;
  bytes_total: number;
  width?: number;
  height?: number;
}

export async function compressAndUploadImage(
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<UploadResult> {
  // 1. Client-side compression options
  const compressionOptions = {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    onProgress: (progress: number) => {
      // Scale compression to 0-50% of the total progress
      if (onProgress) {
        onProgress(Math.round(progress * 0.5));
      }
    },
  };

  let processedFile = file;
  try {
    // Only compress if larger than 1MB or larger image
    if (file.size > 1024 * 1024) {
      processedFile = await imageCompression(file, compressionOptions);
    }
  } catch (err) {
    console.warn("Client compression skipped/failed, proceeding with original:", err);
  }

  // 2. Upload via XMLHttpRequest to report accurate upload progress
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", processedFile, file.name);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        // Upload phase spans 50-100% of progress
        const uploadPercent = (event.loaded / event.total) * 50;
        onProgress(Math.min(99, Math.round(50 + uploadPercent)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response: UploadResult = JSON.parse(xhr.responseText);
          if (onProgress) onProgress(100);
          resolve(response);
        } catch {
          reject(new Error("Failed to parse upload server response"));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during file upload"));
    };

    xhr.open("POST", "/api/admin/upload");
    xhr.send(formData);
  });
}
