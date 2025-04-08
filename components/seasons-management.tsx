import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, Calendar } from "lucide-react";
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
import { format } from "date-fns";
import { DatePicker } from "./ui/date-picker";


export default function SeasonsManagement({
  seasons,
  onAddSeason,
  onEditSeason,
  onDeleteSeason,
}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState("add"); // 'add' or 'edit'
  const [seasonForm, setSeasonForm] = useState({
    season_id: "",
    start_date: "",
    end_date: "",
  });
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endYear, setEndYear] = useState(new Date().getFullYear() + 1);

  const openAddDialog = () => {
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

  const openEditDialog = (season) => {
    setDialogAction("edit");
    setSeasonForm({ ...season });
    
    // Parse years from season_id (e.g., "2024-2025")
    const [startYearStr, endYearStr] = season.season_id.split("-");
    setStartYear(parseInt(startYearStr));
    setEndYear(parseInt(endYearStr));
    
    setOpenDialog(true);
  };

  const handleSubmit = () => {
    if (dialogAction === "add") {
      onAddSeason(seasonForm);
    } else {
      onEditSeason(seasonForm);
    }
    setOpenDialog(false);
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

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Seasons</CardTitle>
        <Button onClick={openAddDialog} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Season
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-gray-800">
              <TableHead>Season ID</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seasons.length === 0 ? (
              <TableRow className="border-gray-800">
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No seasons found. Add a new one.
                </TableCell>
              </TableRow>
            ) : (
              seasons.map((season) => (
                <TableRow key={season.season_id} className="border-gray-800 hover:bg-gray-800">
                  <TableCell>{season.season_id}</TableCell>
                  <TableCell>{season.start_date}</TableCell>
                  <TableCell>{season.end_date}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(season)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteSeason(season.season_id)}
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
    </Card>
  );
}