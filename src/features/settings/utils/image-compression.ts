const BACKEND_BRANDING_LOGO_LIMIT_BYTES = 5 * 1024 * 1024;
const BRANDING_LOGO_TARGET_BYTES = 3.5 * 1024 * 1024;
const MAX_BRANDING_LOGO_DIMENSION = 1600;
const MIN_JPEG_QUALITY = 0.6;
const JPEG_QUALITY_STEP = 0.08;

function getScaledDimensions(width: number, height: number) {
  const longestSide = Math.max(width, height);
  if (longestSide <= MAX_BRANDING_LOGO_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_BRANDING_LOGO_DIMENSION / longestSide;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("Unable to prepare the selected image."));
      },
      type,
      quality,
    );
  });
}

export async function compressBrandingLogo(file: File): Promise<File> {
  if (file.size <= BACKEND_BRANDING_LOGO_LIMIT_BYTES) {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const dimensions = getScaledDimensions(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Unable to prepare the selected image.");
  }

  context.drawImage(bitmap, 0, 0, dimensions.width, dimensions.height);
  bitmap.close();

  let quality = 0.9;
  let blob = await canvasToBlob(canvas, "image/jpeg", quality);

  while (blob.size > BRANDING_LOGO_TARGET_BYTES && quality > MIN_JPEG_QUALITY) {
    quality = Math.max(MIN_JPEG_QUALITY, quality - JPEG_QUALITY_STEP);
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }

  if (blob.size > BACKEND_BRANDING_LOGO_LIMIT_BYTES) {
    throw new Error("Choose a smaller image file.");
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "branding-logo";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
