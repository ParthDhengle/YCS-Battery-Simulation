"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Settings, Zap, Thermometer, TrendingDown, Cpu, Info, Clock, AlertTriangle } from "lucide-react"

const electricalModels = [
  {
    id: "simple",
    name: "Simple RC Model",
    description: "Fast computation with basic internal resistance",
    complexity: "Low",
    accuracy: "Medium",
    computeTime: "Fast",
  },
  {
    id: "detailed",
    name: "Detailed ECM Model",
    description: "High-fidelity equivalent circuit model with multiple RC pairs",
    complexity: "High",
    accuracy: "High",
    computeTime: "Slow",
  },
]

const thermalModels = [
  {
    id: "none",
    name: "No Thermal Model",
    description: "Constant temperature assumption",
  },
  {
    id: "lumped",
    name: "Lumped Thermal Model",
    description: "Single thermal mass with heat generation",
  },
  {
    id: "1d",
    name: "1D Thermal Model",
    description: "One-dimensional heat transfer",
  },
]

const coolingTypes = [
  {
    id: "none",
    name: "Natural Convection",
    description: "Passive air cooling only",
  },
  {
    id: "air",
    name: "Forced Air Cooling",
    description: "Active air circulation with fans",
  },
  {
    id: "liquid",
    name: "Liquid Cooling",
    description: "Liquid coolant circulation system",
  },
]

const busbarMaterials = [
  {
    id: "copper",
    name: "Copper",
    resistivity: 1.68e-8, // Ω⋅m
    description: "High conductivity, standard choice",
  },
  {
    id: "aluminum",
    name: "Aluminum",
    resistivity: 2.65e-8,
    description: "Lightweight, lower cost",
  },
  {
    id: "silver",
    name: "Silver",
    resistivity: 1.59e-8,
    description: "Highest conductivity, premium option",
  },
]

interface SimulationSetupProps {
  onConfigChange: (config: any) => void
  onNext: () => void
  onPrevious: () => void
}

export function SimulationSetup({ onConfigChange, onNext, onPrevious }: SimulationSetupProps) {
  const [electricalModel, setElectricalModel] = useState("simple")
  const [thermalEnabled, setThermalEnabled] = useState(false)
  const [thermalModel, setThermalModel] = useState("lumped")
  const [coolingType, setCoolingType] = useState("none")
  const [lifeEnabled, setLifeEnabled] = useState(false)
  const [busbarEnabled, setBusbarEnabled] = useState(false)
  const [busbarMaterial, setBusbarMaterial] = useState("copper")

  const selectedElectricalModel = electricalModels.find((m) => m.id === electricalModel)
  const selectedBusbarMaterial = busbarMaterials.find((m) => m.id === busbarMaterial)

  const getEstimatedComputeTime = () => {
    let baseTime = electricalModel === "simple" ? 1 : 3
    if (thermalEnabled) baseTime *= 2
    if (lifeEnabled) baseTime *= 1.5
    if (busbarEnabled) baseTime *= 1.2

    if (baseTime < 2) return "Fast (< 30s)"
    if (baseTime < 4) return "Medium (30s - 2min)"
    return "Slow (2min+)"
  }

  const getComplexityLevel = () => {
    let complexity = 1
    if (electricalModel === "detailed") complexity += 2
    if (thermalEnabled) complexity += 1
    if (lifeEnabled) complexity += 1
    if (busbarEnabled) complexity += 0.5

    if (complexity <= 2) return { level: "Low", color: "bg-green-100 text-green-800" }
    if (complexity <= 4) return { level: "Medium", color: "bg-yellow-100 text-yellow-800" }
    return { level: "High", color: "bg-red-100 text-red-800" }
  }

  const handleNext = () => {
    const config = {
      electrical: {
        model: electricalModel,
        details: selectedElectricalModel,
      },
      thermal: {
        enabled: thermalEnabled,
        model: thermalEnabled ? thermalModel : null,
        cooling: thermalEnabled ? coolingType : null,
      },
      life: {
        enabled: lifeEnabled,
      },
      busbar: {
        enabled: busbarEnabled,
        material: busbarEnabled ? busbarMaterial : null,
        materialDetails: busbarEnabled ? selectedBusbarMaterial : null,
      },
      estimatedComputeTime: getEstimatedComputeTime(),
      complexityLevel: getComplexityLevel().level,
    }
    onConfigChange(config)
    onNext()
  }

  const complexity = getComplexityLevel()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Simulation Setup
          </CardTitle>
          <CardDescription>Configure physics models and simulation parameters</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Complexity and Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">Complexity Level</div>
                <Badge className={complexity.color}>{complexity.level}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-accent" />
              <div>
                <div className="text-sm text-muted-foreground">Estimated Compute Time</div>
                <div className="font-medium">{getEstimatedComputeTime()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Electrical Model Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Electrical Model
          </CardTitle>
          <CardDescription>Choose the electrical simulation fidelity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Model Type</Label>
            <Select value={electricalModel} onValueChange={setElectricalModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {electricalModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-sm text-muted-foreground">{model.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedElectricalModel && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Complexity</div>
                <Badge variant="outline">{selectedElectricalModel.complexity}</Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Accuracy</div>
                <Badge variant="outline">{selectedElectricalModel.accuracy}</Badge>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Speed</div>
                <Badge variant="outline">{selectedElectricalModel.computeTime}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Thermal Model Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5" />
            Thermal Model
          </CardTitle>
          <CardDescription>Enable thermal effects and heat transfer simulation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="thermal-enabled">Enable Thermal Simulation</Label>
              <p className="text-sm text-muted-foreground">Include temperature effects on battery performance</p>
            </div>
            <Switch id="thermal-enabled" checked={thermalEnabled} onCheckedChange={setThermalEnabled} />
          </div>

          {thermalEnabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Thermal Model Type</Label>
                  <Select value={thermalModel} onValueChange={setThermalModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {thermalModels
                        .filter((m) => m.id !== "none")
                        .map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{model.name}</span>
                              <span className="text-sm text-muted-foreground">{model.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Cooling System</Label>
                  <Select value={coolingType} onValueChange={setCoolingType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {coolingTypes.map((cooling) => (
                        <SelectItem key={cooling.id} value={cooling.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{cooling.name}</span>
                            <span className="text-sm text-muted-foreground">{cooling.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Life Model Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Battery Life Model
          </CardTitle>
          <CardDescription>Enable battery degradation and aging effects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="life-enabled">Enable Life Degradation</Label>
              <p className="text-sm text-muted-foreground">Track capacity fade and resistance growth over time</p>
            </div>
            <Switch id="life-enabled" checked={lifeEnabled} onCheckedChange={setLifeEnabled} />
          </div>

          {lifeEnabled && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Life modeling will show capacity fade and state-of-health metrics in results. This adds computational
                overhead but provides valuable aging insights.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Advanced: Busbar Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Advanced: Busbar Model
          </CardTitle>
          <CardDescription>Optional interconnect resistance modeling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="busbar-enabled">Enable Busbar Resistance</Label>
              <p className="text-sm text-muted-foreground">Include interconnect losses in simulation</p>
            </div>
            <Switch id="busbar-enabled" checked={busbarEnabled} onCheckedChange={setBusbarEnabled} />
          </div>

          {busbarEnabled && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label>Busbar Material</Label>
                <Select value={busbarMaterial} onValueChange={setBusbarMaterial}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {busbarMaterials.map((material) => (
                      <SelectItem key={material.id} value={material.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{material.name}</span>
                          <span className="text-sm text-muted-foreground">{material.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedBusbarMaterial && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Resistivity: </span>
                    <span className="font-mono">{selectedBusbarMaterial.resistivity.toExponential(2)} Ω⋅m</span>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Performance Warning */}
      {complexity.level === "High" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            High complexity configuration selected. Simulation may take several minutes to complete. Consider using
            simpler models for initial testing.
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous: Drive Cycle
        </Button>
        <Button onClick={handleNext} className="min-w-32">
          Next: Run Simulation
        </Button>
      </div>
    </div>
  )
}
