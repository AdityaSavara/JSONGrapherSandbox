// functions.js - Contains reusable functions

//Though this is called "solveEquation", it is really an equation evaluator.
//It requires the dependent variable as the only thing on the left side
//And the dependent variable cannot appear elsewhere.
// functions.js - Contains reusable functions

function solveEquation(equationString, independentVariables, dependentVariable) {
    console.log("inside solveEquation", jsonInput)
    try {
        // Convert "^" to "**" for correct exponentiation
        equationString = equationString.replace(/\^/g, "**");

        // Split equation into left-hand and right-hand sides
        let [lhs, rhs] = equationString.split("=").map(side => side.trim());

        // Ensure the dependent variable is properly isolated on the left-hand side
        if (lhs !== dependentVariable) {
            throw new Error(`Dependent variable '${dependentVariable}' is not properly isolated on the left-hand side.`);
        }

        // Merge independent variables and constants into scope
        const scope = { ...jsonInput.equation.constants, ...independentVariables };

        // Evaluate the right-hand side expression
        return math.evaluate(rhs, scope);
    } catch (error) {
        console.error("Equation solving error:", error.message);
        return null; // Return null on failure
    }
}

// Make function globally available
window.solveEquation = solveEquation;
