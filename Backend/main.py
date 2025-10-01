from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Any
import numpy as np
import json

# --- Helper function for clean terminal output ---
def print_section(title, content):
    """Prints a formatted section to the console for clear logging."""
    print("\n" + "="*80)
    print(f"| {title.upper():^76} |")
    print("="*80)
    if isinstance(content, dict):
        # Pretty print dictionary
        print(json.dumps(content, indent=2))
    else:
        print(content)
    print("="*80 + "\n")


# --- Pydantic Models for API Data Validation (No changes here) ---
class Cell(BaseModel):
    id: str
    name: str
    voltage: float
    capacity: float

class PackConfig(BaseModel):
    cell: Cell
    seriesCount: int
    parallelCount: int
    totalEnergy: float

class DriveCycle(BaseModel):
    id: str
    name: str
    duration: int

class CsvRow(BaseModel):
    time_s: float
    current_a: float
    speed_kmh: Optional[float] = None

class DriveConfig(BaseModel):
    type: str
    cycle: Optional[DriveCycle] = None
    csvData: Optional[List[CsvRow]] = None
    startingSoc: float
    ambientTemp: float

class ElectricalConfig(BaseModel):
    model: str

class ThermalConfig(BaseModel):
    enabled: bool

class LifeConfig(BaseModel):
    enabled: bool

class SimulationConfig(BaseModel):
    electrical: ElectricalConfig
    thermal: ThermalConfig
    life: LifeConfig

class SimulationRequest(BaseModel):
    packConfig: PackConfig
    driveConfig: DriveConfig
    simulationConfig: SimulationConfig


# --- FastAPI App Initialization (No changes here) ---
app = FastAPI(
    title="Battery Simulation API",
    description="Runs physics-based battery simulations based on frontend configurations.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/simulate")
def run_simulation(request: SimulationRequest):
    """
    Main simulation endpoint with structured terminal logging.
    """
    # --- STEP 1: LOG INCOMING DATA FROM FRONTEND ---
    print_section("Received Simulation Request from Frontend", request.model_dump())

    pack = request.packConfig
    drive = request.driveConfig
    sim = request.simulationConfig

    try:
        # ==============================================================================
        #
        #    START: CLIENT'S CORE SIMULATION LOGIC
        #
        #    This is the block where you will replace the placeholder logic
        #    with the client's actual algorithms converted from MATLAB to Python/NumPy.
        #
        # ==============================================================================

        # --- Determine the data source for the simulation ---
        if drive.type == 'upload' and drive.csvData:
            log_message = "Logic Path: Using custom CSV data for simulation."
            time_points = np.array([row.time_s for row in drive.csvData])
            current_profile = np.array([row.current_a for row in drive.csvData])
        elif drive.cycle:
            log_message = f"Logic Path: Using predefined cycle '{drive.cycle.name}'."
            duration = drive.cycle.duration
            points = int(duration / 2)
            time_points = np.linspace(0, duration, points)
            base_current = (pack.totalEnergy * 10) / duration
            noise = np.random.normal(0, 15, points)
            sine_wave = 20 * np.sin(time_points / 60)
            current_profile = base_current + noise + sine_wave
        else:
            raise HTTPException(status_code=400, detail="Invalid drive cycle configuration.")

        print_section("Simulation Logic Path", log_message)

        # --- Run the step-by-step simulation (Placeholder Logic) ---
        points = len(time_points)
        soc = np.zeros(points)
        voltage = np.zeros(points)
        temperature = np.zeros(points)
        
        soc[0] = drive.startingSoc
        voltage[0] = pack.cell.voltage * pack.seriesCount
        temperature[0] = drive.ambientTemp
        total_capacity_ah = pack.cell.capacity * pack.parallelCount
        
        for i in range(1, points):
            dt = time_points[i] - time_points[i-1]
            if dt <= 0: continue
            soc_delta = (current_profile[i] * dt / 3600) / total_capacity_ah * 100
            soc[i] = max(0, soc[i-1] - soc_delta)
            voltage[i] = (pack.cell.voltage * pack.seriesCount) * (0.9 + 0.1 * (soc[i]/100)) - (current_profile[i] * 0.05)
            if sim.thermal.enabled:
                heat_gen = (current_profile[i]**2 * 0.002)
                heat_dissipation = (temperature[i-1] - drive.ambientTemp) * 0.01
                temp_delta = (heat_gen - heat_dissipation) * dt / 100
                temperature[i] = temperature[i-1] + temp_delta
            else:
                temperature[i] = drive.ambientTemp

        # ==============================================================================
        #
        #    END: CLIENT'S CORE SIMULATION LOGIC
        #
        # ==============================================================================


        # --- STEP 2: PREPARE AND LOG THE RESULTS BEFORE SENDING ---

        time_series_data = [{
            "time": t, "soc": s, "voltage": v, "current": c, "temperature": temp, "power": (v * c) / 1000
        } for t, s, v, c, temp in zip(time_points, soc, voltage, current_profile, temperature)]

        final_soc = soc[-1] if len(soc) > 0 else 0
        max_temp = np.max(temperature) if len(temperature) > 0 else 0
        
        results = {
            "summary": {
                "finalSoc": f"{final_soc:.1f}",
                "totalEnergy": f"{(pack.totalEnergy * (drive.startingSoc - final_soc) / 100):.2f}",
                "maxTemperature": f"{max_temp:.1f}",
                "efficiency": "92.3",
                "stateOfHealth": f"{99.5 - np.random.rand() * 0.5:.1f}" if sim.life.enabled else None,
            },
            "timeSeries": time_series_data
        }

        # Log the summary and a sample of the time-series data
        log_content = {
            "Summary": results["summary"],
            "TimeSeries Sample (First 3 points)": results["timeSeries"][:3]
        }
        print_section("Generated Simulation Results", log_content)


        # --- STEP 3: SEND RESULTS TO FRONTEND ---
        print_section("Action", "Sending complete JSON response to frontend...")
        return results

    except Exception as e:
        print(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail=str(e))