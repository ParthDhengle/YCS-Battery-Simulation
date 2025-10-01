"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, AlertCircle, TrendingUp, Clock, Thermometer } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const predefinedCycles = [
  {
    id: "wltp",
    name: "WLTP (Worldwide Harmonized Light Vehicles Test Procedure)",
    duration: 1800, // seconds
    description: "Standard automotive test cycle for fuel consumption and emissions",
    peakCurrent: 150,
    avgCurrent: 45,
  },
  {
    id: "ftp75",
    name: "FTP-75 (Federal Test Procedure)",
    duration: 1874,
    description: "US EPA standard driving cycle for light-duty vehicles",
    peakCurrent: 120,
    avgCurrent: 38,
  },
  {
    id: "nedc",
    name: "NEDC (New European Driving Cycle)",
    duration: 1180,
    description: "European standard for measuring fuel economy and emissions",
    peakCurrent: 100,
    avgCurrent: 32,
  },
  {
    id: "us06",
    name: "US06 (Supplemental Federal Test Procedure)",
    duration: 596,
    description: "Aggressive driving cycle with high speeds and accelerations",
    peakCurrent: 200,
    avgCurrent: 65,
  },
]

interface DriveCycleBuilderProps {
  onConfigChange: (config: any) => void
  onNext: () => void
  onPrevious: () => void
}

export function DriveCycleBuilder({ onConfigChange, onNext, onPrevious }: DriveCycleBuilderProps) {
  const [cycleType, setCycleType] = useState("predefined")
  const [selectedCycle, setSelectedCycle] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvError, setCsvError] = useState("")
  const [startingSoc, setStartingSoc] = useState("80")
  const [ambientTemp, setAmbientTemp] = useState("25")
  const [repeatCount, setRepeatCount] = useState("1")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith(".csv")) {
      setCsvError("Please upload a CSV file")
      return
    }

    setUploadedFile(file)
    setCsvError("")

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

        // Validate headers
        const requiredHeaders = ["time_s", "current_a"]
        const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

        if (missingHeaders.length > 0) {
          setCsvError(`Missing required columns: ${missingHeaders.join(", ")}`)
          return
        }

        // Parse data
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(",")
          const timeIndex = headers.indexOf("time_s")
          const currentIndex = headers.indexOf("current_a")
          const speedIndex = headers.indexOf("speed_kmh")

          const time = Number.parseFloat(values[timeIndex])
          const current = Number.parseFloat(values[currentIndex])
          const speed = speedIndex >= 0 ? Number.parseFloat(values[speedIndex]) : null

          if (isNaN(time) || isNaN(current)) {
            throw new Error(`Invalid data at line ${index + 2}`)
          }

          return {
            time,
            current,
            speed: speed || 0,
          }
        })

        // Validate time intervals
        for (let i = 1; i < data.length; i++) {
          const timeDiff = data[i].time - data[i - 1].time
          if (timeDiff <= 0) {
            setCsvError("Time values must be increasing")
            return
          }
        }

        setCsvData(data)
        setCsvError("")
      } catch (error) {
        setCsvError(`Error parsing CSV: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }
    reader.readAsText(file)
  }

  const selectedPredefinedCycle = predefinedCycles.find((c) => c.id === selectedCycle)

  const isValid = () => {
    if (cycleType === "predefined") {
      return selectedCycle && startingSoc && ambientTemp && repeatCount
    } else {
      return csvData.length > 0 && !csvError && startingSoc && ambientTemp && repeatCount
    }
  }

  const handleNext = () => {
    if (isValid()) {
      const config = {
        type: cycleType,
        cycle: cycleType === "predefined" ? selectedPredefinedCycle : null,
        csvData: cycleType === "upload" ? csvData : null,
        startingSoc: Number.parseFloat(startingSoc),
        ambientTemp: Number.parseFloat(ambientTemp),
        repeatCount: Number.parseInt(repeatCount),
        fileName: uploadedFile?.name,
      }
      onConfigChange(config)
      onNext()
    }
  }

  // Generate sample data for predefined cycles (simplified visualization)
  const generatePreviewData = (cycle: any) => {
    const points = 50
    const data = []
    for (let i = 0; i < points; i++) {
      const time = (i / points) * cycle.duration
      const current =
        cycle.avgCurrent + (cycle.peakCurrent - cycle.avgCurrent) * Math.sin(i * 0.3) * Math.random() * 0.8
      data.push({ time, current })
    }
    return data
  }

  const previewData = selectedPredefinedCycle ? generatePreviewData(selectedPredefinedCycle) : csvData.slice(0, 100) // Limit preview to first 100 points

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Drive Cycle Builder
          </CardTitle>
          <CardDescription>Define how your battery pack will be used during simulation</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={cycleType} onValueChange={setCycleType} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="predefined">Predefined Cycles</TabsTrigger>
              <TabsTrigger value="upload">Upload CSV</TabsTrigger>
            </TabsList>

            <TabsContent value="predefined" className="space-y-4">
              <div className="space-y-3">
                <Label>Select Drive Cycle</Label>
                <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a standard drive cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {predefinedCycles.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{cycle.name}</span>
                          <span className="text-sm text-muted-foreground">{cycle.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPredefinedCycle && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-accent" />
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-semibold">{selectedPredefinedCycle.duration}s</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-accent" />
                    <div className="text-sm text-muted-foreground">Peak Current</div>
                    <div className="font-semibold">{selectedPredefinedCycle.peakCurrent}A</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-accent" />
                    <div className="text-sm text-muted-foreground">Avg Current</div>
                    <div className="font-semibold">{selectedPredefinedCycle.avgCurrent}A</div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-3">
                <Label>Upload Drive Cycle CSV</Label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</div>
                  <div className="text-xs text-muted-foreground">
                    CSV format: time_s, current_a, speed_kmh (optional)
                  </div>
                  <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </div>

                {uploadedFile && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <FileText className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">{uploadedFile.name}</span>
                    <Badge variant="secondary">{csvData.length} points</Badge>
                  </div>
                )}

                {csvError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{csvError}</AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Chart */}
      {previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Drive Cycle Preview</CardTitle>
            <CardDescription>Current profile over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-65 pd-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={previewData}margin={{ bottom: 20 , left: 10}}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" label={{ value: "Time (s)", position: "insideBottom",  offset: 5, dy:20}} />
                  <YAxis label={{ value: "Current (A)", angle: -90, position: "insideLeft" }} />
                  <Tooltip
                    formatter={(value: any) => [`${value.toFixed(1)}A`, "Current"]}
                    labelFormatter={(value: any) => `Time: ${value.toFixed(1)}s`}
                  />
                  <Line type="monotone" dataKey="current" stroke="var(--accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulation Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Simulation Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label htmlFor="starting-soc">Starting SOC (%)</Label>
              <Input
                id="starting-soc"
                type="number"
                placeholder="80"
                value={startingSoc}
                onChange={(e) => setStartingSoc(e.target.value)}
                min="0"
                max="100"
              />
              <p className="text-sm text-muted-foreground">Initial state of charge (0-100%)</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="ambient-temp">Ambient Temperature (°C)</Label>
              <Input
                id="ambient-temp"
                type="number"
                placeholder="25"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(e.target.value)}
                min="-40"
                max="60"
              />
              <p className="text-sm text-muted-foreground">Environmental temperature</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="repeat-count">Number of Repeats</Label>
              <Input
                id="repeat-count"
                type="number"
                placeholder="1"
                value={repeatCount}
                onChange={(e) => setRepeatCount(e.target.value)}
                min="1"
                max="10"
              />
              <p className="text-sm text-muted-foreground">How many times to repeat the cycle</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous: Pack Builder
        </Button>
        <Button onClick={handleNext} disabled={!isValid()} className="min-w-32">
          Next: Configure Models
        </Button>
      </div>
    </div>
  )
}
