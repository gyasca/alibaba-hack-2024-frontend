// Identify.js
import { useState } from "react";
import axios from "axios";
import IngredientCard from "./IngredientCard";
import { Tab, Tabs, Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function Identify() {
  const [image, setImage] = useState(null);
  const [foodData, setFoodData] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please upload an image.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post(
        "http://localhost:3001/foodmodel/identify-food",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const { name, image: foodImage, ingredients } = response.data;

      setFoodData({ name, image: foodImage });
      setIngredients(ingredients.map((ingredient) => ({
        ...ingredient,
        quantity: ingredient.quantity || 1,
      })));
    } catch (error) {
      console.error("Error detecting food:", error);
      alert("An error occurred while processing the image.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (index, newQuantity) => {
    setIngredients((prev) => {
      const updated = [...prev];
      updated[index].quantity = newQuantity;
      return updated;
    });
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!foodData || !ingredients.length) {
      alert("No food data or ingredients to save!");
      return;
    }

    setLoading(true);
    const foodScanData = {
      food_name: foodData.name,
      food_image: foodData.image,
      ingredients: JSON.stringify(ingredients),
      user_id: 1,
    };

    try {
      const response = await axios.post(
        "http://localhost:3001/foodmodel/api/foodscan",
        foodScanData,
        { headers: { "Content-Type": "application/json" } }
      );

      alert("Ingredients saved successfully!");
    } catch (error) {
      console.error("Error saving FoodScan:", error.response?.data || error.message);
      alert("An error occurred while saving the ingredients.");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
    { field: "unit", headerName: "Unit", flex: 1 },
    { field: "calories", headerName: "Calories", flex: 1 },
    { field: "protein", headerName: "Protein", flex: 1 },
    { field: "carb", headerName: "Carbs", flex: 1 },
    { field: "fat", headerName: "Fats", flex: 1 },
  ];

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl border border-gray-300">
        <h1 className="text-3xl font-semibold text-center text-black mb-6">
          Food Identification
        </h1>
        {!foodData ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center">
              <label htmlFor="file-upload" className="cursor-pointer">
                <input
                  type="file"
                  id="file-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  className={`bg-black text-white px-4 py-2 rounded-md text-center w-full hover:bg-gray-800 ${image ? "bg-gray-500" : ""
                    }`}
                >
                  {image ? image.name : "Choose File"}
                </div>
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md text-white ${loading ? "bg-gray-400" : "bg-black hover:bg-gray-800"
                } focus:outline-none`}
            >
              {loading ? "Processing..." : "Upload and Detect"}
            </button>
          </form>
        ) : (
          <div className="flex">
            <div className="w-1/2 pr-4 border-r border-gray-300">
              <h2 className="text-xl font-semibold text-center mb-4">
                Dish Name: {foodData.name}
              </h2>
              <div className="flex justify-center">
                <img
                  src={`http://localhost:3001/foodmodel/${foodData.image}`}
                  // src={"http://localhost:3001/foodmodel/uploads/nasilemak.jpeg"}
                  alt="Uploaded Food"
                  className="w-64 h-64 object-cover rounded-md"
                />
              </div>
            </div>

            <div className="w-1/2 pl-4 flex flex-col">
              <h2 className="text-xl font-semibold text-center mb-4">
                Ingredients
              </h2>
              <Box>
                <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)}>
                  <Tab label="Cards" />
                  <Tab label="Table" />
                </Tabs>
                <Box className="mt-4">
                  {tabIndex === 0 && (
                    <div className="overflow-y-auto border rounded-md p-4 border-gray-300">
                      {ingredients.map((ingredient, index) => (
                        <IngredientCard
                          key={index}
                          ingredient={ingredient}
                          onQuantityChange={(newQuantity) => handleQuantityChange(index, newQuantity)}
                          onRemove={() => removeIngredient(index)}
                        />
                      ))}
                    </div>
                  )}
                  {tabIndex === 1 && (
                    <div style={{ height: 400, width: "100%" }}>
                      <DataGrid
                        rows={ingredients.map((ingredient, index) => ({
                          id: index,
                          ...ingredient,
                        }))}
                        columns={columns}
                        pageSize={5}
                      />
                    </div>
                  )}
                </Box>
              </Box>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => {
                    setFoodData(null);
                    setIngredients([]);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-md ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                    }`}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
