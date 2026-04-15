export const SUPPORTED_OUTPUT_FORMATS = [
  "jpeg",
  "png",
  "webp",
  "avif",
] as const;

export type OutputFormat = (typeof SUPPORTED_OUTPUT_FORMATS)[number];

export type ResizeFit = "cover" | "contain" | "inside" | "outside";

export interface ResizeOperation {
  mode?: "dimensions" | "percentage" | "preset";
  width?: number;
  height?: number;
  percentage?: number;
  preset?: "thumbnail" | "social" | "hd";
  fit?: ResizeFit;
  responsiveWidths?: number[];
}

export interface CropOperation {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RotateOperation {
  angle?: number;
  quarterTurns?: number;
}

export interface FlipOperation {
  horizontal?: boolean;
  vertical?: boolean;
}

export interface OrientationOperation {
  autoOrient?: boolean;
}

export interface ConvertOperation {
  format?: OutputFormat;
  mode?: "lossy" | "lossless";
  quality?: number;
  compressionLevel?: number;
  effort?: number;
  autoOptimize?: boolean;
}

export interface ImageOperations {
  resize?: ResizeOperation;
  crop?: CropOperation;
  rotate?: RotateOperation;
  flip?: FlipOperation;
  orientation?: OrientationOperation;
  convert?: ConvertOperation;
}

export interface StoredImage {
  id: string;
  originalName: string;
  mimeType: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
  hasAlpha: boolean;
  orientation: number | null;
  createdAt: string;
  inputPath: string;
}

export interface AppliedImageResult {
  buffer: Buffer;
  format: OutputFormat;
  width: number;
  height: number;
  bytes: number;
  warnings: string[];
}
