"use client";

import { useState, useEffect, useMemo } from "react";
import AuthGuard from "@/components/auth/auth-guard";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import {
  Trophy, Users, Calendar, Search, PlusCircle,
  Edit, Trash2, RefreshCw, CheckCircle, Clock, AlertTriangle,
  Plane, CalendarRange, ArrowRight,
  Database
} from "lucide-react";
import MatchesManagement from "@/components/matches-management";
import TeamsManagement from "@/components/teams-management";
import LeaguesManagement from "@/components/leagues-management";
import AirportsManagement from "@/components/airports-management";
import DashboardOverview from "@/components/dashboard-overview";
import { supabase } from "@/lib/supabase/client";
import SeasonsManagement from "@/components/seasons-management";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TeamSeasonsManagement from "@/components/teams-seasons-management";
import DataManagement from "@/components/data-management";

// Main Dashboard Page Component
export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  // View state
  const [activeTab, setActiveTab] = useState("overview");
  const [viewMode, setViewMode] = useState("main"); // 'main' or 'teamSeasons'
  const [selectedTeam, setSelectedTeam] = useState(null);

  // State for data
  const [stats, setStats] = useState({
    leagues: 0,
    teams: 0,
    matches: 0,
    seasons: 0,
    airports: 0,
    upcomingMatches: 0
  });

  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [airports, setAirports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(null);

  // Data collections for dropdowns
  const [allTeams, setAllTeams] = useState([]);
  const [allLeagues, setAllLeagues] = useState([]);
  const [allSeasons, setAllSeasons] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState({
    leagues: 0,
    teams: 0,
    matches: 0,
    seasons: 0,
    airports: 0
  });

  // Dashboard extra data
  const [latestMatches, setLatestMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);

  // Search states
  const [searchTerms, setSearchTerms] = useState({
    teams: '',
    matches: '',
    airports: ''
  });

  // Initialize data on component mount
  useEffect(() => {
    // Load all data on initial mount
    const initialize = async () => {
      await fetchStatsData();
      await fetchDashboardData();

      // Only fetch tab data if not on overview
      if (activeTab !== "overview") {
        await fetchTabData();
      }
    };

    initialize();
  }, []);

  // Handle tab changes and pagination 
  useEffect(() => {
    if (activeTab === "overview") {
      // On overview tab, refresh dashboard data
      fetchDashboardData();
    } else {
      // On other tabs, fetch tab-specific data or search results
      if (searchTerms[activeTab]) {
        handleDynamicSearch(activeTab, searchTerms[activeTab]);
      } else {
        fetchTabData();
      }
    }
  }, [activeTab, currentPage, itemsPerPage]);

  const fetchStatsData = async () => {
    try {
      // Get counts for dashboard stats
      const { count: totalLeagues } = await supabase.from('leagues').select('*', { count: 'exact', head: true });
      const { count: totalTeams } = await supabase.from('teams').select('*', { count: 'exact', head: true });
      const { count: totalMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true });
      const { count: totalSeasons } = await supabase.from('seasons').select('*', { count: 'exact', head: true });
      const { count: totalAirports } = await supabase.from('airports').select('*', { count: 'exact', head: true });

      // Fetch all teams, leagues, and seasons for dropdowns (needed everywhere)
      const { data: allTeamsData, error: allTeamsError } = await supabase
        .from('teams')
        .select('team_id, name, city, country, stadium, capacity, founded');

      if (allTeamsError) throw allTeamsError;

      const { data: allLeaguesData, error: allLeaguesError } = await supabase
        .from('leagues')
        .select('league_id, name, country');

      if (allLeaguesError) throw allLeaguesError;

      const { data: allSeasonsData, error: allSeasonsError } = await supabase
        .from('seasons')
        .select('season_id, start_date, end_date');

      if (allSeasonsError) throw allSeasonsError;

      // Set complete datasets for dropdowns
      setAllTeams(allTeamsData || []);
      setAllLeagues(allLeaguesData || []);
      setAllSeasons(allSeasonsData || []);

      // Update stats
      setStats(prev => ({
        ...prev,
        leagues: totalLeagues || 0,
        teams: totalTeams || 0,
        matches: totalMatches || 0,
        seasons: totalSeasons || 0,
        airports: totalAirports || 0
      }));
    } catch (error) {
      console.error("Error fetching stats data:", error);
      setLoadingError("Failed to load statistics. Please try again.");
    }
  };

  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    try {
      const today = new Date();
      const todayFormatted = format(today, 'yyyy-MM-dd');

      // Fetch latest matches (last 5 matches before today)
      const { data: latestMatchesData, error: latestMatchesError } = await supabase
        .from('matches')
        .select('match_id, date, home_team, away_team, stadium')
        .lt('date', todayFormatted)
        .order('date', { ascending: false })
        .limit(5);

      if (latestMatchesError) throw latestMatchesError;
      setLatestMatches(latestMatchesData || []);

      // Fetch upcoming matches (next 5 matches from today)
      const { data: upcomingMatchesData, error: upcomingMatchesError } = await supabase
        .from('matches')
        .select('match_id, date, home_team, away_team, stadium')
        .gte('date', todayFormatted)
        .order('date', { ascending: true })
        .limit(5);

      if (upcomingMatchesError) throw upcomingMatchesError;
      setUpcomingMatches(upcomingMatchesData || []);

      // Update stats for upcoming matches
      setStats(prev => ({
        ...prev,
        upcomingMatches: upcomingMatchesData?.length || 0
      }));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoadingError("Failed to load dashboard data. Please try again.");
    } finally {
      setDashboardLoading(false);
    }
  };

  const fetchTabData = async () => {
    setIsLoading(true);
    setLoadingError(null);
    try {
      // Skip fetching data for other tabs if on overview tab
      if (activeTab === "overview") return;

      // Fetch tab-specific data with pagination
      let leaguesData = [], teamsData = [], matchesData = [], seasonsData = [], airportsData = [];
      let leaguesCount = 0, teamsCount = 0, matchesCount = 0, seasonsCount = 0, airportsCount = 0;

      // Only fetch data for the active tab to improve performance
      if (activeTab === "leagues" || activeTab === "all") {
        const { data, error, count } = await supabase
          .from('leagues')
          .select('league_id, name, country', { count: 'exact' })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (error) throw error;
        leaguesData = data || [];
        leaguesCount = count || 0;
      }

      if (activeTab === "teams" || activeTab === "all") {
        const { data, error, count } = await supabase
          .from('teams')
          .select('team_id, name, city, country, stadium, capacity, founded', { count: 'exact' })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (error) throw error;
        teamsData = data || [];
        teamsCount = count || 0;
      }

      if (activeTab === "matches" || activeTab === "all") {
        const { data, error, count } = await supabase
          .from('matches')
          .select('match_id, date, league_id, season_id, home_team_id, home_team, away_team_id, away_team, home_city, away_city, stadium, country', { count: 'exact' })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (error) throw error;
        matchesData = data || [];
        matchesCount = count || 0;
      }

      if (activeTab === "seasons" || activeTab === "all") {
        const { data, error, count } = await supabase
          .from('seasons')
          .select('season_id, start_date, end_date', { count: 'exact' })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (error) throw error;
        seasonsData = data || [];
        seasonsCount = count || 0;
      }

      if (activeTab === "airports" || activeTab === "all") {
        const { data, error, count } = await supabase
          .from('airports')
          .select('team_id, iata_code, airport_name, latitude, longitude', { count: 'exact' })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

        if (error) throw error;
        airportsData = data || [];
        airportsCount = count || 0;
      }

      // Set state with fetched data
      setLeagues(leaguesData);
      setTeams(teamsData);
      setMatches(matchesData);
      setSeasons(seasonsData);
      setAirports(airportsData);

      // Update total counts for pagination
      setTotalItems({
        leagues: leaguesCount,
        teams: teamsCount,
        matches: matchesCount,
        seasons: seasonsCount,
        airports: airportsCount
      });
    } catch (error) {
      console.error("Error fetching tab data:", error);
      setLoadingError("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic search function
  const handleDynamicSearch = async (componentName, searchInput) => {
    setIsLoading(true);
    setLoadingError(null);

    try {
      setSearchTerms(prev => ({
        ...prev,
        [componentName]: searchInput
      }));

      let filteredData = [];

      switch (componentName) {
        case 'teams':
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('team_id, name, city, country, stadium, capacity, founded')
            .or(`name.ilike.%${searchInput}%,city.ilike.%${searchInput}%,country.ilike.%${searchInput}%`)
            .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

          if (teamsError) throw teamsError;
          filteredData = teamsData || [];
          setTeams(filteredData);

          const { count: teamsCount } = await supabase
            .from('teams')
            .select('team_id', { count: 'exact', head: true })
            .or(`name.ilike.%${searchInput}%,city.ilike.%${searchInput}%,country.ilike.%${searchInput}%`);

          setTotalItems(prev => ({ ...prev, teams: teamsCount || 0 }));
          break;

        case 'matches':
          const { data: matchesData, error: matchesError } = await supabase
            .from('matches')
            .select('match_id, date, league_id, season_id, home_team_id, home_team, away_team_id, away_team, home_city, away_city, stadium, country')
            .or(`home_team.ilike.%${searchInput}%,away_team.ilike.%${searchInput}%,stadium.ilike.%${searchInput}%`)
            .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

          if (matchesError) throw matchesError;
          filteredData = matchesData || [];
          setMatches(filteredData);

          const { count: matchesCount } = await supabase
            .from('matches')
            .select('match_id', { count: 'exact', head: true })
            .or(`home_team.ilike.%${searchInput}%,away_team.ilike.%${searchInput}%,stadium.ilike.%${searchInput}%`);

          setTotalItems(prev => ({ ...prev, matches: matchesCount || 0 }));
          break;

        case 'airports':
          const { data: airportsData, error: airportsError } = await supabase
            .from('airports')
            .select('team_id, iata_code, airport_name, latitude, longitude')
            .or(`airport_name.ilike.%${searchInput}%,iata_code.ilike.%${searchInput}%`)
            .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

          if (airportsError) throw airportsError;
          filteredData = airportsData || [];
          setAirports(filteredData);

          const { count: airportsCount } = await supabase
            .from('airports')
            .select('team_id', { count: 'exact', head: true })
            .or(`airport_name.ilike.%${searchInput}%,iata_code.ilike.%${searchInput}%`);

          setTotalItems(prev => ({ ...prev, airports: airportsCount || 0 }));
          break;

        default:
          break;
      }

      setCurrentPage(1);

    } catch (error) {
      console.error(`Error searching ${componentName}:`, error);
      setLoadingError(`Failed to search ${componentName}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // CRUD operations for leagues
  const handleAddLeague = async (league) => {
    try {
      const { data, error } = await supabase
        .from('leagues')
        .insert([{
          league_id: parseInt(league.league_id),
          name: league.name,
          country: league.country
        }])
        .select();

      if (error) throw error;

      fetchTabData();
      fetchStatsData(); // Update stats
    } catch (error) {
      console.error("Error adding league:", error);
    }
  };

  const handleEditLeague = async (league) => {
    try {
      const { error } = await supabase
        .from('leagues')
        .update({
          name: league.name,
          country: league.country
        })
        .eq('league_id', parseInt(league.league_id));

      if (error) throw error;

      fetchTabData();
    } catch (error) {
      console.error("Error updating league:", error);
    }
  };

  const handleDeleteLeague = async (league_id) => {
    try {
      const { error } = await supabase
        .from('leagues')
        .delete()
        .eq('league_id', parseInt(league_id));

      if (error) throw error;

      fetchTabData();
      fetchStatsData(); // Update stats
    } catch (error) {
      console.error("Error deleting league:", error);
    }
  };

  // CRUD operations for teams
  const handleAddTeam = async (team) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{
          team_id: parseInt(team.team_id),
          name: team.name,
          city: team.city,
          country: team.country,
          stadium: team.stadium,
          capacity: parseInt(team.capacity || 0),
          founded: parseInt(team.founded || 0)
        }])
        .select();

      if (error) throw error;

      fetchTabData();
      fetchStatsData(); // Update stats
    } catch (error) {
      console.error("Error adding team:", error);
    }
  };

  const handleEditTeam = async (team) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: team.name,
          city: team.city,
          country: team.country,
          stadium: team.stadium,
          capacity: parseInt(team.capacity || 0),
          founded: parseInt(team.founded || 0)
        })
        .eq('team_id', parseInt(team.team_id));

      if (error) throw error;

      fetchTabData();
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };

  const handleDeleteTeam = async (team_id) => {
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('team_id', parseInt(team_id));

      if (error) throw error;

      fetchTabData();
      fetchStatsData(); // Update stats
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  };

  // CRUD operations for matches
  const handleAddMatch = async (match) => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([{
          match_id: parseInt(match.match_id),
          date: match.date,
          league_id: parseInt(match.league_id),
          season_id: match.season_id,
          home_team_id: parseInt(match.home_team_id),
          home_team: match.home_team,
          away_team_id: parseInt(match.away_team_id),
          away_team: match.away_team,
          home_city: match.home_city,
          away_city: match.away_city,
          stadium: match.stadium,
          country: match.country
        }])
        .select();

      if (error) throw error;

      fetchTabData();
      fetchDashboardData(); // Refresh dashboard data for upcoming matches
      fetchStatsData(); // Update stats
    } catch (error) {
      console.error("Error adding match:", error);
    }
  };

  const handleEditMatch = async (match) => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({
          date: match.date,
          league_id: parseInt(match.league_id),
          season_id: match.season_id,
          home_team_id: parseInt(match.home_team_id),
          home_team: match.home_team,
          away_team_id: parseInt(match.away_team_id),
          away_team: match.away_team,
          home_city: match.home_city,
          away_city: match.away_city,
          stadium: match.stadium,
          country: match.country
        })
        .eq('match_id', parseInt(match.match_id));

      if (error) throw error;

      fetchTabData();
      fetchDashboardData(); // Refresh dashboard data
    } catch (error) {
      console.error("Error updating match:", error);
    }
  };

  const handleDeleteMatch = async (match_id) => {
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('match_id', parseInt(match_id));

      if (error) throw error;

      fetchTabData();
      fetchDashboardData(); // Refresh dashboard data
      fetchStatsData(); // Update stats
    } catch (error) {
      console.error("Error deleting match:", error);
    }
  };

  // CRUD operations for seasons
  const handleAddSeason = async (season) => {
    try {
      const { data, error } = await supabase
        .from('seasons')
        .insert([{
          season_id: season.season_id,
          start_date: season.start_date,
          end_date: season.end_date
        }])
        .select();

      if (error) throw error;

      fetchTabData();
      fetchStatsData(); // Update stats
    } catch (error) {
      console.error("Error adding season:", error);
    }
  };

  const handleEditSeason = async (season) => {
    try {
      const { error } = await supabase
        .from('seasons')
        .update({
          start_date: season.start_date,
          end_date: season.end_date
        })
        .eq('season_id', season.season_id);

      if (error) throw error;

      fetchTabData();
    } catch (error) {
      console.error("Error updating season:", error);
    }
  };

  const handleDeleteSeason = async (season_id) => {
    try {
      const { error } = await supabase
        .from('seasons')
        .delete()
        .eq('season_id', season_id);

      if (error) throw error;

      fetchTabData();
      fetchStatsData(); // Update stats
    } catch (error) {
      console.error("Error deleting season:", error);
    }
  };

  // CRUD operations for airports
  const handleAddAirport = async (airport) => {
    try {
      const { data, error } = await supabase
        .from('airports')
        .insert([airport])
        .select();

      if (error) throw error;

      fetchTabData();
      fetchStatsData(); // Update stats
    } catch (error) {
      console.error("Error adding airport:", error);
    }
  };

  const handleEditAirport = async (airport) => {
    try {
      const { error } = await supabase
        .from('airports')
        .update({
          airport_name: airport.airport_name,
          latitude: airport.latitude,
          longitude: airport.longitude
        })
        .eq('team_id', airport.team_id)
        .eq('iata_code', airport.iata_code);

      if (error) throw error;

      fetchTabData();
    } catch (error) {
      console.error("Error updating airport:", error);
    }
  };

  const handleDeleteAirport = async (team_id, iata_code) => {
    try {
      const { error } = await supabase
        .from('airports')
        .delete()
        .eq('team_id', team_id)
        .eq('iata_code', iata_code);

      if (error) throw error;

      fetchTabData();
      fetchStatsData(); // Update stats
    } catch (error) {
      console.error("Error deleting airport:", error);
    }
  };

  // Team management function
  const handleViewTeamSeasons = (team) => {
    setSelectedTeam(team);
    setViewMode("teamSeasons");
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setViewMode("main");
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle tab change
  const handleTabChange = (value) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Render pagination component
  const Pagination = ({ totalItems, currentTab }) => {
    const totalPages = Math.ceil(totalItems[currentTab] / itemsPerPage);

    return (
      <div className="flex justify-center mt-6">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="text-sm px-2">
            Page {currentPage} of {totalPages || 1}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>

          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(parseInt(value))}>
            <SelectTrigger className="w-20">
              <SelectValue>{itemsPerPage}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  // Get current season data for dashboard
  const getCurrentSeasonInfo = useMemo(() => {
    if (allSeasons.length === 0) return { currentSeason: null, previousSeason: null, oldestSeason: null };

    const sortedSeasons = [...allSeasons].sort((a, b) =>
      new Date(b.end_date) - new Date(a.end_date)
    );

    const today = new Date();
    const currentSeason = sortedSeasons.find(s =>
      new Date(s.start_date) <= today && today <= new Date(s.end_date)
    ) || sortedSeasons[0];

    const previousSeason = sortedSeasons[sortedSeasons.indexOf(currentSeason) + 1] || null;
    const oldestSeason = sortedSeasons[sortedSeasons.length - 1] || null;

    return { currentSeason, previousSeason, oldestSeason };
  }, [allSeasons]);

  return (
    <AuthGuard>
      <div className="text-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Sports Management Dashboard</h1>
          <p className="text-gray-400">Manage your sports leagues, teams, fixtures, seasons, and airports</p>
        </div>

        {loadingError && (
          <Alert className="bg-red-900/30 border-red-800 mb-6">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-200">{loadingError}</AlertDescription>
          </Alert>
        )}

        {viewMode === "main" ? (
          <>
            <Tabs defaultValue="overview" className="w-full" onValueChange={handleTabChange}>
              <TabsList className="bg-gray-800 border-gray-700 mb-6">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="leagues"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                >
                  Leagues
                </TabsTrigger>
                <TabsTrigger
                  value="teams"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                >
                  Teams
                </TabsTrigger>
                <TabsTrigger
                  value="matches"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                >
                  Matches
                </TabsTrigger>
                <TabsTrigger
                  value="seasons"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                >
                  Seasons
                </TabsTrigger>
                <TabsTrigger
                  value="airports"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                >
                  Airports
                </TabsTrigger>
                <TabsTrigger
                  value="data-management"
                  className="data-[state=active]:bg-gray-700 data-[state=active]:shadow-none"
                >
                  <Database className="h-4 w-4 mr-1" />
                  Data Management
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                {dashboardLoading ? (
                  <div className="flex justify-center my-12">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <DashboardOverview
                    stats={stats}
                    latestMatches={latestMatches}
                    upcomingMatches={upcomingMatches}
                    currentSeason={getCurrentSeasonInfo.currentSeason}
                    previousSeason={getCurrentSeasonInfo.previousSeason}
                    oldestSeason={getCurrentSeasonInfo.oldestSeason}
                  />
                )}
              </TabsContent>

              <TabsContent value="leagues">
                {isLoading ? (
                  <div className="flex justify-center my-12">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    <LeaguesManagement
                      leagues={leagues}
                      seasons={allSeasons}
                      onAddLeague={handleAddLeague}
                      onEditLeague={handleEditLeague}
                      onDeleteLeague={handleDeleteLeague}
                      supabase={supabase}
                    />
                    <Pagination totalItems={totalItems} currentTab="leagues" />
                  </>
                )}
              </TabsContent>

              <TabsContent value="teams">
                <>
                  <TeamsManagement
                    teams={teams}
                    leagues={allLeagues}
                    onAddTeam={handleAddTeam}
                    onEditTeam={handleEditTeam}
                    onDeleteTeam={handleDeleteTeam}
                    onViewTeamSeasons={handleViewTeamSeasons}
                    onSearch={(searchInput) => handleDynamicSearch('teams', searchInput)}
                    searchTerm={searchTerms.teams}
                    loading={isLoading}
                  />
                  <Pagination totalItems={totalItems} currentTab="teams" />
                </>
              </TabsContent>

              <TabsContent value="matches">
                <>
                  <MatchesManagement
                    matches={matches}
                    teams={allTeams}
                    leagues={allLeagues}
                    seasons={allSeasons}
                    onAddMatch={handleAddMatch}
                    onEditMatch={handleEditMatch}
                    onDeleteMatch={handleDeleteMatch}
                    onSearch={(searchInput) => handleDynamicSearch('matches', searchInput)}
                    searchTerm={searchTerms.matches}
                    loading={isLoading}
                  />
                  <Pagination totalItems={totalItems} currentTab="matches" />
                </>
              </TabsContent>

              <TabsContent value="seasons">
                {isLoading ? (
                  <div className="flex justify-center my-12">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    <SeasonsManagement
                      seasons={seasons}
                      onAddSeason={handleAddSeason}
                      onEditSeason={handleEditSeason}
                      onDeleteSeason={handleDeleteSeason}
                    />
                    <Pagination totalItems={totalItems} currentTab="seasons" />
                  </>
                )}
              </TabsContent>

              <TabsContent value="airports">
                <>
                  <AirportsManagement
                    airports={airports}
                    allTeams={allTeams}
                    onAddAirport={handleAddAirport}
                    onEditAirport={handleEditAirport}
                    onDeleteAirport={handleDeleteAirport}
                    isLoading={isLoading}
                    onSearch={(searchInput) => handleDynamicSearch('airports', searchInput)}
                    searchTerm={searchTerms.airports}
                    loading={isLoading}
                  />
                  <Pagination totalItems={totalItems} currentTab="airports" />
                </>
              </TabsContent>

              <TabsContent value="data-management">
                <DataManagement supabase={supabase} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <TeamSeasonsManagement
            team={selectedTeam}
            allLeagues={allLeagues}
            allSeasons={allSeasons}
            supabase={supabase}
            onBack={handleBackToTeams}
          />
        )}
      </div>
    </AuthGuard>
  );
}