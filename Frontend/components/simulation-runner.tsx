"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, AlertCircle, CheckCircle, Loader2 } from "lucide-react"

interface SimulationRunnerProps {
  packConfig: any
  driveConfig: any
  simulationConfig: any
  onComplete: (results: any) => void
  onPrevious: () => void
}

// Get the backend URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_SIMULATION_API_URL

export function SimulationRunner({
  packConfig,
  driveConfig,
  simulationConfig,
  onComplete,
  onPrevious,
}: SimulationRunnerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState("")
  const [completed, setCompleted] = useState(false)

  // This function now makes a real network request to the Python backend
  const runSimulation = async () => {
    if (!API_URL) {
      setError("Configuration Error: The simulation API URL is not set.")
      return
    }

    setIsRunning(true)
    setCompleted(false)
    setError("")
    setLogs(["Connecting to simulation server..."])
    setProgress(10)

    try {
      setLogs(prev => [...prev, "Sending configuration and starting simulation..."])
      
      const response = await fetch(`${API_URL}/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packConfig,
          driveConfig,
          simulationConfig,
        }),
      });

      setProgress(80)
      setLogs(prev => [...prev, "Calculation complete. Receiving results..."])

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Server returned an error: ${response.statusText}`)
      }
      
      const results = await response.json()

      setLogs(prev => [...prev, "Simulation successful!"])
      setProgress(100)
      setCompleted(true)
      
      // Pass the real results from the backend to the dashboard
      onComplete(results)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown network or server error occurred."
      setError(`Simulation failed: ${errorMessage}`)
      setLogs(prev => [...prev, `Error: ${errorMessage}`])
      setIsRunning(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Run Simulation
          </CardTitle>
          <CardDescription>Execute the configured physics-based simulation on the backend server.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Summary (This part remains the same) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-sm text-muted-foreground">Pack Config</div>
              <div className="font-medium">{packConfig?.seriesCount}S{packConfig?.parallelCount}P</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Drive Cycle</div>
              <div className="font-medium">
                {driveConfig?.type === "predefined"
                  ? driveConfig?.cycle?.name
                  : `Custom CSV (${driveConfig?.csvData?.length} points)`}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Models Enabled</div>
              <div className="text-sm text-muted-foreground">
                {simulationConfig?.thermal?.enabled && "Thermal, "}
                {simulationConfig?.life?.enabled && "Life"}
              </div>
            </div>
          </div>

          {/* Progress and Logs Section (This part remains the same) */}
          {(isRunning || completed || error) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isRunning && !completed && <Loader2 className="w-4 h-4 animate-spin" />}
                  {completed && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {error && <AlertCircle className="w-4 h-4 text-destructive" />}
                  <span className="font-medium">{logs[logs.length-1]}</span>
                </div>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isRunning && !completed && (
            <Button onClick={runSimulation} className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Start Simulation
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={isRunning}>
          Previous: Configure Models
        </Button>
        <Button onClick={() => { if(completed) { /* Logic to move to next step in wizard */ } }} disabled={!completed}>
          {completed ? "View Results" : "Awaiting Results..."}
        </Button>
      </div>
    </div>
  )
}