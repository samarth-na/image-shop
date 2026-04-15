"use client";

import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UIShowcasePage() {
  const [progress, setProgress] = useState(62);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6 md:p-8">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-semibold">UI Showcase</h1>
            <p className="text-muted-foreground">
              Route: <code>/ui</code> — all installed shadcn components in one
              place.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>1) File Input & Queue</CardTitle>
              <CardDescription>
                Upload controls, queue table, and batch toggles.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button>Browse files</Button>
                <Input type="file" multiple />
                <Badge variant="secondary">3 queued</Badge>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox aria-label="Select all" />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Checkbox aria-label="Select file" />
                    </TableCell>
                    <TableCell>hero-photo.png</TableCell>
                    <TableCell>1.2 MB</TableCell>
                    <TableCell>PNG</TableCell>
                    <TableCell>
                      <Badge>Ready</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center gap-3 border-t">
              <div className="flex items-center gap-2">
                <Label htmlFor="batch-mode">Batch mode</Label>
                <Switch id="batch-mode" defaultChecked />
              </div>
              <Button variant="outline">Remove selected</Button>
            </CardFooter>
          </Card>

          <ResizablePanelGroup
            orientation="horizontal"
            className="min-h-[360px]"
          >
            <ResizablePanel defaultSize={40}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>2) Live Preview Area</CardTitle>
                  <CardDescription>
                    Before/after panel with zoom and metadata.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-4">
                  <div className="grid flex-1 place-items-center rounded-md border bg-muted/30">
                    <Badge variant="outline">Before</Badge>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Zoom</Label>
                    <Slider
                      value={[progress]}
                      onValueChange={(v) => setProgress(v[0] ?? 0)}
                    />
                    <Progress value={progress} />
                  </div>
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Output Metadata</CardTitle>
                  <CardDescription>
                    Dimensions, format, estimated size, and reduction.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-3">
                  <div className="grid flex-1 place-items-center rounded-md border bg-muted/30">
                    <Badge>After</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">1200×800</Badge>
                    <Badge variant="secondary">WebP</Badge>
                    <Badge variant="secondary">280 KB</Badge>
                    <Badge>−42%</Badge>
                  </div>
                </CardContent>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>

          <Tabs defaultValue="format">
            <TabsList>
              <TabsTrigger value="format">3) Format</TabsTrigger>
              <TabsTrigger value="compress">4) Compression</TabsTrigger>
              <TabsTrigger value="resize">5) Resize</TabsTrigger>
            </TabsList>
            <TabsContent value="format">
              <Card>
                <CardContent className="flex flex-col gap-4 pt-4">
                  <div className="flex flex-col gap-2">
                    <Label>Output format</Label>
                    <Select defaultValue="webp">
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Choose format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Formats</SelectLabel>
                          <SelectItem value="jpg">JPG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="webp">WebP</SelectItem>
                          <SelectItem value="avif">AVIF</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <Alert>
                    <AlertTitle>Compatibility hint</AlertTitle>
                    <AlertDescription>
                      AVIF may not be supported in older browsers.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="compress">
              <Card>
                <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label>Mode</Label>
                    <RadioGroup defaultValue="lossy">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="lossy" id="lossy" />
                        <Label htmlFor="lossy">Lossy</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="lossless" id="lossless" />
                        <Label htmlFor="lossless">Lossless</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label>Quality</Label>
                    <Slider defaultValue={[80]} max={100} step={1} />
                    <div className="flex items-center gap-2">
                      <Label htmlFor="auto-opt">Auto optimize</Label>
                      <Switch id="auto-opt" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="resize">
              <Card>
                <CardContent className="grid gap-4 pt-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label>Resize mode</Label>
                    <ToggleGroup type="single" defaultValue="size">
                      <ToggleGroupItem value="size">WxH</ToggleGroupItem>
                      <ToggleGroupItem value="percent">%</ToggleGroupItem>
                      <ToggleGroupItem value="preset">Preset</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Fit mode</Label>
                    <ToggleGroup type="single" defaultValue="contain">
                      <ToggleGroupItem value="cover">cover</ToggleGroupItem>
                      <ToggleGroupItem value="contain">contain</ToggleGroupItem>
                      <ToggleGroupItem value="inside">inside</ToggleGroupItem>
                      <ToggleGroupItem value="outside">outside</ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>6-7) Crop, Rotate, Flip, Orientation</CardTitle>
              <CardDescription>
                Crop presets, angle input, and operation controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Aspect preset</Label>
                <ToggleGroup type="single" defaultValue="16:9">
                  <ToggleGroupItem value="1:1">1:1</ToggleGroupItem>
                  <ToggleGroupItem value="4:3">4:3</ToggleGroupItem>
                  <ToggleGroupItem value="16:9">16:9</ToggleGroupItem>
                  <ToggleGroupItem value="free">Free</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="flex items-center gap-2">
                <Input defaultValue="90" className="w-20" />
                <Button variant="outline">Rotate +90°</Button>
                <Button variant="outline">Rotate -90°</Button>
                <Toggle>Flip H</Toggle>
                <Toggle>Flip V</Toggle>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8) Output & Export</CardTitle>
              <CardDescription>
                Naming, destination, progress, and feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pattern">Filename pattern</Label>
                  <Input id="pattern" defaultValue="{name}-{width}.{ext}" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Destination</Label>
                  <Select defaultValue="zip">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Export to</SelectLabel>
                        <SelectItem value="zip">Download ZIP</SelectItem>
                        <SelectItem value="folder">Save Folder</SelectItem>
                        <SelectItem value="cloud">Cloud Bucket</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="overwrite">Overwrite originals</Label>
                  <Switch id="overwrite" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    toast.success("Export finished", {
                      description: "3 files written to download package.",
                    });
                  }}
                >
                  Export
                </Button>
                <div className="w-64">
                  <Progress value={78} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quality-of-life Elements</CardTitle>
              <CardDescription>
                Menus, overlays, helpers, and quick-access UI patterns.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-wrap items-center gap-2">
                <Menubar>
                  <MenubarMenu>
                    <MenubarTrigger>Presets</MenubarTrigger>
                    <MenubarContent>
                      <MenubarItem>Web optimized</MenubarItem>
                      <MenubarItem>Avatar 1:1</MenubarItem>
                      <MenubarSeparator />
                      <MenubarItem>High quality print</MenubarItem>
                    </MenubarContent>
                  </MenubarMenu>
                </Menubar>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Actions</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Editing</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem>Undo</DropdownMenuItem>
                      <DropdownMenuItem>Redo</DropdownMenuItem>
                      <DropdownMenuItem>Reset all</DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">History</Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverHeader>
                      <PopoverTitle>Recent settings</PopoverTitle>
                      <PopoverDescription>
                        Last used quality, format, and dimensions.
                      </PopoverDescription>
                    </PopoverHeader>
                    <Separator />
                    <div className="flex flex-col gap-1">
                      <p>WebP • 80 • 1200x800</p>
                      <p>AVIF • 70 • 1024x683</p>
                    </div>
                  </PopoverContent>
                </Popover>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost">Compatibility note</Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    PNG is best for transparency, JPG for photos, WebP/AVIF for
                    aggressive web compression.
                  </HoverCardContent>
                </HoverCard>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Shortcuts</Button>
                  </TooltipTrigger>
                  <TooltipContent>R: rotate, C: crop, +/-: zoom</TooltipContent>
                </Tooltip>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <AvatarGroup>
                    <Avatar>
                      <AvatarImage
                        src="https://i.pravatar.cc/80?img=7"
                        alt="A"
                      />
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarImage
                        src="https://i.pravatar.cc/80?img=8"
                        alt="B"
                      />
                      <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                    <AvatarGroupCount>+3</AvatarGroupCount>
                  </AvatarGroup>
                  <Badge variant="outline">Recent collaborators</Badge>
                </div>

                <ScrollArea className="h-24 rounded-md border p-2">
                  <div className="flex flex-col gap-2">
                    <p>Resize → Crop → Compress</p>
                    <p>Crop → Rotate → Compress</p>
                    <p>Resize → Convert → Export</p>
                    <p>Rotate → Flip → Export</p>
                  </div>
                </ScrollArea>

                <Textarea
                  placeholder="Validation messages and notes appear here..."
                  defaultValue="Width required\nPNG lossless only"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overlays</CardTitle>
              <CardDescription>
                Dialog, sheet, and drawer examples.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export configuration</DialogTitle>
                    <DialogDescription>
                      Confirm the selected operation order and output options.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter showCloseButton>
                    <Button>Confirm</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">Open Sheet</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Operation timeline</SheetTitle>
                    <SheetDescription>
                      Preview all queued transformations before export.
                    </SheetDescription>
                  </SheetHeader>
                  <SheetFooter>
                    <Button>Apply</Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="secondary">Open Drawer</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Mobile controls</DrawerTitle>
                    <DrawerDescription>
                      Quick access panel for touch workflows.
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerFooter>
                    <Button>Done</Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skeleton + Accordion</CardTitle>
              <CardDescription>
                Loading placeholders and collapsible sections.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-5/6" />
              </div>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>Keyboard shortcuts</AccordionTrigger>
                  <AccordionContent>
                    C for crop, R for rotate, V for flip, plus and minus for
                    zoom.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Validation rules</AccordionTrigger>
                  <AccordionContent>
                    Width and height must be positive values. PNG supports
                    lossless output.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </main>

        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
