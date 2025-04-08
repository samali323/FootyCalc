import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, CalendarRange, Search, RefreshCw } from "lucide-react";
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

export default function TeamsManagement({
  teams,
  leagues,
  onAddTeam,
  onEditTeam,
  onDeleteTeam,
  onViewTeamSeasons,
  onSearch,  // Added prop for search handler
  searchTerm, // Added prop for search term state
  loading
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("add"); // 'add' or 'edit'
  const [teamForm, setTeamForm] = useState({
    team_id: "",
    name: "",
    city: "",
    country: "",
    stadium: "",
    capacity: "",
    founded: "",
  });

  const openAddDialog = () => {
    setDialogAction("add");
    setTeamForm({
      team_id: "",
      name: "",
      city: "",
      country: "",
      stadium: "",
      capacity: "",
      founded: "",
    });
    setOpenDialog(true);
  };

  const openEditDialog = (team) => {
    setDialogAction("edit");
    setTeamForm({ ...team });
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (dialogAction === "add") {
      onAddTeam(teamForm);
    } else {
      onEditTeam(teamForm);
    }
    setOpenDialog(false);
  };

  const handleInputChange = (field, value) => {
    setTeamForm({
      ...teamForm,
      [field]: value,
    });
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Teams</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Input
              placeholder="Search teams..."
              className="w-64 bg-gray-800 border-gray-700 pl-8"
              value={searchTerm} // Use prop instead of local state
              onChange={(e) => onSearch(e.target.value)} // Call prop function
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <Button onClick={openAddDialog} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-800">
              <TableHead>Team ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Stadium</TableHead>
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
              {teams.length === 0 ? ( // Use teams directly instead of filteredTeams
                <TableRow className="border-gray-800">
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No teams found. Add a new one or adjust your search.
                  </TableCell>
                </TableRow>
              ) : (
                teams.map((team) => ( // Use teams directly instead of filteredTeams
                  <TableRow key={team.team_id} className="border-gray-800 hover:bg-gray-800">
                    <TableCell>{team.team_id}</TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell>{team.city}</TableCell>
                    <TableCell>{team.country}</TableCell>
                    <TableCell>{team.stadium}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewTeamSeasons(team)}
                          title="View Team Seasons"
                        >
                          <CalendarRange className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(team)}
                          title="Edit Team"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteTeam(team.team_id)}
                          title="Delete Team"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>}
        </Table>
      </CardContent>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "add" ? "Add New Team" : "Edit Team"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {dialogAction === "add" && (
              <div className="space-y-2">
                <Label htmlFor="team_id">Team ID</Label>
                <Input
                  id="team_id"
                  className="bg-gray-800 text-white border-gray-700"
                  value={teamForm.team_id}
                  onChange={(e) => handleInputChange("team_id", e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                className="bg-gray-800 text-white border-gray-700"
                value={teamForm.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                className="bg-gray-800 text-white border-gray-700"
                value={teamForm.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                className="bg-gray-800 text-white border-gray-700"
                value={teamForm.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stadium">Stadium</Label>
              <Input
                id="stadium"
                className="bg-gray-800 text-white border-gray-700"
                value={teamForm.stadium}
                onChange={(e) => handleInputChange("stadium", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  className="bg-gray-800 text-white border-gray-700"
                  value={teamForm.capacity}
                  onChange={(e) => handleInputChange("capacity", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="founded">Founded Year</Label>
                <Input
                  id="founded"
                  type="number"
                  className="bg-gray-800 text-white border-gray-700"
                  value={teamForm.founded}
                  onChange={(e) => handleInputChange("founded", e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {dialogAction === "add" ? "Add Team" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}