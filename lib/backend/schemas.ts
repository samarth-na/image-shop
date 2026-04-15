import { z } from "zod";
import { SUPPORTED_OUTPUT_FORMATS } from "@/lib/backend/types";

const outputFormatSchema = z.enum(SUPPORTED_OUTPUT_FORMATS);

export const imageIdSchema = z.object({
  imageId: z.string().min(1),
});

export const operationsSchema = z.object({
  resize: z
    .object({
      mode: z.enum(["dimensions", "percentage", "preset"]).optional(),
      width: z.number().int().positive().optional(),
      height: z.number().int().positive().optional(),
      percentage: z.number().positive().max(1000).optional(),
      preset: z.enum(["thumbnail", "social", "hd"]).optional(),
      fit: z.enum(["cover", "contain", "inside", "outside"]).optional(),
      responsiveWidths: z.array(z.number().int().positive()).max(12).optional(),
    })
    .optional(),
  crop: z
    .object({
      x: z.number().int().min(0),
      y: z.number().int().min(0),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .optional(),
  rotate: z
    .object({
      angle: z.number().min(-360).max(360).optional(),
      quarterTurns: z.number().int().min(-3).max(3).optional(),
    })
    .optional(),
  flip: z
    .object({
      horizontal: z.boolean().optional(),
      vertical: z.boolean().optional(),
    })
    .optional(),
  orientation: z
    .object({
      autoOrient: z.boolean().optional(),
    })
    .optional(),
  convert: z
    .object({
      format: outputFormatSchema.optional(),
      mode: z.enum(["lossy", "lossless"]).optional(),
      quality: z.number().int().min(1).max(100).optional(),
      compressionLevel: z.number().int().min(0).max(9).optional(),
      effort: z.number().int().min(0).max(9).optional(),
      autoOptimize: z.boolean().optional(),
    })
    .optional(),
});

export const estimateSchema = imageIdSchema.extend({
  operations: operationsSchema,
});

export const previewSchema = imageIdSchema.extend({
  operations: operationsSchema.optional(),
});

export const exportSchema = z.object({
  items: z
    .array(
      z.object({
        imageId: z.string().min(1),
        operations: operationsSchema.optional(),
      }),
    )
    .min(1)
    .max(100),
  output: z
    .object({
      namingPattern: z.string().min(1).max(120).default("{name}-{width}.{ext}"),
      destination: z.enum(["zip", "folder", "cloud"]).default("zip"),
      overwrite: z.boolean().default(false),
    })
    .default({
      namingPattern: "{name}-{width}.{ext}",
      destination: "zip",
      overwrite: false,
    }),
});

export const presetSchema = z.object({
  name: z.string().min(1).max(80),
  operations: operationsSchema,
});

export type EstimateInput = z.infer<typeof estimateSchema>;
export type ExportInput = z.infer<typeof exportSchema>;
export type OperationsInput = z.infer<typeof operationsSchema>;
export type PresetInput = z.infer<typeof presetSchema>;
export type PreviewInput = z.infer<typeof previewSchema>;
