"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Calendar, Search, PlusCircle, Edit, Trash2, RefreshCw } from "lucide-react";
import { DatePicker } from "./ui/date-picker";
import { format } from "date-fns";

// Custom Select component with search and scroll
const SearchableSelect = ({
  value,
  onValueChange,
  placeholder,
  options,
  label,
  className = "",
  includeAll = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <Select
        value={value}
        onValueChange={(val) => {
          onValueChange(val);
          setSearchTerm("");
          setIsOpen(false);
        }}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger
          className={`bg-gray-800 border-gray-700 ${className}`}
          onClick={() => setIsOpen(true)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className="bg-gray-800 border-gray-700"
          position="popper"
        >
          <div className="p-2">
            <Input
              className="bg-gray-700 border-gray-600 mb-2"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {includeAll && (
              <SelectItem value="all">{placeholder || "All"}</SelectItem>
            )}
            {filteredOptions.length === 0 ? (
              <div className="p-2 text-center text-gray-400">No results found</div>
            ) : (
              filteredOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

const MatchesManagement = ({
  matches,
  teams,
  leagues,
  seasons,
  onAddMatch,
  onEditMatch,
  onDeleteMatch,
  onSearch,  // Added prop for search handler
  searchTerm, // Added prop for search term state
  loading
}) => {
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("add"); // 'add' or 'edit'

  const [matchForm, setMatchForm] = useState({
    match_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    league_id: "",
    season_id: "",
    home_team_id: "",
    home_team: "",
    away_team_id: "",
    away_team: "",
    home_city: "",
    away_city: "",
    stadium: "",
    country: ""
  });

  const openAddDialog = () => {
    setDialogAction("add");
    setMatchForm({
      match_id: Math.floor(Math.random() * 10000).toString(), // Temporary ID generation
      date: format(new Date(), "yyyy-MM-dd"),
      league_id: leagues.length > 0 ? leagues[0].league_id.toString() : "",
      season_id: seasons.length > 0 ? seasons[0].season_id : "",
      home_team_id: "",
      home_team: "",
      away_team_id: "",
      away_team: "",
      home_city: "",
      away_city: "",
      stadium: "",
      country: ""
    });
    setOpenDialog(true);
  };

  const openEditDialog = (match) => {
    setDialogAction("edit");
    setMatchForm({ ...match });
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    // Update home_team and away_team names from selected IDs
    const homeTeam = teams.find(t => t.team_id.toString() === matchForm.home_team_id.toString());
    const awayTeam = teams.find(t => t.team_id.toString() === matchForm.away_team_id.toString());

    const updatedMatch = {
      ...matchForm,
      home_team: homeTeam?.name || "",
      away_team: awayTeam?.name || "",
      home_city: homeTeam?.city || "",
      away_city: awayTeam?.city || "",
      stadium: matchForm.stadium || homeTeam?.stadium || ""
    };

    if (dialogAction === "add") {
      onAddMatch(updatedMatch);
    } else {
      onEditMatch(updatedMatch);
    }
    setOpenDialog(false);
  };

  const handleHomeTeamChange = (value) => {
    const homeTeam = teams.find(t => t.team_id.toString() === value);
    setMatchForm({
      ...matchForm,
      home_team_id: value,
      home_team: homeTeam?.name || "",
      home_city: homeTeam?.city || "",
      stadium: homeTeam?.stadium || matchForm.stadium
    });
  };

  const handleAwayTeamChange = (value) => {
    const awayTeam = teams.find(t => t.team_id.toString() === value);
    setMatchForm({
      ...matchForm,
      away_team_id: value,
      away_team: awayTeam?.name || "",
      away_city: awayTeam?.city || ""
    });
  };

  const handleLeagueChange = (value) => {
    if (value === "all") {
      setSelectedLeague("all");
      return;
    }

    const selectedLeagueObj = leagues.find(l => l.league_id.toString() === value);
    setMatchForm({
      ...matchForm,
      league_id: value,
      country: selectedLeagueObj?.country || matchForm.country
    });
  };

  const handleDateChange = (date) => {
    setMatchForm({
      ...matchForm,
      date: format(date, "yyyy-MM-dd")
    });
  };

  // Prepare options for searchable selects
  const leagueOptions = leagues.map(league => ({
    value: league.league_id.toString(),
    label: league.name
  }));

  const seasonOptions = seasons.map(season => ({
    value: season.season_id,
    label: season.season_id
  }));

  const teamOptions = teams.map(team => ({
    value: team.team_id.toString(),
    label: team.name
  }));

  const awayTeamOptions = teams
    .filter(team => team.team_id.toString() !== matchForm.home_team_id.toString())
    .map(team => ({
      value: team.team_id.toString(),
      label: team.name
    }));

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-xl">Matches</CardTitle>

        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 gap-2 sm:gap-0 w-full sm:w-auto">
          {/* Search Input with Icon */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search matches..."
              className="w-full sm:w-64 bg-gray-800 border-gray-700"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>

          {/* League Selector */}
          <SearchableSelect
            value={selectedLeague}
            onValueChange={setSelectedLeague}
            placeholder="All Leagues"
            options={leagueOptions}
            label="Leagues"
            className="w-full sm:w-48"
            includeAll={true}
          />

          {/* Add Match Button */}
          <Button onClick={openAddDialog} size="sm" className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Match
          </Button>
        </div>
      </CardHeader>


      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-800">
              <TableHead>Date</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead>Stadium</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Season</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {loading ?
            <TableBody>
              <TableRow className="border-gray-800">
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
            :
            <TableBody>
              {matches.length === 0 ? ( // Use matches directly instead of filteredMatches
                <TableRow className="border-gray-800">
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No matches found. Add a new match or adjust your filters.
                  </TableCell>
                </TableRow>
              ) : (
                matches.map((match) => { // Use matches directly instead of filteredMatches
                  const league = leagues.find(l => l.league_id.toString() === match.league_id.toString());
                  return (
                    <TableRow key={match.match_id} className="border-gray-800 hover:bg-gray-800">
                      <TableCell>
                        <div>{new Date(match.date).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{match.home_team}</div>
                        <div className="text-gray-400">vs</div>
                        <div className="font-medium">{match.away_team}</div>
                      </TableCell>
                      <TableCell>{match.stadium}</TableCell>
                      <TableCell>{league?.name || "Unknown League"}</TableCell>
                      <TableCell>{match.season_id}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(match)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteMatch(match.match_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>}
        </Table>
      </CardContent>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "add" ? "Add New Match" : "Edit Match Details"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="league">League</Label>
              <SearchableSelect
                value={matchForm.league_id.toString() || "league-default"}
                onValueChange={handleLeagueChange}
                placeholder="Select a league"
                options={leagueOptions.map(option => ({
                  ...option,
                  value: option.value || "league-default" // Ensure no empty string values
                }))}
                label="League"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <SearchableSelect
                value={matchForm.season_id || "season-default"}
                onValueChange={(value) => setMatchForm({ ...matchForm, season_id: value })}
                placeholder="Select a season"
                options={seasonOptions.map(option => ({
                  ...option,
                  value: option.value || "season-default" // Ensure no empty string values
                }))}
                label="Season"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Match Date</Label>
              <div className="flex items-center">
                <DatePicker
                  id="date"
                  date={matchForm.date ? new Date(matchForm.date) : new Date()}
                  onSelect={handleDateChange}
                />
                <Calendar className="h-4 w-4 ml-2 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="home_team">Home Team</Label>
              <SearchableSelect
                value={matchForm.home_team_id ? matchForm.home_team_id.toString() : "home-default"}
                onValueChange={handleHomeTeamChange}
                placeholder="Select home team"
                options={teamOptions.map(option => ({
                  ...option,
                  value: option.value || "home-default" // Ensure no empty string values
                }))}
                label="Home Team"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="away_team">Away Team</Label>
              <SearchableSelect
                value={matchForm.away_team_id ? matchForm.away_team_id.toString() : "away-default"}
                onValueChange={handleAwayTeamChange}
                placeholder="Select away team"
                options={awayTeamOptions.map(option => ({
                  ...option,
                  value: option.value || "away-default" // Ensure no empty string values
                }))}
                label="Away Team"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stadium">Stadium</Label>
              <Input
                id="stadium"
                className="bg-gray-800 border-gray-700"
                value={matchForm.stadium}
                onChange={(e) => setMatchForm({ ...matchForm, stadium: e.target.value })}
                placeholder="Will use home team's stadium if empty"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                className="bg-gray-800 border-gray-700"
                value={matchForm.country}
                onChange={(e) => setMatchForm({ ...matchForm, country: e.target.value })}
                placeholder="Will use league country if empty"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {dialogAction === "add" ? "Add Match" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MatchesManagement;