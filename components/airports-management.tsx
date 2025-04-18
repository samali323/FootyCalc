import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, RefreshCw, MapPin } from "lucide-react";
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

export default function AirportsManagement({
  airports,
  allTeams,
  onAddAirport,
  onEditAirport,
  onDeleteAirport,
  isLoading,
  onSearch,  // Added prop for search handler
  searchTerm, // Added prop for search term state
  loading
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("add"); // 'add' or 'edit'
  const [airportForm, setAirportForm] = useState({
    team_id: "",
    iata_code: "",
    airport_name: "",
    latitude: "",
    longitude: ""
  });

  const openAddDialog = () => {
    setDialogAction("add");
    setAirportForm({
      team_id: "",
      iata_code: "",
      airport_name: "",
      latitude: "",
      longitude: ""
    });
    setOpenDialog(true);
  };

  const openEditDialog = (airport) => {
    setDialogAction("edit");
    // Create a deep copy to prevent modifying the original data
    setAirportForm({ ...airport });
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    // Convert numeric fields to appropriate types
    const formattedForm = {
      ...airportForm,
      team_id: parseInt(airportForm.team_id),
      latitude: parseFloat(airportForm.latitude) || null,
      longitude: parseFloat(airportForm.longitude) || null
    };

    if (dialogAction === "add") {
      onAddAirport(formattedForm);
    } else {
      onEditAirport(formattedForm);
    }
    setOpenDialog(false);
  };

  const handleInputChange = (field, value) => {
    setAirportForm({
      ...airportForm,
      [field]: value,
    });
  };

  // Find team name from team ID
  const getTeamName = (teamId) => {
    const team = allTeams.find(t => t.team_id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CardTitle className="text-xl">Airports</CardTitle>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          {/* Search Input with Icon */}
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search airports..."
              className="w-full bg-gray-800 border-gray-700 pl-8"
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
            />
            <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>

          {/* Add Button */}
          <Button onClick={openAddDialog} size="sm" className="w-full sm:w-auto">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Airport
          </Button>
        </div>
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
                <TableHead>IATA Code</TableHead>
                <TableHead>Airport Name</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Coordinates</TableHead>
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
                {airports.length === 0 ? ( // Use airports directly instead of filteredAirports
                  <TableRow className="border-gray-800">
                    <TableCell colSpan={5} className="text-center text-gray-500">
                      No airports found. Add a new one or adjust your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  airports.map((airport) => ( // Use airports directly instead of filteredAirports
                    <TableRow key={`${airport.team_id}-${airport.iata_code}`} className="border-gray-800 hover:bg-gray-800">
                      <TableCell>{airport.iata_code}</TableCell>
                      <TableCell>{airport.airport_name}</TableCell>
                      <TableCell>{getTeamName(airport.team_id)}</TableCell>
                      <TableCell>
                        {airport.latitude && airport.longitude ?
                          `${airport.latitude.toFixed(4)}, ${airport.longitude.toFixed(4)}` :
                          'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(airport)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteAirport(airport.team_id, airport.iata_code)}
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
        )}
      </CardContent>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "add" ? "Add New Airport" : "Edit Airport"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="space-y-2">
              <Label htmlFor="team_id">Team</Label>
              <Select
                value={airportForm.team_id.toString()}
                onValueChange={(value) => handleInputChange("team_id", value)}
                disabled={dialogAction === "edit"} // Disable in edit mode since it's part of the primary key
              >
                <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700 max-h-60">
                  {allTeams.map((team) => (
                    <SelectItem key={team.team_id} value={team.team_id.toString()}>
                      {team.name} ({team.city}, {team.country})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iata_code">IATA Code</Label>
              <Input
                id="iata_code"
                className="bg-gray-800 text-white border-gray-700"
                value={airportForm.iata_code}
                onChange={(e) => handleInputChange("iata_code", e.target.value.toUpperCase())}
                maxLength={3}
                disabled={dialogAction === "edit"} // Disable in edit mode since it's part of the primary key
                required
              />
              <p className="text-xs text-gray-400">3-letter IATA airport code (e.g., LHR, JFK)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="airport_name">Airport Name</Label>
              <Input
                id="airport_name"
                className="bg-gray-800 text-white border-gray-700"
                value={airportForm.airport_name}
                onChange={(e) => handleInputChange("airport_name", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  className="bg-gray-800 text-white border-gray-700"
                  value={airportForm.latitude}
                  onChange={(e) => handleInputChange("latitude", e.target.value)}
                  placeholder="-90 to 90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  className="bg-gray-800 text-white border-gray-700"
                  value={airportForm.longitude}
                  onChange={(e) => handleInputChange("longitude", e.target.value)}
                  placeholder="-180 to 180"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {dialogAction === "add" ? "Add Airport" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}