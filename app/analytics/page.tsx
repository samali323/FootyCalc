'use client';
import React, { useState, useEffect } from 'react';
import { 
  PlaneTakeoff, 
  PlaneLanding, 
  Users, 
  Plane, 
  RotateCw, 
  Calculator, 
  BarChart4, 
  Leaf, 
  AlertCircle, 
  CheckCircle,
  Bus,
  Train,
  Battery
} from 'lucide-react';
import { supabase } from "@/lib/supabase/client";

const EmissionsCalculator = () => {
  // States for form inputs
  const [homeAirport, setHomeAirport] = useState(null);
  const [awayAirport, setAwayAirport] = useState(null);
  const [passengers, setPassengers] = useState(35);
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [aircraftRegistration, setAircraftRegistration] = useState("");
  const [results, setResults] = useState(null);
  const [efficiencyComparison, setEfficiencyComparison] = useState(null);
  const [airports, setAirports] = useState([]);
  const [aircraft_database, setAircraftDatabase] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [showOffsetOptions, setShowOffsetOptions] = useState(false);
  const [alternativeOptions, setAlternativeOptions] = useState(null);
  const [selectedOffsetOption, setSelectedOffsetOption] = useState(null);
  const [selectedAlternative, setSelectedAlternative] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoadingAirports, setIsLoadingAirports] = useState(true);
  
  // Aircraft cruising speeds in km/h
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

  // Aircraft typical capacity
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
  
 
  
  // Fetch airports from Supabase
  useEffect(() => {
    const fetchAirports = async () => {
      setIsLoadingAirports(true);
      try {
        const { data, error } = await supabase
          .from("airports")
          .select("iata_code, airport_name, latitude, longitude")
          .order('airport_name', { ascending: true })
          const uniqueAirports:any = Object.values(
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

    // Simulating aircraft database fetch
    const fetchAircraftData = () => {
      const aircraftData = {
        // 2Excel Aviation
        "G-NEWG": {"model": "Boeing 737-8K5(WL)", "fuel_burn_rate_kg_per_hour": 2400, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
      
        // Eastern Airways
        "G-SWRD": {"model": "Embraer ERJ-190LR", "fuel_burn_rate_kg_per_hour": 1800, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-CMLI": {"model": "ATR 72-600", "fuel_burn_rate_kg_per_hour": 600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-CMFI": {"model": "ATR 72-600", "fuel_burn_rate_kg_per_hour": 600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-IACY": {"model": "Saab 2000", "fuel_burn_rate_kg_per_hour": 800, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-CMEI": {"model": "ATR 72-600", "fuel_burn_rate_kg_per_hour": 600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-CLSN": {"model": "ATR 72-600", "fuel_burn_rate_kg_per_hour": 600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-MAJY": {"model": "Embraer ERJ-190LR", "fuel_burn_rate_kg_per_hour": 1800, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-MAJZ": {"model": "Embraer ERJ-190LR", "fuel_burn_rate_kg_per_hour": 1800, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
      
        // Loganair
        "G-SAJC": {"model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-SAJG": {"model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-SAJH": {"model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-SAJK": {"model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-SAJN": {"model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-LMTI": {"model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-SAJO": {"model": "Embraer ERJ-145EP", "fuel_burn_rate_kg_per_hour": 1000, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
      
        // Titan Airways
        "G-POWK": {"model": "Airbus A321-211", "fuel_burn_rate_kg_per_hour": 2600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-POWT": {"model": "Airbus A321-211", "fuel_burn_rate_kg_per_hour": 2600, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
      
        // Blue Islands
        "G-ISLO": {"model": "Dornier 328Jet", "fuel_burn_rate_kg_per_hour": 700, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-ISLK": {"model": "Dornier 328Jet", "fuel_burn_rate_kg_per_hour": 700, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-ISLM": {"model": "Dornier 328Jet", "fuel_burn_rate_kg_per_hour": 700, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
      
        // Jet2
        "G-GDFJ": {"model": "Boeing 737-33A", "fuel_burn_rate_kg_per_hour": 2200, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-GDFL": {"model": "Boeing 737-33A", "fuel_burn_rate_kg_per_hour": 2200, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-JZHX": {"model": "Boeing 737-8K5", "fuel_burn_rate_kg_per_hour": 2400, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "G-GDFF": {"model": "Boeing 737-33A", "fuel_burn_rate_kg_per_hour": 2200, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
      
        // Thalair
        "F-HFCN": {"model": "Beechcraft King Air 350i", "fuel_burn_rate_kg_per_hour": 400, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
        "F-HFKF": {"model": "Beechcraft King Air 350i", "fuel_burn_rate_kg_per_hour": 400, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
      
        // Comlux
        "9H-MAC": {"model": "Bombardier Global 6000", "fuel_burn_rate_kg_per_hour": 1800, "emissions_factor_kg_CO2_per_kg_fuel": 3.16},
      };
      
      setAircraftDatabase(aircraftData);
    };

    fetchAirports();
    fetchAircraftData();
  }, []);

  // Function to get aircraft efficiency comparison
  // Enhanced aircraft efficiency comparison incorporating ICAO standards
function getAircraftEfficiencyComparison(distance) {
  // Calculate emissions for each aircraft at the given distance using ICAO methodology
  const aircraftEmissions = Object.entries(aircraft_database).map(([registration, data]) => {
    const model = data.model;
    const cruisingSpeed = aircraftCruisingSpeeds[model] || 800;
    
    // Get aircraft capacity
    const capacity = aircraftCapacity[model] || 150;
    
    // Determine flight type
    const flightType = determineFlightType(distance);
    
    // Calculate total fuel consumption using ICAO methodology
    const totalFuelKg = calculateFuelBurn({
      model: model,
      fuel_burn_rate_kg_per_hour: data.fuel_burn_rate_kg_per_hour
    }, distance, flightType);
    
    // Calculate total emissions (tonnes) using ICAO emission factor
    const totalEmissions = (totalFuelKg * getCO2EmissionFactor()) / 1000;
    
    // Calculate per km emissions
    const emissionsPerKm = totalEmissions / distance;
    
    // Calculate per seat-km emissions (ICAO standard efficiency metric)
    const emissionsPerSeatKm = emissionsPerKm / capacity;
    
    // ICAO passenger-km CO2 intensity metric (accounts for typical load factors)
    const typicalLoadFactor = 0.75; // Industry average
    const emissionsPerPassengerKm = emissionsPerSeatKm / typicalLoadFactor;
    
    return {
      registration,
      model,
      emissionsPerKm: emissionsPerKm.toFixed(5),
      emissionsPerSeatKm: emissionsPerSeatKm.toFixed(7),
      emissionsPerPassengerKm: emissionsPerPassengerKm.toFixed(7),
      totalEmissions: totalEmissions.toFixed(3),
      capacity,
      fuelConsumption: totalFuelKg.toFixed(0)
    };
  });
  
  // Sort by emissions per seat-km (ICAO standard efficiency metric)
  const sortedByEfficiency = [...aircraftEmissions].sort(
    (a, b) => parseFloat(a.emissionsPerSeatKm) - parseFloat(b.emissionsPerSeatKm)
  );
  
  // Calculate average emissions according to ICAO methodology
  const totalSeatKmEmissions = aircraftEmissions.reduce((sum, a) => sum + parseFloat(a.emissionsPerSeatKm), 0);
  const averageSeatKmEmissions = (totalSeatKmEmissions / aircraftEmissions.length).toFixed(7);
  
  // Calculate industry benchmark based on ICAO fleet average
  // This is a simplified approach - ICAO maintains detailed fleet averages by aircraft category
  const icaoBenchmark = (distance < 500) ? 0.00000140 : 
                       (distance < 1500) ? 0.00000115 :
                       (distance < 3000) ? 0.00000100 : 0.00000095;
  
  // Add percentages above/below average and ICAO benchmark
  const withPercentages = sortedByEfficiency.map(aircraft => {
    const percentFromAverage = ((parseFloat(aircraft.emissionsPerSeatKm) / parseFloat(averageSeatKmEmissions) - 1) * 100).toFixed(1);
    const percentFromICAOBenchmark = ((parseFloat(aircraft.emissionsPerSeatKm) / icaoBenchmark - 1) * 100).toFixed(1);
    
    return {
      ...aircraft,
      percentFromAverage: percentFromAverage,
      percentFromICAOBenchmark: percentFromICAOBenchmark
    };
  });
  
  return {
    allAircraft: withPercentages.map(a => ({
      registration: a.registration,
      model: a.model,
      emissions: a.emissionsPerKm,
      emissionsPerSeat: a.emissionsPerSeatKm,
      emissionsPerPassenger: a.emissionsPerPassengerKm,
      totalEmissions: a.totalEmissions,
      capacity: a.capacity,
      percentFromAverage: a.percentFromAverage,
      percentFromICAOBenchmark: a.percentFromICAOBenchmark,
      fuelConsumption: a.fuelConsumption
    })),
    mostEfficient: withPercentages.slice(0, 5).map(a => ({
      registration: a.registration,
      model: a.model,
      emissions: a.emissionsPerKm,
      emissionsPerSeat: a.emissionsPerSeatKm,
      totalEmissions: a.totalEmissions,
      capacity: a.capacity,
      percentFromAverage: a.percentFromAverage,
      percentFromICAOBenchmark: a.percentFromICAOBenchmark
    })),
    leastEfficient: withPercentages.slice(-5).reverse().map(a => ({
      registration: a.registration,
      model: a.model,
      emissions: a.emissionsPerKm,
      emissionsPerSeat: a.emissionsPerSeatKm,
      totalEmissions: a.totalEmissions,
      capacity: a.capacity,
      percentFromAverage: a.percentFromAverage,
      percentFromICAOBenchmark: a.percentFromICAOBenchmark
    })),
    average: averageSeatKmEmissions,
    icaoBenchmark: icaoBenchmark.toFixed(9),
    chartData: withPercentages.map(a => ({
      name: a.model,
      registration: a.registration,
      emissions: parseFloat(a.emissionsPerKm),
      emissionsPerSeat: parseFloat(a.emissionsPerSeatKm),
      percentFromAverage: parseFloat(a.percentFromAverage),
      percentFromICAOBenchmark: parseFloat(a.percentFromICAOBenchmark)
    }))
  };
}

  // Calculate load factor and adjust emissions
  function calculateLoadFactorAdjustment(passengers, aircraftModel) {
    const capacity = aircraftCapacity[aircraftModel] || 150;
    const loadFactor = Math.min(passengers / capacity, 1); // Cap at 100%
    
    // ICAO methodology suggests that about 80% of emissions are fixed
    // regardless of passenger count
    const fixedEmissionsRatio = 0.80; // 80% fixed emissions
    const variableEmissionsRatio = 0.20; // 20% variable based on load
    
    return fixedEmissionsRatio + (variableEmissionsRatio * loadFactor);
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
  function getEmissionsAdjustment(flightType) {
    const DISTANCE_EMISSIONS_ADJUSTMENT = {
      derby: 0.5,     // Ground transport is more efficient
      short: 1.3,     // Short flights have higher per-km emissions
      medium: 1.0,    // Medium flights are our baseline
      long: 0.9       // Long flights have lower per-km emissions
    };
    
    return DISTANCE_EMISSIONS_ADJUSTMENT[flightType];
  }
  const handleCalculate = () => {
    // Reset validation states
    setValidationErrors({});
    
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
    setShowSuccessMessage(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  
    // Simulate API calculation delay
    setTimeout(() => {
      // Calculate distance between airports using the same approach as icaoCalculations.ts
      const distance = calculateDistance(
        homeAirport.latitude, homeAirport.longitude,
        awayAirport.latitude, awayAirport.longitude
      );
      
      // Using constants and functions from icaoCalculations.ts
      const CALIBRATED_EMISSIONS_FACTOR = 0.0291; // tons CO2 per km (round trip)
      const flightType = determineFlightType(distance);
      
      // Calculate emissions
      let result;
      
      if (aircraftRegistration && aircraft_database[aircraftRegistration]) {
        // If aircraft is selected, use the detailed calculation method
        result = calculateEmissionsWithAircraft(
          distance, 
          isRoundTrip, 
          passengers, 
          aircraftRegistration,
          homeAirport,
          awayAirport
        );
      } else {
        // If no aircraft is selected, use the approach from icaoCalculations.ts
        result = calculateSportsEmissions(distance, isRoundTrip, passengers);
        
        // Add additional information to match the expected response format
        result.homeAirport = homeAirport;
        result.awayAirport = awayAirport;
        result.aircraft = null;
        
        // Add equivalencies
        result.equivalencies = {
          carsPerYear: Math.round(result.totalEmissions * 4.6),
          homeEnergyForDays: Math.round(result.totalEmissions * 120),
          smartphonesCharged: Math.round(result.totalEmissions * 121643),
          treesNeededForYear: Math.round(result.totalEmissions * 16.5),
          recycledWasteInKg: Math.round(result.totalEmissions * 1200),
          offsetCostUSD: Math.round(result.totalEmissions * 13.5)
        };
        
        result.methodology = "ICAO";
      }
      
      setResults(result);
      
      // Generate efficiency comparison data
      const comparison = getAircraftEfficiencyComparison(result.adjustedDistance);
      setEfficiencyComparison(comparison);
      
      setTimeout(() => {
        calculateFootballTeamAlternatives();
        setIsCalculating(false);
      }, 100);
    }, 800);
  };
  
  
  useEffect(() => {
    // calculateAlternatives();
    calculateFootballTeamAlternatives();
  }, [results]);
  // Enhanced alternatives calculator aligned with ICAO methodology
function calculateFootballTeamAlternatives() {
  if (!results) return;
  
  const distance = results.distanceKm;
  const teamSize = results.passengers;
  
  // Only show alternatives for distances where they make sense
  if (distance > 5000) {
    setAlternativeOptions(null);
    return;
  }
  
  // Updated emissions factors based on ICAO and other authoritative sources
  const teamAlternatives = [
    {
      mode: "Team Charter Bus",
      icon: "Bus",
      // Source: ICAO/DEFRA emissions factors for coach transport
      emissionsPerKm: 0.027, // kg CO2 per km per person
      timeHours: distance / 80, // Average speed 80 km/h
      applicable: distance < 1200,
      suitability: "High",
      benefits: "Door-to-door service, space for equipment, team bonding, flexible schedule",
      considerations: "Longer travel time, road conditions can affect journey"
    },
    {
      mode: "Team Train Charter",
      icon: "Train",
      // Source: ICAO/UIC/IEA rail emissions data
      emissionsPerKm: 0.016,
      timeHours: distance / 160,
      applicable: distance < 1500 && distance > 100,
      suitability: "Medium-High",
      benefits: "Lower emissions, comfortable for players, potential for team meetings en route",
      considerations: "Limited to train routes, requires transport to/from stations"
    },
    {
      mode: "High-Speed Rail",
      icon: "Train",
      // Source: UIC high-speed rail emissions data
      emissionsPerKm: 0.012,
      timeHours: distance / 250,
      applicable: distance < 2000 && distance > 200,
      suitability: "Medium",
      benefits: "Fastest ground transport, lower emissions, comfortable for players",
      considerations: "Limited availability, public exposure, fixed schedules"
    },
    {
      mode: "Electric Team Bus",
      icon: "Battery",
      // Source: ICAO/IEA electric vehicle emissions including electricity generation
      emissionsPerKm: 0.010,
      timeHours: distance / 80,
      applicable: distance < 800,
      suitability: "High",
      benefits: "Greatly reduced emissions, flexible, team branding opportunity",
      considerations: "Charging infrastructure, range limitations, higher initial cost"
    },
    {
      mode: "Biodiesel Team Bus",
      icon: "Leaf",
      // Source: ICAO/IPCC life-cycle biodiesel emissions
      emissionsPerKm: 0.019,
      timeHours: distance / 80,
      applicable: distance < 1200,
      suitability: "Medium-High", 
      benefits: "Lower emissions than standard diesel, maintains flexibility",
      considerations: "Fuel availability, potential for sustainable local sourcing"
    },
    {
      mode: "Commercial Train + Local Transport",
      icon: "Train",
      // Source: ICAO/UIC combined transport emissions
      emissionsPerKm: 0.020,
      timeHours: distance / 140,
      applicable: distance < 1200 && distance > 100,
      suitability: "Medium",
      benefits: "Lower emissions, public transport network advantage",
      considerations: "Public exposure, less flexible, equipment logistics challenges"
    },
    {
      mode: "Sustainable Aviation Fuel Flight",
      icon: "Plane",
      // Source: ICAO CORSIA SAF emission reduction data (30% reduction from conventional)
      emissionsPerKm: results.emissionsPerKm * 0.7,
      timeHours: (distance / 800) + 3,
      applicable: distance > 700,
      suitability: "Medium-Low",
      benefits: "Maintains speed advantage, newer more efficient aircraft, SAF reduces emissions",
      considerations: "Still relatively high emissions, limited SAF availability"
    },
    {
      mode: "Multi-Modal Travel Plan",
      icon: "RotateCw",
      // Weighted average of multiple modes based on ICAO methodology
      emissionsPerKm: 0.025,
      timeHours: distance / 120,
      applicable: distance < 3000 && distance > 400,
      suitability: "Medium",
      benefits: "Optimizes each segment of journey, potentially lower total emissions",
      considerations: "Complexity of coordinating multiple modes, more transfer points"
    }
  ];
  
  // Filter applicable options
  let applicableOptions = teamAlternatives.filter(option => option.applicable);
  
  // Ensure we always have at least 3 options if possible
  if (applicableOptions.length < 3) {
    applicableOptions = teamAlternatives
      .sort((a, b) => a.emissionsPerKm - b.emissionsPerKm)
      .slice(0, Math.min(3, teamAlternatives.length));
  }
  
  // Calculate emissions with ICAO methodology
  const optionsWithEmissions = applicableOptions.map(option => {
    const totalDistanceWithMultiplier = distance * (results.isRoundTrip ? 2 : 1);
    
    // Apply distance category adjustments for different transport modes
    // Based on ICAO intermodal transport guidance
    let distanceMultiplier = 1.0;
    if (option.mode.includes("Bus") || option.mode.includes("Car")) {
      // Road transport usually follows longer routes than straight-line distance
      distanceMultiplier = 1.2;
    } else if (option.mode.includes("Train")) {
      // Train routes are typically 5-15% longer than straight-line distance
      distanceMultiplier = 1.1;
    }
    
    const adjustedDistance = totalDistanceWithMultiplier * distanceMultiplier;
    
    // Calculate total emissions for the alternative, converting to tonnes
    const alternativeEmissions = (option.emissionsPerKm * adjustedDistance * teamSize) / 1000;
    
    // Compare to current flying emissions
    const currentEmissions = results.totalEmissions;
    const savingsPercent = Math.round(100 - (alternativeEmissions / currentEmissions * 100));
    
    // Calculate CO2 savings in tonnes
    const co2Savings = parseFloat((currentEmissions - alternativeEmissions).toFixed(2));
    
    // Calculate carbon equivalencies for this alternative
    const treesPlanted = Math.round(co2Savings * 16.5);
    const homeEnergyDays = Math.round(alternativeEmissions * 120);
    
    // Calculate cost impact based on ICAO carbon pricing methodology
    const carbonPrice = 85; // USD per tonne - ICAO CORSIA average carbon price
    const costSavingsUSD = Math.round(co2Savings * carbonPrice);
    
    return {
      ...option,
      totalEmissions: alternativeEmissions.toFixed(2),
      co2Savings: co2Savings,
      savingsPercent: savingsPercent,
      travelTime: Math.round(option.timeHours * 10) / 10,
      totalTimeDifference: Math.round((option.timeHours - (distance / 800 + 3)) * 10) / 10,
      planningSuggestions: generatePlanningTips(option.mode, distance, teamSize),
      treesEquivalent: treesPlanted,
      homeEnergyEquivalent: homeEnergyDays,
      adjustedDistance: adjustedDistance.toFixed(0),
      carbonCostSavingsUSD: costSavingsUSD
    };
  });
  
  // Sort by emissions savings
  const sortedOptions = optionsWithEmissions.sort((a, b) => b.savingsPercent - a.savingsPercent);
  
  setAlternativeOptions(sortedOptions);
}
  
  // Generate team-specific planning tips
  function generatePlanningTips(mode, distance, teamSize) {
    const tips = {
      "Team Charter Bus": [
        "Schedule driver changes for longer journeys to comply with regulations",
        "Plan for team meals and rest stops every 2-3 hours",
        "Consider overnight travel for distances over 500km to maximize recovery time",
        "Arrange secure parking for equipment at destination"
      ],
      "Team Train Charter": [
        "Book entire carriages or sections to maintain team privacy",
        "Arrange equipment transport separately if needed",
        "Schedule team meetings or video analysis during journey",
        "Coordinate with stations for streamlined arrival/departure"
      ],
      "High-Speed Rail": [
        "Book tickets well in advance to ensure team seating together",
        "Arrange private transfer from station to accommodation/venue",
        "Consider first class for more space and privacy"
      ],
      "Electric Team Bus": [
        "Plan charging stops along route",
        "Map out backup charging locations",
        "Consider overnight charging at team hotel",
        "Verify vehicle range matches route requirements"
      ],
      "Biodiesel Team Bus": [
        "Source fuel in advance at strategic points",
        "Partner with local sustainable fuel providers",
        "Calculate and offset remaining carbon footprint"
      ],
      "Commercial Train + Local Transport": [
        "Book quieter travel times to reduce public exposure",
        "Arrange equipment transport separately",
        "Pre-book local transport from stations"
      ],
      "Sustainable Flight Options": [
        "Select newer, more efficient aircraft where possible",
        "Choose direct flights to reduce takeoff/landing emissions",
        "Consider carbon offset programs specific to sports teams",
        "Time flights to reduce overnight stays"
      ],
      "Hybrid Travel Plan": [
        "Create detailed logistics plan with all connection points",
        "Designate contingency plans for each transition",
        "Split team travel if beneficial for preparation"
      ]
    };
    
    // Get the basic tips for the mode
    const modeTips = tips[mode] || ["Plan route in advance", "Consider team recovery needs"];
    
    // Add distance-specific tips
    let distanceTips = [];
    if (distance < 300) {
      distanceTips = ["Consider same-day travel", "Reduce pre-travel preparation time"];
    } else if (distance < 800) {
      distanceTips = ["Plan for one full travel day", "Schedule light training upon arrival"];
    } else {
      distanceTips = ["Allow recovery day after travel", "Consider impact on training schedule"];
    }
    
    // Add team size tips
    let sizeTips = [];
    if (teamSize > 40) {
      sizeTips = ["Consider splitting travel group for more flexibility"];
    }
    
    return [...modeTips, ...distanceTips, ...sizeTips].slice(0, 4); // Return a maximum of 4 tips
  }
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

  function applyRouteCorrection(distance, flightType) {
    const ROUTE_INEFFICIENCY = {
      derby: 1.0,     // No correction for ground transport
      short: 1.13,    // 13% extra for short flights
      medium: 1.08,   // 8% extra for medium flights
      long: 1.05      // 5% extra for long flights
    };
    
    return distance * ROUTE_INEFFICIENCY[flightType];
  }
  function convertFlightTypeFormat(flightType) {
    switch(flightType) {
      case "derby": return "Derby Match";
      case "short": return "Short Flight";
      case "medium": return "Medium Flight";
      case "long": return "Long Flight";
      default: return flightType;
    }
  }  
  function getDefaultCapacity(flightType) {
    switch(flightType) {
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
  
  function calculateSportsEmissions(distance, isRoundTrip = true, passengers = 150) {
    // Constants from icaoCalculations.ts
    const CALIBRATED_EMISSIONS_FACTOR = 0.0291; // tons CO2 per km (round trip)
    
    // Determine flight type
    const flightType = determineFlightType(distance);
    
    // Apply route correction based on flight type
    const adjustedDistance = applyRouteCorrection(distance, flightType);
    
    // Get emissions adjustment factor for this flight type
    const emissionsAdjustment = getEmissionsAdjustment(flightType);
    
    // Add default capacity based on flight type
    const defaultCapacity = getDefaultCapacity(flightType);
    
    // Calculate load factor and adjustment
    const loadFactor = Math.min(passengers / defaultCapacity, 1);
    const loadFactorAdjustment = calculateDefaultLoadFactorAdjustment(loadFactor);
    
    // Calculate base emissions rate per km for this flight type
    const baseEmissionsPerKm = CALIBRATED_EMISSIONS_FACTOR * emissionsAdjustment;
    
    // Apply load factor adjustment to get actual emissions per km
    const emissionsPerKm = baseEmissionsPerKm * loadFactorAdjustment;
    
    // Calculate one-way emissions
    let totalEmissions = adjustedDistance * emissionsPerKm;
    
    // Apply RFI factor
    const rfi = calculateRFI(flightType);
    totalEmissions *= rfi;
    
    // Account for round trip if needed
    const finalDistance = isRoundTrip ? distance * 2 : distance;
    const finalAdjustedDistance = isRoundTrip ? adjustedDistance * 2 : adjustedDistance;
    
    if (isRoundTrip) {
      totalEmissions *= 2;
    }
    
    // Calculate per-passenger emissions
    const emissionsPerPassenger = totalEmissions / passengers;
    
    return {
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
      co2Factor: 3.16 // Standard ICAO conversion factor
    };
  }
  function calculateEmissionsWithAircraft(
    distance, 
    isRoundTrip, 
    passengers, 
    aircraftRegistration,
    homeAirport,
    awayAirport
  ) {
    const aircraft = aircraft_database[aircraftRegistration];
    const flightType = determineFlightType(distance);
    const adjustedDistance = applyRouteCorrection(distance, flightType);
    
    // Get aircraft model details
    const aircraftModel = aircraft.model;
    const capacity = aircraftCapacity[aircraftModel] || 150;
    
    // Calculate load factor adjustment
    const loadFactorAdjustment = calculateLoadFactorAdjustment(passengers, aircraftModel);
    
    // Calculate fuel burn using ICAO method
    const totalFuelKg = calculateFuelBurn(aircraft, adjustedDistance, flightType);
    
    // Convert fuel to emissions using ICAO standard factor
    const co2Factor = 3.16; // ICAO standard: 3.16 kg CO2 per kg of jet fuel
    const rawEmissions = totalFuelKg * co2Factor / 1000; // tonnes
    
    // Calculate per-km emissions
    const baseEmissionsPerKm = rawEmissions / adjustedDistance;
    const emissionsPerKm = baseEmissionsPerKm * loadFactorAdjustment;
    
    // Apply RFI factor
    const rfi = calculateRFI(flightType);
    let totalEmissions = emissionsPerKm * adjustedDistance * rfi;
    
    // Account for round trip
    const finalDistance = isRoundTrip ? distance * 2 : distance;
    const finalAdjustedDistance = isRoundTrip ? adjustedDistance * 2 : adjustedDistance;
    
    if (isRoundTrip) {
      totalEmissions *= 2;
    }
    
    // Calculate per-passenger emissions
    const emissionsPerPassenger = totalEmissions / passengers;
    
    // Calculate equivalencies
    const equivalencies = {
      carsPerYear: Math.round(totalEmissions * 4.6),
      homeEnergyForDays: Math.round(totalEmissions * 120),
      smartphonesCharged: Math.round(totalEmissions * 121643),
      treesNeededForYear: Math.round(totalEmissions * 16.5),
      recycledWasteInKg: Math.round(totalEmissions * 1200),
      offsetCostUSD: Math.round(totalEmissions * 13.5)
    };
    
    return {
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
      loadFactor: passengers / capacity,
      loadFactorAdjustment,
      radiativeForcingIndex: rfi,
      co2Factor,
      aircraft: {
        registration: aircraftRegistration,
        model: aircraftModel
      },
      homeAirport,
      awayAirport,
      equivalencies,
      methodology: "ICAO"
    };
  }
  
  function calculateFuelBurn(aircraft, adjustedDistance, flightType) {
    let fuelBurnRateAdjusted = aircraft.fuel_burn_rate_kg_per_hour;
    const cruisingSpeed = aircraftCruisingSpeeds[aircraft.model] || 800;
    
    // LTO fuel consumption (kg) - varies by aircraft size
    let ltoFuel;
    if (aircraft.model.includes("737") || aircraft.model.includes("321")) {
      ltoFuel = 850; // Narrowbody jets
    } else if (aircraft.model.includes("ERJ") || aircraft.model.includes("Dornier")) {
      ltoFuel = 550; // Regional jets
    } else if (aircraft.model.includes("ATR") || aircraft.model.includes("Saab")) {
      ltoFuel = 300; // Turboprops
    } else if (aircraft.model.includes("King Air")) {
      ltoFuel = 120; // Small turboprops
    } else if (aircraft.model.includes("Global") || aircraft.model.includes("Bombardier")) {
      ltoFuel = 700; // Business jets
    } else {
      ltoFuel = 600; // Default
    }
    
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
  
  // Enhanced for football team specific UI rendering
function renderTeamTravelOptionCard(option) {
  return (
    <div className="border rounded-lg p-4 mb-4 bg-gray-800/50 shadow-sm">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
          {getIconForMode(option.mode)}
        </div>
        <div>
          <h3 className="font-bold text-lg text-blue-400">{option.mode}</h3>
          <div className="flex items-center">
            <span className={`text-sm px-2 py-0.5 rounded ${getSuitabilityColor(option.suitability)}`}>
              {option.suitability} Suitability
            </span>
            <span className="text-sm text-gray-300 ml-2">{option.travelTime} hours</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm text-gray-400">Total Emissions</p>
          <p className="font-semibold">{option.totalEmissions} tonnes CO₂</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Savings vs. Flying</p>
          <p className={`font-semibold ${option.savingsPercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {option.savingsPercent > 0 ? '-' : '+'}{Math.abs(option.savingsPercent)}%
          </p>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-sm font-medium mb-1">Benefits</p>
        <p className="text-sm text-gray-400">{option.benefits}</p>
      </div>
      
      <div className="mb-3">
        <p className="text-sm font-medium mb-1">Considerations</p>
        <p className="text-sm text-gray-400">{option.considerations}</p>
      </div>
      
      <div>
        <p className="text-sm font-medium mb-1">Planning Tips</p>
        <ul className="text-sm text-gray-400">
          {option.planningSuggestions.map((tip, index) => (
            <li key={index} className="mb-1 flex items-start">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1 mt-0.5" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
  // Helper function to get suitability color
function getSuitabilityColor(suitability) {
  switch(suitability) {
    case "High": return "bg-green-100 text-green-800";
    case "Medium-High": return "bg-teal-100 text-teal-800";
    case "Medium": return "bg-blue-100 text-blue-800";
    case "Medium-Low": return "bg-yellow-100 text-yellow-800";
    case "Low": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

// Helper to get the appropriate icon for each mode
function getIconForMode(mode) {
  switch(mode) {
    case "Team Charter Bus": return <Bus className="h-6 w-6 text-blue-600" />;
    case "Team Train Charter": return <Train className="h-6 w-6 text-green-600" />;
    case "High-Speed Rail": return <Train className="h-6 w-6 text-teal-600" />;
    case "Electric Team Bus": return <Battery className="h-6 w-6 text-green-600" />;
    case "Biodiesel Team Bus": return <Leaf className="h-6 w-6 text-green-600" />;
    case "Commercial Train + Local Transport": return <Train className="h-6 w-6 text-blue-600" />;
    case "Sustainable Flight Options": return <Plane className="h-6 w-6 text-blue-600" />;
    case "Hybrid Travel Plan": return <RotateCw className="h-6 w-6 text-purple-600" />;
    default: return <Bus className="h-6 w-6 text-blue-600" />;
  }
}

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-white">Aircraft Emissions Calculator</h1>
        <p className="text-gray-400">Calculate and compare carbon emissions for team travel</p>
      </div>
      {(Object.keys(validationErrors).length > 0 || showSuccessMessage) && (
  <div className={`mb-4 p-4 rounded-lg ${Object.keys(validationErrors).length > 0 ? 'bg-red-900/30 border border-red-800' : 'bg-green-900/30 border border-green-800'}`}>
    {Object.keys(validationErrors).length > 0 ? (
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-red-400">Please fix the following issues:</p>
          <ul className="list-disc list-inside mt-1 space-y-1 text-sm text-gray-300">
            {Object.values(validationErrors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </div>
    ) : showSuccessMessage && (
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
        <p className="font-medium text-green-400">Calculating emissions...</p>
      </div>
    )}
  </div>
)}
      {/* Main Calculator Card */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden">
        {/* Form Section */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Home Airport */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <PlaneTakeoff className="mr-2 h-4 w-4 text-emerald-500" />
                <span>Home Airport</span>
              </label>
              <div className="relative">
              <select 
  className={`w-full p-3 pr-10 bg-gray-800 border ${validationErrors.homeAirport || validationErrors.sameAirport ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-700'} rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500`}
  value={homeAirport?.id || ""}
  onChange={(e) => setHomeAirport(airports.find(a => a.id === e.target.value) || null)}
>
  <option value="">Select Home Airport</option>
  {airports.map(airport => (
    <option key={airport.id} value={airport.id}>
      {airport.name} ({airport.id}) - {airport.country}
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
            </div>
            
            {/* Away Airport */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <PlaneLanding className="mr-2 h-4 w-4 text-emerald-500" />
                <span>Away Airport</span>
              </label>
              <div className="relative">
              <select 
  className={`w-full p-3 pr-10 bg-gray-800 border ${validationErrors.awayAirport || validationErrors.sameAirport ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-700'} rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500`}
  value={awayAirport?.id || ""}
  onChange={(e) => setAwayAirport(airports.find(a => a.id === e.target.value) || null)}
>
  <option value="">Select Away Airport</option>
  {airports.map(airport => (
    <option key={airport.id} value={airport.id}>
      {airport.name} ({airport.id}) - {airport.country}
    </option>
  ))}
</select>
{validationErrors.awayAirport && (
  <p className="mt-1 text-xs text-red-500 flex items-center">
    <AlertCircle className="h-3 w-3 mr-1" />
    {validationErrors.awayAirport}
  </p>
)}
{validationErrors.sameAirport && (
  <p className="mt-1 text-xs text-red-500 flex items-center">
    <AlertCircle className="h-3 w-3 mr-1" />
    {validationErrors.sameAirport}
  </p>
)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Number of Passengers */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Users className="mr-2 h-4 w-4 text-emerald-500" />
                <span>Number of Passengers</span>
              </label>
              <input 
  type="number" 
  className={`w-full p-3 bg-gray-800 border ${validationErrors.passengers ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-700'} rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500`}
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
            
            {/* Aircraft Registration */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <Plane className="mr-2 h-4 w-4 text-emerald-500" />
                <span>Aircraft</span>
              </label>
              <select 
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                value={aircraftRegistration}
                onChange={(e) => setAircraftRegistration(e.target.value)}
              >
                <option value="">Select Aircraft (Optional)</option>
                {Object.entries(aircraft_database).map(([registration, data]) => (
                  <option key={registration} value={registration}>
                    {registration} - {data.model}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Round Trip Option */}
            <div className="flex items-end">
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
          </div>

          {/* Calculate Button */}
          <button 
            className="flex items-center justify-center w-full md:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg shadow hover:from-emerald-700 hover:to-emerald-800 focus:ring-4 focus:ring-emerald-500/50 transition-all duration-200 disabled:opacity-70"
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
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

        {/* Results Section */}
        {results && (
          <div className="border-t border-gray-800">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-emerald-500" />
                Emissions Results
              </h2>
              
              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Trip Info */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-300 mb-3">Trip Details</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-400">Distance:</span>
                      <span className="font-medium text-white">{results.distanceKm.toFixed(2)} km</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Flight Type:</span>
                      <span className="font-medium text-white capitalize">{results.flightType}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Trip Type:</span>
                      <span className="font-medium text-white">{results.isRoundTrip ? "Round Trip" : "One Way"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Route Adjustment:</span>
                      <span className="font-medium text-white">{((results.adjustedDistance / results.distanceKm - 1) * 100).toFixed(0)}%</span>
                    </li>
                  </ul>
                </div>
                
                {/* Emissions Info */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-300 mb-3">Emissions Data</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-gray-400">Base Emissions Rate:</span>
                      <span className="font-medium text-white">{(results.baseEmissionsPerKm * 1000).toFixed(2)} kg CO₂/km</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Adjusted Distance:</span>
                      <span className="font-medium text-white">{results.adjustedDistance.toFixed(2)} km</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Total Passengers:</span>
                      <span className="font-medium text-white">{results.passengers}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Load Factor:</span>
                      <span className="font-medium text-white">{(results.loadFactor * 100).toFixed(1)}%</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-400">Per Passenger:</span>
                      <span className="font-medium text-white">{(results.totalEmissions / results.passengers).toFixed(2)} tonnes</span>
                    </li>
                  </ul>
                </div>
                
                {/* Summary */}
                <div className="bg-gradient-to-br from-emerald-900/50 to-gray-800 rounded-lg p-4 flex flex-col">
                  <h3 className="font-medium text-emerald-300 mb-3">Emissions Summary</h3>
                  <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className="text-3xl font-bold text-white mb-1">{results.totalEmissions.toFixed(2)}</div>
                    <div className="text-sm text-emerald-300 mb-4">tonnes CO₂</div>
                    
                    {results.aircraft && (
                      <div className="text-xs text-gray-400 bg-gray-800/50 rounded-full px-3 py-1">
                        {results.aircraft.registration} ({results.aircraft.model})
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Efficiency Comparison */}
        {efficiencyComparison && (
          <div className="border-t border-gray-800">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <BarChart4 className="mr-2 h-5 w-5 text-emerald-500" />
                Aircraft Efficiency Comparison
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Most Efficient */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-emerald-400 mb-3">Most Efficient Aircraft</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="py-2 text-left text-gray-400 font-medium">Registration</th>
                          <th className="py-2 text-left text-gray-400 font-medium">Model</th>
                          <th className="py-2 text-right text-gray-400 font-medium">kg CO₂/km</th>
                        </tr>
                      </thead>
                      <tbody>
                        {efficiencyComparison.mostEfficient.map((aircraft, index) => (
                          <tr key={index} className="border-b border-gray-700/50">
                            <td className="py-2 text-gray-300">{aircraft.registration}</td>
                            <td className="py-2 text-gray-300">{aircraft.model}</td>
                            <td className="py-2 text-right font-medium text-emerald-400">{(aircraft.emissions * 1000).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Least Efficient */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-medium text-red-400 mb-3">Least Efficient Aircraft</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="py-2 text-left text-gray-400 font-medium">Registration</th>
                          <th className="py-2 text-left text-gray-400 font-medium">Model</th>
                          <th className="py-2 text-right text-gray-400 font-medium">kg CO₂/km</th>
                        </tr>
                      </thead>
                      <tbody>
                        {efficiencyComparison.leastEfficient.map((aircraft, index) => (
                          <tr key={index} className="border-b border-gray-700/50">
                            <td className="py-2 text-gray-300">{aircraft.registration}</td>
                            <td className="py-2 text-gray-300">{aircraft.model}</td>
                            <td className="py-2 text-right font-medium text-red-400">{(aircraft.emissions * 1000).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-800/30 rounded-lg p-4 text-center">
                <span className="text-gray-400">Average Emissions: </span>
                <span className="font-medium text-white">{(efficiencyComparison.average * 1000).toFixed(2)} kg CO₂/km</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Offset Recommendation Card - Optional addition */}
      {results && (
        <div className="bg-gradient-to-r from-emerald-900/30 to-gray-900 rounded-xl border border-emerald-800/50 p-6">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-emerald-800/40 rounded-lg mr-4">
              <Leaf className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Carbon Offset Recommendation</h3>
              <p className="text-gray-400 text-sm">Based on your calculated emissions</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-emerald-300 font-medium mb-1">Estimated offset cost:</p>
              <p className="text-3xl font-bold text-white">£{(results.totalEmissions * 25).toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">Based on average price of £25 per tonne CO₂</p>
            </div>
            
            <button 
  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow transition-colors"
  onClick={() => setShowOffsetOptions(!showOffsetOptions)}
>
  {showOffsetOptions ? "Hide Offset Options" : "View Offset Options"}
</button>
          </div>
          {showOffsetOptions && (
  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h4 className="font-medium text-emerald-400 mb-2">Tree Planting</h4>
      <p className="text-gray-300 text-sm mb-3">Plant {Math.ceil(results.totalEmissions * 10)} trees to offset your carbon footprint.</p>
      {/* <button className="w-full py-2 bg-emerald-700/50 hover:bg-emerald-700 text-white text-sm rounded transition-colors">
        Select This Option
      </button> */}
    </div>
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h4 className="font-medium text-emerald-400 mb-2">Renewable Energy</h4>
      <p className="text-gray-300 text-sm mb-3">Invest in wind and solar projects to balance your emissions.</p>
      {/* <button className="w-full py-2 bg-emerald-700/50 hover:bg-emerald-700 text-white text-sm rounded transition-colors">
        Select This Option
      </button> */}
    </div>
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h4 className="font-medium text-emerald-400 mb-2">Community Projects</h4>
      <p className="text-gray-300 text-sm mb-3">Support carbon reduction initiatives in local communities.</p>
      {/* <button className="w-full py-2 bg-emerald-700/50 hover:bg-emerald-700 text-white text-sm rounded transition-colors">
        Select This Option
      </button> */}
    </div>
  </div>
)}
{/* Alternative Transportation Options */}

        </div>
      )}
      {alternativeOptions && alternativeOptions.length > 0 && (
  <div className="bg-gradient-to-r from-blue-900/30 to-gray-900 rounded-xl border border-blue-800/50 p-6">
    <div className="flex items-center mb-4">
      <div className="p-2 bg-blue-800/40 rounded-lg mr-4">
        <RotateCw className="h-6 w-6 text-blue-400" />
      </div>
      <div>
        <h3 className="font-bold text-white">Alternative Transportation Options</h3>
        <p className="text-gray-400 text-sm">Lower emission alternatives for your journey</p>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {alternativeOptions.map((option, index) => (
        renderTeamTravelOptionCard(option)
        // <div key={index} className="bg-gray-800/50 rounded-lg p-4">
        //   <h4 className="font-medium text-blue-400 mb-2">{option.mode}</h4>
        //   <div className="space-y-2 text-sm mb-3">
        //     <div className="flex justify-between">
        //       <span className="text-gray-400">Emissions:</span>
        //       <span className="font-medium text-white">{option.totalEmissions} tonnes</span>
        //     </div>
        //     <div className="flex justify-between">
        //       <span className="text-gray-400">Savings:</span>
        //       <span className="font-medium text-green-400">{option.savingsPercent.toFixed(0)}%</span>
        //     </div>
        //     <div className="flex justify-between">
        //       <span className="text-gray-400">Travel Time:</span>
        //       <span className="font-medium text-white">{option.timeHours.toFixed(1)} hours</span>
        //     </div>
        //   </div>
        //   {/* <button className="w-full py-2 bg-blue-700/50 hover:bg-blue-700 text-white text-sm rounded transition-colors">
        //     Explore This Option
        //   </button> */}
        // </div>
      ))}
      {/* {renderTeamTravelOptionCard()} */}
    </div>
  </div>
)}
    </div>
  );
};

export default EmissionsCalculator;