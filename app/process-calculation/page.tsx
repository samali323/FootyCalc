'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Calculator,
  Clipboard,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Info,
  Leaf,
  PlaneTakeoff,
  PlaneLanding,
  Users,
  Plane,
  RotateCw,
  X,
  Check,
  RefreshCw,
  FileText,
  Download,
  Trophy,
  CalendarDays,
  Medal
} from 'lucide-react';
import { supabase } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { League, Match, Season } from '@/lib/types';
import { toast } from 'sonner';

const EmissionsCalculationProcess = () => {
  const [leagues, setLeagues] = useState<League[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [matchCount, setMatchCount] = useState(10)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // States for form inputs (similar to the main calculator)
  const [homeAirport, setHomeAirport] = useState(null);
  const [awayAirport, setAwayAirport] = useState(null);
  const [passengers, setPassengers] = useState(35);
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [aircraftRegistration, setAircraftRegistration] = useState("");
  const [airports, setAirports] = useState([]);
  const [aircraft_database, setAircraftDatabase] = useState({});
  const [isLoadingAirports, setIsLoadingAirports] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // States for tab management and selections
  const [activeTab, setActiveTab] = useState("airports"); // Default to airports tab
  const [selectedLeague, setSelectedLeague] = useState("all"); // Default to "All"
  const [selectedSeason, setSelectedSeason] = useState(""); // Default season must be unset
  const [selectedMatch, setSelectedMatch] = useState(""); // No match selected by default

  // States for calculation process display
  const [calculationSteps, setCalculationSteps] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [calculationResult, setCalculationResult] = useState(null);
  const [alternativeCalculations, setAlternativeCalculations] = useState(null);
  const [selectedMethodology, setSelectedMethodology] = useState("ICAO");
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' // 'success' or 'error'
  });
  // Aircraft cruising speeds in km/h (from your original code)
  const aircraftCruisingSpeeds = {
    "Boeing 737-8K5(WL)": 840,
    "Embraer ERJ-190LR": 830,
    "ATR 72-600": 510,
    "Saab 2000": 665,
    "Embraer ERJ-145EP": 830,
    "Airbus A321-211": 840,
    "Dornier 328Jet": 740,
    "Boeing 737-33A": 780,
    "Beechcraft King Air 350i": 560,
    "Bombardier Global 6000": 900
  };

  // Aircraft typical capacity (from your original code)
  const aircraftCapacity = {
    "Boeing 737-8K5(WL)": 189,
    "Embraer ERJ-190LR": 100,
    "ATR 72-600": 72,
    "Saab 2000": 50,
    "Embraer ERJ-145EP": 50,
    "Airbus A321-211": 220,
    "Dornier 328Jet": 32,
    "Boeing 737-33A": 149,
    "Beechcraft King Air 350i": 11,
    "Bombardier Global 6000": 13
  };

  // Calculate methodologies available
  const methodologies = [
    {
      id: "ICAO",
      name: "ICAO Standard",
      description: "International Civil Aviation Organization standard methodology"
    },
    {
      id: "DEFRA",
      name: "DEFRA",
      description: "UK Department for Environment, Food and Rural Affairs"
    },
    {
      id: "EPA",
      name: "EPA",
      description: "U.S. Environmental Protection Agency methodology"
    },
    {
      id: "GHG",
      name: "GHG Protocol",
      description: "Greenhouse Gas Protocol methodology"
    }
  ];

  // Fetch airports and aircraft data from Supabase (same as original code)
  useEffect(() => {
    const fetchAirports = async () => {
      setIsLoadingAirports(true);
      try {
        const { data, error } = await supabase
          .from("airports")
          .select("iata_code, airport_name, latitude, longitude")
          .order('airport_name', { ascending: true })

        const uniqueAirports = Object.values(
          data.reduce((acc, airport) => {
            acc[airport.iata_code] = airport;
            return acc;
          }, {})
        );

        if (error) {
          console.error("Error fetching airports:", error);
          return;
        }

        // Transform the data to match our expected format
        const formattedAirports = uniqueAirports.map(airport => ({
          id: airport.iata_code,
          name: airport.airport_name,
          latitude: airport.latitude,
          longitude: airport.longitude
        }));

        setAirports(formattedAirports);
      } catch (error) {
        console.error("Failed to fetch airports:", error);
      } finally {
        setIsLoadingAirports(false);
      }
    };

    // Simulating aircraft database fetch (same as original code)
    const fetchAircraftData = () => {
      const aircraftData = {
        // 2Excel Aviation
        "G-NEWG": { "model": "Boeing 737-8K5(WL)", "fuel_burn_rate_kg_per_hour": 2400, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },

        // Eastern Airways
        "G-SWRD": { "model": "Embraer ERJ-190LR", "fuel_burn_rate_kg_per_hour": 1800, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-CMLI": { "model": "ATR 72-600", "fuel_burn_rate_kg_per_hour": 600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-CMFI": { "model": "ATR 72-600", "fuel_burn_rate_kg_per_hour": 600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-IACY": { "model": "Saab 2000", "fuel_burn_rate_kg_per_hour": 800, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-CMEI": { "model": "ATR 72-600", "fuel_burn_rate_kg_per_hour": 600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-CLSN": { "model": "ATR 72-600", "fuel_burn_rate_kg_per_hour": 600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-MAJY": { "model": "Embraer ERJ-190LR", "fuel_burn_rate_kg_per_hour": 1800, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-MAJZ": { "model": "Embraer ERJ-190LR", "fuel_burn_rate_kg_per_hour": 1800, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },

        // Loganair
        "G-SAJC": { "model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-SAJG": { "model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-SAJH": { "model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-SAJK": { "model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-SAJN": { "model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-LMTI": { "model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-SAJO": { "model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },

        // Titan Airways
        "G-POWK": { "model": "Airbus A321-211", "fuel_burn_rate_kg_per_hour": 2600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-POWT": { "model": "Airbus A321-211", "fuel_burn_rate_kg_per_hour": 2600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },

        // Blue Islands
        "G-ISLO": { "model": "Dornier 328Jet", "fuel_burn_rate_kg_per_hour": 700, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-ISLK": { "model": "Dornier 328Jet", "fuel_burn_rate_kg_per_hour": 700, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-ISLM": { "model": "Dornier 328Jet", "fuel_burn_rate_kg_per_hour": 700, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },

        // Jet2
        "G-GDFJ": { "model": "Boeing 737-33A", "fuel_burn_rate_kg_per_hour": 2200, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-GDFL": { "model": "Boeing 737-33A", "fuel_burn_rate_kg_per_hour": 2200, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-JZHX": { "model": "Boeing 737-8K5", "fuel_burn_rate_kg_per_hour": 2400, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "G-GDFF": { "model": "Boeing 737-33A", "fuel_burn_rate_kg_per_hour": 2200, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },

        // Thalair
        "F-HFCN": { "model": "Beechcraft King Air 350i", "fuel_burn_rate_kg_per_hour": 400, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
        "F-HFKF": { "model": "Beechcraft King Air 350i", "fuel_burn_rate_kg_per_hour": 400, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },

        // Comlux
        "9H-MAC": { "model": "Bombardier Global 6000", "fuel_burn_rate_kg_per_hour": 1800, "emissions_factor_kg_CO2_per_kg_fuel": 3.16 },
      };

      setAircraftDatabase(aircraftData);
    };

    fetchAirports();
    fetchAircraftData();

    // Load sample calculation history
    // const sampleHistory = [
    //   {
    //     id: "calc-001",
    //     date: "2025-04-08",
    //     route: "LHR to CDG",
    //     passengers: 42,
    //     totalEmissions: 3.8,
    //     methodology: "ICAO"
    //   },
    //   {
    //     id: "calc-002",
    //     date: "2025-04-05",
    //     route: "MAN to AMS",
    //     passengers: 35,
    //     totalEmissions: 2.7,
    //     methodology: "ICAO"
    //   },
    //   {
    //     id: "calc-003",
    //     date: "2025-04-01",
    //     route: "EDI to LHR",
    //     passengers: 48,
    //     totalEmissions: 4.2,
    //     methodology: "DEFRA"
    //   }
    // ];

    // setCalculationHistory(sampleHistory);
  }, []);

  // Toggle expanding a section
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Add a debug log
  const addDebugLog = (message, type = "info") => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    setDebugLogs(prev => [
      ...prev,
      {
        timestamp,
        message: typeof message === 'object' ? JSON.stringify(message) : message,
        type
      }
    ]);
  };

  // Clear debug logs
  const clearDebugLogs = () => {
    setDebugLogs([]);
  };

  // Handle calculation
  const handleCalculate = () => {
    // Reset validation states
    setValidationErrors({});
    setCalculationSteps([]);
    clearDebugLogs();

    // Validate inputs
    const errors = {};

    if (!homeAirport) {
      errors.homeAirport = 'Please select a home airport';
    }

    if (!awayAirport) {
      errors.awayAirport = 'Please select an away airport';
    }

    if (homeAirport && awayAirport && homeAirport.id === awayAirport.id) {
      errors.sameAirport = 'Home and away airports cannot be the same';
    }

    if (passengers < 1) {
      errors.passengers = 'At least one passenger is required';
    }

    // If there are validation errors, display them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsCalculating(true);

    // Simulate API calculation delay
    setTimeout(() => {
      try {
        // Step 1: Calculate distance between airports
        const distance = calculateDistance(
          homeAirport.latitude, homeAirport.longitude,
          awayAirport.latitude, awayAirport.longitude
        );

        addDebugLog(`Calculated raw distance: ${distance.toFixed(2)} km`);

        const steps = [];

        // Step 1: Add distance calculation
        steps.push({
          id: "distance",
          title: "Step 1: Distance Calculation",
          content: `
            <p>Calculating the great circle distance between ${homeAirport.name} (${homeAirport.id}) and ${awayAirport.name} (${awayAirport.id}):</p>
            <ul>
              <li>Home Airport: ${homeAirport.name} (${homeAirport.id}) at coordinates [${homeAirport.latitude.toFixed(4)}, ${homeAirport.longitude.toFixed(4)}]</li>
              <li>Away Airport: ${awayAirport.name} (${awayAirport.id}) at coordinates [${awayAirport.latitude.toFixed(4)}, ${awayAirport.longitude.toFixed(4)}]</li>
              <li>Calculated Great Circle Distance: ${distance.toFixed(2)} km</li>
            </ul>
          `
        });

        // Step 2: Determine flight type
        const flightType = determineFlightType(distance);

        addDebugLog(`Determined flight type: ${flightType}`);

        steps.push({
          id: "flightType",
          title: "Step 2: Flight Type Determination",
          content: `
            <p>Determining the flight type based on distance:</p>
            <ul>
              <li>Distance: ${distance.toFixed(2)} km</li>
              <li>Flight Type: <strong>${convertFlightTypeFormat(flightType)}</strong></li>
              <li>Classification Thresholds:</li>
              <ul>
                <li>Derby Match: < 50 km</li>
                <li>Short Flight: 50 - 800 km</li>
                <li>Medium Flight: 800 - 4800 km</li>
                <li>Long Flight: > 4800 km</li>
              </ul>
            </ul>
          `
        });

        // Step 3: Apply route correction
        const adjustedDistance = applyRouteCorrection(distance, flightType);

        addDebugLog(`Applied route correction. Adjusted distance: ${adjustedDistance.toFixed(2)} km`);

        steps.push({
          id: "routeCorrection",
          title: "Step 3: Route Correction",
          content: `
            <p>Applying standard route inefficiency correction factors:</p>
            <ul>
              <li>Raw Distance: ${distance.toFixed(2)} km</li>
              <li>Flight Type: ${convertFlightTypeFormat(flightType)}</li>
              <li>Route Inefficiency Factor: ${getRouteInefficiencyFactor(flightType).toFixed(2)}</li>
              <li>Adjusted Distance: ${adjustedDistance.toFixed(2)} km</li>
              <li>Additional Distance: ${(adjustedDistance - distance).toFixed(2)} km (+${((adjustedDistance / distance - 1) * 100).toFixed(1)}%)</li>
            </ul>
            <p class="text-xs text-gray-400 mt-2">Note: Route correction accounts for the fact that aircraft don't fly in perfectly straight lines between airports due to air traffic control, weather patterns, and navigational waypoints.</p>
          `
        });

        // Calculate emissions based on selected methodology
        let result;

        if (aircraftRegistration && aircraft_database[aircraftRegistration]) {
          const aircraft = aircraft_database[aircraftRegistration];

          // Step 4: Aircraft details
          steps.push({
            id: "aircraftDetails",
            title: "Step 4: Aircraft Specifications",
            content: `
              <p>Selected Aircraft: ${aircraftRegistration} (${aircraft.model})</p>
              <ul>
                <li>Model: ${aircraft.model}</li>
                <li>Fuel Burn Rate: ${aircraft.fuel_burn_rate_kg_per_hour} kg/hour</li>
                <li>Emissions Factor: ${aircraft.emissions_factor_kg_CO2_per_kg_fuel} kg CO₂/kg fuel</li>
                <li>Typical Capacity: ${aircraftCapacity[aircraft.model] || "Unknown"} passengers</li>
                <li>Cruising Speed: ${aircraftCruisingSpeeds[aircraft.model] || "Unknown"} km/h</li>
              </ul>
            `
          });

          // Step 5: Calculate fuel consumption
          const totalFuelKg = calculateFuelBurn(aircraft, adjustedDistance, flightType);

          addDebugLog(`Calculated fuel consumption: ${totalFuelKg.toFixed(2)} kg`);

          steps.push({
            id: "fuelConsumption",
            title: "Step 5: Fuel Consumption Calculation",
            content: `
              <p>Calculating total fuel consumption for this flight:</p>
              <ul>
                <li>Aircraft: ${aircraft.model}</li>
                <li>Adjusted Distance: ${adjustedDistance.toFixed(2)} km</li>
                <li>Flight Type: ${convertFlightTypeFormat(flightType)}</li>
                <li>Base Fuel Burn Rate: ${aircraft.fuel_burn_rate_kg_per_hour} kg/hour</li>
                <li>Cruising Speed: ${aircraftCruisingSpeeds[aircraft.model] || 800} km/h</li>
                <li>Landing and Take Off (LTO) Fuel: ${getLTOFuel(aircraft.model)} kg</li>
                <li><strong>Total Fuel Consumption: ${totalFuelKg.toFixed(2)} kg</strong></li>
              </ul>
            `
          });

          // Step 6: Convert fuel to CO2
          const co2Factor = getCO2EmissionFactor();
          const rawEmissions = totalFuelKg * co2Factor / 1000; // tonnes

          addDebugLog(`Converted fuel to CO2: ${rawEmissions.toFixed(3)} tonnes`);

          steps.push({
            id: "fuelToCO2",
            title: "Step 6: Fuel to CO₂ Conversion",
            content: `
              <p>Converting fuel consumption to CO₂ emissions:</p>
              <ul>
                <li>Total Fuel: ${totalFuelKg.toFixed(2)} kg</li>
                <li>CO₂ Emission Factor: ${co2Factor} kg CO₂/kg fuel</li>
                <li>Raw CO₂ Emissions: ${(totalFuelKg * co2Factor).toFixed(2)} kg</li>
                <li><strong>Raw CO₂ Emissions: ${rawEmissions.toFixed(3)} tonnes</strong></li>
              </ul>
              <p class="text-xs text-gray-400 mt-2">Note: The standard ICAO CO₂ emission factor of 3.16 kg CO₂ per kg of jet fuel is used.</p>
            `
          });

          // Step 7: Load factor adjustment
          const capacity = aircraftCapacity[aircraft.model] || 150;
          const loadFactor = Math.min(passengers / capacity, 1);
          const loadFactorAdjustment = calculateLoadFactorAdjustment(passengers, aircraft.model);

          addDebugLog(`Applied load factor adjustment: ${loadFactorAdjustment.toFixed(3)}`);

          steps.push({
            id: "loadFactor",
            title: "Step 7: Load Factor Adjustment",
            content: `
              <p>Adjusting emissions based on passenger load:</p>
              <ul>
                <li>Number of Passengers: ${passengers}</li>
                <li>Aircraft Capacity: ${capacity}</li>
                <li>Load Factor: ${(loadFactor * 100).toFixed(1)}%</li>
                <li>Fixed Emissions Ratio: 80%</li>
                <li>Variable Emissions Ratio: 20%</li>
                <li>Load Factor Adjustment: ${loadFactorAdjustment.toFixed(3)}</li>
              </ul>
              <p class="text-xs text-gray-400 mt-2">Note: ICAO methodology suggests that about 80% of emissions are fixed regardless of passenger count, with 20% varying based on load.</p>
            `
          });

          // Step 8: Apply radiative forcing index (RFI)
          const baseEmissionsPerKm = rawEmissions / adjustedDistance;
          const emissionsPerKm = baseEmissionsPerKm * loadFactorAdjustment;
          const rfi = calculateRFI(flightType);

          addDebugLog(`Applied RFI: ${rfi}`);

          steps.push({
            id: "rfi",
            title: "Step 8: Radiative Forcing Index",
            content: `
              <p>Accounting for non-CO₂ climate effects using Radiative Forcing Index (RFI):</p>
              <ul>
                <li>Flight Type: ${convertFlightTypeFormat(flightType)}</li>
                <li>RFI Factor: ${rfi}</li>
                <li>Base Emissions per km: ${(baseEmissionsPerKm * 1000).toFixed(4)} kg CO₂/km</li>
                <li>Load-adjusted Emissions per km: ${(emissionsPerKm * 1000).toFixed(4)} kg CO₂/km</li>
                <li>RFI-adjusted Emissions per km: ${(emissionsPerKm * rfi * 1000).toFixed(4)} kg CO₂/km</li>
              </ul>
              <p class="text-xs text-gray-400 mt-2">Note: The Radiative Forcing Index accounts for additional warming effects from aviation emissions at altitude, including nitrogen oxides, water vapor, and contrails.</p>
            `
          });

          // Step 9: Round trip calculation
          let totalEmissions = emissionsPerKm * adjustedDistance * rfi;
          const oneWayEmissions = totalEmissions;
          const finalDistance = isRoundTrip ? distance * 2 : distance;
          const finalAdjustedDistance = isRoundTrip ? adjustedDistance * 2 : adjustedDistance;

          if (isRoundTrip) {
            totalEmissions *= 2;
          }

          addDebugLog(`Calculated ${isRoundTrip ? 'round-trip' : 'one-way'} emissions: ${totalEmissions.toFixed(3)} tonnes`);

          steps.push({
            id: "roundTrip",
            title: "Step 9: Trip Type Calculation",
            content: `
              <p>Calculating final emissions based on trip type:</p>
              <ul>
                <li>Trip Type: ${isRoundTrip ? "Round Trip" : "One Way"}</li>
                <li>One-way Emissions: ${oneWayEmissions.toFixed(3)} tonnes CO₂</li>
                ${isRoundTrip ? `<li>Return Journey Emissions: ${oneWayEmissions.toFixed(3)} tonnes CO₂</li>` : ''}
                <li>Final Raw Distance: ${finalDistance.toFixed(2)} km</li>
                <li>Final Adjusted Distance: ${finalAdjustedDistance.toFixed(2)} km</li>
                <li><strong>Total Emissions: ${totalEmissions.toFixed(3)} tonnes CO₂</strong></li>
              </ul>
            `
          });

          // Step 10: Per passenger calculation
          const emissionsPerPassenger = totalEmissions / passengers;

          steps.push({
            id: "perPassenger",
            title: "Step 10: Per Passenger Emissions",
            content: `
              <p>Calculating per-passenger emissions:</p>
              <ul>
                <li>Total Emissions: ${totalEmissions.toFixed(3)} tonnes CO₂</li>
                <li>Number of Passengers: ${passengers}</li>
                <li><strong>Emissions per Passenger: ${emissionsPerPassenger.toFixed(3)} tonnes CO₂</strong></li>
              </ul>
            `
          });

          // Add methodology notes based on selected methodology
          steps.push({
            id: "methodology",
            title: "Methodology Notes",
            content: getMethodologyDetails(selectedMethodology)
          });

          // Calculate emissions equivalences
          const equivalencies = {
            carsPerYear: Math.round(totalEmissions * 4.6),
            homeEnergyForDays: Math.round(totalEmissions * 120),
            smartphonesCharged: Math.round(totalEmissions * 121643),
            treesNeededForYear: Math.round(totalEmissions * 16.5),
            recycledWasteInKg: Math.round(totalEmissions * 1200),
            offsetCostUSD: Math.round(totalEmissions * 13.5)
          };

          steps.push({
            id: "equivalencies",
            title: "Emissions Equivalencies",
            content: `
              <p>Understanding the scale of these emissions through equivalencies:</p>
              <ul>
                <li>${equivalencies.carsPerYear} passenger cars driven for one year</li>
                <li>${equivalencies.homeEnergyForDays} days of home energy use</li>
                <li>${equivalencies.smartphonesCharged.toLocaleString()} smartphones charged</li>
                <li>${equivalencies.treesNeededForYear} trees growing for one year to sequester this carbon</li>
                <li>${equivalencies.recycledWasteInKg.toLocaleString()} kg of waste recycled instead of landfilled</li>
                <li>$${equivalencies.offsetCostUSD.toLocaleString()} to offset through carbon credit projects</li>
              </ul>
            `
          });

          // Final result
          result = {
            totalEmissions,
            emissionsPerPassenger,
            distanceKm: finalDistance,
            adjustedDistance: finalAdjustedDistance,
            flightType: convertFlightTypeFormat(flightType),
            baseEmissionsPerKm,
            emissionsPerKm,
            isRoundTrip,
            passengers,
            capacity,
            loadFactor,
            loadFactorAdjustment,
            radiativeForcingIndex: rfi,
            co2Factor,
            aircraft: {
              registration: aircraftRegistration,
              model: aircraft.model
            },
            homeAirport,
            awayAirport,
            equivalencies,
            methodology: selectedMethodology,
            fuel: totalFuelKg
          };
        } else {
          // No aircraft selected, use default calculation method
          addDebugLog("No specific aircraft selected, using default ICAO methodology");

          // Step 4: Default calculation method
          steps.push({
            id: "defaultMethod",
            title: "Step 4: Default Calculation Method",
            content: `
              <p>No specific aircraft selected. Using standard ${selectedMethodology} methodology for aviation emissions.</p>
              <ul>
                <li>Calibrated Emissions Factor: ${getCalibrationFactor(selectedMethodology)} tonnes CO₂ per km</li>
                <li>Flight Type: ${convertFlightTypeFormat(flightType)}</li>
                <li>Adjusted Distance: ${adjustedDistance.toFixed(2)} km</li>
              </ul>
            `
          });

          // Step 5: Emissions adjustment based on flight type
          const CALIBRATED_EMISSIONS_FACTOR = getCalibrationFactor(selectedMethodology);
          const emissionsAdjustment = getEmissionsAdjustment(flightType);

          addDebugLog(`Applied emissions adjustment for ${flightType}: ${emissionsAdjustment}`);

          steps.push({
            id: "emissionsAdjustment",
            title: "Step 5: Distance-Based Emissions Adjustment",
            content: `
              <p>Adjusting emissions factor based on flight distance category:</p>
              <ul>
                <li>Base Emissions Factor: ${CALIBRATED_EMISSIONS_FACTOR} tonnes CO₂/km</li>
                <li>Flight Type: ${convertFlightTypeFormat(flightType)}</li>
                <li>Distance Adjustment Factor: ${emissionsAdjustment.toFixed(2)}</li>
                <li>Adjusted Emissions Factor: ${(CALIBRATED_EMISSIONS_FACTOR * emissionsAdjustment).toFixed(5)} tonnes CO₂/km</li>
              </ul>
              <p class="text-xs text-gray-400 mt-2">Note: Short flights have higher emissions per km due to the disproportionate fuel consumption during takeoff and landing. Long flights are more fuel-efficient per km once at cruising altitude.</p>
            `
          });

          // Step 6: Load factor calculation
          const defaultCapacity = getDefaultCapacity(flightType);
          const loadFactor = Math.min(passengers / defaultCapacity, 1);
          const loadFactorAdjustment = calculateDefaultLoadFactorAdjustment(loadFactor);

          addDebugLog(`Applied load factor adjustment: ${loadFactorAdjustment.toFixed(3)}`);

          steps.push({
            id: "loadFactor",
            title: "Step 6: Load Factor Adjustment",
            content: `
              <p>Adjusting emissions based on passenger load:</p>
              <ul>
                <li>Number of Passengers: ${passengers}</li>
                <li>Default Aircraft Capacity for ${convertFlightTypeFormat(flightType)}: ${defaultCapacity}</li>
                <li>Load Factor: ${(loadFactor * 100).toFixed(1)}%</li>
                <li>Fixed Emissions Ratio: 80%</li>
                <li>Variable Emissions Ratio: 20%</li>
                <li>Load Factor Adjustment: ${loadFactorAdjustment.toFixed(3)}</li>
              </ul>
              <p class="text-xs text-gray-400 mt-2">Note: Standard methodology suggests that about 80% of emissions are fixed regardless of passenger count, with 20% varying based on load.</p>
            `
          });

          // Step 7: Calculate base emissions
          const baseEmissionsPerKm = CALIBRATED_EMISSIONS_FACTOR * emissionsAdjustment;
          const emissionsPerKm = baseEmissionsPerKm * loadFactorAdjustment;

          addDebugLog(`Calculated emissions rate: ${(emissionsPerKm * 1000).toFixed(2)} kg CO₂/km`);

          // Step 8: Apply radiative forcing index (RFI)
          const rfi = calculateRFI(flightType);
          let totalEmissions = adjustedDistance * emissionsPerKm * rfi;

          addDebugLog(`Applied RFI factor: ${rfi}`);

          steps.push({
            id: "rfi",
            title: "Step 7: Radiative Forcing Index",
            content: `
              <p>Accounting for non-CO₂ climate effects using Radiative Forcing Index (RFI):</p>
              <ul>
                <li>Flight Type: ${convertFlightTypeFormat(flightType)}</li>
                <li>RFI Factor: ${rfi}</li>
                <li>Base Emissions per km: ${(baseEmissionsPerKm * 1000).toFixed(4)} kg CO₂/km</li>
                <li>Load-adjusted Emissions per km: ${(emissionsPerKm * 1000).toFixed(4)} kg CO₂/km</li>
                <li>RFI-adjusted Emissions per km: ${(emissionsPerKm * rfi * 1000).toFixed(4)} kg CO₂/km</li>
                <li>Adjusted Distance: ${adjustedDistance.toFixed(2)} km</li>
                <li>One-way Emissions: ${totalEmissions.toFixed(3)} tonnes CO₂</li>
              </ul>
              <p class="text-xs text-gray-400 mt-2">Note: The Radiative Forcing Index accounts for additional warming effects from aviation emissions at altitude, including nitrogen oxides, water vapor, and contrails.</p>
            `
          });

          // Step 9: Round trip calculation
          const oneWayEmissions = totalEmissions;
          const finalDistance = isRoundTrip ? distance * 2 : distance;
          const finalAdjustedDistance = isRoundTrip ? adjustedDistance * 2 : adjustedDistance;

          if (isRoundTrip) {
            totalEmissions *= 2;
          }

          addDebugLog(`Calculated ${isRoundTrip ? 'round-trip' : 'one-way'} emissions: ${totalEmissions.toFixed(3)} tonnes`);

          steps.push({
            id: "roundTrip",
            title: "Step 8: Trip Type Calculation",
            content: `
              <p>Calculating final emissions based on trip type:</p>
              <ul>
                <li>Trip Type: ${isRoundTrip ? "Round Trip" : "One Way"}</li>
                <li>One-way Emissions: ${oneWayEmissions.toFixed(3)} tonnes CO₂</li>
                ${isRoundTrip ? `<li>Return Journey Emissions: ${oneWayEmissions.toFixed(3)} tonnes CO₂</li>` : ''}
                <li>Final Raw Distance: ${finalDistance.toFixed(2)} km</li>
                <li>Final Adjusted Distance: ${finalAdjustedDistance.toFixed(2)} km</li>
                <li><strong>Total Emissions: ${totalEmissions.toFixed(3)} tonnes CO₂</strong></li>
              </ul>
            `
          });

          // Step 10: Per passenger calculation
          const emissionsPerPassenger = totalEmissions / passengers;

          steps.push({
            id: "perPassenger",
            title: "Step 9: Per Passenger Emissions",
            content: `
              <p>Calculating per-passenger emissions:</p>
              <ul>
                <li>Total Emissions: ${totalEmissions.toFixed(3)} tonnes CO₂</li>
                <li>Number of Passengers: ${passengers}</li>
                <li><strong>Emissions per Passenger: ${emissionsPerPassenger.toFixed(3)} tonnes CO₂</strong></li>
              </ul>
            `
          });

          // Add methodology notes based on selected methodology
          steps.push({
            id: "methodology",
            title: "Methodology Notes",
            content: getMethodologyDetails(selectedMethodology)
          });

          // Calculate emissions equivalences
          const equivalencies = {
            carsPerYear: Math.round(totalEmissions * 4.6),
            homeEnergyForDays: Math.round(totalEmissions * 120),
            smartphonesCharged: Math.round(totalEmissions * 121643),
            treesNeededForYear: Math.round(totalEmissions * 16.5),
            recycledWasteInKg: Math.round(totalEmissions * 1200),
            offsetCostUSD: Math.round(totalEmissions * 13.5)
          };

          steps.push({
            id: "equivalencies",
            title: "Emissions Equivalencies",
            content: `
              <p>Understanding the scale of these emissions through equivalencies:</p>
              <ul>
                <li>${equivalencies.carsPerYear} passenger cars driven for one year</li>
                <li>${equivalencies.homeEnergyForDays} days of home energy use</li>
                <li>${equivalencies.smartphonesCharged.toLocaleString()} smartphones charged</li>
                <li>${equivalencies.treesNeededForYear} trees growing for one year to sequester this carbon</li>
                <li>${equivalencies.recycledWasteInKg.toLocaleString()} kg of waste recycled instead of landfilled</li>
                <li>${equivalencies.offsetCostUSD.toLocaleString()} to offset through carbon credit projects</li>
              </ul>
            `
          });

          result = {
            totalEmissions,
            emissionsPerPassenger,
            distanceKm: finalDistance,
            adjustedDistance: finalAdjustedDistance,
            flightType: convertFlightTypeFormat(flightType),
            baseEmissionsPerKm,
            emissionsPerKm,
            isRoundTrip,
            passengers,
            capacity: defaultCapacity,
            loadFactor,
            loadFactorAdjustment,
            radiativeForcingIndex: rfi,
            co2Factor: 3.16,
            aircraft: null,
            homeAirport,
            awayAirport,
            equivalencies,
            methodology: selectedMethodology
          };
        }

        setCalculationSteps(steps);
        setCalculationResult(result);
        setExpandedSections({
          distance: true, // Auto-expand first section
          flightType: false,
          routeCorrection: false
        });

        // Calculate results with alternative methodologies
        calculateAlternativeMethodologies(distance, adjustedDistance, passengers, isRoundTrip, flightType);

        // Add to calculation history
        const historyEntry = {
          id: `calc-${new Date().getTime().toString().slice(-6)}`,
          date: new Date().toISOString().split('T')[0],
          route: `${homeAirport.id} to ${awayAirport.id}`,
          passengers: passengers,
          totalEmissions: result.totalEmissions.toFixed(2),
          methodology: selectedMethodology
        };

        setCalculationHistory(prev => [historyEntry, ...prev].slice(0, 10));

        setIsCalculating(false);
      } catch (error) {
        console.error("Calculation error:", error);
        addDebugLog(`Error in calculation: ${error.message}`, "error");
        setIsCalculating(false);
      }
    }, 800);
  };

  // Calculate emissions using alternative methodologies for comparison
  const calculateAlternativeMethodologies = (distance, adjustedDistance, passengers, isRoundTrip, flightType, currentResult) => {
    const methodologiesToCompare = methodologies.filter(m => m.id !== selectedMethodology);

    const alternativeResults = methodologiesToCompare.map(methodology => {
      const factor = getCalibrationFactor(methodology.id);
      const emissionsAdjustment = getEmissionsAdjustment(flightType);
      const defaultCapacity = getDefaultCapacity(flightType);
      const loadFactor = Math.min(passengers / defaultCapacity, 1);
      const loadFactorAdjustment = calculateDefaultLoadFactorAdjustment(loadFactor);
      const baseEmissionsPerKm = factor * emissionsAdjustment;
      const emissionsPerKm = baseEmissionsPerKm * loadFactorAdjustment;
      const rfi = calculateRFI(flightType);

      let totalEmissions = adjustedDistance * emissionsPerKm * rfi;
      if (isRoundTrip) {
        totalEmissions *= 2;
      }

      const percentDifference = currentResult ?
        ((totalEmissions / currentResult.totalEmissions - 1) * 100).toFixed(1) : 0;

      return {
        id: methodology.id,
        name: methodology.name,
        description: methodology.description,
        totalEmissions: totalEmissions.toFixed(3),
        percentDifference: percentDifference
      };
    });

    setAlternativeCalculations(alternativeResults);
  };

  // Utility functions
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Returns one-way distance in kilometers
  }

  function determineFlightType(distanceKm) {
    const FLIGHT_DISTANCE_THRESHOLDS = {
      derby: 50,      // Below this is considered a derby match (ground transport)
      short: 800,     // Below this is a short flight
      medium: 4800    // Below this is a medium flight, above is long-haul
    };

    if (distanceKm < FLIGHT_DISTANCE_THRESHOLDS.derby) {
      return "derby";
    } else if (distanceKm < FLIGHT_DISTANCE_THRESHOLDS.short) {
      return "short";
    } else if (distanceKm < FLIGHT_DISTANCE_THRESHOLDS.medium) {
      return "medium";
    } else {
      return "long";
    }
  }

  function getRouteInefficiencyFactor(flightType) {
    const ROUTE_INEFFICIENCY = {
      derby: 1.0,     // No correction for ground transport
      short: 1.13,    // 13% extra for short flights
      medium: 1.08,   // 8% extra for medium flights
      long: 1.05      // 5% extra for long flights
    };

    return ROUTE_INEFFICIENCY[flightType];
  }

  function applyRouteCorrection(distance, flightType) {
    const inefficiencyFactor = getRouteInefficiencyFactor(flightType);
    return distance * inefficiencyFactor;
  }

  function convertFlightTypeFormat(flightType) {
    switch (flightType) {
      case "derby": return "Derby Match";
      case "short": return "Short Flight";
      case "medium": return "Medium Flight";
      case "long": return "Long Flight";
      default: return flightType;
    }
  }

  function getDefaultCapacity(flightType) {
    switch (flightType) {
      case "derby": return 60;     // Coach/bus capacity
      case "short": return 100;    // Regional jet/smaller aircraft
      case "medium": return 180;   // Typical narrowbody capacity
      case "long": return 300;     // Typical widebody capacity
      default: return 150;         // Default capacity
    }
  }

  function calculateDefaultLoadFactorAdjustment(loadFactor) {
    // Similar to the aircraft-specific method but using standard values
    const fixedEmissionsRatio = 0.80; // 80% fixed emissions
    const variableEmissionsRatio = 0.20; // 20% variable based on load

    return fixedEmissionsRatio + (variableEmissionsRatio * loadFactor);
  }

  function getEmissionsAdjustment(flightType) {
    const DISTANCE_EMISSIONS_ADJUSTMENT = {
      derby: 0.5,     // Ground transport is more efficient
      short: 1.3,     // Short flights have higher per-km emissions
      medium: 1.0,    // Medium flights are our baseline
      long: 0.9       // Long flights have lower per-km emissions
    };

    return DISTANCE_EMISSIONS_ADJUSTMENT[flightType];
  }

  function getCalibrationFactor(methodology) {
    // Different methodologies have slightly different emissions factors
    const METHODOLOGY_FACTORS = {
      "ICAO": 0.0291,
      "DEFRA": 0.0302,
      "EPA": 0.0285,
      "GHG": 0.0294
    };

    return METHODOLOGY_FACTORS[methodology] || 0.0291;
  }

  function calculateRFI(flightType) {
    switch (flightType) {
      case "derby": return 1.0;  // Ground transport has no altitude effects
      case "short": return 1.7;  // Lower altitude flights have smaller non-CO2 effects
      case "medium": return 1.9; // Standard value
      case "long": return 2.3;   // Higher altitude, greater impact
      default: return 1.9;
    }
  }

  function calculateLoadFactorAdjustment(passengers, aircraftModel) {
    const capacity = aircraftCapacity[aircraftModel] || 150;
    const loadFactor = Math.min(passengers / capacity, 1); // Cap at 100%

    // ICAO methodology suggests that about 80% of emissions are fixed
    // regardless of passenger count
    const fixedEmissionsRatio = 0.80; // 80% fixed emissions
    const variableEmissionsRatio = 0.20; // 20% variable based on load

    return fixedEmissionsRatio + (variableEmissionsRatio * loadFactor);
  }

  function getLTOFuel(aircraftModel) {
    // LTO fuel consumption (kg) - varies by aircraft size
    if (aircraftModel.includes("737") || aircraftModel.includes("321")) {
      return 850; // Narrowbody jets
    } else if (aircraftModel.includes("ERJ") || aircraftModel.includes("Dornier")) {
      return 550; // Regional jets
    } else if (aircraftModel.includes("ATR") || aircraftModel.includes("Saab")) {
      return 300; // Turboprops
    } else if (aircraftModel.includes("King Air")) {
      return 120; // Small turboprops
    } else if (aircraftModel.includes("Global") || aircraftModel.includes("Bombardier")) {
      return 700; // Business jets
    } else {
      return 600; // Default
    }
  }

  function calculateFuelBurn(aircraft, adjustedDistance, flightType) {
    let fuelBurnRateAdjusted = aircraft.fuel_burn_rate_kg_per_hour;
    const cruisingSpeed = aircraftCruisingSpeeds[aircraft.model] || 800;

    // LTO fuel consumption
    const ltoFuel = getLTOFuel(aircraft.model);

    // Calculate cruise time excluding LTO phases
    const climbDescentDistance = 200; // km - simplification of climb/descent phases
    const cruiseDistance = Math.max(0, adjustedDistance - climbDescentDistance);

    // Calculate cruise time in hours
    const cruiseTimeHours = cruiseDistance / cruisingSpeed;

    // Apply cruise-specific fuel burn rate (more efficient than average)
    const cruiseFuelRate = fuelBurnRateAdjusted * 0.9; // Cruise is ~10% more efficient than average
    const cruiseFuel = cruiseFuelRate * cruiseTimeHours;

    // Calculate climb/descent fuel (typically higher consumption than cruise)
    const climbDescentFuel = (fuelBurnRateAdjusted * 1.2) * (climbDescentDistance / cruisingSpeed);

    // Total fuel = LTO + climb/descent + cruise
    const totalFuelKg = ltoFuel + climbDescentFuel + cruiseFuel;

    return totalFuelKg;
  }

  function getCO2EmissionFactor() {
    // ICAO standard: 3.16 kg CO2 per kg of jet fuel
    return 3.16;
  }

  function getMethodologyDetails(methodology) {
    const details = {
      "ICAO": `
        <p>The International Civil Aviation Organization (ICAO) methodology is the globally recognized standard for aviation emissions calculations. Key aspects include:</p>
        <ul>
          <li>Applies different emission factors based on flight distance categories</li>
          <li>Incorporates Radiative Forcing Index (RFI) to account for non-CO₂ climate effects</li>
          <li>Considers the LTO (Landing and Take-Off) cycle as a separate emissions component</li>
          <li>Uses a standard CO₂ emission factor of 3.16 kg CO₂ per kg of jet fuel</li>
          <li>Accounts for load factor with appropriate scaling</li>
        </ul>
        <p class="text-xs text-gray-400 mt-2">Reference: ICAO Carbon Emissions Calculator Methodology, Version 11, 2018</p>
      `,
      "DEFRA": `
        <p>The UK Department for Environment, Food and Rural Affairs (DEFRA) methodology has specific UK considerations:</p>
        <ul>
          <li>Generally results in slightly higher emissions estimates than ICAO</li>
          <li>UK-specific emission factors that reflect the UK aircraft fleet</li>
          <li>Updated annually with UK government conversion factors</li>
          <li>Includes domestic, short-haul and long-haul specific factors</li>
          <li>Recommends a 1.9 uplift factor for non-CO₂ effects</li>
        </ul>
        <p class="text-xs text-gray-400 mt-2">Reference: DEFRA Greenhouse Gas Reporting: Conversion Factors 2023</p>
      `,
      "EPA": `
        <p>The U.S. Environmental Protection Agency (EPA) methodology focuses on US aviation standards:</p>
        <ul>
          <li>Generally results in slightly lower emissions estimates than ICAO</li>
          <li>Based on US fleet performance data</li>
          <li>Uses tier-based approach for different levels of calculation detail</li>
          <li>Incorporates US-specific aviation data</li>
          <li>Less emphasis on non-CO₂ effects in standard calculations</li>
        </ul>
        <p class="text-xs text-gray-400 mt-2">Reference: EPA Center for Corporate Climate Leadership GHG Emission Factors Hub</p>
      `,
      "GHG": `
        <p>The Greenhouse Gas Protocol methodology is aimed at organizational carbon accounting:</p>
        <ul>
          <li>More conservative in its estimates than other methodologies</li>
          <li>Provides specific guidance for corporate carbon accounting</li>
          <li>Divides emissions into Scope 1, 2, and 3 categories</li>
          <li>Includes detailed guidance for organizational boundaries</li>
          <li>Includes all six Kyoto Protocol GHGs, not just CO₂</li>
        </ul>
        <p class="text-xs text-gray-400 mt-2">Reference: GHG Protocol Corporate Accounting and Reporting Standard</p>
      `
    };

    return details[methodology] || details["ICAO"];
  }

  // Function to download calculation details as CSV
  const downloadCalculationCSV = () => {
    if (!calculationResult) return;

    const rows = [
      ['Aviation Emissions Calculation Report'],
      ['Generated:', new Date().toISOString()],
      [''],
      ['ROUTE INFORMATION'],
      ['Home Airport:', `${calculationResult.homeAirport.name} (${calculationResult.homeAirport.id})`],
      ['Away Airport:', `${calculationResult.awayAirport.name} (${calculationResult.awayAirport.id})`],
      ['Distance (km):', calculationResult.distanceKm],
      ['Adjusted Distance (km):', calculationResult.adjustedDistance],
      ['Trip Type:', calculationResult.isRoundTrip ? 'Round Trip' : 'One Way'],
      ['Flight Type:', calculationResult.flightType],
      [''],
      ['CALCULATION PARAMETERS'],
      ['Methodology:', calculationResult.methodology],
      ['Passengers:', calculationResult.passengers],
      ['Aircraft Capacity:', calculationResult.capacity],
      ['Load Factor:', `${(calculationResult.loadFactor * 100).toFixed(1)}%`],
      ['RFI Factor:', calculationResult.radiativeForcingIndex],
      [''],
      ['EMISSIONS RESULTS'],
      ['Base Emissions per km (kg CO₂/km):', (calculationResult.baseEmissionsPerKm * 1000).toFixed(4)],
      ['Adjusted Emissions per km (kg CO₂/km):', (calculationResult.emissionsPerKm * 1000).toFixed(4)],
      ['Total Emissions (tonnes CO₂):', calculationResult.totalEmissions.toFixed(3)],
      ['Emissions per Passenger (tonnes CO₂):', calculationResult.emissionsPerPassenger.toFixed(3)],
      [''],
      ['EQUIVALENCIES'],
      ['Cars Driven for One Year:', calculationResult.equivalencies.carsPerYear],
      ['Home Energy Use (days):', calculationResult.equivalencies.homeEnergyForDays],
      ['Smartphones Charged:', calculationResult.equivalencies.smartphonesCharged],
      ['Trees Growing for One Year:', calculationResult.equivalencies.treesNeededForYear],
    ];

    // Add aircraft info if available
    if (calculationResult.aircraft) {
      rows.splice(11, 0, ['Aircraft:', `${calculationResult.aircraft.registration} (${calculationResult.aircraft.model})`]);
      if (calculationResult.fuel) {
        rows.splice(12, 0, ['Fuel Consumption (kg):', calculationResult.fuel.toFixed(2)]);
      }
    }

    // Convert to CSV
    const csvContent = rows.map(row => row.join(',')).join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `emissions_calculation_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy calculation details to clipboard in a formatted way
  const copyCalculationDetails = () => {
    if (!calculationResult) return;

    const details = `
  EMISSIONS CALCULATION SUMMARY
  ============================
  Route: ${calculationResult.homeAirport.name} (${calculationResult.homeAirport.id}) to ${calculationResult.awayAirport.name} (${calculationResult.awayAirport.id})
  Distance: ${calculationResult.distanceKm.toFixed(2)} km (${calculationResult.isRoundTrip ? 'Round Trip' : 'One Way'})
  Flight Type: ${calculationResult.flightType}
  Passengers: ${calculationResult.passengers}
  ${calculationResult.aircraft ? `Aircraft: ${calculationResult.aircraft.registration} (${calculationResult.aircraft.model})` : ''}
  
  EMISSIONS RESULTS
  ================
  Total Emissions: ${calculationResult.totalEmissions.toFixed(3)} tonnes CO₂
  Per Passenger: ${calculationResult.emissionsPerPassenger.toFixed(3)} tonnes CO₂
  Emissions per km: ${(calculationResult.emissionsPerKm * 1000).toFixed(4)} kg CO₂/km
  
  Calculated using ${calculationResult.methodology} methodology
  Generated on ${new Date().toISOString().split('T')[0]}
      `.trim();

    navigator.clipboard.writeText(details)
      .then(() => {
        setToast({
          show: true,
          message: 'Calculation details copied to clipboard',
          type: 'success'
        });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      })
      .catch(err => {
        console.error('Failed to copy calculation details: ', err);
        setToast({
          show: true,
          message: 'Failed to copy details',
          type: 'error'
        });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
      });
  };


  // Fetch Leagues data from supabase
  const fetchLeagues = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.from("leagues").select("*")
      if (error) {
        throw error
      }
      if (data) {
        setLeagues(data)
      }
    } catch (error) {
      console.error("Error fetching leagues:", error)
      toast.error("Failed to load league data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch seasons data from supabase
  const fetchLeagueSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('season_id, start_date, end_date');

      if (error) throw error;
      setSeasons(data);
    } catch (error) {
      console.error("Error fetching league seasons:", error);
    }
  };

  // Fetch Matches data from supabase
  const fetchMatches = async () => {
    try {
      let query = supabase
        .from('matches')
        .select(`
          *,
          league_seasons!inner (
            league_id,
            leagues (
              name
            )
          )`,
          { count: 'exact' }
        )
      // .order("date", { ascending: sortDirection === "asc" })

      // Apply league filter
      if (selectedLeague && selectedLeague !== "all") {
        query = query.eq('league_id', selectedLeague);
      }
      if (selectedSeason && selectedSeason !== "") {
        query = query.eq("season_id", selectedSeason);
      }

      const { data: matchesData, error: matchesError, count: matchesCount } = await query;

      // matchesData = data || [];
      // matchesCount = count || 0;

      if (matchesError) {
        console.error("Error fetching matches:", matchesError)
        setIsLoading(false)
        return
      }

      setMatches(matchesData || []);
      setMatchCount(matchesCount || 0);

    } catch (error) {
      console.error("Error fetching league seasons:", error);
      toast.error("Failed to load matches data");
      setMatches([]);
      setMatchCount(0);
    }
  };

  // Fetch Airports data based on selected match
  const fetchAirportsForMatch = async (matchId) => {
    try {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('home_team_id, away_team_id')
        .eq('match_id', matchId)
        .single();

      if (matchError) throw matchError;

      const { home_team_id, away_team_id } = matchData;

      // Fetch home airport based on home_team_id
      const { data: homeAirportData, error: homeAirportError } = await supabase
        .from('airports')
        .select('iata_code, airport_name, latitude, longitude')
        .eq('team_id', home_team_id)
        .single();

      if (homeAirportError) throw homeAirportError;

      const formattedHomeAirport = homeAirportData
        ? {
          id: homeAirportData.iata_code,
          name: homeAirportData.airport_name,
          latitude: homeAirportData.latitude,
          longitude: homeAirportData.longitude,
        }
        : null;

      // Fetch away airport based on away_team_id
      const { data: awayAirportData, error: awayAirportError } = await supabase
        .from('airports')
        .select('iata_code, airport_name, latitude, longitude')
        .eq('team_id', away_team_id)
        .single();

      if (awayAirportError) throw awayAirportError;

      const formattedAwayAirport = awayAirportData
        ? {
          id: awayAirportData.iata_code,
          name: awayAirportData.airport_name,
          latitude: awayAirportData.latitude,
          longitude: awayAirportData.longitude,
        }
        : null;

      setHomeAirport(formattedHomeAirport);
      setAwayAirport(formattedAwayAirport);
    } catch (error) {
      console.error("Error fetching airports for match:", error);
      toast.error("Failed to load airport data for the selected match");
    }
  };

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchLeagues(); // Fetch leagues first
      await fetchLeagueSeasons(); // Then fetch seasons
      await fetchMatches(); // Finally fetch matches
    };

    loadInitialData();
  }, [])

  // Refetch matches when filters change
  useEffect(() => {
    if (seasons.length > 0) { // Only fetch matches after seasons are loaded
      fetchMatches();
    }
  }, [selectedLeague, selectedSeason, sortDirection]);

  // Fetch airports when a match is selected
  useEffect(() => {
    if (selectedMatch) {
      fetchAirportsForMatch(selectedMatch);
    } else {
      setHomeAirport(null);
      setAwayAirport(null);
    }
  }, [selectedMatch]);

  // Main render function based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'airports':
        return renderAirportsTab();
      case 'matches':
        return renderMatchesTab();
      default:
        return null;
    }
  };

  // Determine if the given tab should be disabled
  const isTabDisabled = (tabName) => {
    switch (tabName) {
      case 'airports':
        return false; // Can be accessed directly
      case 'matches':
        return false; // Always available
      default:
        return false;
    }
  };

  // UI for rendering the different tabs
  const renderMatchesTab = () => (
    <div className="grid grid-cols-1 gap-4 px-4 pb-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
          <Trophy className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Select Leagues</span>
        </label>
        <select
          className={`w-full p-3 bg-gray-800 border rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500 border-gray-700`}
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
        >
          <option value="all">All Leagues</option>
          {leagues.map(league => (
            <option key={league.league_id} value={league.league_id}>
              {league.name} ({league.country})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
          <CalendarDays className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Select Seasons</span>
        </label>
        <select
          className={`w-full p-3 bg-gray-800 border rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500 border-gray-700`}
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
        >
          <option value="">Select a Season</option>
          {seasons.map(season => (
            <option key={season.season_id} value={season.season_id}>
              {season.season_id}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
          <Medal className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Select Matches</span>
        </label>
        <select
          className={`w-full p-3 bg-gray-800 border rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500 border-gray-700`}
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
        >
          <option value="">Select a Match (Total {matchCount})</option>
          {matches.map(match => (
            <option key={match.match_id} value={match.match_id}>
              {match.home_team} vs {match.away_team} ({match.country})
            </option>
          ))}
        </select>
      </div>

      {/* Home Airport */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
          <PlaneTakeoff className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Home Airport</span>
        </label>
        <input
          type="text"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200"
          value={homeAirport ? `${homeAirport.name} (${homeAirport.id})` : "Selecte a match"}
          readOnly
        />
      </div>

      {/* Away Airport */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
          <PlaneLanding className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Away Airport</span>
        </label>
        <input
          type="text"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200"
          value={awayAirport ? `${awayAirport.name} (${awayAirport.id})` : "Select a match"}
          readOnly
        />
      </div>

      {/* Passengers */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
          <Users className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Number of Passengers</span>
        </label>
        <input
          type="number"
          className={`w-full p-3 bg-gray-800 border ${validationErrors.passengers ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500`}
          value={passengers}
          onChange={(e) => setPassengers(Number(e.target.value))}
          min="1"
        />
        {validationErrors.passengers && (
          <p className="mt-1 text-xs text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validationErrors.passengers}
          </p>
        )}
      </div>

      {/* Aircraft Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
          <Plane className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Aircraft (Optional)</span>
        </label>
        <select
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
          value={aircraftRegistration}
          onChange={(e) => setAircraftRegistration(e.target.value)}
        >
          <option value="">No Specific Aircraft</option>
          {Object.entries(aircraft_database).map(([registration, data]) => (
            <option key={registration} value={registration}>
              {registration} - {data.model}
            </option>
          ))}
        </select>
      </div>

      {/* Round Trip Option */}
      <div className="flex items-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isRoundTrip}
            onChange={(e) => setIsRoundTrip(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-300 flex items-center">
            <RotateCw className="mr-2 h-4 w-4 text-emerald-500" />
            Round Trip
          </span>
        </label>
      </div>

      {/* Calculate Button */}
      <button
        className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg shadow hover:from-emerald-700 hover:to-emerald-800 focus:ring-4 focus:ring-emerald-500/50 transition-all duration-200 disabled:opacity-70"
        onClick={handleCalculate}
        disabled={isCalculating}
      >
        {isCalculating ? (
          <>
            <RefreshCw className="animate-spin mr-2 h-5 w-5" />
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="mr-2 h-5 w-5" />
            Calculate Emissions
          </>
        )}
      </button>
    </div>
  );

  const renderAirportsTab = () => (
    <div className="px-4 space-y-4">
      {/* Home Airport */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
          <PlaneTakeoff className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Home Airport</span>
        </label>
        <select
          className={`w-full p-3 bg-gray-800 border ${validationErrors.homeAirport || validationErrors.sameAirport ?
            'border-red-500' : 'border-gray-700'
            } rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500`}
          value={homeAirport?.id || ""}
          onChange={(e) => setHomeAirport(airports.find(a => a.id === e.target.value) || null)}
        >
          <option value="">Select Home Airport</option>
          {airports.map(airport => (
            <option key={airport.id} value={airport.id}>
              {airport.name} ({airport.id})
            </option>
          ))}
        </select>
        {validationErrors.homeAirport && (
          <p className="mt-1 text-xs text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validationErrors.homeAirport}
          </p>
        )}
      </div>

      {/* Away Airport */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
          <PlaneLanding className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Away Airport</span>
        </label>
        <select
          className={`w-full p-3 bg-gray-800 border ${validationErrors.awayAirport || validationErrors.sameAirport ?
            'border-red-500' : 'border-gray-700'
            } rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500`}
          value={awayAirport?.id || ""}
          onChange={(e) => setAwayAirport(airports.find(a => a.id === e.target.value) || null)}
        >
          <option value="">Select Away Airport</option>
          {airports.map(airport => (
            <option key={airport.id} value={airport.id}>
              {airport.name} ({airport.id})
            </option>
          ))}
        </select>
        {(validationErrors.awayAirport || validationErrors.sameAirport) && (
          <p className="mt-1 text-xs text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validationErrors.awayAirport || validationErrors.sameAirport}
          </p>
        )}
      </div>

      {/* Passengers */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
          <Users className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Number of Passengers</span>
        </label>
        <input
          type="number"
          className={`w-full p-3 bg-gray-800 border ${validationErrors.passengers ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500`}
          value={passengers}
          onChange={(e) => setPassengers(Number(e.target.value))}
          min="1"
        />
        {validationErrors.passengers && (
          <p className="mt-1 text-xs text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validationErrors.passengers}
          </p>
        )}
      </div>

      {/* Aircraft Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300 flex items-center">
          <Plane className="mr-2 h-4 w-4 text-emerald-500" />
          <span>Aircraft (Optional)</span>
        </label>
        <select
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
          value={aircraftRegistration}
          onChange={(e) => setAircraftRegistration(e.target.value)}
        >
          <option value="">No Specific Aircraft</option>
          {Object.entries(aircraft_database).map(([registration, data]) => (
            <option key={registration} value={registration}>
              {registration} - {data.model}
            </option>
          ))}
        </select>
      </div>

      {/* Round Trip Option */}
      <div className="flex items-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isRoundTrip}
            onChange={(e) => setIsRoundTrip(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-300 flex items-center">
            <RotateCw className="mr-2 h-4 w-4 text-emerald-500" />
            Round Trip
          </span>
        </label>
      </div>

      {/* Calculate Button */}
      <button
        className="flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg shadow hover:from-emerald-700 hover:to-emerald-800 focus:ring-4 focus:ring-emerald-500/50 transition-all duration-200 disabled:opacity-70"
        onClick={handleCalculate}
        disabled={isCalculating}
      >
        {isCalculating ? (
          <>
            <RefreshCw className="animate-spin mr-2 h-5 w-5" />
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="mr-2 h-5 w-5" />
            Calculate Emissions
          </>
        )}
      </button>
    </div>
  )

  // Render the Admin Panel UI
  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Emissions Calculation Process</h1>
          <p className="text-gray-400">Administrative view of the detailed emissions calculation methodology</p>
        </div>
        <div className="flex space-x-2">
          {/* <button 
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 flex items-center"
            onClick={() => setShowDebugInfo(!showDebugInfo)}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {showDebugInfo ? "Hide Debug" : "Show Debug"}
          </button> */}

          <select
            className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700"
            value={selectedMethodology}
            onChange={(e) => setSelectedMethodology(e.target.value)}
          >
            {methodologies.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Debug Info Panel */}
      {showDebugInfo && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-800">
            <h2 className="font-bold text-gray-300">Debug Information</h2>
            <div className="flex space-x-2">
              <button
                className="px-3 py-1 bg-gray-800 text-xs text-gray-300 rounded hover:bg-gray-700"
                onClick={clearDebugLogs}
              >
                Clear Logs
              </button>
            </div>
          </div>
          <div className="p-4 h-48 overflow-y-auto font-mono text-xs">
            {debugLogs.length === 0 ? (
              <p className="text-gray-500">No debug logs yet. Run a calculation to see detailed logs.</p>
            ) : (
              <div className="space-y-1">
                {debugLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`${log.type === 'error' ? 'text-red-400' :
                      log.type === 'warning' ? 'text-yellow-400' : 'text-gray-400'
                      }`}
                  >
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Inputs */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-bold text-gray-300">Input Parameters</h2>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-gray-800 border-gray-700 m-4">
              <TabsTrigger
                value="airports"
                className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                disabled={isTabDisabled('airports')}
              >
                Airports
              </TabsTrigger>
              <TabsTrigger
                value="matches"
                className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                disabled={isTabDisabled('matches')}
              >
                Matches
              </TabsTrigger>
            </TabsList>

            {renderContent()}
          </Tabs>
        </div>

        {/* Middle Column - Calculation Process */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden lg:col-span-2">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="font-bold text-gray-300">Calculation Process</h2>
            {calculationResult && (
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 bg-gray-800 text-xs text-gray-300 rounded hover:bg-gray-700 flex items-center"
                  onClick={copyCalculationDetails}
                >
                  <Clipboard className="h-3 w-3 mr-1" />
                  Copy
                </button>
                <button
                  className="px-3 py-1 bg-gray-800 text-xs text-gray-300 rounded hover:bg-gray-700 flex items-center"
                  onClick={downloadCalculationCSV}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export CSV
                </button>
              </div>
            )}
          </div>

          <div className={`p-4 overflow-y-auto ${activeTab === "airports" ? "h-[600px]" : "h-[800px]"}`}>
            {!calculationResult ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Calculator className="h-16 w-16 mb-4 text-gray-700" />
                <p className="text-center">Enter your flight details and click "Calculate Emissions" to see the detailed calculation process.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary banner */}
                <div className="bg-gradient-to-r from-emerald-900/30 to-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-emerald-400">Calculation Summary</h3>
                      <p className="text-gray-300 text-sm">
                        {calculationResult.homeAirport.id} to {calculationResult.awayAirport.id}
                        ({calculationResult.isRoundTrip ? 'Round Trip' : 'One Way'})
                        with {calculationResult.passengers} passengers
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{calculationResult.totalEmissions.toFixed(2)}</div>
                      <div className="text-xs text-emerald-400">tonnes CO₂</div>
                    </div>
                  </div>
                </div>

                {/* Calculation steps */}
                <div className="space-y-3">
                  {calculationSteps.map((step) => (
                    <div key={step.id} className="border border-gray-800 rounded-lg overflow-hidden">
                      <div
                        className="p-3 bg-gray-800/50 flex justify-between items-center cursor-pointer"
                        onClick={() => toggleSection(step.id)}
                      >
                        <h3 className="font-medium text-emerald-400">{step.title}</h3>
                        <button className="text-gray-400">
                          {expandedSections[step.id] ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {expandedSections[step.id] && (
                        <div className="p-4 text-sm text-gray-300 border-t border-gray-800">
                          <div dangerouslySetInnerHTML={{ __html: step.content }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Alternative methodology comparisons */}
                {alternativeCalculations && alternativeCalculations.length > 0 && (
                  <div className="border border-gray-800 rounded-lg overflow-hidden mt-6">
                    <div className="p-3 bg-gray-800/50">
                      <h3 className="font-medium text-blue-400">Alternative Methodology Comparisons</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-3 gap-4">
                        {alternativeCalculations.map((alt) => (
                          <div key={alt.id} className="bg-gray-800/50 p-3 rounded-lg">
                            <h4 className="font-medium text-gray-300 mb-1">{alt.name}</h4>
                            <div className="text-xl font-bold text-white">{alt.totalEmissions}</div>
                            <div className="text-xs text-gray-400">tonnes CO₂</div>
                            <div className={`text-xs mt-1 ${parseFloat(alt.percentDifference) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {parseFloat(alt.percentDifference) > 0 ? '▲' : '▼'}
                              {Math.abs(parseFloat(alt.percentDifference))}% from {selectedMethodology}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-3">
                        Note: Different methodologies produce varying results due to different factors, adjustment weights,
                        and assumptions in their calculation processes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Previous Calculations History */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="font-bold text-gray-300">Calculation History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 text-left">
              <tr>
                <th className="py-3 px-4 text-xs font-medium text-gray-400">ID</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-400">Date</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-400">Route</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-400">Passengers</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-400">Emissions</th>
                <th className="py-3 px-4 text-xs font-medium text-gray-400">Methodology</th>
                {/* <th className="py-3 px-4 text-xs font-medium text-gray-400">Actions</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {calculationHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 px-4 text-center text-gray-500">
                    No calculation history available
                  </td>
                </tr>
              ) : (
                calculationHistory.map((calc) => (
                  <tr key={calc.id} className="hover:bg-gray-800/30">
                    <td className="py-3 px-4 text-sm text-gray-300">{calc.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{calc.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{calc.route}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{calc.passengers}</td>
                    <td className="py-3 px-4 text-sm font-medium text-emerald-400">{calc.totalEmissions}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">{calc.methodology}</td>
                    {/* <td className="py-3 px-4 text-sm">
                      <button className="text-xs bg-gray-700 hover:bg-gray-600 py-1 px-2 rounded text-gray-300">
                        View Details
                      </button>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {toast.show && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg flex items-center ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          } text-white animate-fade-in-up`}>
          {toast.type === 'success' ? (
            <Check className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default EmissionsCalculationProcess;