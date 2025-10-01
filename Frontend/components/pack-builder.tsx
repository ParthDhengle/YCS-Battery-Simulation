"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Battery, Zap, Gauge } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const batteryTypes = [
  {
    id: "samsung-21700-50e",
    name: "Samsung 21700-50E",
    voltage: 3.7,
    capacity: 5.0,
    maxCurrent: 9.8,
    chemistry: "Li-ion NMC",
  },
  {
    id: "panasonic-18650-3400",
    name: "Panasonic 18650-3400",
    voltage: 3.7,
    capacity: 3.4,
    maxCurrent: 6.8,
    chemistry: "Li-ion NCA",
  },
  {
    id: "lg-21700-m50",
    name: "LG 21700-M50",
    voltage: 3.7,
    capacity: 5.0,
    maxCurrent: 7.3,
    chemistry: "Li-ion NMC",
  },
  {
    id: "tesla-4680",
    name: "Tesla 4680",
    voltage: 3.7,
    capacity: 9.0,
    maxCurrent: 12.0,
    chemistry: "Li-ion NMC",
  },
]

interface PackBuilderProps {
  onConfigChange: (config: any) => void
  onNext: () => void
}

export function PackBuilder({ onConfigChange, onNext }: PackBuilderProps) {
  const [selectedCell, setSelectedCell] = useState("")
  const [seriesCount, setSeriesCount] = useState("")
  const [parallelCount, setParallelCount] = useState("")

  const selectedBattery = batteryTypes.find((b) => b.id === selectedCell)

  const totalVoltage =
    selectedBattery && seriesCount ? (selectedBattery.voltage * Number.parseInt(seriesCount)).toFixed(1) : "0"

  const totalCapacity =
    selectedBattery && parallelCount ? (selectedBattery.capacity * Number.parseInt(parallelCount)).toFixed(1) : "0"

  const totalEnergy =
    selectedBattery && seriesCount && parallelCount
      ? (
          (selectedBattery.voltage *
            selectedBattery.capacity *
            Number.parseInt(seriesCount) *
            Number.parseInt(parallelCount)) /
          1000
        ).toFixed(2)
      : "0"

  const maxPackCurrent =
    selectedBattery && parallelCount ? (selectedBattery.maxCurrent * Number.parseInt(parallelCount)).toFixed(1) : "0"

  const isValid =
    selectedCell &&
    seriesCount &&
    parallelCount &&
    Number.parseInt(seriesCount) > 0 &&
    Number.parseInt(parallelCount) > 0

  const hasWarnings = () => {
    if (!selectedBattery || !seriesCount || !parallelCount) return false
    const s = Number.parseInt(seriesCount)
    const p = Number.parseInt(parallelCount)
    return s > 100 || p > 50 || s * p > 1000
  }

  const handleNext = () => {
    if (isValid) {
      const config = {
        cell: selectedBattery,
        seriesCount: Number.parseInt(seriesCount),
        parallelCount: Number.parseInt(parallelCount),
        totalVoltage: Number.parseFloat(totalVoltage),
        totalCapacity: Number.parseFloat(totalCapacity),
        totalEnergy: Number.parseFloat(totalEnergy),
        maxCurrent: Number.parseFloat(maxPackCurrent),
      }
      onConfigChange(config)
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Battery className="w-5 h-5" />
            Pack Builder
          </CardTitle>
          <CardDescription>Define your battery pack specifications by selecting cells and architecture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cell Selection */}
          <div className="space-y-3">
            <Label htmlFor="cell-select">Battery Cell Type</Label>
            <Select value={selectedCell} onValueChange={setSelectedCell}>
              <SelectTrigger>
                <SelectValue placeholder="Select a battery cell" />
              </SelectTrigger>
              <SelectContent>
                {batteryTypes.map((battery) => (
                  <SelectItem key={battery.id} value={battery.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{battery.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {battery.chemistry}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedBattery && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Voltage</div>
                  <div className="font-semibold">{selectedBattery.voltage}V</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Capacity</div>
                  <div className="font-semibold">{selectedBattery.capacity}Ah</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Max Current</div>
                  <div className="font-semibold">{selectedBattery.maxCurrent}A</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Chemistry</div>
                  <div className="font-semibold">{selectedBattery.chemistry}</div>
                </div>
              </div>
            )}
          </div>

          {/* Architecture Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label htmlFor="series">Series Count (S)</Label>
              <Input
                id="series"
                type="number"
                placeholder="e.g., 96"
                value={seriesCount}
                onChange={(e) => setSeriesCount(e.target.value)}
                min="1"
                max="200"
              />
              <p className="text-sm text-muted-foreground">Number of cells connected in series (affects voltage)</p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="parallel">Parallel Count (P)</Label>
              <Input
                id="parallel"
                type="number"
                placeholder="e.g., 3"
                value={parallelCount}
                onChange={(e) => setParallelCount(e.target.value)}
                min="1"
                max="100"
              />
              <p className="text-sm text-muted-foreground">Number of cells connected in parallel (affects capacity)</p>
            </div>
          </div>

          {/* Warnings */}
          {hasWarnings() && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Warning: Large pack configurations may result in longer simulation times or unrealistic setups.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Pack Summary */}
      {isValid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              Pack Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Zap className="w-6 h-6 mx-auto mb-2 text-accent" />
                <div className="text-sm text-muted-foreground">Total Voltage</div>
                <div className="text-2xl font-bold">{totalVoltage}V</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Battery className="w-6 h-6 mx-auto mb-2 text-accent" />
                <div className="text-sm text-muted-foreground">Total Capacity</div>
                <div className="text-2xl font-bold">{totalCapacity}Ah</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Gauge className="w-6 h-6 mx-auto mb-2 text-accent" />
                <div className="text-sm text-muted-foreground">Total Energy</div>
                <div className="text-2xl font-bold">{totalEnergy}kWh</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Zap className="w-6 h-6 mx-auto mb-2 text-accent" />
                <div className="text-sm text-muted-foreground">Max Current</div>
                <div className="text-2xl font-bold">{maxPackCurrent}A</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!isValid} className="min-w-32">
          Next: Define Drive Cycle
        </Button>
      </div>
    </div>
  )
}
