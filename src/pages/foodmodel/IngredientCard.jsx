import React from "react";

export default function IngredientCard({ ingredient, onQuantityChange, onRemove }) {
  const handleInputChange = (e) => {
    const value = parseFloat(e.target.value);
    onQuantityChange(value > 0 ? value : 0);
  };

  return (
    <div className="flex flex-col mb-4 p-4 border rounded-lg shadow-md">
      {/* Ingredient Name and Quantity */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h4 className="text-lg font-bold">{ingredient.name}</h4>
          <div className="text-sm text-gray-600">
            <input
              type="number"
              value={ingredient.quantity}
              min="0"
              step="0.01"
              onChange={handleInputChange}
              className="w-16 p-1 border rounded text-center"
            />{" "}
            {ingredient.increment_type}
          </div>
        </div>
        <button
          onClick={onRemove}
          className="text-red-600 hover:underline"
        >
          Remove
        </button>
      </div>

      {/* Nutritional Information */}
      <div className="text-sm text-gray-800">
        <p className="mb-1">
          <span className="font-semibold">Calories:</span>{" "}
          {Math.round(ingredient.calories * ingredient.quantity * 100) / 100} kcal
        </p>
        <p className="mb-1">
          <span className="font-semibold">Protein:</span>{" "}
          {Math.round(ingredient.protein * ingredient.quantity * 100) / 100} g
        </p>
        <p className="mb-1">
          <span className="font-semibold">Carbs:</span>{" "}
          {Math.round(ingredient.carb * ingredient.quantity * 100) / 100} g
        </p>
        <p className="mb-1">
          <span className="font-semibold">Fats:</span>{" "}
          {Math.round(ingredient.fat * ingredient.quantity * 100) / 100} g
        </p>
      </div>
    </div>
  );
}
