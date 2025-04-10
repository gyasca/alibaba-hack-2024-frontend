import React, { useState } from "react";
import axios from "axios";

export default function AddDI() {
    const [dish, setDish] = useState({
        name: "",
        avg_calories: "",
        ingredients: []
    });
    const [ingredient, setIngredient] = useState({
        name: "",
        calories: "",
        carb: "",
        protein: "",
        fat: "",
        increment_type: ""
    });
    const [ingredientsList, setIngredientsList] = useState([]);

    const handleDishChange = (e) => {
        const { name, value } = e.target;
        setDish((prev) => ({ ...prev, [name]: value }));
    };

    const handleIngredientChange = (e) => {
        const { name, value } = e.target;
        setIngredient((prev) => ({ ...prev, [name]: value }));
    };

    const addIngredient = async () => {
        try {
            await axios.post("http://localhost:3001/foodmodel/api/ingredients", ingredient);
            alert("Ingredient added successfully!");
            setIngredientsList((prev) => [...prev, ingredient]);
            setDish((prevDish) => ({
                ...prevDish,
                ingredients: [...prevDish.ingredients, ingredient.name], // Add ingredient name to dish's ingredients
            }));
            setIngredient({ name: "", calories: "", carb: "", protein: "", fat: "", increment_type: "" });
        } catch (error) {
            alert("Error adding ingredient: " + error.message);
        }
    };
    
    const submitDish = async () => {
        try {
            await axios.post("http://localhost:3001/foodmodel/api/dishes", dish);
            alert("Dish added successfully!");
            setDish({ name: "", avg_calories: "", ingredients: [] }); // Reset dish
            setIngredientsList([]); // Reset local ingredients list
        } catch (error) {
            alert("Error adding dish: " + error.message);
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Add Dish and Ingredients</h1>

            {/* Dish Form */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold">Dish Details</h2>
                <label className="block mb-2">Dish Name</label>
                <input
                    type="text"
                    name="name"
                    value={dish.name}
                    onChange={handleDishChange}
                    className="w-full p-2 border rounded mb-2"
                />

                <label className="block mb-2">Average Calories</label>
                <input
                    type="number"
                    name="avg_calories"
                    value={dish.avg_calories}
                    onChange={handleDishChange}
                    className="w-full p-2 border rounded mb-4"
                />

                <button
                    onClick={submitDish}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Add Dish
                </button>
            </div>

            {/* Ingredient Form */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold">Add Ingredient</h2>
                <label className="block mb-2">Ingredient Name</label>
                <input
                    type="text"
                    name="name"
                    value={ingredient.name}
                    onChange={handleIngredientChange}
                    className="w-full p-2 border rounded mb-2"
                />

                <label className="block mb-2">Calories</label>
                <input
                    type="number"
                    name="calories"
                    value={ingredient.calories}
                    onChange={handleIngredientChange}
                    className="w-full p-2 border rounded mb-2"
                />

                <label className="block mb-2">Carbohydrates</label>
                <input
                    type="number"
                    name="carb"
                    value={ingredient.carb}
                    onChange={handleIngredientChange}
                    className="w-full p-2 border rounded mb-2"
                />

                <label className="block mb-2">Protein</label>
                <input
                    type="number"
                    name="protein"
                    value={ingredient.protein}
                    onChange={handleIngredientChange}
                    className="w-full p-2 border rounded mb-2"
                />

                <label className="block mb-2">Fat</label>
                <input
                    type="number"
                    name="fat"
                    value={ingredient.fat}
                    onChange={handleIngredientChange}
                    className="w-full p-2 border rounded mb-2"
                />

                <label className="block mb-2">Increment Type</label>
                <input
                    type="text"
                    name="increment_type"
                    value={ingredient.increment_type}
                    onChange={handleIngredientChange}
                    className="w-full p-2 border rounded mb-4"
                />

                <button
                    onClick={addIngredient}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Add Ingredient
                </button>

                <ul className="mt-4">
                    {ingredientsList.map((ing, index) => (
                        <li key={index} className="mb-2">
                            {ing.name} - {ing.calories} cal
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
