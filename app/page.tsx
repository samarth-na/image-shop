import Link from "next/link";
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

export default function Home() {
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
        <Card>
          <CardContent className="space-y-5 p-4 sm:p-5">
            <Card className="border-dashed bg-muted/10">
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1">
                  <p className="font-medium">Upload image</p>
                </div>
                <Input type="file" accept="image/*" aria-label="Choose image" />
              </CardContent>
            </Card>

            <Tabs defaultValue="before">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2">
                <TabsTrigger value="before">Before</TabsTrigger>
                <TabsTrigger value="after">After</TabsTrigger>
              </TabsList>
              <TabsContent value="before" className="pt-4">
                <div className="grid min-h-[280px] place-items-center rounded-xl border bg-muted/20 sm:min-h-[360px] lg:min-h-[440px]">
                  Before
                </div>
              </TabsContent>
              <TabsContent value="after" className="pt-4">
                <div className="grid min-h-[280px] place-items-center rounded-xl border bg-muted/20 sm:min-h-[360px] lg:min-h-[440px]">
                  After
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

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

              <TabsContent value="resize" className="pt-1">
                <Card className="border-0 shadow-none">
                  <CardContent className="px-0 pb-0">
                    <div className="space-y-4">
                      <ToggleGroup
                        type="single"
                        defaultValue="preset"
                        className="justify-start gap-2 flex-wrap"
                      >
                        <ToggleGroupItem value="wh">W x H</ToggleGroupItem>
                        <ToggleGroupItem value="percent">%</ToggleGroupItem>
                        <ToggleGroupItem value="preset">Preset</ToggleGroupItem>
                      </ToggleGroup>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input defaultValue="1200" aria-label="Width" />
                        <Input defaultValue="800" aria-label="Height" />
                      </div>
                      <ToggleGroup
                        type="single"
                        defaultValue="contain"
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

              <TabsContent value="rotate" className="pt-1">
                <Card className="border-0 shadow-none">
                  <CardContent className="px-0 pb-0">
                    <div className="space-y-4">
                      <ToggleGroup
                        type="single"
                        defaultValue="16:9"
                        className="justify-start gap-2 flex-wrap"
                      >
                        <ToggleGroupItem value="1:1">1:1</ToggleGroupItem>
                        <ToggleGroupItem value="4:3">4:3</ToggleGroupItem>
                        <ToggleGroupItem value="16:9">16:9</ToggleGroupItem>
                        <ToggleGroupItem value="free">Free</ToggleGroupItem>
                      </ToggleGroup>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input defaultValue="0" aria-label="Crop X" />
                        <Input defaultValue="0" aria-label="Crop Y" />
                        <Input defaultValue="1200" aria-label="Crop width" />
                        <Input defaultValue="800" aria-label="Crop height" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Button variant="outline">-90°</Button>
                        <Button variant="outline">+90°</Button>
                        <Button variant="outline">Flip H</Button>
                        <Button variant="outline">Flip V</Button>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Switch id="auto-orient" defaultChecked />
                        <Label htmlFor="auto-orient">Auto orient</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="format" className="pt-1">
                <Card className="border-0 shadow-none">
                  <CardContent className="px-0 pb-0">
                    <div className="space-y-4">
                      <ToggleGroup
                        type="single"
                        defaultValue="webp"
                        className="justify-start gap-2 flex-wrap"
                      >
                        <ToggleGroupItem value="jpg">JPG</ToggleGroupItem>
                        <ToggleGroupItem value="png">PNG</ToggleGroupItem>
                        <ToggleGroupItem value="webp">WebP</ToggleGroupItem>
                        <ToggleGroupItem value="avif">AVIF</ToggleGroupItem>
                      </ToggleGroup>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="compress" className="pt-1">
                <Card className="border-0 shadow-none">
                  <CardContent className="px-0 pb-0">
                    <div className="space-y-4">
                      <ToggleGroup
                        type="single"
                        defaultValue="lossy"
                        className="justify-start gap-2 flex-wrap"
                      >
                        <ToggleGroupItem value="lossy">Lossy</ToggleGroupItem>
                        <ToggleGroupItem value="lossless">
                          Lossless
                        </ToggleGroupItem>
                      </ToggleGroup>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium leading-none">
                            Quality
                          </p>
                          <span className="text-sm text-muted-foreground">
                            82
                          </span>
                        </div>
                        <Slider defaultValue={[82]} max={100} step={1} />
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border p-3">
                        <Switch id="auto-opt" defaultChecked />
                        <Label htmlFor="auto-opt">Auto optimize</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div id="export" className="mt-4 space-y-4 rounded-xl border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  id="pattern"
                  defaultValue="{name}-{width}.{ext}"
                  aria-label="Naming pattern"
                />
                <Input
                  id="destination"
                  defaultValue="Download ZIP"
                  aria-label="Destination"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                <Switch id="keep-originals" />
                <Label htmlFor="keep-originals">Keep originals</Label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button className="sm:w-auto">Export</Button>
                <Button variant="outline" className="sm:w-auto">
                  Reset
                </Button>
                <div className="min-w-48 flex-1">
                  <Progress value={72} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
