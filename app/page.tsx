"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import type { OperationsInput } from "@/lib/backend/schemas";
import { SUPPORTED_OUTPUT_FORMATS } from "@/lib/backend/types";

// Types
type ImageInputInfo = {
  name: string;
  mimeType: string;
  bytes: number;
  width: number;
  height: number;
  format: string;
  hasAlpha: boolean;
  orientation: number | null;
};

type EstimateResult = {
  format: string;
  width: number;
  height: number;
  estimatedBytes: number;
  estimatedReductionPct: number;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Home() {
  // Core state
  const [imageId, setImageId] = useState<string | null>(null);
  const [inputInfo, setInputInfo] = useState<ImageInputInfo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Preview state
  const [originalBlobUrl, setOriginalBlobUrl] = useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const originalUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);

  // Operations state
  const [resizeMode, setResizeMode] = useState<
    "dimensions" | "percentage" | "preset"
  >("preset");
  const [resizeWidth, setResizeWidth] = useState<number>(1200);
  const [resizeHeight, setResizeHeight] = useState<number>(800);
  const [resizePercentage, setResizePercentage] = useState<number>(100);
  const [resizePreset, setResizePreset] = useState<
    "thumbnail" | "social" | "hd"
  >("hd");
  const [resizeFit, setResizeFit] = useState<
    "cover" | "contain" | "inside" | "outside"
  >("contain");

  const [cropRatio, setCropRatio] = useState<"1:1" | "4:3" | "16:9" | "free">(
    "16:9",
  );
  const [cropX, setCropX] = useState<number>(0);
  const [cropY, setCropY] = useState<number>(0);
  const [cropWidth, setCropWidth] = useState<number>(1200);
  const [cropHeight, setCropHeight] = useState<number>(800);

  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [autoOrient, setAutoOrient] = useState(true);

  const [outputFormat, setOutputFormat] = useState<string>("webp");
  const [compressionMode, setCompressionMode] = useState<"lossy" | "lossless">(
    "lossy",
  );
  const [quality, setQuality] = useState<number>(82);
  const [autoOptimize, setAutoOptimize] = useState(true);

  const [namingPattern, setNamingPattern] = useState("{name}-{width}.{ext}");
  const [keepOriginals, setKeepOriginals] = useState(false);

  // Build operations object from state
  const operations: OperationsInput = useMemo(() => {
    const ops: OperationsInput = {};

    // Resize
    if (resizeMode === "percentage" && resizePercentage !== 100) {
      ops.resize = {
        mode: "percentage",
        percentage: resizePercentage,
        fit: resizeFit,
      };
    } else if (resizeMode === "dimensions") {
      ops.resize = {
        mode: "dimensions",
        width: resizeWidth,
        height: resizeHeight,
        fit: resizeFit,
      };
    } else if (resizeMode === "preset") {
      ops.resize = { mode: "preset", preset: resizePreset, fit: resizeFit };
    }

    // Crop
    if (cropWidth > 0 && cropHeight > 0) {
      ops.crop = { x: cropX, y: cropY, width: cropWidth, height: cropHeight };
    }

    // Rotate
    if (rotation !== 0) {
      ops.rotate = { angle: rotation };
    }

    // Flip
    if (flipH || flipV) {
      ops.flip = { horizontal: flipH, vertical: flipV };
    }

    // Orientation
    if (autoOrient) {
      ops.orientation = { autoOrient: true };
    }

    // Convert
    ops.convert = {
      format: outputFormat as any,
      mode: compressionMode,
      quality: autoOptimize ? undefined : quality,
      autoOptimize,
    };

    return ops;
  }, [
    resizeMode,
    resizeWidth,
    resizeHeight,
    resizePercentage,
    resizePreset,
    resizeFit,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    rotation,
    flipH,
    flipV,
    autoOrient,
    outputFormat,
    compressionMode,
    quality,
    autoOptimize,
  ]);

  // Debounced preview generation
  useEffect(() => {
    if (!imageId) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsProcessing(true);
      try {
        // Get estimate
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

        // Get preview
        const prevRes = await fetch("/api/images/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId, operations }),
          signal: controller.signal,
        });

        if (prevRes.ok) {
          const blob = await prevRes.blob();
          const url = URL.createObjectURL(blob);
          setPreviewBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") {
          toast.error("Failed to generate preview");
        }
      } finally {
        setIsProcessing(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [operations, imageId]);

  // Track URLs for cleanup
  useEffect(() => {
    originalUrlRef.current = originalBlobUrl;
  }, [originalBlobUrl]);

  useEffect(() => {
    previewUrlRef.current = previewBlobUrl;
  }, [previewBlobUrl]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);

      // Create blob URL for original preview
      const originalUrl = URL.createObjectURL(file);
      setOriginalBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return originalUrl;
      });

      const formData = new FormData();
      formData.append("file", file);

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

        // Set defaults based on input
        setResizeWidth(data.input.width);
        setResizeHeight(data.input.height);
        setCropWidth(data.input.width);
        setCropHeight(data.input.height);

        // Auto-select format based on alpha
        if (data.input.hasAlpha && outputFormat === "jpeg") {
          setOutputFormat("webp");
        }

        toast.success("Image uploaded successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload image",
        );
        setImageId(null);
        setInputInfo(null);
        setOriginalBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
      } finally {
        setIsUploading(false);
      }
    },
    [outputFormat],
  );

  const handleExport = async () => {
    if (!imageId) return;

    setIsExporting(true);
    setExportProgress(30);

    try {
      const res = await fetch("/api/images/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ imageId, operations }],
          output: { namingPattern, destination: "zip", overwrite: false },
        }),
      });

      setExportProgress(70);

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

      setExportProgress(100);
      toast.success("Export successful!");
    } catch (err) {
      toast.error("Export failed");
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    }
  };

  const handleReset = () => {
    setImageId(null);
    setInputInfo(null);
    setOriginalBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPreviewBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setEstimate(null);
    setResizeMode("preset");
    setResizePreset("hd");
    setResizeFit("contain");
    setCropRatio("16:9");
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setOutputFormat("webp");
    setQuality(82);
    toast.info("Settings reset");
  };

  // Preset handlers
  const applyPresetDimensions = (preset: typeof resizePreset) => {
    setResizePreset(preset);
    if (preset === "thumbnail") {
      setResizeWidth(200);
      setResizeHeight(200);
      setResizeFit("cover");
    } else if (preset === "social") {
      setResizeWidth(1200);
      setResizeHeight(630);
      setResizeFit("cover");
    } else if (preset === "hd") {
      setResizeWidth(1920);
      setResizeHeight(1080);
      setResizeFit("inside");
    }
  };

  // Crop ratio handlers
  const applyCropRatio = (ratio: typeof cropRatio) => {
    setCropRatio(ratio);
    if (!inputInfo) return;
    if (ratio === "1:1") {
      const size = Math.min(inputInfo.width, inputInfo.height);
      setCropWidth(size);
      setCropHeight(size);
    } else if (ratio === "4:3") {
      setCropWidth(Math.min(inputInfo.width, 1200));
      setCropHeight(Math.min(inputInfo.height, 900));
    } else if (ratio === "16:9") {
      setCropWidth(Math.min(inputInfo.width, 1920));
      setCropHeight(Math.min(inputInfo.height, 1080));
    }
  };

  // Rotation handlers
  const rotateLeft = () => setRotation((r) => r - 90);
  const rotateRight = () => setRotation((r) => r + 90);

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-4 sm:px-5 sm:py-6 lg:px-8">
      <div className="mb-4 flex flex-col gap-4 border-b pb-4 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:pb-5">
        <div className="max-w-2xl space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-[2.15rem]">
            Image Shop
          </h1>
          <p className="max-w-[58ch] text-sm text-muted-foreground sm:text-[0.95rem]">
            A compact image workflow built to move cleanly from phone to large
            screen.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <ThemeToggle />
          <Button asChild variant="ghost" className="min-w-24">
            <Link href="#export">Export</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        {/* LEFT COLUMN - Image Preview */}
        <Card>
          <CardContent className="space-y-5 p-4 sm:p-5">
            {/* Upload Area */}
            <Card className="border-dashed bg-muted/10">
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1">
                  <p className="font-medium">Upload image</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WebP, AVIF up to 25MB
                  </p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  aria-label="Choose image"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </CardContent>
            </Card>

            {/* Image Preview Tabs */}
            <Tabs defaultValue="before">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2">
                <TabsTrigger value="before">Before</TabsTrigger>
                <TabsTrigger value="after">After</TabsTrigger>
              </TabsList>

              <TabsContent value="before" className="pt-4">
                <div
                  className="grid min-h-[280px] place-items-center rounded-xl border bg-muted/20 sm:min-h-[360px] lg:min-h-[440px] relative overflow-hidden"
                  style={{
                    backgroundImage: inputInfo?.hasAlpha
                      ? `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239CA3AF' fill-opacity='0.2'%3E%3Crect width='10' height='10'/%3E%3Crect x='10' y='10' width='10' height='10'/%3E%3C/g%3E%3C/svg%3E")`
                      : undefined,
                  }}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <span className="text-sm text-muted-foreground">
                        Uploading...
                      </span>
                    </div>
                  ) : originalBlobUrl ? (
                    <img
                      src={originalBlobUrl}
                      alt="Original"
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  ) : (
                    <span className="text-muted-foreground">
                      No image uploaded
                    </span>
                  )}
                </div>

                {/* Original Info */}
                {inputInfo && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">
                      {inputInfo.format.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary">
                      {inputInfo.width} × {inputInfo.height}
                    </Badge>
                    <Badge variant="secondary">
                      {formatBytes(inputInfo.bytes)}
                    </Badge>
                    {inputInfo.hasAlpha && (
                      <Badge variant="outline">Alpha</Badge>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="after" className="pt-4">
                <div
                  className="grid min-h-[280px] place-items-center rounded-xl border bg-muted/20 sm:min-h-[360px] lg:min-h-[440px] relative overflow-hidden"
                  style={{
                    backgroundImage: inputInfo?.hasAlpha
                      ? `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239CA3AF' fill-opacity='0.2'%3E%3Crect width='10' height='10'/%3E%3Crect x='10' y='10' width='10' height='10'/%3E%3C/g%3E%3C/svg%3E")`
                      : undefined,
                  }}
                >
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <span className="text-sm text-muted-foreground">
                          Processing...
                        </span>
                      </div>
                    </div>
                  )}
                  {previewBlobUrl ? (
                    <img
                      src={previewBlobUrl}
                      alt="Preview"
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  ) : originalBlobUrl ? (
                    <span className="text-muted-foreground">
                      Generating preview...
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Upload an image first
                    </span>
                  )}
                </div>

                {/* Output Info */}
                {estimate && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <Badge variant="secondary">
                      {estimate.format.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary">
                      {estimate.width} × {estimate.height}
                    </Badge>
                    <Badge variant="secondary">
                      {formatBytes(estimate.estimatedBytes)}
                    </Badge>
                    {estimate.estimatedReductionPct > 0 ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                        -{estimate.estimatedReductionPct}%
                      </Badge>
                    ) : estimate.estimatedReductionPct < 0 ? (
                      <Badge variant="destructive">
                        +{Math.abs(estimate.estimatedReductionPct)}%
                      </Badge>
                    ) : null}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN - Controls */}
        <Card className="border-0">
          <CardHeader className="pb-3">
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resize" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-4">
                <TabsTrigger value="resize">Resize</TabsTrigger>
                <TabsTrigger value="rotate">Rotate</TabsTrigger>
                <TabsTrigger value="format">Format</TabsTrigger>
                <TabsTrigger value="compress">Compress</TabsTrigger>
              </TabsList>

              {/* Resize Tab */}
              <TabsContent value="resize" className="pt-1">
                <Card className="border-0 shadow-none">
                  <CardContent className="px-0 pb-0 space-y-4">
                    <ToggleGroup
                      type="single"
                      value={resizeMode}
                      onValueChange={(v) =>
                        v && setResizeMode(v as typeof resizeMode)
                      }
                      className="justify-start gap-2 flex-wrap"
                    >
                      <ToggleGroupItem value="dimensions">
                        W x H
                      </ToggleGroupItem>
                      <ToggleGroupItem value="percentage">%</ToggleGroupItem>
                      <ToggleGroupItem value="preset">Preset</ToggleGroupItem>
                    </ToggleGroup>

                    {resizeMode === "dimensions" && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="resize-width">Width (px)</Label>
                          <Input
                            id="resize-width"
                            type="number"
                            value={resizeWidth}
                            onChange={(e) =>
                              setResizeWidth(Number(e.target.value))
                            }
                            min={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="resize-height">Height (px)</Label>
                          <Input
                            id="resize-height"
                            type="number"
                            value={resizeHeight}
                            onChange={(e) =>
                              setResizeHeight(Number(e.target.value))
                            }
                            min={1}
                          />
                        </div>
                      </div>
                    )}

                    {resizeMode === "percentage" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Scale: {resizePercentage}%</Label>
                        </div>
                        <Slider
                          value={[resizePercentage]}
                          onValueChange={(v) => setResizePercentage(v[0])}
                          min={1}
                          max={200}
                          step={1}
                        />
                      </div>
                    )}

                    {resizeMode === "preset" && (
                      <ToggleGroup
                        type="single"
                        value={resizePreset}
                        onValueChange={(v) =>
                          v && applyPresetDimensions(v as typeof resizePreset)
                        }
                        className="justify-start gap-2 flex-wrap"
                      >
                        <ToggleGroupItem value="thumbnail">
                          Thumbnail
                        </ToggleGroupItem>
                        <ToggleGroupItem value="social">Social</ToggleGroupItem>
                        <ToggleGroupItem value="hd">HD</ToggleGroupItem>
                      </ToggleGroup>
                    )}

                    <div className="space-y-2">
                      <Label>Fit Mode</Label>
                      <ToggleGroup
                        type="single"
                        value={resizeFit}
                        onValueChange={(v) =>
                          v && setResizeFit(v as typeof resizeFit)
                        }
                        className="justify-start gap-2 flex-wrap"
                      >
                        <ToggleGroupItem value="cover">Cover</ToggleGroupItem>
                        <ToggleGroupItem value="contain">
                          Contain
                        </ToggleGroupItem>
                        <ToggleGroupItem value="inside">Inside</ToggleGroupItem>
                        <ToggleGroupItem value="outside">
                          Outside
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rotate Tab */}
              <TabsContent value="rotate" className="pt-1">
                <Card className="border-0 shadow-none">
                  <CardContent className="px-0 pb-0 space-y-4">
                    <ToggleGroup
                      type="single"
                      value={cropRatio}
                      onValueChange={(v) =>
                        v && applyCropRatio(v as typeof cropRatio)
                      }
                      className="justify-start gap-2 flex-wrap"
                    >
                      <ToggleGroupItem value="1:1">1:1</ToggleGroupItem>
                      <ToggleGroupItem value="4:3">4:3</ToggleGroupItem>
                      <ToggleGroupItem value="16:9">16:9</ToggleGroupItem>
                      <ToggleGroupItem value="free">Free</ToggleGroupItem>
                    </ToggleGroup>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="crop-x">Crop X</Label>
                        <Input
                          id="crop-x"
                          type="number"
                          value={cropX}
                          onChange={(e) => setCropX(Number(e.target.value))}
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crop-y">Crop Y</Label>
                        <Input
                          id="crop-y"
                          type="number"
                          value={cropY}
                          onChange={(e) => setCropY(Number(e.target.value))}
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crop-width">Crop Width</Label>
                        <Input
                          id="crop-width"
                          type="number"
                          value={cropWidth}
                          onChange={(e) => setCropWidth(Number(e.target.value))}
                          min={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="crop-height">Crop Height</Label>
                        <Input
                          id="crop-height"
                          type="number"
                          value={cropHeight}
                          onChange={(e) =>
                            setCropHeight(Number(e.target.value))
                          }
                          min={1}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button variant="outline" onClick={rotateLeft}>
                        -90°
                      </Button>
                      <Button variant="outline" onClick={rotateRight}>
                        +90°
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setFlipH((v) => !v)}
                        className={flipH ? "bg-accent" : ""}
                      >
                        Flip H
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setFlipV((v) => !v)}
                        className={flipV ? "bg-accent" : ""}
                      >
                        Flip V
                      </Button>
                    </div>

                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Switch
                        id="auto-orient"
                        checked={autoOrient}
                        onCheckedChange={setAutoOrient}
                      />
                      <Label htmlFor="auto-orient">Auto orient</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Format Tab */}
              <TabsContent value="format" className="pt-1">
                <Card className="border-0 shadow-none">
                  <CardContent className="px-0 pb-0 space-y-4">
                    <Label>Output Format</Label>
                    <ToggleGroup
                      type="single"
                      value={outputFormat}
                      onValueChange={(v) => v && setOutputFormat(v)}
                      className="justify-start gap-2 flex-wrap"
                    >
                      {SUPPORTED_OUTPUT_FORMATS.map((fmt) => (
                        <ToggleGroupItem key={fmt} value={fmt}>
                          {fmt.toUpperCase()}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>

                    {inputInfo?.hasAlpha && outputFormat === "jpeg" && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Warning: JPEG does not support transparency. Alpha
                        channel will be lost.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Compress Tab */}
              <TabsContent value="compress" className="pt-1">
                <Card className="border-0 shadow-none">
                  <CardContent className="px-0 pb-0 space-y-4">
                    <ToggleGroup
                      type="single"
                      value={compressionMode}
                      onValueChange={(v) =>
                        v && setCompressionMode(v as typeof compressionMode)
                      }
                      className="justify-start gap-2 flex-wrap"
                    >
                      <ToggleGroupItem value="lossy">Lossy</ToggleGroupItem>
                      <ToggleGroupItem value="lossless">
                        Lossless
                      </ToggleGroupItem>
                    </ToggleGroup>

                    {!autoOptimize && compressionMode === "lossy" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">
                            Quality
                          </p>
                          <span className="text-sm text-muted-foreground">
                            {quality}
                          </span>
                        </div>
                        <Slider
                          value={[quality]}
                          onValueChange={(v) => setQuality(v[0])}
                          max={100}
                          step={1}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-3 rounded-lg border p-3">
                      <Switch
                        id="auto-opt"
                        checked={autoOptimize}
                        onCheckedChange={setAutoOptimize}
                      />
                      <Label htmlFor="auto-opt">Auto optimize</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Export Section */}
            <div id="export" className="mt-4 space-y-4 rounded-xl border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pattern">Naming Pattern</Label>
                  <Input
                    id="pattern"
                    value={namingPattern}
                    onChange={(e) => setNamingPattern(e.target.value)}
                    aria-label="Naming pattern"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables: {"{name}, {width}, {ext}"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    defaultValue="Download ZIP"
                    disabled
                    aria-label="Destination"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                <Switch
                  id="keep-originals"
                  checked={keepOriginals}
                  onCheckedChange={setKeepOriginals}
                />
                <Label htmlFor="keep-originals">Keep originals</Label>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  className="sm:w-auto"
                  onClick={handleExport}
                  disabled={!imageId || isExporting || isProcessing}
                >
                  {isExporting ? "Exporting..." : "Export"}
                </Button>
                <Button
                  variant="outline"
                  className="sm:w-auto"
                  onClick={handleReset}
                  disabled={!imageId}
                >
                  Reset
                </Button>
                {isExporting && (
                  <div className="min-w-48 flex-1">
                    <Progress value={exportProgress} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
