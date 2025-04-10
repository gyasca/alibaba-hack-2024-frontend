import { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";

export default function Scans() {
    const [foodScans, setFoodScans] = useState([]);
    const [loading, setLoading] = useState(false);
    const userId = 1; // Replace with the actual logged-in user ID

    // Fetch all FoodScans for the user
    const fetchFoodScans = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:3001/foodmodel/api/foodscans/${userId}`);
            setFoodScans(response.data);
            console.log("[INFO] Fetched FoodScans:", response.data);
        } catch (error) {
            console.error("[ERROR] Error fetching FoodScans:", error);
            alert("An error occurred while fetching FoodScans.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch FoodScans on component mount
    useEffect(() => {
        fetchFoodScans();
    }, []);

    // Columns for the MUI DataGrid
    const columns = [
        { field: "id", headerName: "ID", width: 70 },
        { field: "food_name", headerName: "Food Name", flex: 1 },
        {
            field: "food_image",
            headerName: "Food Image",
            flex: 1,
            renderCell: (params) => (
                <img
                    src={`http://localhost:3001${params.value}`}
                    alt="Food"
                    style={{ width: "50px", height: "50px", borderRadius: "8px" }}
                />
            ),
        },
        { field: "ingredients", headerName: "Ingredients", flex: 2 },
        { field: "timestamp", headerName: "Timestamp", flex: 1 },
    ];

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-6">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-6xl border border-gray-300">
                <h1 className="text-3xl font-semibold text-center text-black mb-6">
                    Your FoodScans
                </h1>
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : (
                    <div style={{ height: 400, width: "100%" }}>
                        <DataGrid
                            rows={foodScans.map((scan) => ({
                                id: scan.id,
                                food_name: scan.food_name,
                                food_image: scan.food_image,
                                ingredients: scan.ingredients,
                                timestamp: new Date(scan.timestamp).toLocaleString(),
                            }))}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 15]}
                            disableSelectionOnClick
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

