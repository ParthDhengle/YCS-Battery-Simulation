import { BatterySimulationWizard } from "@/components/battery-simulation-wizard"

export default function Home() {
  return (

<main className="min-h-screen bg-background">
  <div className="container mx-auto py-8">
    <div className="mb-8 max-w-6xl mx-auto relative">
      <div className="flex flex-col items-center md:block">
        <img
          src="/logo.svg"  // Ensure this path is correct (in public/ or imported)
          alt="Company Logo"
          className="h-12 w-auto mb-4 md:mb-0 md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2"
        />
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Battery Pack Simulation Tool</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simulate and test battery packs with physics-based models
          </p>
        </div>
      </div>
    </div>
    <BatterySimulationWizard />
  </div>
</main>
  )
}
