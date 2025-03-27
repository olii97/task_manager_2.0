import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeMeal, type OpenAIModel, type NutritionItem } from "@/services/nutritionService";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Save, Trash2, Eye, Edit, Check, Calendar } from "lucide-react";
import { formatDistance, format, isToday, isYesterday } from "date-fns";
import { 
  saveMealEntry, 
  fetchMealEntries, 
  deleteMealEntry, 
  fetchMealEntryWithItems,
  mealEntryToNutritionResult,
  fetchDailyTotals,
  fetchMealsByDate,
  fetchDailyTotalsByDate,
  fetchLastSevenDays,
  type MealEntry,
  type DailyTotals 
} from "@/services/mealEntryService";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const calculateMacroPercentages = (totals: DailyTotals) => {
  const proteinCals = totals.protein * 4;
  const carbsCals = totals.carbs * 4;
  const fatCals = totals.fat * 9;
  const totalCals = proteinCals + carbsCals + fatCals;
  
  return {
    protein: totalCals > 0 ? (proteinCals / totalCals) * 100 : 0,
    carbs: totalCals > 0 ? (carbsCals / totalCals) * 100 : 0,
    fat: totalCals > 0 ? (fatCals / totalCals) * 100 : 0
  };
};

const MacroBar = ({ totals }: { totals: DailyTotals }) => {
  const percentages = calculateMacroPercentages(totals);
  
  return (
    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="absolute h-full bg-green-400" 
        style={{ width: `${percentages.protein}%` }}
      ></div>
      <div 
        className="absolute h-full bg-blue-400" 
        style={{ width: `${percentages.carbs}%`, left: `${percentages.protein}%` }}
      ></div>
      <div 
        className="absolute h-full bg-yellow-400" 
        style={{ width: `${percentages.fat}%`, left: `${percentages.protein + percentages.carbs}%` }}
      ></div>
    </div>
  );
};

const MacroTooltip = ({ totals }: { totals: DailyTotals }) => {
  const percentages = calculateMacroPercentages(totals);
  
  return (
    <div className="space-y-2">
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-green-400" 
          style={{ width: `${percentages.protein}%` }}
        ></div>
        <div 
          className="absolute h-full bg-blue-400" 
          style={{ width: `${percentages.carbs}%`, left: `${percentages.protein}%` }}
        ></div>
        <div 
          className="absolute h-full bg-yellow-400" 
          style={{ width: `${percentages.fat}%`, left: `${percentages.protein + percentages.carbs}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-sm mr-1"></div>
          <span>Protein: {percentages.protein.toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-blue-400 rounded-sm mr-1"></div>
          <span>Carbs: {percentages.carbs.toFixed(1)}%</span>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-yellow-400 rounded-sm mr-1"></div>
          <span>Fat: {percentages.fat.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

const Nutrition = () => {
  const { session } = useAuth();
  const userId = session?.user.id;
  
  const [mealDescription, setMealDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nutritionResults, setNutritionResults] = useState<any>(null);
  const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    mealCount: 0
  });
  const [model, setModel] = useState<OpenAIModel>("gpt-4-turbo-preview");
  const [editableItems, setEditableItems] = useState<NutritionItem[]>([]);
  const [editableTotals, setEditableTotals] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  });
  const [weeklyData, setWeeklyData] = useState<{ date: string; totals: DailyTotals }[]>([]);

  // Load meal entries when component mounts or date changes
  useEffect(() => {
    if (userId) {
      loadMealEntries();
      loadDailyTotals();
      loadWeeklyData();
    }
  }, [userId, selectedDate]);

  // Calculate totals when items change
  useEffect(() => {
    if (isEditing && editableItems.length > 0) {
      const newTotals = editableItems.reduce(
        (acc, item) => {
          return {
            calories: acc.calories + Number(item.calories || 0),
            protein: acc.protein + Number(item.protein || 0),
            carbs: acc.carbs + Number(item.carbs || 0),
            fat: acc.fat + Number(item.fat || 0),
            fiber: acc.fiber + Number(item.fiber || 0)
          };
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
      );
      setEditableTotals(newTotals);
    }
  }, [isEditing, editableItems]);

  const loadMealEntries = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const entries = await fetchMealsByDate(userId, selectedDate.toISOString());
      setMealEntries(entries);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load meal history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDailyTotals = async () => {
    if (!userId) return;
    
    try {
      const totals = await fetchDailyTotalsByDate(userId, selectedDate.toISOString());
      setDailyTotals(totals);
    } catch (error) {
      console.error("Failed to load daily totals:", error);
    }
  };

  const loadWeeklyData = async () => {
    if (!userId) return;
    try {
      const data = await fetchLastSevenDays(userId);
      setWeeklyData(data);
    } catch (error) {
      console.error("Failed to load weekly data:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!mealDescription.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meal description",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const results = await analyzeMeal(mealDescription, model);
      setNutritionResults(results);
      setEditableItems(JSON.parse(JSON.stringify(results.items)));
      setEditableTotals(JSON.parse(JSON.stringify(results.totals)));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze meal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!userId || !nutritionResults) {
      toast({
        title: "Error",
        description: "No meal data to save",
        variant: "destructive",
      });
      return;
    }

    // If editing, use the edited values
    const dataToSave = isEditing 
      ? { 
          items: editableItems, 
          totals: editableTotals 
        } 
      : nutritionResults;

    setIsSaving(true);
    try {
      await saveMealEntry(userId, mealDescription, dataToSave, selectedDate.toISOString());
      toast({
        title: "Success",
        description: "Meal saved successfully",
      });
      // Exit edit mode
      setIsEditing(false);
      // Refresh meal entries list and daily totals
      await Promise.all([loadMealEntries(), loadDailyTotals()]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save meal",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteMealEntry(mealId);
      toast({
        title: "Success",
        description: "Meal deleted successfully",
      });
      // Update local state to remove the deleted meal
      setMealEntries(prevEntries => prevEntries.filter(entry => entry.id !== mealId));
      // Reload daily totals
      loadDailyTotals();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete meal",
        variant: "destructive",
      });
    }
  };

  const handleViewMeal = async (mealId: string) => {
    try {
      const { mealEntry, nutritionItems } = await fetchMealEntryWithItems(mealId);
      setMealDescription(mealEntry.meal_description);
      const result = mealEntryToNutritionResult(mealEntry, nutritionItems);
      setNutritionResults(result);
      setEditableItems(JSON.parse(JSON.stringify(result.items)));
      setEditableTotals(JSON.parse(JSON.stringify(result.totals)));
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load meal details",
        variant: "destructive",
      });
    }
  };

  const toggleEditMode = () => {
    if (!isEditing && nutritionResults) {
      // Enter edit mode
      setEditableItems(JSON.parse(JSON.stringify(nutritionResults.items)));
      setEditableTotals(JSON.parse(JSON.stringify(nutritionResults.totals)));
    }
    setIsEditing(!isEditing);
  };

  const updateItemField = (index: number, field: keyof NutritionItem, value: string) => {
    const newItems = [...editableItems];
    
    if (field === 'food_item') {
      newItems[index][field] = value;
    } else {
      // Convert to number for numerical fields
      const numValue = value === '' ? 0 : Number(value);
      newItems[index][field] = numValue as any;
    }
    
    setEditableItems(newItems);
  };

  const addNewItem = () => {
    setEditableItems([
      ...editableItems,
      { food_item: '', calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    ]);
  };

  const removeItem = (index: number) => {
    setEditableItems(editableItems.filter((_, i) => i !== index));
  };

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Overview Card */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-right">Calories</th>
                      <th className="px-4 py-2 text-right">Protein</th>
                      <th className="px-4 py-2 text-right">Carbs</th>
                      <th className="px-4 py-2 text-right">Fat</th>
                      <th className="px-4 py-2 text-right">Fiber</th>
                      <th className="px-4 py-2 text-right">Meals</th>
                      <th className="px-4 py-2 text-center">Macros</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyData.map((day) => {
                      const date = new Date(day.date);
                      const isCurrentDay = isToday(date);
                      const isPreviousDay = isYesterday(date);
                      const dateDisplay = isCurrentDay 
                        ? "Today" 
                        : isPreviousDay 
                          ? "Yesterday" 
                          : format(date, "EEE, MMM d");

                      return (
                        <TooltipProvider key={day.date}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <tr 
                                className={cn(
                                  "border-b hover:bg-muted/50 cursor-pointer",
                                  isCurrentDay && "bg-muted"
                                )}
                                onClick={() => setSelectedDate(date)}
                              >
                                <td className="px-4 py-2">{dateDisplay}</td>
                                <td className="px-4 py-2 text-right">{Math.round(day.totals.calories)}</td>
                                <td className="px-4 py-2 text-right">{day.totals.protein.toFixed(1)}g</td>
                                <td className="px-4 py-2 text-right">{day.totals.carbs.toFixed(1)}g</td>
                                <td className="px-4 py-2 text-right">{day.totals.fat.toFixed(1)}g</td>
                                <td className="px-4 py-2 text-right">{day.totals.fiber.toFixed(1)}g</td>
                                <td className="px-4 py-2 text-right">{day.totals.mealCount}</td>
                                <td className="px-4 py-2">
                                  <div className="w-32 mx-auto">
                                    <MacroBar totals={day.totals} />
                                  </div>
                                </td>
                              </tr>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="w-64">
                              <div className="space-y-2">
                                <p className="font-medium">{format(date, "MMMM d, yyyy")}</p>
                                <div className="space-y-2">
                                  <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="absolute h-full bg-green-400" 
                                      style={{ width: `${calculateMacroPercentages(day.totals).protein}%` }}
                                    ></div>
                                    <div 
                                      className="absolute h-full bg-blue-400" 
                                      style={{ width: `${calculateMacroPercentages(day.totals).carbs}%`, left: `${calculateMacroPercentages(day.totals).protein}%` }}
                                    ></div>
                                    <div 
                                      className="absolute h-full bg-yellow-400" 
                                      style={{ width: `${calculateMacroPercentages(day.totals).fat}%`, left: `${calculateMacroPercentages(day.totals).protein + calculateMacroPercentages(day.totals).carbs}%` }}
                                    ></div>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 bg-green-400 rounded-sm mr-1"></div>
                                      <span>Protein: {calculateMacroPercentages(day.totals).protein.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 bg-blue-400 rounded-sm mr-1"></div>
                                      <span>Carbs: {calculateMacroPercentages(day.totals).carbs.toFixed(1)}%</span>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 bg-yellow-400 rounded-sm mr-1"></div>
                                      <span>Fat: {calculateMacroPercentages(day.totals).fat.toFixed(1)}%</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meal Analysis Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Meal Analysis</CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="model-select">Model</Label>
                  <ToggleGroup 
                    type="single" 
                    value={model}
                    onValueChange={(value) => value && setModel(value as OpenAIModel)}
                    className="justify-start mb-2"
                  >
                    <ToggleGroupItem value="gpt-3.5-turbo" size="sm">
                      GPT-3.5
                    </ToggleGroupItem>
                    <ToggleGroupItem value="gpt-4-turbo-preview" size="sm">
                      GPT-4
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <Textarea
                  placeholder="Describe your meal (e.g., '2 eggs, 2 slices of whole wheat toast with butter, and a cup of coffee with milk')"
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing}
                    className="flex-1"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Meal"
                    )}
                  </Button>
                  {nutritionResults && !isEditing && (
                    <Button 
                      onClick={toggleEditMode}
                      variant="outline"
                      title="Edit nutrition data"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {isEditing && (
                    <Button 
                      onClick={toggleEditMode}
                      variant="outline"
                      title="Finish editing"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  {nutritionResults && (
                    <Button 
                      onClick={handleSaveMeal} 
                      disabled={isSaving}
                      variant="outline"
                      title="Save meal"
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Table */}
              {nutritionResults && !isEditing && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Nutrition Information</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Food Item</th>
                          <th className="px-4 py-2 text-right">Calories</th>
                          <th className="px-4 py-2 text-right">Protein (g)</th>
                          <th className="px-4 py-2 text-right">Carbs (g)</th>
                          <th className="px-4 py-2 text-right">Fat (g)</th>
                          <th className="px-4 py-2 text-right">Fiber (g)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nutritionResults.items.map((item: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">{item.food_item}</td>
                            <td className="px-4 py-2 text-right">{item.calories}</td>
                            <td className="px-4 py-2 text-right">{item.protein}</td>
                            <td className="px-4 py-2 text-right">{item.carbs}</td>
                            <td className="px-4 py-2 text-right">{item.fat}</td>
                            <td className="px-4 py-2 text-right">{item.fiber}</td>
                          </tr>
                        ))}
                        <tr className="border-t bg-muted font-semibold">
                          <td className="px-4 py-2">Total</td>
                          <td className="px-4 py-2 text-right">{nutritionResults.totals.calories}</td>
                          <td className="px-4 py-2 text-right">{nutritionResults.totals.protein}</td>
                          <td className="px-4 py-2 text-right">{nutritionResults.totals.carbs}</td>
                          <td className="px-4 py-2 text-right">{nutritionResults.totals.fat}</td>
                          <td className="px-4 py-2 text-right">{nutritionResults.totals.fiber}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Editable Results Table */}
              {nutritionResults && isEditing && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Edit Nutrition Information</h3>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={addNewItem}
                      className="text-xs"
                    >
                      + Add Item
                    </Button>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-2 text-left">Food Item</th>
                          <th className="px-4 py-2 text-right">Calories</th>
                          <th className="px-4 py-2 text-right">Protein</th>
                          <th className="px-4 py-2 text-right">Carbs</th>
                          <th className="px-4 py-2 text-right">Fat</th>
                          <th className="px-4 py-2 text-right">Fiber</th>
                          <th className="px-4 py-2 text-right w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {editableItems.map((item, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-4 py-2">
                              <Input
                                value={item.food_item}
                                onChange={(e) => updateItemField(index, 'food_item', e.target.value)}
                                className="h-8 p-1"
                              />
                            </td>
                            <td className="px-2 py-2 text-right">
                              <Input
                                type="number"
                                value={item.calories}
                                onChange={(e) => updateItemField(index, 'calories', e.target.value)}
                                className="h-8 p-1 w-16"
                              />
                            </td>
                            <td className="px-2 py-2 text-right">
                              <Input
                                type="number"
                                value={item.protein}
                                onChange={(e) => updateItemField(index, 'protein', e.target.value)}
                                className="h-8 p-1 w-16"
                              />
                            </td>
                            <td className="px-2 py-2 text-right">
                              <Input
                                type="number"
                                value={item.carbs}
                                onChange={(e) => updateItemField(index, 'carbs', e.target.value)}
                                className="h-8 p-1 w-16"
                              />
                            </td>
                            <td className="px-2 py-2 text-right">
                              <Input
                                type="number"
                                value={item.fat}
                                onChange={(e) => updateItemField(index, 'fat', e.target.value)}
                                className="h-8 p-1 w-16"
                              />
                            </td>
                            <td className="px-2 py-2 text-right">
                              <Input
                                type="number"
                                value={item.fiber}
                                onChange={(e) => updateItemField(index, 'fiber', e.target.value)}
                                className="h-8 p-1 w-16"
                              />
                            </td>
                            <td className="px-2 py-2 text-right">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => removeItem(index)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t bg-muted font-semibold">
                          <td className="px-4 py-2">Total</td>
                          <td className="px-4 py-2 text-right">{editableTotals.calories.toFixed(1)}</td>
                          <td className="px-4 py-2 text-right">{editableTotals.protein.toFixed(1)}</td>
                          <td className="px-4 py-2 text-right">{editableTotals.carbs.toFixed(1)}</td>
                          <td className="px-4 py-2 text-right">{editableTotals.fat.toFixed(1)}</td>
                          <td className="px-4 py-2 text-right">{editableTotals.fiber.toFixed(1)}</td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Meal History Section */}
        <div className="space-y-6">
          {/* Daily Totals Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(selectedDate, "PPP")} Nutrition Totals
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {dailyTotals.mealCount} {dailyTotals.mealCount === 1 ? 'meal' : 'meals'} logged
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {dailyTotals.mealCount > 0 ? (
                <>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <p className="text-muted-foreground text-xs">Calories</p>
                      <p className="text-xl font-semibold">{Math.round(dailyTotals.calories)}</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <p className="text-muted-foreground text-xs">Protein</p>
                      <p className="text-xl font-semibold">{dailyTotals.protein.toFixed(1)}g</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <p className="text-muted-foreground text-xs">Carbs</p>
                      <p className="text-xl font-semibold">{dailyTotals.carbs.toFixed(1)}g</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <p className="text-muted-foreground text-xs">Fat</p>
                      <p className="text-xl font-semibold">{dailyTotals.fat.toFixed(1)}g</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <p className="text-muted-foreground text-xs">Fiber</p>
                      <p className="text-xl font-semibold">{dailyTotals.fiber.toFixed(1)}g</p>
                    </div>
                  </div>
                  
                  {/* Macro Distribution */}
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Macronutrient Distribution</p>
                    <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                      {/* Calculate macronutrient percentages */}
                      {(() => {
                        const proteinCals = dailyTotals.protein * 4;
                        const carbsCals = dailyTotals.carbs * 4;
                        const fatCals = dailyTotals.fat * 9;
                        const totalCals = proteinCals + carbsCals + fatCals;
                        
                        const proteinPct = totalCals > 0 ? (proteinCals / totalCals) * 100 : 0;
                        const carbsPct = totalCals > 0 ? (carbsCals / totalCals) * 100 : 0;
                        const fatPct = totalCals > 0 ? (fatCals / totalCals) * 100 : 0;
                        
                        return (
                          <>
                            <div 
                              className="absolute h-full bg-green-400" 
                              style={{ width: `${proteinPct}%` }}
                            ></div>
                            <div 
                              className="absolute h-full bg-blue-400" 
                              style={{ width: `${carbsPct}%`, left: `${proteinPct}%` }}
                            ></div>
                            <div 
                              className="absolute h-full bg-yellow-400" 
                              style={{ width: `${fatPct}%`, left: `${proteinPct + carbsPct}%` }}
                            ></div>
                          </>
                        );
                      })()}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex justify-between mt-2 text-xs">
                      {(() => {
                        const proteinCals = dailyTotals.protein * 4;
                        const carbsCals = dailyTotals.carbs * 4;
                        const fatCals = dailyTotals.fat * 9;
                        const totalCals = proteinCals + carbsCals + fatCals;
                        
                        const proteinPct = totalCals > 0 ? (proteinCals / totalCals) * 100 : 0;
                        const carbsPct = totalCals > 0 ? (carbsCals / totalCals) * 100 : 0;
                        const fatPct = totalCals > 0 ? (fatCals / totalCals) * 100 : 0;
                        
                        return (
                          <>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-green-400 rounded-sm mr-1"></div>
                              <span>Protein: {proteinPct.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-blue-400 rounded-sm mr-1"></div>
                              <span>Carbs: {carbsPct.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-yellow-400 rounded-sm mr-1"></div>
                              <span>Fat: {fatPct.toFixed(1)}%</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Daily Goals Reference */}
                  <div className="mt-4 bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-sm font-medium mb-2">Daily Goals Reference</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Protein Target:</span>
                        <span className="font-medium">{(0.8 * 70).toFixed(0)}g - {(2 * 70).toFixed(0)}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your Protein:</span>
                        <span className={`font-medium ${dailyTotals.protein < 0.8 * 70 ? 'text-red-500' : 'text-green-500'}`}>
                          {dailyTotals.protein.toFixed(1)}g
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Daily Fiber Target:</span>
                        <span className="font-medium">25g - 35g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your Fiber:</span>
                        <span className={`font-medium ${dailyTotals.fiber < 25 ? 'text-red-500' : 'text-green-500'}`}>
                          {dailyTotals.fiber.toFixed(1)}g
                        </span>
                      </div>
                      <div className="col-span-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          * Based on general recommendations for an average adult.
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-center">
                  No meals logged today
                </p>
              )}
            </CardContent>
          </Card>

          {/* Meal History List Card */}
          <Card>
            <CardHeader>
              <CardTitle>Meal History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : mealEntries.length === 0 ? (
                <p className="text-muted-foreground">
                  No meal history yet. Analyze and save meals to see them here.
                </p>
              ) : (
                <div className="space-y-4">
                  {mealEntries.map((entry) => (
                    <div key={entry.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium truncate max-w-[250px]">
                            {entry.meal_description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.meal_date ? formatDistance(new Date(entry.meal_date), new Date(), { addSuffix: true }) : 'Unknown date'}
                          </p>
                        </div>
                        <div className="flex items-start gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewMeal(entry.id as string)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteMeal(entry.id as string)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm">
                        <div>
                          <span className="font-medium">{entry.total_calories}</span>
                          <span className="text-muted-foreground ml-1">cal</span>
                        </div>
                        <div>
                          <span className="font-medium">{entry.total_protein}g</span>
                          <span className="text-muted-foreground ml-1">protein</span>
                        </div>
                        <div>
                          <span className="font-medium">{entry.total_carbs}g</span>
                          <span className="text-muted-foreground ml-1">carbs</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Nutrition; 