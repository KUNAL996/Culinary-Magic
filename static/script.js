// Predefined list of valid vegetables
const validVegetables = [
    'Tomatoes', 'Potatoes', 'Carrots', 'Spinach', 'Cabbage', 'Lettuce', 'Broccoli', 'Cauliflower', 
    'Zucchini', 'Peppers', 'Onions', 'Garlic', 'Peas', 'Beans', 'Radishes', 'Beets', 'Mushrooms', 
    'Cucumbers', 'Pumpkin', 'Squash', 'Celery', 'Corn', 'Asparagus','tomatoes', 'potatoes', 'carrots', 
    'spinach', 'cabbage', 'lettuce', 'broccoli', 'cauliflower', 'zucchini', 'peppers', 'onions',
    'garlic', 'peas', 'beans', 'radishes', 'beets', 'mushrooms', 'cucumbers', 'pumpkin', 'squash', 
    'celery', 'corn', 'asparagus','onion','Onion','carrot','Carrot','Potatoe','potatoe','cabbage','garlic','beet',
    'tomatoe','Tomatoe'
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
function addVegetable() {
    event.preventDefault(); // Prevents the form from submitting and redirecting

    const vegetableList = document.getElementById('vegetable-list');
    const newVegetable = document.getElementById('new-vegetable').value.trim();
    const isValid = validVegetables.includes(newVegetable);

    // Check if the vegetable is already in the checkbox list
    const alreadyExists = [...vegetableList.querySelectorAll('input[type="checkbox"]')].some(
        checkbox => checkbox.value.toLowerCase() === newVegetable.toLowerCase()
    );

    if (alreadyExists) {
        document.getElementById('invalid-vegetable-error').style.display = 'block';
        document.getElementById('invalid-vegetable-error').textContent = 'The vegetable is already available in the list.';
    } else if (isValid) {
        const newLabel = document.createElement('label');
        newLabel.innerHTML = `<input type="checkbox" name="vegetables" value="${newVegetable}" checked> ${newVegetable}`;
        vegetableList.appendChild(newLabel);
        plannerData.vegetables.push(newVegetable);
        document.getElementById('new-vegetable').value = '';
        document.getElementById('invalid-vegetable-error').style.display = 'none';
    } else {
        document.getElementById('invalid-vegetable-error').style.display = 'block';
        document.getElementById('invalid-vegetable-error').textContent = 'Invalid vegetable. Please add a valid vegetable.';
    }
}

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

    // If all fields are valid, submit the form
    if (isValid) {
        const form = document.getElementById('planner-form');
        form.submit(); // Submit the form normally
    }
}