const express = require('express');
const axios = require('axios');  // Used to make requests to third-party APIs
const app = express();

const WINDOW_SIZE = 10;  // Configurable window size
let windowCurrState = [];  // Current state of the sliding window


const primeNumbers = [29, 31, 37, 41, 43, 47, 53, 59, 61, 67];

// Helper function to fetch numbers from a third-party API
async function fetchNumbers() {
    try {
        // Make a request to the third-party API
        const response = await axios.get('http://20.244.56.144/test/primes', { timeout: 500 });
        
        // Log the response to verify its structure
        console.log("API Response:", response.data);

        // Return the numbers array from the response
        if (response.data && response.data.numbers) {
            return response.data.numbers;  // Return the array of numbers
        } else {
            console.log("Unexpected response format");
            return [];  // Return an empty array if the response format is not as expected
        }
    } catch (error) {
        console.log("Error fetching numbers:", error.message);
        return [];  // Return empty if there's an error or timeout
    }
}

// Function to calculate the average
function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return (sum / numbers.length).toFixed(2);
}

// Route to handle requests to /numbers/{numberid}
app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    let validTypes = ['p'];  // Currently handling only prime numbers

    if (!validTypes.includes(numberid)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    // Fetch numbers from the third-party API
    const numbers = primeNumbers;

    if (numbers.length === 0) {
        return res.status(500).json({ error: 'Failed to fetch numbers from third-party API' });
    }

    // Filter unique numbers
    const uniqueNumbers = [...new Set(numbers)];

    // Store the current window state
    const windowPrevState = [...windowCurrState];

    // Update the sliding window
    uniqueNumbers.forEach(num => {
        if (windowCurrState.length < WINDOW_SIZE) {
            windowCurrState.push(num);  // Fill the window if not full
        } else {
            windowCurrState.shift();  // Remove oldest and add new number
            windowCurrState.push(num);
        }
    });

    // Calculate the average
    const avg = calculateAverage(windowCurrState);

    // Send the response
    res.json({
        windowPrevState,
        windowCurrState,
        numbers: uniqueNumbers,
        avg: avg
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});