import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, ArrowLeft, RefreshCw } from "lucide-react";
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

export default function TeamSeasonsManagement({
  team,
  allLeagues,
  allSeasons,
  supabase,
  onBack
}) {
  const [teamSeasons, setTeamSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("add");
  const [teamSeasonForm, setTeamSeasonForm] = useState({
    team_id: "",
    league_id: "",
    season_id: "",
  });

  useEffect(() => {
    if (team) {
      fetchTeamSeasons();
    }
  }, [team]);

  const fetchTeamSeasons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('team_seasons')
        .select(`
          team_id,
          league_id,
          season_id,
          leagues (league_id, name, country),
          seasons (season_id, start_date, end_date)
        `)
        .eq('team_id', team.team_id);

      if (error) throw error;
      setTeamSeasons(data || []);
    } catch (error) {
      console.error("Error fetching team seasons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setDialogAction("add");
    setTeamSeasonForm({
      team_id: team.team_id,
      league_id: "",
      season_id: "",
    });
    setOpenDialog(true);
  };

  const openEditDialog = (teamSeason) => {
    setDialogAction("edit");
    setTeamSeasonForm({
      team_id: teamSeason.team_id,
      league_id: teamSeason.league_id,
      season_id: teamSeason.season_id,
    });
    setOpenDialog(true);
  };

  const handleFormChange = (field, value) => {
    setTeamSeasonForm({
      ...teamSeasonForm,
      [field]: field === "team_id" || field === "league_id" ? parseInt(value, 10) : value,
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialogAction === "add") {
        const { error } = await supabase
          .from('team_seasons')
          .insert([{
            team_id: teamSeasonForm.team_id,
            league_id: teamSeasonForm.league_id,
            season_id: teamSeasonForm.season_id,
          }]);

        if (error) throw error;
      } else {
        // For edit, we need to delete and re-insert since all fields are part of the primary key
        const { error: deleteError } = await supabase
          .from('team_seasons')
          .delete()
          .eq('team_id', teamSeasonForm.team_id)
          .eq('league_id', parseInt(teamSeasonForm.originalLeagueId))
          .eq('season_id', teamSeasonForm.originalSeasonId);

        if (deleteError) throw deleteError;

        const { error: insertError } = await supabase
          .from('team_seasons')
          .insert([{
            team_id: teamSeasonForm.team_id,
            league_id: teamSeasonForm.league_id,
            season_id: teamSeasonForm.season_id,
          }]);

        if (insertError) throw insertError;
      }

      fetchTeamSeasons();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving team season:", error);
    }
  };

  const handleDelete = async (leagueId, seasonId) => {
    try {
      const { error } = await supabase
        .from('team_seasons')
        .delete()
        .eq('team_id', team.team_id)
        .eq('league_id', leagueId)
        .eq('season_id', seasonId);

      if (error) throw error;
      fetchTeamSeasons();
    } catch (error) {
      console.error("Error deleting team season:", error);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="text-xl">
            {team?.name} - Seasons
          </CardTitle>
        </div>
        <Button onClick={openAddDialog} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Season
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center my-12">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800">
                <TableHead>League</TableHead>
                <TableHead>Season</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamSeasons.length === 0 ? (
                <TableRow className="border-gray-800">
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    No seasons found for this team. Add a new one.
                  </TableCell>
                </TableRow>
              ) : (
                teamSeasons.map((teamSeason) => (
                  <TableRow 
                    key={`${teamSeason.team_id}-${teamSeason.league_id}-${teamSeason.season_id}`}
                    className="border-gray-800 hover:bg-gray-800"
                  >
                    <TableCell>
                      {teamSeason.leagues ? teamSeason.leagues.name : 'Unknown League'}
                    </TableCell>
                    <TableCell>{teamSeason.season_id}</TableCell>
                    <TableCell>
                      {teamSeason.seasons ? 
                        `${new Date(teamSeason.seasons.start_date).toLocaleDateString()} - ${new Date(teamSeason.seasons.end_date).toLocaleDateString()}` : 
                        'Unknown Period'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(teamSeason)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(teamSeason.league_id, teamSeason.season_id)}
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
        )}
      </CardContent>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "add" ? "Add Season to Team" : "Edit Team Season"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="league_id">League</Label>
              <Select
                value={teamSeasonForm.league_id.toString()}
                onValueChange={(value) => handleFormChange("league_id", value)}
              >
                <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Select a league" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  {allLeagues.map((league) => (
                    <SelectItem key={league.league_id} value={league.league_id.toString()}>
                      {league.name} ({league.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season_id">Season</Label>
              <Select
                value={teamSeasonForm.season_id}
                onValueChange={(value) => handleFormChange("season_id", value)}
              >
                <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Select a season" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  {allSeasons.map((season) => (
                    <SelectItem key={season.season_id} value={season.season_id}>
                      {`${season.season_id} (${new Date(season.start_date).toLocaleDateString()} - ${new Date(season.end_date).toLocaleDateString()})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
    </Card>
  );
}