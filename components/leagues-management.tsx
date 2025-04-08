import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, Calendar, ArrowLeft } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LeaguesManagement({
  leagues,
  seasons,
  onAddLeague,
  onEditLeague,
  onDeleteLeague,
  supabase
}) {
  // League states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("add"); // 'add' or 'edit'
  const [leagueForm, setLeagueForm] = useState({
    league_id: "",
    name: "",
    country: "",
  });

  // League seasons states
  const [viewMode, setViewMode] = useState("leagues"); // 'leagues' or 'seasons'
  const [currentLeague, setCurrentLeague] = useState(null);
  const [leagueSeasons, setLeagueSeasons] = useState([]);
  const [openSeasonDialog, setOpenSeasonDialog] = useState(false);
  const [seasonDialogAction, setSeasonDialogAction] = useState("add");
  const [leagueSeasonForm, setLeagueSeasonForm] = useState({
    league_id: "",
    season_id: "",
    total_matches: 0,
  });

  // Fetch league seasons when a league is selected
  useEffect(() => {
    if (currentLeague && viewMode === "seasons") {
      fetchLeagueSeasons(currentLeague.league_id);
    }
  }, [currentLeague, viewMode]);

  // Fetch league seasons data from supabase
  const fetchLeagueSeasons = async (leagueId) => {
    try {
      const { data, error } = await supabase
        .from('league_seasons')
        .select(`
          league_id,
          season_id,
          total_matches,
          seasons (season_id, start_date, end_date)
        `)
        .eq('league_id', leagueId);

      if (error) throw error;
      setLeagueSeasons(data || []);
    } catch (error) {
      console.error("Error fetching league seasons:", error);
    }
  };

  // League dialog handlers
  const openAddDialog = () => {
    setDialogAction("add");
    setLeagueForm({
      league_id: "",
      name: "",
      country: "",
    });
    setOpenDialog(true);
  };

  const openEditDialog = (league) => {
    setDialogAction("edit");
    setLeagueForm({ ...league });
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (dialogAction === "add") {
      onAddLeague(leagueForm);
    } else {
      onEditLeague(leagueForm);
    }
    setOpenDialog(false);
  };

  const handleInputChange = (field, value) => {
    setLeagueForm({
      ...leagueForm,
      [field]: value,
    });
  };

  // League season handlers
  const viewLeagueSeasons = (league) => {
    setCurrentLeague(league);
    setViewMode("seasons");
  };

  const backToLeagues = () => {
    setViewMode("leagues");
    setCurrentLeague(null);
  };

  const openAddSeasonDialog = () => {
    setSeasonDialogAction("add");
    setLeagueSeasonForm({
      league_id: currentLeague.league_id,
      season_id: "",
      total_matches: 0,
    });
    setOpenSeasonDialog(true);
  };

  const openEditSeasonDialog = (leagueSeason) => {
    setSeasonDialogAction("edit");
    setLeagueSeasonForm({
      league_id: leagueSeason.league_id,
      season_id: leagueSeason.season_id,
      total_matches: leagueSeason.total_matches,
    });
    setOpenSeasonDialog(true);
  };

  const handleSeasonFormChange = (field, value) => {
    setLeagueSeasonForm({
      ...leagueSeasonForm,
      [field]: field === "total_matches" ? parseInt(value, 10) || 0 : value,
    });
  };

  const handleSeasonSubmit = async () => {
    try {
      if (seasonDialogAction === "add") {
        const { error } = await supabase
          .from('league_seasons')
          .insert([{
            league_id: leagueSeasonForm.league_id,
            season_id: leagueSeasonForm.season_id,
            total_matches: leagueSeasonForm.total_matches,
          }]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('league_seasons')
          .update({
            total_matches: leagueSeasonForm.total_matches,
          })
          .eq('league_id', leagueSeasonForm.league_id)
          .eq('season_id', leagueSeasonForm.season_id);

        if (error) throw error;
      }

      fetchLeagueSeasons(currentLeague.league_id);
      setOpenSeasonDialog(false);
    } catch (error) {
      console.error("Error saving league season:", error);
    }
  };

  const handleDeleteLeagueSeason = async (leagueId, seasonId) => {
    try {
      const { error } = await supabase
        .from('league_seasons')
        .delete()
        .eq('league_id', leagueId)
        .eq('season_id', seasonId);

      if (error) throw error;
      fetchLeagueSeasons(currentLeague.league_id);
    } catch (error) {
      console.error("Error deleting league season:", error);
    }
  };

  // Render functions
  const renderLeaguesView = () => (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Leagues</CardTitle>
        {/* <Button onClick={openAddDialog} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add League
        </Button> */}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-800">
              <TableHead>League ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagues.length === 0 ? (
              <TableRow className="border-gray-800">
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No leagues found. Add a new one.
                </TableCell>
              </TableRow>
            ) : (
              leagues.map((league) => (
                <TableRow key={league.league_id} className="border-gray-800 hover:bg-gray-800">
                  <TableCell>{league.league_id}</TableCell>
                  <TableCell>{league.name}</TableCell>
                  <TableCell>{league.country}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewLeagueSeasons(league)}
                        title="View Seasons"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(league)}
                        title="Edit League"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteLeague(league.league_id)}
                        title="Delete League"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </>
  );

  const renderSeasonsView = () => (
    <>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={backToLeagues} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl">
            {currentLeague?.name} - Seasons
          </CardTitle>
        </div>
        <Button onClick={openAddSeasonDialog} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Season
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-800">
              <TableHead>Season ID</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Total Matches</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leagueSeasons.length === 0 ? (
              <TableRow className="border-gray-800">
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No seasons found for this league. Add a new one.
                </TableCell>
              </TableRow>
            ) : (
              leagueSeasons.map((leagueSeason) => (
                <TableRow 
                  key={`${leagueSeason.league_id}-${leagueSeason.season_id}`} 
                  className="border-gray-800 hover:bg-gray-800"
                >
                  <TableCell>{leagueSeason.season_id}</TableCell>
                  <TableCell>
                    {leagueSeason.seasons ? 
                      `${new Date(leagueSeason.seasons.start_date).toLocaleDateString()} - ${new Date(leagueSeason.seasons.end_date).toLocaleDateString()}` : 
                      leagueSeason.season_id}
                  </TableCell>
                  <TableCell>{leagueSeason.total_matches}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditSeasonDialog(leagueSeason)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteLeagueSeason(leagueSeason.league_id, leagueSeason.season_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </>
  );

  return (
    <Card className="bg-gray-900 border-gray-800">
      {viewMode === "leagues" ? renderLeaguesView() : renderSeasonsView()}

      {/* League dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "add" ? "Add New League" : "Edit League"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {dialogAction === "add" && (
              <div className="space-y-2">
                <Label htmlFor="league_id">League ID</Label>
                <Input
                  id="league_id"
                  className="bg-gray-800 text-white border-gray-700"
                  value={leagueForm.league_id}
                  onChange={(e) => handleInputChange("league_id", e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">League Name</Label>
              <Input
                id="name"
                className="bg-gray-800 text-white border-gray-700"
                value={leagueForm.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                className="bg-gray-800 text-white border-gray-700"
                value={leagueForm.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {dialogAction === "add" ? "Add League" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* League season dialog */}
      <Dialog open={openSeasonDialog} onOpenChange={setOpenSeasonDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {seasonDialogAction === "add" ? "Add Season to League" : "Edit League Season"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="season_id">Season</Label>
              <Select
                value={leagueSeasonForm.season_id}
                onValueChange={(value) => handleSeasonFormChange("season_id", value)}
                disabled={seasonDialogAction === "edit"}
              >
                <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Select a season" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  {seasons.map((season) => (
                    <SelectItem key={season.season_id} value={season.season_id}>
                      {`${season.season_id} (${new Date(season.start_date).toLocaleDateString()} - ${new Date(season.end_date).toLocaleDateString()})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_matches">Total Matches</Label>
              <Input
                id="total_matches"
                type="number"
                className="bg-gray-800 text-white border-gray-700"
                value={leagueSeasonForm.total_matches}
                onChange={(e) => handleSeasonFormChange("total_matches", e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenSeasonDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSeasonSubmit}>
              {seasonDialogAction === "add" ? "Add Season" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}