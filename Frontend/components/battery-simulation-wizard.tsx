"use client"

import { useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PackBuilder } from "@/components/pack-builder"
import { DriveCycleBuilder } from "@/components/drive-cycle-builder"
import { SimulationSetup } from "@/components/simulation-setup"
import { SimulationRunner } from "@/components/simulation-runner"
import { ResultsDashboard } from "@/components/results-dashboard"
import { CheckCircle } from "lucide-react"

const steps = [
  { id: 1, title: "Build Pack", description: "Define battery pack specifications" },
  { id: 2, title: "Define Drive", description: "Set usage cycles and conditions" },
  { id: 3, title: "Configure Models", description: "Select simulation parameters" },
  { id: 4, title: "Run Simulation", description: "Execute physics-based simulation" },
  { id: 5, title: "View Results", description: "Analyze performance metrics" },
]

export function BatterySimulationWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [packConfig, setPackConfig] = useState(null)
  const [driveConfig, setDriveConfig] = useState(null)
  const [simulationConfig, setSimulationConfig] = useState(null)
  const [simulationResults, setSimulationResults] = useState(null)

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PackBuilder onConfigChange={setPackConfig} onNext={handleNext} />
      case 2:
        return <DriveCycleBuilder onConfigChange={setDriveConfig} onNext={handleNext} onPrevious={handlePrevious} />
      case 3:
        return <SimulationSetup onConfigChange={setSimulationConfig} onNext={handleNext} onPrevious={handlePrevious} />
      case 4:
        return (
          <SimulationRunner
            packConfig={packConfig}
            driveConfig={driveConfig}
            simulationConfig={simulationConfig}
            onComplete={(results) => {
              setSimulationResults(results)
              handleNext()
            }}
            onPrevious={handlePrevious}
          />
        )
      case 5:
        return <ResultsDashboard results={simulationResults} onPrevious={handlePrevious} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-2xl">
                Step {currentStep} of {steps.length}
              </CardTitle>
              <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-2">Progress</div>
              <Progress value={progress} className="w-32" />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      currentStep > step.id
                        ? "bg-accent border-accent text-accent-foreground"
                        : currentStep === step.id
                          ? "border-accent text-accent"
                          : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div
                      className={`text-sm font-medium ${
                        currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? "bg-accent" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  )
}
