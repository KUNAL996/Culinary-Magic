document.addEventListener("DOMContentLoaded", () => {
    const loadingAnimation = document.getElementById("loading-animation");

    // Function to validate the form fields
    const validateAndSubmit = (event) => {
        event.preventDefault();

        let isValid = true;

        // Check at least one vegetable is selected
        const vegetables = document.querySelectorAll("input[name='vegetables']:checked");
        const vegetableError = document.getElementById("vegetable-error");
        if (vegetables.length === 0) {
            vegetableError.style.display = "block";
            isValid = false;
        } else {
            vegetableError.style.display = "none";
        }

        // Check a meal time is selected
        const mealTime = document.querySelector("input[name='mealTime']:checked");
        const mealError = document.getElementById("meal-error");
        if (!mealTime) {
            mealError.style.display = "block";
            isValid = false;
        } else {
            mealError.style.display = "none";
        }

        // Check a food type is selected
        const foodType = document.getElementById("food-type").value;
        const foodError = document.getElementById("food-error");
        if (foodType === "") {
            foodError.style.display = "block";
            isValid = false;
        } else {
            foodError.style.display = "none";
        }

        // Show loading animation and submit if valid
        if (isValid) {
            showLoading();
            setTimeout(() => {
                document.getElementById("planner-form").submit();
            }, 2000); // Simulate a delay
        }
    };

    // Function to show the loading animation
    const showLoading = () => {
        loadingAnimation.style.display = "flex";
    };

    // Hide the loading animation once the page is fully loaded
    window.addEventListener("load", () => {
        loadingAnimation.style.display = "none";
    });

    // Attach validateAndSubmit to the button
    document.getElementById("planner-form-submit").addEventListener("click", validateAndSubmit);
});
