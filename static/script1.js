document.addEventListener('DOMContentLoaded', function () {
    let selectedRecipe = null;

    // Add event listener to select recipe button
    document.querySelectorAll('.select-btn').forEach(recipeElement => {
        recipeElement.addEventListener('click', function () {
            const recipeDiv = recipeElement.parentElement;
            selectedRecipe = {
                name: recipeDiv.querySelector('h2')?.textContent || '',
                ingredients: Array.from(recipeDiv.querySelectorAll('li')).map(li => li.textContent).join(', '),
                instructions: recipeDiv.querySelector('.instructions')?.textContent || ''
            };
            
            alert(`Selected Recipe: ${selectedRecipe.name}`);
        });
    });

    // Add event listener for save recipe button
    document.getElementById('save-recipe-btn').addEventListener('click', function () {
        if (!selectedRecipe) {
            alert('Please select a recipe first.');
            return;
        }

        fetch('/save_recipe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedRecipe)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Recipe saved successfully!');
                window.location.href = '/saved_recipes'; // Redirect to saved recipes page
            } else {
                alert('Failed to save the recipe.');
            }
        })
        .catch(error => console.error('Error:', error));
    });
});
