"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Battery, Zap, Thermometer, TrendingDown, Download, FileText, RotateCcw, Gauge } from "lucide-react"

interface ResultsDashboardProps {
  results: any
  onPrevious: () => void
}

export function ResultsDashboard({ results, onPrevious }: ResultsDashboardProps) {
  const [activeChart, setActiveChart] = useState("soc")

  if (!results) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">No simulation results available</div>
        </CardContent>
      </Card>
    )
  }

  const { summary, timeSeries, metadata } = results

  const handleDownloadCSV = () => {
    const headers = ["Time (s)", "SOC (%)", "Voltage (V)", "Current (A)", "Temperature (°C)", "Power (kW)"]
    const csvContent = [
      headers.join(","),
      ...timeSeries.map((row: any) =>
        [row.time, row.soc, row.voltage, row.current, row.temperature, row.power].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "battery_simulation_results.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    // In a real implementation, this would generate a PDF report
    alert("PDF export functionality would be implemented here using libraries like jsPDF or server-side generation")
  }

  const chartData =
    timeSeries?.map((point: any) => ({
      time: point.time / 60, // Convert to minutes
      soc: point.soc,
      voltage: point.voltage,
      current: point.current,
      temperature: point.temperature,
      power: point.power,
    })) || []

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Battery className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-sm text-muted-foreground">Final SOC</div>
            <div className="text-2xl font-bold">{summary.finalSoc}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-sm text-muted-foreground">Total Energy</div>
            <div className="text-2xl font-bold">{summary.totalEnergy}kWh</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Thermometer className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-sm text-muted-foreground">Max Temperature</div>
            <div className="text-2xl font-bold">{summary.maxTemperature}°C</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Gauge className="w-6 h-6 mx-auto mb-2 text-accent" />
            <div className="text-sm text-muted-foreground">Efficiency</div>
            <div className="text-2xl font-bold">{summary.efficiency}%</div>
          </CardContent>
        </Card>
      </div>

      {/* State of Health (if life model enabled) */}
      {summary.stateOfHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Battery Health Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">State of Health (SOH)</div>
                <div className="text-3xl font-bold">{summary.stateOfHealth}%</div>
              </div>
              <Badge variant={Number.parseFloat(summary.stateOfHealth) > 95 ? "default" : "secondary"}>
                {Number.parseFloat(summary.stateOfHealth) > 95 ? "Excellent" : "Good"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation Results</CardTitle>
          <CardDescription>Time-series data from physics-based simulation</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeChart} onValueChange={setActiveChart} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="soc">SOC</TabsTrigger>
              <TabsTrigger value="voltage">Voltage</TabsTrigger>
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="temperature">Temperature</TabsTrigger>
              <TabsTrigger value="power">Power</TabsTrigger>
            </TabsList>

            <TabsContent value="soc" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ bottom: 20 , left: 10}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (min)", position: "insideBottom", offset: -5, dy:10 }} />
                    <YAxis label={{ value: "SOC (%)", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      formatter={(value: any) => [`${value.toFixed(1)}%`, "SOC"]}
                      labelFormatter={(value: any) => `Time: ${value.toFixed(1)} min`}
                    />
                    <Area
                      type="monotone"
                      dataKey="soc"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="voltage" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}margin={{ bottom: 20 , left: 10}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (min)", position: "insideBottom", offset: -5, dy:10  }} />
                    <YAxis label={{ value: "Voltage (V)", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      formatter={(value: any) => [`${value.toFixed(1)}V`, "Voltage"]}
                      labelFormatter={(value: any) => `Time: ${value.toFixed(1)} min`}
                    />
                    <Line type="monotone" dataKey="voltage" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="current" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}margin={{ bottom: 20 , left: 10}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (min)", position: "insideBottom", offset: -5, dy:10  }} />
                    <YAxis label={{ value: "Current (A)", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      formatter={(value: any) => [`${value.toFixed(1)}A`, "Current"]}
                      labelFormatter={(value: any) => `Time: ${value.toFixed(1)} min`}
                    />
                    <Line type="monotone" dataKey="current" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="temperature" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}margin={{ bottom: 20 , left: 10}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (min)", position: "insideBottom", offset: -5, dy:10 }} />
                    <YAxis label={{ value: "Temperature (°C)", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      formatter={(value: any) => [`${value.toFixed(1)}°C`, "Temperature"]}
                      labelFormatter={(value: any) => `Time: ${value.toFixed(1)} min`}
                    />
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="var(--chart-4))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="power" className="space-y-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}margin={{ bottom: 20 , left: 10}}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" label={{ value: "Time (min)", position: "insideBottom", offset: -5, dy:10  }} />
                    <YAxis label={{ value: "Power (kW)", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      formatter={(value: any) => [`${value.toFixed(2)}kW`, "Power"]}
                      labelFormatter={(value: any) => `Time: ${value.toFixed(1)} min`}
                    />
                    <Area
                      type="monotone"
                      dataKey="power"
                      stroke="hsl(var(--chart-5))"
                      fill="hsl(var(--chart-5))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Results</CardTitle>
          <CardDescription>Download simulation data and generate reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleDownloadCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
            <Button onClick={handleExportPDF} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF Report
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              New Simulation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous: Run Simulation
        </Button>
        <Button onClick={() => window.location.reload()}>Start New Simulation</Button>
      </div>
    </div>
  )
}
