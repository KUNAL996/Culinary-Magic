// Predefined list of valid vegetables
const validVegetables = [
    'Tomatoes', 'Potatoes', 'Carrots', 'Spinach', 'Cabbage', 'Lettuce', 'Broccoli', 'Cauliflower', 
    'Peppers', 'Onions', 'Garlic', 'Peas', 'Beans', 'Radishes', 'Beets', 'Mushrooms', 
    'Cucumbers', 'Pumpkin', 'Corn', 'tomatoes', 'potatoes', 'carrots', 
    'spinach', 'cabbage', 'lettuce', 'broccoli', 'cauliflower', 'peppers', 'onions',
    'garlic', 'peas', 'beans', 'radishes', 'mushrooms', 'cucumbers', 'pumpkin', 
    'corn', ,'onion','Onion','carrot','Carrot','Potato','potato','cabbage','garlic',
    'tomatoe','Tomatoe','Beetroots','Beetroot','beetroots','beetroot','Okra','Okras','okra', 'okras',
    'milk','Milk','butter','Butter','cheese','Cheese','yogurt','Yogurt','cream','Cream','curd','Curd',
    'paneer','Paneer','tofu','Tofu','soy','Soy','soya','Soya','mushroom','Mushroom','mushrooms','Mushrooms',
    'chicken','Chicken','mutton','Mutton','pork','Pork','fish','Fish','prawn','Prawn','crab','Crab','rice','Rice','Noodles'
];

// Store selected values in an object
const plannerData = {
    mealTime: null,
    cookingDuration: 15,
    foodType: '',
    vegetables: []
};

// Function to update cooking duration label and store the value
function updateDurationLabel(value) {
    document.getElementById('duration-label').textContent = `${value} min`;
    plannerData.cookingDuration = value;
}

// Function to add a new vegetable and store the value
function addVegetable(event) {
    event.preventDefault(); // Prevents the form from submitting and redirecting

    const vegetableList = document.getElementById('vegetable-list');
    const newVegetable = document.getElementById('new-vegetable').value.trim();
    const isValid = validVegetables.includes(newVegetable.toLowerCase());

    // Check if the vegetable is already in the checkbox list
    const isAlreadyAdded = Array.from(vegetableList.querySelectorAll('input[type="checkbox"]')).some(
        checkbox => checkbox.value.toLowerCase() === newVegetable.toLowerCase()
    );

    if (isValid && !isAlreadyAdded) {
        const newLabel = document.createElement('label');
        newLabel.innerHTML = `<input type="checkbox" name="vegetables" value="${newVegetable}" checked> ${newVegetable}`;
        vegetableList.appendChild(newLabel);
        plannerData.vegetables.push(newVegetable);
        document.getElementById('new-vegetable').value = '';
        document.getElementById('invalid-vegetable-error').style.display = 'none';
    } else if (isAlreadyAdded) {
        alert("This vegetable is already available in the list.");
    } else {
        document.getElementById('invalid-vegetable-error').style.display = 'block';
        document.getElementById('invalid-vegetable-error').textContent = 'Invalid ingredient. Please add a valid ingredient.';
    }
}

// Add an event listener for the "Enter" key to trigger the addVegetable function
document.getElementById('new-vegetable').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevents form submission
        document.getElementById('add-vegetable-btn').click(); // Triggers the "Add Vegetable" button click
    }
});

// Event listeners to update plannerData when options are selected
document.querySelectorAll('.radio-group input').forEach(input => {
    input.addEventListener('change', function() {
        plannerData.mealTime = this.value;
    });
});

document.getElementById('food-type').addEventListener('change', function() {
    plannerData.foodType = this.value;
});

document.querySelectorAll('.checkbox-group input').forEach(input => {
    input.addEventListener('change', function() {
        if (this.checked) {
            plannerData.vegetables.push(this.value);
        } else {
            plannerData.vegetables = plannerData.vegetables.filter(v => v !== this.value);
        }
    });
});

// Function to validate all required fields
function validateAndSubmit() {
    let isValid = true;

    // Validate Vegetables
    if (plannerData.vegetables.length === 0) {
        document.getElementById('vegetable-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('vegetable-error').style.display = 'none';
    }

    // Validate Meal Time
    if (!plannerData.mealTime) {
        document.getElementById('meal-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('meal-error').style.display = 'none';
    }

    // Validate Food Type
    if (!plannerData.foodType) {
        document.getElementById('food-error').style.display = 'block';
        isValid = false;
    } else {
        document.getElementById('food-error').style.display = 'none';
    }

    // If all fields are valid, show the loading animation and submit the form
    if (isValid) {
        const loadingAnimation = document.getElementById('loading-animation');
        loadingAnimation.style.display = 'flex';
        setTimeout(() => {
            document.getElementById('planner-form').submit(); // Submit the form after the animation
        }, 5000); // 5 seconds loading animation
    }
}

function logout() {
    window.location.href = '/logout';
}

window.onload = function() {
    if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.href);
    }
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function() {
        window.history.pushState(null, "", window.location.href);
    };
};