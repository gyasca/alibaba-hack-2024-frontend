import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

const FoodMetrics = ({ userId }) => {
    const [timeframe, setTimeframe] = useState("today");
    const [chartData, setChartData] = useState([]);
    const [foodScans, setFoodScans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFoodScans = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:3001/foodmodel/api/foodscans/1`);
                const data = response.data;

                const now = new Date();
                const filteredData = data.filter((scan) => {
                    const scanDate = new Date(scan.timestamp);
                    if (timeframe === "today") {
                        return scanDate.toDateString() === now.toDateString();
                    } else if (timeframe === "week") {
                        const weekAgo = new Date();
                        weekAgo.setDate(now.getDate() - 7);
                        return scanDate >= weekAgo;
                    } else if (timeframe === "month") {
                        const monthAgo = new Date();
                        monthAgo.setMonth(now.getMonth() - 1);
                        return scanDate >= monthAgo;
                    }
                    return true;
                });

                const parseNutritionalData = (ingredients) => {
                    try {
                        if (typeof ingredients === "string") {
                            ingredients = JSON.parse(ingredients);
                        }
                        if (!Array.isArray(ingredients)) {
                            console.error("Invalid ingredients format:", ingredients);
                            return { calories: 0, protein: 0, carbs: 0, fat: 0 };
                        }

                        return ingredients.reduce(
                            (totals, item) => ({
                                calories: totals.calories + (item.calories || 0),
                                protein: totals.protein + (item.protein || 0),
                                carbs: totals.carbs + (item.carb || 0),
                                fat: totals.fat + (item.fat || 0),
                            }),
                            { calories: 0, protein: 0, carbs: 0, fat: 0 }
                        );
                    } catch (error) {
                        console.error("Invalid ingredients field for scan:", ingredients);
                        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
                    }
                };

                const aggregatedData = filteredData.reduce((acc, scan) => {
                    const scanDate = new Date(scan.timestamp);
                    const key = timeframe === "today" 
                        ? scanDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
                        : scanDate.toLocaleDateString();

                    const nutritionalData = parseNutritionalData(scan.ingredients || []);

                    if (!acc[key]) {
                        acc[key] = { 
                            date: key, 
                            calories: 0, 
                            protein: 0, 
                            carbs: 0, 
                            fat: 0 
                        };
                    }

                    acc[key].calories += nutritionalData.calories;
                    acc[key].protein += nutritionalData.protein;
                    acc[key].carbs += nutritionalData.carbs;
                    acc[key].fat += nutritionalData.fat;

                    return acc;
                }, {});

                const sortedChartData = Object.values(aggregatedData).sort((a, b) => {
                    if (timeframe === "today") {
                        return new Date(`1970/01/01 ${a.date}`) - new Date(`1970/01/01 ${b.date}`);
                    }
                    return new Date(a.date) - new Date(b.date);
                });

                setChartData(sortedChartData);
                setFoodScans(filteredData);
            } catch (error) {
                console.error("Error fetching food scans:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFoodScans();
    }, [timeframe, userId]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Food Metrics</h1>

            {/* Timeframe Selection */}
            <div className="flex space-x-4 mb-6">
                {[
                    { label: "Today", value: "today" },
                    { label: "This Week", value: "week" },
                    { label: "This Month", value: "month" },
                ].map(({ label, value }) => (
                    <button
                        key={value}
                        onClick={() => setTimeframe(value)}
                        className={`px-4 py-2 rounded ${timeframe === value
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Line Chart */}
            <div className="mb-8">
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="calories" stroke="#8884d8" name="Calories" />
                        <Line type="monotone" dataKey="protein" stroke="#82ca9d" name="Protein" />
                        <Line type="monotone" dataKey="carbs" stroke="#ffc658" name="Carbs" />
                        <Line type="monotone" dataKey="fat" stroke="#ff7300" name="Fat" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Food Scans Table */}
            <div className="overflow-x-auto">
                <table className="table-auto w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2">Image</th>
                            <th className="px-4 py-2">Food Name</th>
                            <th className="px-4 py-2">Ingredients</th>
                            <th className="px-4 py-2">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">Loading...</td>
                            </tr>
                        ) : foodScans.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">No food scans available for this timeframe.</td>
                            </tr>
                        ) : (
                            foodScans.map((scan) => (
                                <tr key={scan.id} className="border-t">
                                    <td className="px-4 py-2">
                                        <img
                                            src={scan.food_image}
                                            alt={scan.food_name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    </td>
                                    <td className="px-4 py-2">{scan.food_name}</td>
                                    <td className="px-4 py-2">{scan.ingredients}</td>
                                    <td className="px-4 py-2">{new Date(scan.timestamp).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FoodMetrics;
