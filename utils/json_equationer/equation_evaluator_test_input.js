// input.js - Handles input and calls solveEquation()

// Example JSON data
const jsonData = {
    "equation": {
        "equation_string": "k = A * e^((-Ea) / (R * T))",
        "constants": {
            "R": 8.314,
            "A": 1e13,
            "e": 2.71828
        }
    }
};

// Example user-provided variables
const variables = {
    Ea: 40000,
    T: 300,
    R: jsonData.equation.constants.R, 
    A: jsonData.equation.constants.A, 
    e: jsonData.equation.constants.e 
};

// Extract equation string and dependent variable
const equationString = jsonData.equation.equation_string;
const dependentVariable = "k"; // Assuming we solve for k

// Compute result
const result = solveEquation(equationString, variables, dependentVariable);

// Expose result globally for `testing.html`
window.result = result;
