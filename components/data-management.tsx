"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DownloadCloud, Upload, RefreshCw, CheckCircle, AlertTriangle,
  Database, Globe, FileText, Copy, Search, Filter, Play, Plane,
  Calendar,
  PlusCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CustomAutocomplete } from "@/components/ui/custom-autocomplete"
import { format } from "date-fns";
import { DatePicker } from "./ui/date-picker";

// TheSportsDB API key - Free tier
const SPORTSDB_API_KEY = "594392"; // Replace with your API key

const DataManagement = ({ supabase, onAddSeason }) => {
  const [selectedTeam, setSelectedTeam] = useState([]);
  // State for API key configuration
  const [apiKey, setApiKey] = useState(SPORTSDB_API_KEY);
  const [selectedTeams, setSelectedTeams] = useState([]);
  // Tab and operation state
  const [activeTab, setActiveTab] = useState("leagues");
  const [operation, setOperation] = useState("fetch");

  // Data fetch state
  const [leagues, setLeagues] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [airports, setAirports] = useState([]);

  // Selected items state
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);


  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Comparison results
  const [comparisonResults, setComparisonResults] = useState({
    leagues: { new: [], existing: [], different: [] },
    seasons: { new: [], existing: [], different: [] },
    teams: { new: [], existing: [], different: [] },
    matches: { new: [], existing: [], different: [] },
    airports: { new: [], existing: [], different: [] }
  });

  // File import/export state
  const [fileContent, setFileContent] = useState(null);
  const [fileType, setFileType] = useState("csv");
  // const [exportData, setExportData] = useState(null);

  // Dialogs state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: "", message: "", onConfirm: null });
  const [apiInfoDialog, setApiInfoDialog] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("add"); // 'add' or 'edit'
  const [seasonForm, setSeasonForm] = useState({
    season_id: "",
    start_date: "",
    end_date: "",
  });
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endYear, setEndYear] = useState(new Date().getFullYear() + 1);

  // Airport lookup state
  const [airportLookupDialog, setAirportLookupDialog] = useState(false);
  const [airportSearchTerm, setAirportSearchTerm] = useState("");
  const [airportSearchResults, setAirportSearchResults] = useState([]);
  const [openFlightsData, setOpenFlightsData] = useState(null);
  const [teamsWithoutAirports, setTeamsWithoutAirports] = useState([]);

  // Initialize component
  useEffect(() => {
    // Fetch OpenFlights data
    fetchOpenFlightsData();

    // Check teams without airports
    checkTeamsWithoutAirports();
  }, []);

  // Fetch OpenFlights data
  const fetchOpenFlightsData = async () => {
    try {
      setLoadingMessage("Fetching airport data...");
      setIsLoading(true);

      const response = await fetch('https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat');
      if (!response.ok) throw new Error("Failed to fetch OpenFlights data");

      const data = await response.text();

      // Parse OpenFlights data
      const parsedData = data.split('\n').map(line => {
        const parts = line.split(',').map(part => part.replace(/"/g, ''));
        if (parts.length >= 8) {
          return {
            id: parts[0],
            name: parts[1],
            city: parts[2],
            country: parts[3],
            iata: parts[4],
            icao: parts[5],
            latitude: parseFloat(parts[6]),
            longitude: parseFloat(parts[7])
          };
        }
        return null;
      }).filter(airport => airport !== null && airport.iata && airport.iata.length === 3);

      setOpenFlightsData(parsedData);
      setSuccess("Airport data loaded successfully");
    } catch (error) {
      console.error("Error fetching OpenFlights data:", error);
      setError(`Failed to fetch airport data: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Check teams without airports
  const checkTeamsWithoutAirports = async () => {
    try {
      setLoadingMessage("Checking teams without airports...");
      setIsLoading(true);

      // Get all teams
      const { data: allTeams, error: teamsError } = await supabase
        .from('teams')
        .select('team_id, name, city, country');

      if (teamsError) throw teamsError;

      // Get all airports
      const { data: allAirports, error: airportsError } = await supabase
        .from('airports')
        .select('team_id');

      if (airportsError) throw airportsError;

      // Find teams without airports
      const teamsWithoutAirport = allTeams.filter(team =>
        !allAirports.some(airport => airport.team_id === team.team_id)
      );

      setTeamsWithoutAirports(teamsWithoutAirport);

      if (teamsWithoutAirport.length > 0) {
        setSuccess(`Found ${teamsWithoutAirport.length} teams without airport data`);
      } else {
        setSuccess("All teams have airport data");
      }
    } catch (error) {
      console.error("Error checking teams without airports:", error);
      setError(`Failed to check teams without airports: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Fetch leagues from TheSportsDB
  // const fetchLeagues = async () => {
  //   try {
  //     setLoadingMessage("Fetching leagues...");
  //     setIsLoading(true);
  //     setError(null);

  //     const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/all_leagues.php`);

  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch leagues: ${response.status} ${response.statusText}`);
  //     }

  //     const data = await response.json();

  //     // Filter for soccer/football leagues
  //     const footballLeagues = data.leagues
  //       ? data.leagues.filter(league => league.strSport.toLowerCase() === "soccer")
  //       : [];

  //     // Format leagues to match our schema
  //     const formattedLeagues = footballLeagues.map(league => ({
  //       league_id: parseInt(league.idLeague),
  //       name: league.strLeague,
  //       country: league.strCountry
  //     }));

  //     setLeagues(formattedLeagues);
  //     setSuccess(`Successfully fetched ${formattedLeagues.length} football leagues`);

  //     // Compare with existing leagues in Supabase
  //     await compareLeaguesWithDatabase(formattedLeagues);
  //   } catch (error) {
  //     console.error("Error fetching leagues:", error);
  //     setError(`Failed to fetch leagues: ${error.message}`);
  //   } finally {
  //     setIsLoading(false);
  //     setLoadingMessage("");
  //   }
  // };

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
      // toast.error("Failed to load league data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeagues()
  }, [])

  // Compare fetched leagues with database
  const compareLeaguesWithDatabase = async (fetchedLeagues) => {
    try {
      setLoadingMessage("Comparing leagues with database...");

      // Get existing leagues from Supabase
      const { data: existingLeagues, error } = await supabase
        .from('leagues')
        .select('league_id, name, country');

      if (error) throw error;

      // Create map for quick lookup
      const existingLeaguesMap = {};
      existingLeagues.forEach(league => {
        existingLeaguesMap[league.league_id] = league;
      });

      // Compare and categorize
      const newLeagues = [];
      const existingLeaguesFound = [];
      const differentLeagues = [];

      fetchedLeagues.forEach(fetchedLeague => {
        const existingLeague = existingLeaguesMap[fetchedLeague.league_id];

        if (!existingLeague) {
          newLeagues.push(fetchedLeague);
        } else {
          existingLeaguesFound.push(existingLeague);

          // Check if there are differences
          if (
            fetchedLeague.name !== existingLeague.name ||
            fetchedLeague.country !== existingLeague.country
          ) {
            differentLeagues.push({
              fetched: fetchedLeague,
              existing: existingLeague
            });
          }
        }
      });

      // Update comparison results
      setComparisonResults({
        ...comparisonResults,
        leagues: {
          new: newLeagues,
          existing: existingLeaguesFound,
          different: differentLeagues
        }
      });

      setSuccess(`Comparison complete. Found ${newLeagues.length} new, ${existingLeaguesFound.length} existing, and ${differentLeagues.length} different leagues`);
    } catch (error) {
      console.error("Error comparing leagues:", error);
      setError(`Failed to compare leagues: ${error.message}`);
    }
  };

  // Fetch seasons for a league (Set Default Seasons)
  const fetchSeasons = async (leagueId) => {
    try {
      if (!leagueId) {
        setError("Please select a league first");
        return;
      }

      setLoadingMessage(`Fetching seasons for league ${leagueId}...`);
      setIsLoading(true);
      setError(null);

      const response = await fetch(`https://www.thesportsdb.com/api/v2/json/${apiKey}/list/seasons/${leagueId}`);

      if (!response.ok) {
        // Handle error, use default seasons if API fails
        console.warn(`Failed to fetch seasons: ${response.status}. Using default seasons.`);
        setSeasons(getDefaultSeasons());
        return;
      }

      const data = await response.json();

      if (!data.seasons || data.seasons.length === 0) {
        setSeasons(getDefaultSeasons());
        setSuccess("Using default seasons (API returned no data)");
        return;
      }

      // Format seasons to match our schema
      const formattedSeasons = data.seasons.map(season => ({
        season_id: season.strSeason,
        // Estimate start/end dates based on season format (e.g., "2023-2024")
        start_date: estimateSeasonDates(season.strSeason).start,
        end_date: estimateSeasonDates(season.strSeason).end
      }));

      setSeasons(formattedSeasons);
      setSuccess(`Successfully fetched ${formattedSeasons.length} seasons`);

      // Compare with existing seasons in Supabase
      await compareSeasonsWithDatabase(formattedSeasons);
    } catch (error) {
      console.error("Error fetching seasons:", error);
      setError(`Failed to fetch seasons: ${error.message}`);

      // Use default seasons as fallback
      setSeasons(getDefaultSeasons());
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Fetch seasons data from supabase
  const fetchLeagueSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .select('season_id, start_date, end_date');

      if (error) throw error;
      setSeasons(data || []);
    } catch (error) {
      console.error("Error fetching league seasons:", error);
    }
  };

  useEffect(() => {
    fetchLeagueSeasons();
  }, []);

  // Get default seasons (fallback)
  const getDefaultSeasons = () => {
    const currentYear = new Date().getFullYear();
    const seasons = [];

    for (let i = 0; i < 5; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 1;
      const seasonId = `${startYear}-${endYear}`;

      seasons.push({
        season_id: seasonId,
        start_date: `${startYear}-07-01`, // July 1st
        end_date: `${endYear}-05-31` // May 31st
      });
    }

    return seasons;
  };

  // Estimate season dates from season ID
  const estimateSeasonDates = (seasonId) => {
    // Parse season format (e.g., "2023-2024")
    const years = seasonId.split('-');

    if (years.length === 2) {
      const startYear = parseInt(years[0]);
      const endYear = parseInt(years[1]);

      if (!isNaN(startYear) && !isNaN(endYear)) {
        return {
          start: `${startYear}-07-01`, // Typical season start - July 1st
          end: `${endYear}-05-31` // Typical season end - May 31st
        };
      }
    }

    // Fallback for single-year seasons or unparseable formats
    return {
      start: `${seasonId}-01-01`,
      end: `${seasonId}-12-31`
    };
  };

  // Compare seasons with database
  const compareSeasonsWithDatabase = async (fetchedSeasons) => {
    try {
      setLoadingMessage("Comparing seasons with database...");

      // Get existing seasons from Supabase
      const { data: existingSeasons, error } = await supabase
        .from('seasons')
        .select('season_id, start_date, end_date');

      if (error) throw error;

      // Create map for quick lookup
      const existingSeasonsMap = {};
      existingSeasons.forEach(season => {
        existingSeasonsMap[season.season_id] = season;
      });

      // Compare and categorize
      const newSeasons = [];
      const existingSeasonsFound = [];
      const differentSeasons = [];

      fetchedSeasons.forEach(fetchedSeason => {
        const existingSeason = existingSeasonsMap[fetchedSeason.season_id];

        if (!existingSeason) {
          newSeasons.push(fetchedSeason);
        } else {
          existingSeasonsFound.push(existingSeason);

          // Check if there are differences
          if (
            fetchedSeason.start_date !== existingSeason.start_date ||
            fetchedSeason.end_date !== existingSeason.end_date
          ) {
            differentSeasons.push({
              fetched: fetchedSeason,
              existing: existingSeason
            });
          }
        }
      });

      // Update comparison results
      setComparisonResults({
        ...comparisonResults,
        seasons: {
          new: newSeasons,
          existing: existingSeasonsFound,
          different: differentSeasons
        }
      });

      setSuccess(`Comparison complete. Found ${newSeasons.length} new, ${existingSeasonsFound.length} existing, and ${differentSeasons.length} different seasons`);
    } catch (error) {
      console.error("Error comparing seasons:", error);
      setError(`Failed to compare seasons: ${error.message}`);
    }
  };

  // Fetch matches for a league and season
  const fetchMatches = async (leagueId, seasonId) => {
    try {
      if (!leagueId || !seasonId) {
        setError("Please select both league and season");
        return;
      }

      setLoadingMessage(`Fetching matches for league ${leagueId}, season ${seasonId}...`);
      setIsLoading(true);
      setError(null);

      const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/eventsseason.php?id=${leagueId}&s=${seasonId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch matches: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.events || data.events.length === 0) {
        setError("No matches found for selected league and season");
        setMatches([]);
        return;
      }

      // Fetch team details for these matches
      const teamIds = new Set();
      data.events.forEach(match => {
        if (match.idHomeTeam) teamIds.add(match.idHomeTeam);
        if (match.idAwayTeam) teamIds.add(match.idAwayTeam);
      });

      const teamDetails = await fetchTeamDetails(Array.from(teamIds));

      // Format matches to match our schema
      const formattedMatches = data.events.map(match => {
        const homeTeam = teamDetails[match.idHomeTeam] || {
          name: match.strHomeTeam || "Unknown",
          city: "Unknown",
          country: "Unknown",
          stadium: "Unknown"
        };

        const awayTeam = teamDetails[match.idAwayTeam] || {
          name: match.strAwayTeam || "Unknown",
          city: "Unknown",
          country: "Unknown",
          stadium: "Unknown"
        };

        return {
          match_id: parseInt(match.idEvent),
          date: match.dateEvent || new Date().toISOString().split('T')[0],
          league_id: parseInt(leagueId),
          season_id: seasonId,
          home_team_id: parseInt(match.idHomeTeam),
          home_team: homeTeam.name,
          away_team_id: parseInt(match.idAwayTeam),
          away_team: awayTeam.name,
          home_city: homeTeam.city,
          away_city: awayTeam.city,
          stadium: homeTeam.stadium,
          country: homeTeam.country
        };
      });

      setMatches(formattedMatches);
      setSuccess(`Successfully fetched ${formattedMatches.length} matches`);

      // Set teams found in these matches
      const uniqueTeams = Array.from(teamIds).map(id => teamDetails[id]).filter(team => team);
      setTeams(uniqueTeams);

      // Compare with existing data
      await compareMatchesAndTeamsWithDatabase(formattedMatches, uniqueTeams);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError(`Failed to fetch matches: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Fetch team details (batch)
  const fetchTeamDetails = async (teamIds) => {
    const teamDetailsMap = {};
    setLoadingMessage(`Fetching details for ${teamIds.length} teams...`);

    // Process in small batches to avoid API rate limits
    const batchSize = 5;
    let processed = 0;

    for (let i = 0; i < teamIds.length; i += batchSize) {
      const batch = teamIds.slice(i, i + batchSize);

      await Promise.all(batch.map(async (teamId) => {
        try {
          const response = await fetch(`https://www.thesportsdb.com/api/v1/json/${apiKey}/lookupteam.php?id=${teamId}`);

          if (!response.ok) {
            console.warn(`Failed to fetch team ${teamId}: ${response.status}`);
            return;
          }

          const data = await response.json();

          if (!data.teams || data.teams.length === 0) {
            console.warn(`No data found for team ${teamId}`);
            return;
          }

          const team = data.teams[0];

          // Format team to match our schema
          teamDetailsMap[teamId] = {
            team_id: parseInt(team.idTeam),
            name: team.strTeam,
            city: team.strStadiumLocation || team.strLocation || "Unknown",
            country: team.strCountry || "Unknown",
            stadium: team.strStadium || "Unknown",
            capacity: team.intStadiumCapacity ? parseInt(team.intStadiumCapacity) : null,
            founded: team.intFormedYear ? parseInt(team.intFormedYear) : null
          };

          processed++;
          setProgressValue(Math.floor((processed / teamIds.length) * 100));
        } catch (error) {
          console.error(`Error fetching team ${teamId}:`, error);
        }
      }));

      // Add a small delay between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return teamDetailsMap;
  };

  // Compare matches and teams with database
  const compareMatchesAndTeamsWithDatabase = async (fetchedMatches, fetchedTeams) => {
    try {
      setLoadingMessage("Comparing data with database...");

      // Check existing matches
      const { data: existingMatches, error: matchesError } = await supabase
        .from('matches')
        .select('match_id, date, league_id, season_id, home_team_id, away_team_id')
        .eq('league_id', fetchedMatches[0]?.league_id)
        .eq('season_id', fetchedMatches[0]?.season_id);

      if (matchesError) throw matchesError;

      // Create maps for quick lookup
      const existingMatchesMap = {};
      existingMatches.forEach(match => {
        existingMatchesMap[match.match_id] = match;
      });

      // Compare matches
      const newMatches = [];
      const existingMatchesFound = [];
      const differentMatches = [];

      fetchedMatches.forEach(fetchedMatch => {
        const existingMatch = existingMatchesMap[fetchedMatch.match_id];

        if (!existingMatch) {
          newMatches.push(fetchedMatch);
        } else {
          existingMatchesFound.push(existingMatch);

          // Check for differences (simplified)
          if (
            fetchedMatch.date !== existingMatch.date ||
            fetchedMatch.home_team_id !== existingMatch.home_team_id ||
            fetchedMatch.away_team_id !== existingMatch.away_team_id
          ) {
            differentMatches.push({
              fetched: fetchedMatch,
              existing: existingMatch
            });
          }
        }
      });

      // Check existing teams
      const teamIds = fetchedTeams.map(team => team.team_id);

      const { data: existingTeams, error: teamsError } = await supabase
        .from('teams')
        .select('team_id, name, city, country, stadium, capacity, founded')
        .in('team_id', teamIds);

      if (teamsError) throw teamsError;

      // Create map for teams
      const existingTeamsMap = {};
      existingTeams.forEach(team => {
        existingTeamsMap[team.team_id] = team;
      });

      // Compare teams
      const newTeams = [];
      const existingTeamsFound = [];
      const differentTeams = [];

      fetchedTeams.forEach(fetchedTeam => {
        const existingTeam = existingTeamsMap[fetchedTeam.team_id];

        if (!existingTeam) {
          newTeams.push(fetchedTeam);
        } else {
          existingTeamsFound.push(existingTeam);

          // Check for differences
          if (
            fetchedTeam.name !== existingTeam.name ||
            fetchedTeam.city !== existingTeam.city ||
            fetchedTeam.country !== existingTeam.country ||
            fetchedTeam.stadium !== existingTeam.stadium
          ) {
            differentTeams.push({
              fetched: fetchedTeam,
              existing: existingTeam
            });
          }
        }
      });

      // Update comparison results
      setComparisonResults({
        ...comparisonResults,
        matches: {
          new: newMatches,
          existing: existingMatchesFound,
          different: differentMatches
        },
        teams: {
          new: newTeams,
          existing: existingTeamsFound,
          different: differentTeams
        }
      });

      setSuccess(`Comparison complete. Found ${newMatches.length} new matches and ${newTeams.length} new teams`);
    } catch (error) {
      console.error("Error comparing with database:", error);
      setError(`Failed to compare with database: ${error.message}`);
    }
  };

  // Find airport for a team by city and country
  const findAirportForTeam = (team) => {
    if (!openFlightsData) return null;

    // Try to find by city name
    const cityMatches = openFlightsData.filter(airport =>
      airport?.city?.toLowerCase().includes(team?.city?.toLowerCase()) ||
      team?.city?.toLowerCase().includes(airport?.city?.toLowerCase())
    );

    // If multiple matches, try to filter by country
    if (cityMatches.length > 1) {
      const countryMatches = cityMatches.filter(airport =>
        airport?.country?.toLowerCase().includes(team?.country?.toLowerCase()) ||
        team?.country?.toLowerCase().includes(airport?.country?.toLowerCase())
      );

      if (countryMatches.length > 0) {
        return countryMatches[0];
      }
    }

    // Return first city match if any
    if (cityMatches.length > 0) {
      return cityMatches[0];
    }

    return null;
  };

  // Search airports by term
  const searchAirports = (term) => {
    if (!term || !openFlightsData) return [];

    const searchTerm = term.toLowerCase();

    return openFlightsData.filter(airport =>
      airport.name.toLowerCase().includes(searchTerm) ||
      airport.city.toLowerCase().includes(searchTerm) ||
      airport.country.toLowerCase().includes(searchTerm) ||
      airport.iata.toLowerCase().includes(searchTerm)
    ).slice(0, 20); // Limit to 20 results
  };

  // Import team_seasons based on teams, league, and season
  const createTeamSeasons = async (teams, leagueId, seasonId) => {
    try {
      if (!teams || teams.length === 0 || !leagueId || !seasonId) {
        setError("Missing required data for team_seasons");
        return;
      }

      setLoadingMessage("Creating team_seasons relationships...");
      setIsLoading(true);

      const teamSeasons = teams.map(team => ({
        team_id: team.team_id,
        league_id: parseInt(leagueId),
        season_id: seasonId
      }));

      // Check existing team_seasons
      const { data: existingTeamSeasons, error: checkError } = await supabase
        .from('team_seasons')
        .select('team_id, league_id, season_id')
        .eq('league_id', leagueId)
        .eq('season_id', seasonId);

      if (checkError) throw checkError;

      // Filter out existing relationships
      const existingMap = {};
      existingTeamSeasons.forEach(ts => {
        existingMap[`${ts.team_id}-${ts.league_id}-${ts.season_id}`] = true;
      });

      const newTeamSeasons = teamSeasons.filter(ts =>
        !existingMap[`${ts.team_id}-${ts.league_id}-${ts.season_id}`]
      );

      if (newTeamSeasons.length === 0) {
        setSuccess("All team_seasons relationships already exist");
        return;
      }

      // Insert new team_seasons
      const { error: insertError } = await supabase
        .from('team_seasons')
        .insert(newTeamSeasons);

      if (insertError) throw insertError;

      setSuccess(`Created ${newTeamSeasons.length} new team_seasons relationships`);
    } catch (error) {
      console.error("Error creating team_seasons:", error);
      setError(`Failed to create team_seasons: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Create league_season relationship
  const createLeagueSeason = async (leagueId, seasonId, matchCount) => {
    try {
      if (!leagueId || !seasonId) {
        setError("Missing required data for league_season");
        return;
      }

      setLoadingMessage("Creating league_season relationship...");
      setIsLoading(true);

      // Check if relationship already exists
      const { data: existing, error: checkError } = await supabase
        .from('league_seasons')
        .select('*')
        .eq('league_id', leagueId)
        .eq('season_id', seasonId)
        .maybeSingle();

      if (checkError) throw checkError;

      const totalMatches = matchCount || 0;

      if (existing) {
        // Update existing relationship
        const { error: updateError } = await supabase
          .from('league_seasons')
          .update({ total_matches: totalMatches })
          .eq('league_id', leagueId)
          .eq('season_id', seasonId);

        if (updateError) throw updateError;

        setSuccess("Updated existing league_season relationship");
      } else {
        // Create new relationship
        const { error: insertError } = await supabase
          .from('league_seasons')
          .insert({
            league_id: parseInt(leagueId),
            season_id: seasonId,
            total_matches: totalMatches
          });

        if (insertError) throw insertError;

        setSuccess("Created new league_season relationship");
      }
    } catch (error) {
      console.error("Error managing league_season:", error);
      setError(`Failed to manage league_season: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Save data to Supabase
  const saveToSupabase = async (dataType) => {
    try {
      setLoadingMessage(`Saving ${dataType} to database...`);
      setIsLoading(true);

      const dataToSave = comparisonResults[dataType].new;

      if (dataToSave.length === 0) {
        setSuccess(`No new ${dataType} to save`);
        return;
      }

      // Insert data
      const { error } = await supabase
        .from(dataType)
        .insert(dataToSave);

      if (error) throw error;

      setSuccess(`Successfully saved ${dataToSave.length} new ${dataType}`);

      // Handle different data type side effects
      if (dataType === 'leagues') {
        // Refresh comparison after saving
        await compareLeaguesWithDatabase(leagues);
      } else if (dataType === 'seasons') {
        await compareSeasonsWithDatabase(seasons);
      } else if (dataType === 'teams') {
        await compareMatchesAndTeamsWithDatabase(matches, teams);

        // Create team_seasons relationships
        if (selectedLeague && selectedSeason) {
          await createTeamSeasons(dataToSave, selectedLeague.league_id, selectedSeason.season_id);
        }
      } else if (dataType === 'matches') {
        await compareMatchesAndTeamsWithDatabase(matches, teams);

        // Update league_season relationship with match count
        if (selectedLeague && selectedSeason) {
          await createLeagueSeason(selectedLeague.league_id, selectedSeason.season_id, dataToSave.length);
        }
      }
    } catch (error) {
      console.error(`Error saving ${dataType}:`, error);
      setError(`Failed to save ${dataType}: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Update team with airport data
  const updateTeamWithAirport = async (team, airport) => {
    try {
      setLoadingMessage(`Adding airport data for ${team.name}...`);
      setIsLoading(true);

      // Check if airport with same IATA code already exists
      const { data: existingAirport, error: checkError } = await supabase
        .from('airports')
        .select('*')
        .eq('iata_code', airport.iata)
        .maybeSingle();

      if (checkError) throw checkError;

      // If airport exists, just link it to this team
      if (existingAirport) {
        const { error: insertError } = await supabase
          .from('airports')
          .insert({
            team_id: team.team_id,
            iata_code: airport.iata,
            airport_name: existingAirport.airport_name,
            latitude: existingAirport.latitude,
            longitude: existingAirport.longitude
          });

        if (insertError) throw insertError;

        setSuccess(`Linked existing airport ${airport.iata} to team ${team.name}`);
      } else {
        // Create new airport
        const { error: insertError } = await supabase
          .from('airports')
          .insert({
            team_id: team.team_id,
            iata_code: airport.iata,
            airport_name: airport.name,
            latitude: airport.latitude,
            longitude: airport.longitude
          });

        if (insertError) throw insertError;

        setSuccess(`Added new airport ${airport.iata} for team ${team.name}`);
      }

      // Refresh teams without airports
      await checkTeamsWithoutAirports();
    } catch (error) {
      console.error("Error updating airport data:", error);
      setError(`Failed to update airport data: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Parse and import CSV/JSON data
  const importFromFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;

        if (file.name.endsWith('.csv')) {
          setFileType('csv');
          setFileContent(content);
          parseCSV(content);
        } else if (file.name.endsWith('.json')) {
          setFileType('json');
          setFileContent(content);
          parseJSON(content);
        } else {
          setError("Unsupported file type. Please use CSV or JSON files.");
        }
      } catch (error) {
        console.error("Error reading file:", error);
        setError(`Failed to read file: ${error.message}`);
      }
    };

    reader.readAsText(file);
  };

  // Parse CSV data
  const parseCSV = (csvContent) => {
    try {
      // Simple CSV parser
      const lines = csvContent.split('\n');
      if (lines.length <= 1) {
        setError("CSV file is empty or has only headers");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

      // Parse rows
      const parsedData = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const rowData = {};

        headers.forEach((header, index) => {
          rowData[header] = values[index];
        });

        parsedData.push(rowData);
      }

      // Detect data type based on headers
      detectAndProcessImportedData(parsedData, headers);
    } catch (error) {
      console.error("Error parsing CSV:", error);
      setError(`Failed to parse CSV: ${error.message}`);
    }
  };

  // Parse JSON data
  const parseJSON = (jsonContent) => {
    try {
      const parsedData = JSON.parse(jsonContent);

      if (!Array.isArray(parsedData)) {
        setError("JSON must contain an array of objects");
        return;
      }

      if (parsedData.length === 0) {
        setError("JSON array is empty");
        return;
      }

      // Get headers from first object
      const headers = Object.keys(parsedData[0]);

      // Detect data type based on headers
      detectAndProcessImportedData(parsedData, headers);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      setError(`Failed to parse JSON: ${error.message}`);
    }
  };

  // Detect data type and process imported data
  const detectAndProcessImportedData = (data, headers) => {
    // Check headers to determine data type
    if (headers.includes('team_id') && headers.includes('iata_code')) {
      setActiveTab('airports');
      processImportedAirports(data);
    } else if (headers.includes('league_id') && headers.includes('name') && !headers.includes('date')) {
      setActiveTab('leagues');
      processImportedLeagues(data);
    } else if (headers.includes('season_id') && headers.includes('start_date')) {
      setActiveTab('seasons');
      processImportedSeasons(data);
    } else if (headers.includes('team_id') && headers.includes('name') && headers.includes('city')) {
      setActiveTab('teams');
      processImportedTeams(data);
    } else if (headers.includes('match_id') && headers.includes('home_team')) {
      setActiveTab('matches');
      processImportedMatches(data);
    } else {
      setError("Could not determine data type from headers");
    }
  };

  // Process imported airports
  const processImportedAirports = async (data) => {
    try {
      setLoadingMessage("Processing imported airport data...");
      setIsLoading(true);

      // Format data to match schema
      const formattedAirports = data.map(item => ({
        team_id: parseInt(item.team_id),
        iata_code: item.iata_code,
        airport_name: item.airport_name,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude)
      }));

      setAirports(formattedAirports);

      // Compare with database
      const { data: existingAirports, error } = await supabase
        .from('airports')
        .select('team_id, iata_code, airport_name, latitude, longitude');

      if (error) throw error;

      // Create lookup map
      const existingMap = {};
      existingAirports.forEach(airport => {
        existingMap[`${airport.team_id}-${airport.iata_code}`] = airport;
      });

      // Compare
      const newAirports = [];
      const existingFound = [];
      const different = [];

      formattedAirports.forEach(airport => {
        const key = `${airport.team_id}-${airport.iata_code}`;
        const existing = existingMap[key];

        if (!existing) {
          newAirports.push(airport);
        } else {
          existingFound.push(existing);

          // Check for differences
          if (
            airport.airport_name !== existing.airport_name ||
            airport.latitude !== existing.latitude ||
            airport.longitude !== existing.longitude
          ) {
            different.push({
              fetched: airport,
              existing
            });
          }
        }
      });

      setComparisonResults({
        ...comparisonResults,
        airports: {
          new: newAirports,
          existing: existingFound,
          different
        }
      });

      setSuccess(`Processed ${formattedAirports.length} airports. Found ${newAirports.length} new airports.`);
    } catch (error) {
      console.error("Error processing airports:", error);
      setError(`Failed to process airports: ${error.message}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  // Process other imported data types
  const processImportedLeagues = async (data) => {
    try {
      const formattedLeagues = data.map(item => ({
        league_id: parseInt(item.league_id),
        name: item.name,
        country: item.country
      }));

      setLeagues(formattedLeagues);
      await compareLeaguesWithDatabase(formattedLeagues);
    } catch (error) {
      console.error("Error processing leagues:", error);
      setError(`Failed to process leagues: ${error.message}`);
    }
  };

  const processImportedSeasons = async (data) => {
    try {
      const formattedSeasons = data.map(item => ({
        season_id: item.season_id,
        start_date: item.start_date,
        end_date: item.end_date
      }));

      setSeasons(formattedSeasons);
      await compareSeasonsWithDatabase(formattedSeasons);
    } catch (error) {
      console.error("Error processing seasons:", error);
      setError(`Failed to process seasons: ${error.message}`);
    }
  };

  const processImportedTeams = async (data) => {
    try {
      const formattedTeams = data.map(item => ({
        team_id: parseInt(item.team_id),
        name: item.name,
        city: item.city,
        country: item.country,
        stadium: item.stadium,
        capacity: parseInt(item.capacity) || null,
        founded: parseInt(item.founded) || null
      }));

      setTeams(formattedTeams);

      // Compare with database
      const teamIds = formattedTeams.map(team => team.team_id);

      const { data: existingTeams, error } = await supabase
        .from('teams')
        .select('team_id, name, city, country, stadium, capacity, founded')
        .in('team_id', teamIds);

      if (error) throw error;

      const existingMap = {};
      existingTeams.forEach(team => {
        existingMap[team.team_id] = team;
      });

      const newTeams = [];
      const existingFound = [];
      const different = [];

      formattedTeams.forEach(team => {
        const existing = existingMap[team.team_id];

        if (!existing) {
          newTeams.push(team);
        } else {
          existingFound.push(existing);

          if (
            team.name !== existing.name ||
            team.city !== existing.city ||
            team.country !== existing.country ||
            team.stadium !== existing.stadium
          ) {
            different.push({
              fetched: team,
              existing
            });
          }
        }
      });

      setComparisonResults({
        ...comparisonResults,
        teams: {
          new: newTeams,
          existing: existingFound,
          different
        }
      });

      setSuccess(`Processed ${formattedTeams.length} teams. Found ${newTeams.length} new teams.`);
    } catch (error) {
      console.error("Error processing teams:", error);
      setError(`Failed to process teams: ${error.message}`);
    }
  };

  const processImportedMatches = async (data) => {
    try {
      const formattedMatches = data.map(item => ({
        match_id: parseInt(item.match_id),
        date: item.date,
        league_id: parseInt(item.league_id),
        season_id: item.season_id,
        home_team_id: parseInt(item.home_team_id),
        home_team: item.home_team,
        away_team_id: parseInt(item.away_team_id),
        away_team: item.away_team,
        home_city: item.home_city,
        away_city: item.away_city,
        stadium: item.stadium,
        country: item.country
      }));

      setMatches(formattedMatches);

      // Extract league and season info
      if (formattedMatches.length > 0) {
        const firstMatch = formattedMatches[0];
        setSelectedLeague({ league_id: firstMatch.league_id });
        setSelectedSeason({ season_id: firstMatch.season_id });
      }

      // Compare with database
      const { data: existingMatches, error } = await supabase
        .from('matches')
        .select('match_id, date, league_id, season_id, home_team_id, away_team_id');

      if (error) throw error;

      const existingMap = {};
      existingMatches.forEach(match => {
        existingMap[match.match_id] = match;
      });

      const newMatches = [];
      const existingFound = [];
      const different = [];

      formattedMatches.forEach(match => {
        const existing = existingMap[match.match_id];

        if (!existing) {
          newMatches.push(match);
        } else {
          existingFound.push(existing);

          if (
            match.date !== existing.date ||
            match.home_team_id !== existing.home_team_id ||
            match.away_team_id !== existing.away_team_id
          ) {
            different.push({
              fetched: match,
              existing
            });
          }
        }
      });

      setComparisonResults({
        ...comparisonResults,
        matches: {
          new: newMatches,
          existing: existingFound,
          different
        }
      });

      setSuccess(`Processed ${formattedMatches.length} matches. Found ${newMatches.length} new matches.`);
    } catch (error) {
      console.error("Error processing matches:", error);
      setError(`Failed to process matches: ${error.message}`);
    }
  };

  // Export data to CSV or JSON
  const exportData = (dataType, format) => {
    try {
      let dataToExport;

      switch (dataType) {
        case 'leagues':
          dataToExport = leagues;
          break;
        case 'seasons':
          dataToExport = seasons;
          break;
        case 'teams':
          dataToExport = teams;
          break;
        case 'matches':
          dataToExport = matches;
          break;
        case 'airports':
          dataToExport = airports;
          break;
        case 'teamsWithoutAirports':
          dataToExport = teamsWithoutAirports;
          break;
        default:
          setError(`Unknown data type: ${dataType}`);
          return;
      }

      if (!dataToExport || dataToExport.length === 0) {
        setError(`No ${dataType} data available to export`);
        return;
      }

      let content;
      let mimeType;
      let filename = `${dataType}_export_${new Date().toISOString().split('T')[0]}`;

      if (format === 'json') {
        content = JSON.stringify(dataToExport, null, 2);
        mimeType = 'application/json';
        filename += '.json';
      } else {
        // CSV format
        const headers = Object.keys(dataToExport[0]).join(',') + '\n';

        const rows = dataToExport.map(item => {
          return Object.values(item).map(value => {
            // Handle values with commas
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value === null ? '' : value;
          }).join(',');
        }).join('\n');

        content = headers + rows;
        mimeType = 'text/csv';
        filename += '.csv';
      }

      // Create download link
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(`Exported ${dataToExport.length} ${dataType} to ${format.toUpperCase()}`);
    } catch (error) {
      console.error(`Error exporting ${dataType}:`, error);
      setError(`Failed to export ${dataType}: ${error.message}`);
    }
  };

  // Export missing airports list
  const exportMissingAirports = () => {
    try {
      if (!teamsWithoutAirports || teamsWithoutAirports.length === 0) {
        setError("No teams without airports found");
        return;
      }

      // Create CSV content with headers for manual entry
      const headers = 'team_id,name,city,country,airport\n';

      const rows = teamsWithoutAirports.map(team => {
        const cityName = team.city || '';
        const countryName = team.country || '';
        return `${team.team_id},"${team.name.replace(/"/g, '""')}","${cityName.replace(/"/g, '""')}","${countryName.replace(/"/g, '""')}",`;
      }).join('\n');

      const content = headers + rows;

      // Create download link
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `teams_without_airports_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(`Exported ${teamsWithoutAirports.length} teams without airports to CSV`);
    } catch (error) {
      console.error("Error exporting missing airports:", error);
      setError(`Failed to export missing airports: ${error.message}`);
    }
  };

  // Format difference display
  const formatDifference = (item) => {
    if (!item || !item.fetched || !item.existing) return null;

    const diffs = [];

    // Get all keys from both objects
    const allKeys = new Set([...Object.keys(item.fetched), ...Object.keys(item.existing)]);

    // Find differences
    allKeys.forEach(key => {
      const fetchedValue = item.fetched[key];
      const existingValue = item.existing[key];

      if (fetchedValue !== existingValue) {
        diffs.push({
          key,
          fetched: fetchedValue,
          existing: existingValue
        });
      }
    });

    return diffs;
  };

  // Determine if the given tab should be disabled
  const isTabDisabled = (tabName) => {
    switch (tabName) {
      case 'leagues':
        return false; // Always available
      case 'seasons':
        return !selectedLeague;
      case 'matches':
        return !selectedLeague || !selectedSeason;
      case 'teams':
        return false; // Can be accessed directly
      case 'airports':
        return false; // Can be accessed directly
      default:
        return false;
    }
  };

  const openAddDialog = () => {
    console.log(`Hello open openDialog === ${openDialog}`)
    setDialogAction("add");
    setStartYear(new Date().getFullYear());
    setEndYear(new Date().getFullYear() + 1);
    setSeasonForm({
      season_id: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      start_date: format(new Date(new Date().getFullYear(), 6, 1), "yyyy-MM-dd"), // July 1st
      end_date: format(new Date(new Date().getFullYear() + 1, 4, 31), "yyyy-MM-dd"), // May 31st
    });
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (dialogAction === "add") {
      onAddSeason(seasonForm);
      fetchLeagueSeasons()
    }
    setOpenDialog(false);
    fetchLeagueSeasons()
  };

  const handleYearChange = (type, value) => {
    const numValue = parseInt(value);
    if (type === "start") {
      setStartYear(numValue);
      setEndYear(numValue + 1);
      setSeasonForm({
        ...seasonForm,
        season_id: `${numValue}-${numValue + 1}`,
      });
    } else {
      setEndYear(numValue);
      setSeasonForm({
        ...seasonForm,
        season_id: `${startYear}-${numValue}`,
      });
    }
  };

  const handleDateChange = (type, date) => {
    setSeasonForm({
      ...seasonForm,
      [type]: format(date, "yyyy-MM-dd"),
    });
  };

  const yearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  // UI for rendering the different tabs
  const renderLeaguesTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Fetch Leagues</CardTitle>
            <CardDescription>Fetch football leagues from TheSportsDB</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* <Button
                onClick={fetchLeagues}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}
                Fetch Football Leagues
              </Button> */}

              {leagues.length > 0 && (
                <div className="mt-4">
                  <Label htmlFor="league-autocomplete">Select a League</Label>
                  <CustomAutocomplete
                    options={leagues.map((league) => ({
                      value: league.league_id.toString(),
                      label: `${league.name} (${league.country})`,
                    }))}
                    placeholder="Search leagues..."
                    onValueChange={(option) => {
                      const league = leagues.find(
                        (l) => l.league_id.toString() === option?.value
                      );
                      setSelectedLeague(league);
                      if (league) fetchLeagueSeasons(league.league_id);
                    }}
                    inputClassName="w-full bg-gray-800 border-gray-700 text-white"
                    dropdownClassName="bg-gray-800 border border-gray-700 text-white"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Import/Export</CardTitle>
            <CardDescription>Import or export league data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('fileInput').click()}
                  disabled={isLoading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import File
                </Button>
                <input
                  id="fileInput"
                  type="file"
                  accept=".csv,.json"
                  className="hidden"
                  onChange={importFromFile}
                />

                <Button
                  variant="outline"
                  onClick={() => exportData('leagues', 'csv')}
                  disabled={isLoading || leagues.length === 0}
                >
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              {comparisonResults.leagues.new.length > 0 && (
                <Button
                  onClick={() => saveToSupabase('leagues')}
                  disabled={isLoading}
                  className="w-full mt-4"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Save {comparisonResults.leagues.new.length} New Leagues to Database
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Results */}
      {(comparisonResults.leagues.new.length > 0 ||
        comparisonResults.leagues.different.length > 0) && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Comparison Results</CardTitle>
              <CardDescription>
                {comparisonResults.leagues.new.length} new, {comparisonResults.leagues.existing.length} existing,
                {comparisonResults.leagues.different.length} different leagues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {comparisonResults.leagues.new.length > 0 && (
                  <AccordionItem value="new">
                    <AccordionTrigger className="text-green-400">
                      {comparisonResults.leagues.new.length} New Leagues
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-gray-800 border-gray-700">
                              <TableHead>League ID</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Country</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {comparisonResults.leagues.new.map(league => (
                              <TableRow key={league.league_id} className="hover:bg-gray-800 border-gray-700">
                                <TableCell>{league.league_id}</TableCell>
                                <TableCell>{league.name}</TableCell>
                                <TableCell>{league.country}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {comparisonResults.leagues.different.length > 0 && (
                  <AccordionItem value="different">
                    <AccordionTrigger className="text-yellow-400">
                      {comparisonResults.leagues.different.length} Different Leagues
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-gray-800 border-gray-700">
                              <TableHead>League ID</TableHead>
                              <TableHead>Field</TableHead>
                              <TableHead>API Value</TableHead>
                              <TableHead>Database Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {comparisonResults.leagues.different.flatMap(diff =>
                              formatDifference(diff).map((fieldDiff, i) => (
                                <TableRow key={`${diff.fetched.league_id}-${fieldDiff.key}`} className="hover:bg-gray-800 border-gray-700">
                                  {i === 0 && (
                                    <TableCell rowSpan={formatDifference(diff).length}>
                                      {diff.fetched.league_id}
                                    </TableCell>
                                  )}
                                  <TableCell>{fieldDiff.key}</TableCell>
                                  <TableCell className="text-green-400">{fieldDiff.fetched}</TableCell>
                                  <TableCell className="text-yellow-400">{fieldDiff.existing}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        )}
    </div>
  );

  const renderSeasonsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Fetch Seasons</CardTitle>
            <CardDescription>Fetch seasons for selected league</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedLeague ? (
                <>
                  <div className="p-3 rounded bg-gray-800 border border-gray-700">
                    <h3 className="font-semibold">Selected League</h3>
                    <p className="text-sm text-gray-400">
                      {selectedLeague.name} ({selectedLeague.country})
                    </p>
                  </div>

                  <Button
                    onClick={() => fetchLeagueSeasons(selectedLeague.league_id)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
                    Fetch Seasons
                  </Button>

                  {seasons.length > 0 && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Select a Season</Label>
                        <Button onClick={openAddDialog} size="sm">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Season
                        </Button>
                      </div>
                      <Select
                        onValueChange={(value) => {
                          const season = seasons.find(s => s.season_id === value);
                          setSelectedSeason(season);
                        }}
                      >
                        <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                          <SelectValue placeholder="Select a season" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          {seasons.map(season => (
                            <SelectItem key={season.season_id} value={season.season_id}>
                              {season.season_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-gray-400 border border-gray-700 rounded">
                  Please select a league first
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Import/Export</CardTitle>
            <CardDescription>Import or export season data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('fileInput').click()}
                  disabled={isLoading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import File
                </Button>

                <Button
                  variant="outline"
                  onClick={() => exportData('seasons', 'csv')}
                  disabled={isLoading || seasons.length === 0}
                >
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              {comparisonResults.seasons.new.length > 0 && (
                <Button
                  onClick={() => saveToSupabase('seasons')}
                  disabled={isLoading}
                  className="w-full mt-4"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Save {comparisonResults.seasons.new.length} New Seasons to Database
                </Button>
              )}

              {selectedLeague && selectedSeason && (
                <Button
                  onClick={() => createLeagueSeason(selectedLeague.league_id, selectedSeason.season_id, matches.length)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full mt-2"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Create League-Season Relationship
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Results */}
      {(comparisonResults.seasons.new.length > 0 ||
        comparisonResults.seasons.different.length > 0) && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Comparison Results</CardTitle>
              <CardDescription>
                {comparisonResults.seasons.new.length} new, {comparisonResults.seasons.existing.length} existing,
                {comparisonResults.seasons.different.length} different seasons
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                {comparisonResults.seasons.new.length > 0 && (
                  <AccordionItem value="new">
                    <AccordionTrigger className="text-green-400">
                      {comparisonResults.seasons.new.length} New Seasons
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-gray-800 border-gray-700">
                              <TableHead>Season ID</TableHead>
                              <TableHead>Start Date</TableHead>
                              <TableHead>End Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {comparisonResults.seasons.new.map(season => (
                              <TableRow key={season.season_id} className="hover:bg-gray-800 border-gray-700">
                                <TableCell>{season.season_id}</TableCell>
                                <TableCell>{season.start_date}</TableCell>
                                <TableCell>{season.end_date}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {comparisonResults.seasons.different.length > 0 && (
                  <AccordionItem value="different">
                    <AccordionTrigger className="text-yellow-400">
                      {comparisonResults.seasons.different.length} Different Seasons
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-gray-800 border-gray-700">
                              <TableHead>Season ID</TableHead>
                              <TableHead>Field</TableHead>
                              <TableHead>API Value</TableHead>
                              <TableHead>Database Value</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {comparisonResults.seasons.different.flatMap(diff =>
                              formatDifference(diff).map((fieldDiff, i) => (
                                <TableRow key={`${diff.fetched.season_id}-${fieldDiff.key}`} className="hover:bg-gray-800 border-gray-700">
                                  {i === 0 && (
                                    <TableCell rowSpan={formatDifference(diff).length}>
                                      {diff.fetched.season_id}
                                    </TableCell>
                                  )}
                                  <TableCell>{fieldDiff.key}</TableCell>
                                  <TableCell className="text-green-400">{fieldDiff.fetched}</TableCell>
                                  <TableCell className="text-yellow-400">{fieldDiff.existing}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        )}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "add" ? "Add New Season" : "Edit Season"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="season_years">Season Years</Label>
              <div className="flex gap-2 items-center">
                <select
                  className="bg-gray-800 text-white p-2 rounded-md border border-gray-700"
                  value={startYear}
                  onChange={(e) => handleYearChange("start", e.target.value)}
                >
                  {yearOptions().map((year) => (
                    <option key={`start-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <span>-</span>
                <select
                  className="bg-gray-800 text-white p-2 rounded-md border border-gray-700"
                  value={endYear}
                  onChange={(e) => handleYearChange("end", e.target.value)}
                >
                  {yearOptions().map((year) => (
                    <option key={`end-${year}`} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-400">
                Season ID: {seasonForm.season_id}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <div className="flex items-center">
                <DatePicker
                  id="start_date"
                  date={seasonForm.start_date ? new Date(seasonForm.start_date) : new Date()}
                  onSelect={(date) => handleDateChange("start_date", date)}
                />
                <Calendar className="h-4 w-4 ml-2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <div className="flex items-center">
                <DatePicker
                  id="end_date"
                  date={seasonForm.end_date ? new Date(seasonForm.end_date) : new Date()}
                  onSelect={(date) => handleDateChange("end_date", date)}
                />
                <Calendar className="h-4 w-4 ml-2 text-gray-400" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {dialogAction === "add" ? "Add Season" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );



  const renderMatchesTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Fetch Matches</CardTitle>
            <CardDescription>Fetch matches for selected league and season</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedLeague && selectedSeason ? (
                <>
                  <div className="p-3 rounded bg-gray-800 border border-gray-700">
                    <h3 className="font-semibold">Selected League & Season</h3>
                    <p className="text-sm text-gray-400">
                      {selectedLeague.name} - {selectedSeason.season_id}
                    </p>
                  </div>

                  <Button
                    onClick={() => fetchMatches(selectedLeague.league_id, selectedSeason.season_id)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {loadingMessage} {progressValue > 0 && `(${progressValue}%)`}
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Fetch Matches & Teams
                      </>
                    )}
                  </Button>

                  {progressValue > 0 && (
                    <Progress value={progressValue} className="h-2 bg-gray-700" />
                  )}

                  {matches.length > 0 && (
                    <div className="p-3 rounded bg-gray-800 border border-gray-700 mt-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Match Summary</h3>
                        <Badge variant="outline" className="bg-gray-700">
                          {matches.length} matches
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Found {teams.length} teams in these matches
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 text-center text-gray-400 border border-gray-700 rounded">
                  Please select a league and season first
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Import/Export</CardTitle>
            <CardDescription>Import or export match data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('fileInput').click()}
                  disabled={isLoading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import File
                </Button>

                <Button
                  variant="outline"
                  onClick={() => exportData('matches', 'csv')}
                  disabled={isLoading || matches.length === 0}
                >
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              {comparisonResults.matches.new.length > 0 && (
                <Button
                  onClick={() => saveToSupabase('matches')}
                  disabled={isLoading}
                  className="w-full mt-4"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Save {comparisonResults.matches.new.length} New Matches to Database
                </Button>
              )}

              {selectedLeague && selectedSeason && matches.length > 0 && (
                <Button
                  onClick={() => createLeagueSeason(selectedLeague.league_id, selectedSeason.season_id, matches.length)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full mt-2"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Update League-Season Match Count
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Match Count Summary */}
      {matches.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Matches Summary</CardTitle>
            <CardDescription>
              Found {comparisonResults.matches.new.length} new, {comparisonResults.matches.existing.length} existing,
              {comparisonResults.matches.different.length} different matches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded bg-gray-800 border border-gray-700">
                  <h3 className="font-semibold text-sm text-gray-400">New Matches</h3>
                  <p className="text-2xl font-bold">{comparisonResults.matches.new.length}</p>
                </div>

                <div className="p-3 rounded bg-gray-800 border border-gray-700">
                  <h3 className="font-semibold text-sm text-gray-400">Teams</h3>
                  <p className="text-2xl font-bold">{teams.length}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {comparisonResults.teams.new.length} new teams found
                  </p>
                </div>
              </div>

              {comparisonResults.teams.new.length > 0 && (
                <Button
                  onClick={() => saveToSupabase('teams')}
                  disabled={isLoading}
                  className="w-full mt-2"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Save {comparisonResults.teams.new.length} New Teams to Database
                </Button>
              )}

              {teams.length > 0 && selectedLeague && selectedSeason && (
                <Button
                  onClick={() => createTeamSeasons(teams, selectedLeague.league_id, selectedSeason.season_id)}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full mt-2"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Create Team-Season Relationships
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTeamsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Team Management</CardTitle>
            <CardDescription>Import teams or fetch from API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('fileInput').click()}
                  disabled={isLoading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import File
                </Button>

                <Button
                  variant="outline"
                  onClick={() => exportData('teams', 'csv')}
                  disabled={isLoading || teams.length === 0}
                >
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              {comparisonResults.teams.new.length > 0 && (
                <Button
                  onClick={() => saveToSupabase('teams')}
                  disabled={isLoading}
                  className="w-full mt-4"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Save {comparisonResults.teams.new.length} New Teams to Database
                </Button>
              )}

              {teams.length > 0 && (
                <div className="p-3 rounded bg-gray-800 border border-gray-700 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Team Summary</h3>
                    <Badge variant="outline" className="bg-gray-700">
                      {teams.length} teams
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {comparisonResults.teams.new.length} new, {comparisonResults.teams.existing.length} existing,
                    {comparisonResults.teams.different.length} different teams
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Missing Airport Data</CardTitle>
            <CardDescription>Teams that need airport information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={checkTeamsWithoutAirports}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plane className="mr-2 h-4 w-4" />}
                Check Teams Without Airports
              </Button>

              {teamsWithoutAirports.length > 0 && (
                <>
                  <div className="p-3 rounded bg-gray-800 border border-gray-700 mt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Missing Airports</h3>
                      <Badge variant="outline" className="bg-gray-700">
                        {teamsWithoutAirports.length} teams
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={exportMissingAirports}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Export Missing Airports CSV
                  </Button>

                  <Button
                    onClick={() => setAirportLookupDialog(true)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Search for Airports
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Table (Limited) */}
      {teams.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Team List</CardTitle>
            <CardDescription>Showing first 20 teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-gray-800 border-gray-700">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Stadium</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.slice(0, 20).map(team => (
                    <TableRow key={team.team_id} className="hover:bg-gray-800 border-gray-700">
                      <TableCell>{team.team_id}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.city}</TableCell>
                      <TableCell>{team.country}</TableCell>
                      <TableCell>{team.stadium}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {teams.length > 20 && (
              <div className="text-center text-sm text-gray-400 mt-4">
                Showing 20 of {teams.length} teams
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Missing Airport Teams */}
      {teamsWithoutAirports.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Teams Without Airport Data</CardTitle>
            <CardDescription>Showing all {teamsWithoutAirports.length} teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-gray-800 border-gray-700">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamsWithoutAirports.map(team => (
                    <TableRow key={team.team_id} className="hover:bg-gray-800 border-gray-700">
                      <TableCell>{team.team_id}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.city}</TableCell>
                      <TableCell>{team.country}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTeam(team);
                            setAirportSearchTerm(team.city);
                            setAirportLookupDialog(true);
                            // Auto-search for this team's city
                            if (openFlightsData) {
                              setAirportSearchResults(searchAirports(team.city));
                            }
                          }}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Find
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAirportsTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Airport Management</CardTitle>
            <CardDescription>Import or fetch airport data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('fileInput').click()}
                  disabled={isLoading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import File
                </Button>

                <Button
                  variant="outline"
                  onClick={() => exportData('airports', 'csv')}
                  disabled={isLoading || airports.length === 0}
                >
                  <DownloadCloud className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>

              <Button
                onClick={checkTeamsWithoutAirports}
                disabled={isLoading}
                className="w-full mt-4"
              >
                {isLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plane className="mr-2 h-4 w-4" />}
                Check Teams Without Airports
              </Button>

              {comparisonResults.airports.new.length > 0 && (
                <Button
                  onClick={() => saveToSupabase('airports')}
                  disabled={isLoading}
                  className="w-full mt-4"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Save {comparisonResults.airports.new.length} New Airports to Database
                </Button>
              )}

              {teamsWithoutAirports.length > 0 && (
                <>
                  <div className="p-3 rounded bg-gray-800 border border-gray-700 mt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Missing Airports</h3>
                      <Badge variant="outline" className="bg-gray-700">
                        {teamsWithoutAirports.length} teams
                      </Badge>
                    </div>
                  </div>

                  <Button
                    onClick={exportMissingAirports}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    Export Missing Airports CSV
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Airport Lookup</CardTitle>
            <CardDescription>Search for airports in OpenFlights database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search airports by city, name, or IATA code"
                  value={airportSearchTerm}
                  onChange={(e) => setAirportSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />

                <Button
                  onClick={() => setAirportSearchResults(searchAirports(airportSearchTerm))}
                  disabled={!openFlightsData || !airportSearchTerm}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {airportSearchResults.length > 0 && (
                <div className="border border-gray-700 rounded overflow-hidden mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-gray-800 border-gray-700">
                        <TableHead>IATA</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead className="w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {airportSearchResults.map(airport => (
                        <TableRow key={airport.iata} className="hover:bg-gray-800 border-gray-700">
                          <TableCell className="font-bold">{airport.iata}</TableCell>
                          <TableCell>{airport.name}</TableCell>
                          <TableCell>{airport.city}</TableCell>
                          <TableCell>{airport.country}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedTeam ? setAirportLookupDialog(true) : null}
                              className="h-8 w-8 p-0"
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {airportSearchResults.length === 0 && airportSearchTerm && (
                <div className="text-center p-4 border border-gray-700 rounded text-gray-400">
                  No airports found matching "{airportSearchTerm}"
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Airports Table */}
      {airports.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Imported Airports</CardTitle>
            <CardDescription>
              {airports.length} airports loaded, {comparisonResults.airports.new.length} new
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-gray-800 border-gray-700">
                    <TableHead>Team ID</TableHead>
                    <TableHead>IATA</TableHead>
                    <TableHead>Airport Name</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {airports.slice(0, 20).map(airport => {
                    const isNew = comparisonResults.airports.new.some(
                      a => a.team_id === airport.team_id && a.iata_code === airport.iata_code
                    );
                    return (
                      <TableRow key={`${airport.team_id}-${airport.iata_code}`} className="hover:bg-gray-800 border-gray-700">
                        <TableCell>{airport.team_id}</TableCell>
                        <TableCell>{airport.iata_code}</TableCell>
                        <TableCell>{airport.airport_name}</TableCell>
                        <TableCell>
                          {airport.latitude?.toFixed(4)}, {airport.longitude?.toFixed(4)}
                        </TableCell>
                        <TableCell>
                          {isNew ? (
                            <Badge className="bg-green-900/30 text-green-400 border-green-800">New</Badge>
                          ) : (
                            <Badge className="bg-blue-900/30 text-blue-400 border-blue-800">Existing</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {airports.length > 20 && (
              <div className="text-center text-sm text-gray-400 mt-4">
                Showing 20 of {airports.length} airports
              </div>
            )}
          </CardContent>
        </Card>

      )}
      {teamsWithoutAirports.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Teams Without Airport Data</CardTitle>
            <CardDescription>Showing first 20 of {teamsWithoutAirports.length} teams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-gray-800 border-gray-700">
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamsWithoutAirports.slice(0, 20).map(team => (
                    <TableRow key={team.team_id} className="hover:bg-gray-800 border-gray-700">
                      <TableCell>{team.team_id}</TableCell>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>{team.city}</TableCell>
                      <TableCell>{team.country}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTeam(team);
                            setAirportSearchTerm(team.city);
                            setAirportLookupDialog(true);
                            // Auto-search for this team's city
                            if (openFlightsData) {
                              setAirportSearchResults(searchAirports(team.city));
                            }
                          }}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Find
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // Main render function based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'leagues':
        return renderLeaguesTab();
      case 'seasons':
        return renderSeasonsTab();
      case 'matches':
        return renderMatchesTab();
      case 'teams':
        return renderTeamsTab();
      case 'airports':
        return renderAirportsTab();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-6 w-6 mr-2" />
            Sports Data Management
          </CardTitle>
          <CardDescription>
            Fetch, import, compare, and update sports data between TheSportsDB and your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-gray-800 border-gray-700 mb-6">
              <TabsTrigger
                value="leagues"
                className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                disabled={isTabDisabled('leagues')}
              >
                Leagues
              </TabsTrigger>
              <TabsTrigger
                value="seasons"
                className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                disabled={isTabDisabled('seasons')}
              >
                Seasons
              </TabsTrigger>
              <TabsTrigger
                value="matches"
                className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                disabled={isTabDisabled('matches')}
              >
                Matches
              </TabsTrigger>
              <TabsTrigger
                value="teams"
                className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                disabled={isTabDisabled('teams')}
              >
                Teams
              </TabsTrigger>
              <TabsTrigger
                value="airports"
                className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                disabled={isTabDisabled('airports')}
              >
                Airports
              </TabsTrigger>
            </TabsList>

            {(isLoading && loadingMessage) && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{loadingMessage}</span>
                  {progressValue > 0 && <span>({progressValue}%)</span>}
                </div>
                {progressValue > 0 && (
                  <Progress value={progressValue} className="h-2 mt-2 bg-gray-700" />
                )}
              </div>
            )}

            {error && (
              <Alert className="bg-red-900/30 border-red-800 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-900/30 border-green-800 mb-4">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">{success}</AlertDescription>
              </Alert>
            )}

            {renderContent()}
          </Tabs>
        </CardContent>
      </Card>

      {/* Airport Lookup Dialog */}
      <Dialog open={airportLookupDialog} onOpenChange={setAirportLookupDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Airport Lookup</DialogTitle>
          </DialogHeader>

          {selectedTeam && (
            <div className="bg-gray-800 p-3 rounded border border-gray-700 mb-4">
              <h3 className="font-semibold">Selected Team</h3>
              <div className="text-sm text-gray-300 mt-1">
                {selectedTeam.name} ({selectedTeam.city}, {selectedTeam.country})
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search airports by city, name, or IATA code"
                value={airportSearchTerm}
                onChange={(e) => setAirportSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-700"
                autoFocus
              />

              <Button
                onClick={() => setAirportSearchResults(searchAirports(airportSearchTerm))}
                disabled={!openFlightsData || !airportSearchTerm}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Best match suggestion */}
            {selectedTeam && openFlightsData && (
              <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <h3 className="font-semibold text-sm text-gray-300">Suggested Match</h3>

                {(() => {
                  const bestMatch = findAirportForTeam(selectedTeam);

                  if (bestMatch) {
                    return (
                      <div className="mt-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold">{bestMatch.iata}</span> - {bestMatch.name}
                            <div className="text-sm text-gray-400">
                              {bestMatch.city}, {bestMatch.country}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            onClick={() => {
                              updateTeamWithAirport(selectedTeam, bestMatch);
                              setAirportLookupDialog(false);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Use This
                          </Button>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-gray-400 text-sm">
                        No automatic match found. Please search manually.
                      </div>
                    );
                  }
                })()}
              </div>
            )}

            {airportSearchResults.length > 0 ? (
              <div className="border border-gray-700 rounded overflow-hidden mt-2">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-gray-800 border-gray-700">
                      <TableHead>IATA</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {airportSearchResults.map(airport => (
                      <TableRow key={airport.iata} className="hover:bg-gray-800 border-gray-700">
                        <TableCell className="font-bold">{airport.iata}</TableCell>
                        <TableCell>{airport.name}</TableCell>
                        <TableCell>
                          {airport.city}, {airport.country}
                          <div className="text-xs text-gray-500">
                            {airport.latitude.toFixed(4)}, {airport.longitude.toFixed(4)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {selectedTeam && (
                            <Button
                              size="sm"
                              onClick={() => {
                                updateTeamWithAirport(selectedTeam, airport);
                                setAirportLookupDialog(false);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Select
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              airportSearchTerm && (
                <div className="text-center p-4 border border-gray-700 rounded text-gray-400">
                  No airports found matching "{airportSearchTerm}"
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* API Info Dialog */}
      <Dialog open={apiInfoDialog} onOpenChange={setApiInfoDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>API Configuration</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">TheSportsDB API Key</Label>
              <Input
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-gray-800 border-gray-700"
                placeholder="Enter your API key"
              />
              <p className="text-xs text-gray-400">
                Free tier API key "1" has limited functionality. For full access, upgrade to a paid plan.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setApiInfoDialog(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
          </DialogHeader>

          <p>{confirmDialog.message}</p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                setConfirmDialog({ ...confirmDialog, open: false });
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DataManagement;