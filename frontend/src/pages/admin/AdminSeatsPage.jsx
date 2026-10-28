import { useState, useEffect } from "react";
import { Armchair, Sparkles, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { theaterApi } from "../../api/theaterApi";
import { screenApi } from "../../api/screenApi";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";

export default function AdminSeatsPage() {
  const { showToast } = useToast();
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState("");
  const [screens, setScreens] = useState([]);
  const [selectedScreen, setSelectedScreen] = useState("");
  const [existingSeats, setExistingSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Layout Generator Builder Rows
  const [rowsConfig, setRowsConfig] = useState([
    { row: "A", seatsCount: 10, seatType: "regular", priceMultiplier: 1.0 },
    { row: "B", seatsCount: 10, seatType: "regular", priceMultiplier: 1.0 },
    { row: "C", seatsCount: 10, seatType: "premium", priceMultiplier: 1.3 },
    { row: "D", seatsCount: 8, seatType: "recliner", priceMultiplier: 1.6 },
  ]);

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const res = await theaterApi.getAll();
        if (res.data.success && res.data.data.length > 0) {
          setTheaters(res.data.data);
          setSelectedTheater(res.data.data[0]._id);
        }
      } catch {
        showToast("Failed to load theaters", "error");
      }
    };
    fetchTheaters();
  }, []);

  useEffect(() => {
    const fetchScreens = async () => {
      if (!selectedTheater) return;
      try {
        const res = await adminApi.getScreensByTheater(selectedTheater);
        if (res.data.success) {
          setScreens(res.data.data || []);
          if (res.data.data.length > 0) {
            setSelectedScreen(res.data.data[0]._id);
          } else {
            setSelectedScreen("");
            setExistingSeats([]);
          }
        }
      } catch {
        showToast("Failed to load screens", "error");
      }
    };
    fetchScreens();
  }, [selectedTheater]);

  const fetchScreenSeats = async () => {
    if (!selectedScreen) return;
    try {
      setLoadingSeats(true);
      const res = await screenApi.getById(selectedScreen);
      if (res.data.success) {
        setExistingSeats(res.data.data.seats || []);
      }
    } catch {
      showToast("Failed to load seat layout", "error");
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    fetchScreenSeats();
  }, [selectedScreen]);

  const handleAddRow = () => {
    const nextChar = String.fromCharCode(65 + rowsConfig.length); // A, B, C, D...
    setRowsConfig([
      ...rowsConfig,
      { row: nextChar, seatsCount: 10, seatType: "regular", priceMultiplier: 1.0 },
    ]);
  };

  const handleRemoveRow = (index) => {
    setRowsConfig(rowsConfig.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index, field, value) => {
    const updated = [...rowsConfig];
    updated[index][field] = value;
    if (field === "seatType") {
      updated[index].priceMultiplier = value === "recliner" ? 1.6 : value === "premium" ? 1.3 : 1.0;
    }
    setRowsConfig(updated);
  };

  const handleGenerateLayout = async () => {
    if (!selectedScreen) {
      showToast("Please select a screen", "error");
      return;
    }

    try {
      setGenerating(true);
      const res = await adminApi.generateSeatLayout({
        screenId: selectedScreen,
        rowsConfig,
      });

      if (res.data.success) {
        showToast(res.data.message || "Seats generated successfully", "success");
        fetchScreenSeats();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to generate seat layout", "error");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Seat Layout Designer</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure seating tiers, pricing multipliers, and row arrangements for each screen.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <Select
          label="1. Select Cinema Theater"
          value={selectedTheater}
          onChange={(e) => setSelectedTheater(e.target.value)}
          options={theaters.map((t) => ({ label: `${t.name} (${t.city})`, value: t._id }))}
          placeholder=""
        />

        <Select
          label="2. Select Auditorium Screen"
          value={selectedScreen}
          onChange={(e) => setSelectedScreen(e.target.value)}
          options={screens.map((s) => ({ label: `${s.name} (${s.screenType})`, value: s._id }))}
          placeholder={screens.length === 0 ? "No screens available" : ""}
          disabled={screens.length === 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Layout Generator Form */}
        <div className="bg-white dark:bg-[#0e1626]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Row Configuration</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Define rows, seats per row, and tiers</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleAddRow}>
              <Plus className="w-4 h-4" /> Add Row
            </Button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {rowsConfig.map((row, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10"
              >
                <div className="w-14">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Row</span>
                  <input
                    type="text"
                    value={row.row}
                    onChange={(e) => handleUpdateRow(idx, "row", e.target.value.toUpperCase())}
                    className="w-full font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                    maxLength={2}
                  />
                </div>

                <div className="w-20">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Seats</span>
                  <input
                    type="number"
                    value={row.seatsCount}
                    min={1}
                    max={30}
                    onChange={(e) => handleUpdateRow(idx, "seatsCount", e.target.value)}
                    className="w-full font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs"
                  />
                </div>

                <div className="flex-1">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Tier Type</span>
                  <select
                    value={row.seatType}
                    onChange={(e) => handleUpdateRow(idx, "seatType", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-2 py-1 text-xs font-medium"
                  >
                    <option value="regular">Regular (1.0x)</option>
                    <option value="premium">Premium (1.3x)</option>
                    <option value="recliner">Recliner (1.6x)</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    title="Remove row"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total to generate:{" "}
              <strong className="text-slate-900 dark:text-white">
                {rowsConfig.reduce((acc, r) => acc + (Number(r.seatsCount) || 0), 0)} seats
              </strong>
            </span>

            <Button
              variant="primary"
              size="md"
              onClick={handleGenerateLayout}
              loading={generating}
              disabled={!selectedScreen}
            >
              <Sparkles className="w-4 h-4" /> Generate Layout
            </Button>
          </div>
        </div>

        {/* Existing Layout Preview */}
        <div className="bg-white dark:bg-[#0e1626]/90 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Active Seat Layout Preview</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {existingSeats.length} seats currently configured on this screen
              </p>
            </div>
          </div>

          {loadingSeats ? (
            <Loader text="Loading seats preview..." />
          ) : existingSeats.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
              No seat layout generated yet for this screen.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-2 p-2">
              {/* Screen indicator */}
              <div className="h-1.5 w-3/4 mx-auto bg-indigo-500 rounded-full mb-6 opacity-70" />

              {/* Group preview by row */}
              {Array.from(new Set(existingSeats.map((s) => s.row))).map((rowLetter) => (
                <div key={rowLetter} className="flex items-center justify-center gap-1.5">
                  <span className="w-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">{rowLetter}</span>
                  <div className="flex flex-wrap items-center gap-1">
                    {existingSeats
                      .filter((s) => s.row === rowLetter)
                      .map((seat) => {
                        let color = "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200";
                        if (seat.seatType === "recliner") color = "bg-purple-100 dark:bg-purple-900/40 border-purple-300 dark:border-purple-600 text-purple-800 dark:text-purple-300";
                        if (seat.seatType === "premium") color = "bg-sky-100 dark:bg-sky-900/40 border-sky-300 dark:border-sky-600 text-sky-800 dark:text-sky-300";

                        return (
                          <div
                            key={seat._id}
                            title={`${seat.seatLabel} (${seat.seatType})`}
                            className={`w-6 h-6 rounded border text-[10px] font-bold flex items-center justify-center shadow-2xs ${color}`}
                          >
                            {seat.seatNumber}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

