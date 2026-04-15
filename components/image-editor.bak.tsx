"use client";

import { useState, useCallback, useEffect } from "react";
import {
  RiUploadCloud2Line,
  RiImage2Line,
  RiDownload2Line,
  RiSettings3Line,
  RiCheckLine,
  RiCloseLine,
  RiArrowRightLine,
} from "@remixicon/react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import type {
  OperationsInput,
  EstimateInput,
  PreviewInput,
  ExportInput,
} from "@/lib/backend/schemas";
import { SUPPORTED_OUTPUT_FORMATS } from "@/lib/backend/types";

// Type definitions to hold our app state
type ImageInputInfo = {
  name: string;
  mimeType: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
  hasAlpha: boolean;
  orientation: number;
};

type EstimateResult = {
  format: string;
  width: number;
  height: number;
  estimatedBytes: number;
  estimatedReductionPct: number;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export function ImageEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [inputInfo, setInputInfo] = useState<ImageInputInfo | null>(null);

  const [operations, setOperations] = useState<OperationsInput>({});

  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [previewBlob, setPreviewBlob] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Settings State
  const [format, setFormat] = useState<string>("jpeg");
  const [quality, setQuality] = useState(80);
  const [resizeMode, setResizeMode] = useState<
    "original" | "percentage" | "dimensions"
  >("original");
  const [resizeWidth, setResizeWidth] = useState<string>("");
  const [resizeHeight, setResizeHeight] = useState<string>("");
  const [resizePercentage, setResizePercentage] = useState<number>(50);

  const [exportNaming, setExportNaming] = useState("{name}-{width}.{ext}");

  // Generate the actual operations object whenever settings change
  useEffect(() => {
    if (!imageId) return;

    const newOps: OperationsInput = {
      convert: {
        format: format as any,
        quality: quality,
      },
    };

    if (resizeMode === "percentage" && resizePercentage !== 100) {
      newOps.resize = { mode: "percentage", percentage: resizePercentage };
    } else if (resizeMode === "dimensions") {
      const w = parseInt(resizeWidth, 10);
      const h = parseInt(resizeHeight, 10);
      if (!isNaN(w) || !isNaN(h)) {
        newOps.resize = {
          mode: "dimensions",
          width: !isNaN(w) && w > 0 ? w : undefined,
          height: !isNaN(h) && h > 0 ? h : undefined,
        };
      }
    }

    setOperations(newOps);
  }, [
    format,
    quality,
    resizeMode,
    resizeWidth,
    resizeHeight,
    resizePercentage,
    imageId,
  ]);

  // Handle Debounced Previews and Estimates
  useEffect(() => {
    if (!imageId) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsProcessing(true);
      try {
        // 1. Estimate
        const estRes = await fetch("/api/images/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId, operations }),
          signal: controller.signal,
        });

        if (estRes.ok) {
          const estData = await estRes.json();
          setEstimate(estData.output);
        }

        // 2. Preview
        const prevRes = await fetch("/api/images/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId, operations }),
          signal: controller.signal,
        });

        if (prevRes.ok) {
          const blob = await prevRes.blob();
          const url = URL.createObjectURL(blob);
          setPreviewBlob((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          toast.error("Failed to process image preview");
        }
      } finally {
        setIsProcessing(false);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [operations, imageId]);

  const handleFileDrop = useCallback(
    async (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.DragEvent<HTMLLabelElement>,
    ) => {
      let selectedFile: File | null = null;

      if ("dataTransfer" in e) {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          selectedFile = e.dataTransfer.files[0];
        }
      } else {
        if (e.target.files && e.target.files.length > 0) {
          selectedFile = e.target.files[0];
        }
      }

      if (!selectedFile) return;

      setFile(selectedFile);
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const res = await fetch("/api/images/inspect", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || "Upload failed");
        }

        const data = await res.json();
        setImageId(data.imageId);
        setInputInfo(data.input);

        // Default resize dimensions based on input
        setResizeWidth(String(data.input.width));
        setResizeHeight(String(data.input.height));

        // Auto-set optimal output format based on input
        if (data.input.hasAlpha && format === "jpeg") {
          setFormat("webp");
        } else if (!data.input.hasAlpha && data.input.format === "jpeg") {
          setFormat("jpeg");
        }

        toast.success("Image uploaded successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload image",
        );
        setFile(null);
        setImageId(null);
        setInputInfo(null);
      } finally {
        setIsUploading(false);
      }
    },
    [format],
  );

  const handleExport = async () => {
    if (!imageId || !operations) return;

    setIsExporting(true);
    try {
      const res = await fetch("/api/images/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ imageId, operations }],
          output: { namingPattern: exportNaming, destination: "zip" },
        }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "processed-images.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Export successful!");
    } catch (err) {
      toast.error("Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* LEFT COLUMN: CONTROLS */}
      <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
        {/* Dropzone */}
        <Card className="border-dashed shadow-none bg-zinc-50/50 dark:bg-zinc-900/50">
          <CardContent className="p-0">
            <label
              className="flex flex-col items-center justify-center w-full h-48 cursor-pointer rounded-xl hover:bg-zinc-100/80 transition-colors dark:hover:bg-zinc-800/80"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <RiUploadCloud2Line className="w-10 h-10 mb-3 text-zinc-400" />
                <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  PNG, JPG, WEBP, AVIF (Max 25MB)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileDrop}
              />
            </label>
          </CardContent>
        </Card>

        {/* Settings Accordion (Only show if image uploaded) */}
        {imageId && (
          <Card className="shadow-sm">
            <CardHeader className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-base flex items-center gap-2">
                <RiSettings3Line className="w-5 h-5 text-zinc-500" />
                Optimization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion
                type="multiple"
                defaultValue={["format", "resize"]}
                className="w-full"
              >
                {/* Format & Quality */}
                <AccordionItem
                  value="format"
                  className="border-b border-zinc-100 dark:border-zinc-800 px-5"
                >
                  <AccordionTrigger className="hover:no-underline py-4 text-sm font-medium">
                    Format & Quality
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 space-y-5">
                    <div className="space-y-3">
                      <Label htmlFor="format-select">Output Format</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger id="format-select">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPPORTED_OUTPUT_FORMATS.map((fmt) => (
                            <SelectItem key={fmt} value={fmt}>
                              {fmt.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Quality ({quality}%)</Label>
                        <span className="text-xs text-zinc-500">
                          Lower means smaller file
                        </span>
                      </div>
                      <Slider
                        value={[quality]}
                        min={1}
                        max={100}
                        step={1}
                        onValueChange={(v) => setQuality(v[0])}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Resize */}
                <AccordionItem value="resize" className="border-b-0 px-5">
                  <AccordionTrigger className="hover:no-underline py-4 text-sm font-medium">
                    Resize
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 space-y-5">
                    <div className="space-y-3">
                      <Label>Resize Mode</Label>
                      <Select
                        value={resizeMode}
                        onValueChange={(v: any) => setResizeMode(v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Original Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="original">
                            Original Size
                          </SelectItem>
                          <SelectItem value="percentage">Percentage</SelectItem>
                          <SelectItem value="dimensions">
                            Custom Dimensions
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {resizeMode === "percentage" && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center justify-between">
                          <Label>Scale ({resizePercentage}%)</Label>
                        </div>
                        <Slider
                          value={[resizePercentage]}
                          min={1}
                          max={200}
                          step={1}
                          onValueChange={(v) => setResizePercentage(v[0])}
                        />
                      </div>
                    )}

                    {resizeMode === "dimensions" && (
                      <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
                        <div className="space-y-2">
                          <Label>Width (px)</Label>
                          <Input
                            type="number"
                            placeholder="Auto"
                            value={resizeWidth}
                            onChange={(e) => setResizeWidth(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Height (px)</Label>
                          <Input
                            type="number"
                            placeholder="Auto"
                            value={resizeHeight}
                            onChange={(e) => setResizeHeight(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Export Configuration */}
        {imageId && (
          <Card className="shadow-sm">
            <CardHeader className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <CardTitle className="text-base flex items-center gap-2">
                <RiDownload2Line className="w-5 h-5 text-zinc-500" />
                Export Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-3">
                <Label>File Name Pattern</Label>
                <Input
                  value={exportNaming}
                  onChange={(e) => setExportNaming(e.target.value)}
                  placeholder="{name}-{width}.{ext}"
                />
                <p className="text-xs text-zinc-500">
                  Variables: {"{name}, {width}, {ext}"}
                </p>
              </div>

              <Button
                className="w-full font-medium"
                size="lg"
                onClick={handleExport}
                disabled={isExporting || isProcessing}
              >
                {isExporting ? "Exporting..." : "Download ZIP"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* RIGHT COLUMN: PREVIEW */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Placeholder if no image */}
        {!imageId && !isUploading && (
          <Card className="h-full min-h-[500px] flex items-center justify-center border-dashed bg-transparent shadow-none">
            <div className="text-center text-zinc-400 dark:text-zinc-600">
              <RiImage2Line className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium text-zinc-500">
                No Image Selected
              </p>
              <p className="text-sm mt-1">Upload an image to see the preview</p>
            </div>
          </Card>
        )}

        {/* Skeleton while initial upload is happening */}
        {isUploading && (
          <Card className="h-full min-h-[500px] flex items-center justify-center">
            <div className="space-y-4 w-full px-12">
              <Skeleton className="h-[400px] w-full rounded-lg" />
              <div className="flex gap-4">
                <Skeleton className="h-20 flex-1 rounded-lg" />
                <Skeleton className="h-20 flex-1 rounded-lg" />
              </div>
            </div>
          </Card>
        )}

        {/* Preview Area */}
        {imageId && inputInfo && (
          <>
            <Card className="overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 relative">
              {/* Checkered pattern background for transparency */}
              <div
                className="w-full h-full min-h-[400px] flex items-center justify-center p-4"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
                }}
              >
                {previewBlob ? (
                  <img
                    src={previewBlob}
                    alt="Preview"
                    className={`max-w-full max-h-[600px] object-contain transition-opacity duration-300 ${isProcessing ? "opacity-50" : "opacity-100"}`}
                  />
                ) : (
                  <Skeleton className="w-full h-[400px]" />
                )}

                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 text-xs shadow-lg font-medium flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Updating...
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            {/* Metadata Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Stats */}
              <Card className="bg-zinc-50 dark:bg-zinc-900/50 shadow-none border-zinc-200 dark:border-zinc-800">
                <CardHeader className="py-3 px-4 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Original
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-3 px-4 text-sm grid grid-cols-2 gap-y-2">
                  <div className="text-zinc-500">Format</div>
                  <div className="font-medium text-right uppercase">
                    {inputInfo.format}
                  </div>

                  <div className="text-zinc-500">Dimensions</div>
                  <div className="font-medium text-right">
                    {inputInfo.width} × {inputInfo.height}
                  </div>

                  <div className="text-zinc-500">Size</div>
                  <div className="font-medium text-right">
                    {formatBytes(inputInfo.bytes)}
                  </div>
                </CardContent>
              </Card>

              {/* Estimated Stats */}
              <Card className="bg-white dark:bg-zinc-950 shadow-none border-blue-100 dark:border-blue-900/30 ring-1 ring-blue-50/50 dark:ring-0">
                <CardHeader className="py-3 px-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
                  <CardTitle className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Estimated Output
                  </CardTitle>
                  {estimate && estimate.estimatedReductionPct > 0 && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-[10px] px-1.5 py-0 h-4">
                      -{estimate.estimatedReductionPct}%
                    </Badge>
                  )}
                  {estimate && estimate.estimatedReductionPct < 0 && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      +{Math.abs(estimate.estimatedReductionPct)}%
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="py-3 px-4 text-sm grid grid-cols-2 gap-y-2">
                  <div className="text-zinc-500">Format</div>
                  <div className="font-medium text-right uppercase">
                    {estimate ? (
                      estimate.format
                    ) : (
                      <Skeleton className="h-4 w-12 ml-auto" />
                    )}
                  </div>

                  <div className="text-zinc-500">Dimensions</div>
                  <div className="font-medium text-right">
                    {estimate ? (
                      `${estimate.width} × ${estimate.height}`
                    ) : (
                      <Skeleton className="h-4 w-20 ml-auto" />
                    )}
                  </div>

                  <div className="text-zinc-500">Size</div>
                  <div className="font-medium text-right flex items-center justify-end gap-2">
                    {estimate ? (
                      <>
                        <span
                          className={
                            estimate.estimatedBytes < inputInfo.bytes
                              ? "text-green-600 dark:text-green-400 font-semibold"
                              : ""
                          }
                        >
                          {formatBytes(estimate.estimatedBytes)}
                        </span>
                      </>
                    ) : (
                      <Skeleton className="h-4 w-16 ml-auto" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
