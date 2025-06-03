// equation.js
import { evaluateEquationDict } from './equation_evaluator.js'; // Import the evaluator function

class Equation {
    /**
     * A class to manage mathematical equations with units and to evaluate them.
     * Provides utilities for evaluating, formatting, exporting, and printing.
     *
     * Initialization:
     * - Normally, should be initialized as a blank Map object like exampleArrhenius = new Equation().
     * - Defaults to an empty equation with predefined structure.
     * - Accepts an optional Map (`initialDict`) to prepopulate the equation Map.
     *
     * Example structure:
     * ```
     * const customDict = new Map([
     * ['equation_string', "k = A * (e ** (-Ea / (R * T)))"],
     * ['x_variable', "T (K)"],
     * ['y_variable', "k (s**-1)"],
     * ['constants', new Map([["Ea", "30000 J/mol"], ["R", "8.314 J/(mol*K)"], ["A", "1*10**13 (s**-1)"], ["e", "2.71828"]])],
     * ['num_of_points', 10],
     * ['x_range_default', [200, 500]],
     * ['x_range_limits', [null, 600]],
     * ['points_spacing', "Linear"],
     * ['graphical_dimensionality', 2]
     * ]);
     *
     * const equationInstance = new Equation(customDict);
     * ```
     */

    constructor(initialDict = null) {
        /**Initialize an empty equation Map.*/
        this.equationDict = new Map([
            ['equation_string', ''],
            ['x_variable', ''],
            ['y_variable', ''],
            ['constants', new Map()],
            ['num_of_points', null], // Expected: Integer, defines the minimum number of points to be calculated for the range.
            ['x_range_default', [0, 1]], // Default to [0,1] instead of an empty list.
            ['x_range_limits', [null, null]], // Allows null for either limit.
            ['x_points_specified', []],
            ['points_spacing', ''],
            ['reverse_scaling', false],
        ]);

        // If a Map is provided, update the default values
        if (initialDict && initialDict.size > 0) {
            if (initialDict instanceof Map) {
                for (let [key, value] of initialDict) {
                    this.equationDict.set(key, value);
                }
            } else {
                throw new TypeError("initialDict must be a Map.");
            }
        }
    }

    validateUnit(value) {
        /**Ensure that the value is either a pure number or contains a unit.*/
        const unitPattern = /^\d+(\.\d+)?(.*)?$/;
        if (!unitPattern.test(value)) {
            throw new Error(`Invalid format: '${value}'. Expected a numeric value, optionally followed by a unit.`);
        }
    }

    addConstants(constants) {
        /**Add constants to the equation Map, supporting both single and multiple additions.*/
        if (constants instanceof Map) { // Single constant case
            for (let [name, value] of constants) {
                this.validateUnit(value);
                this.equationDict.get('constants').set(name, value);
            }
        } else if (Array.isArray(constants)) { // Multiple constants case
            for (let constantMap of constants) {
                if (constantMap instanceof Map) {
                    for (let [name, value] of constantMap) {
                        this.validateUnit(value);
                        this.equationDict.get('constants').set(name, value);
                    }
                } else {
                    throw new Error("Each item in the list must be a Map containing a constant name-value pair.");
                }
            }
        } else {
            throw new TypeError("Expected a Map for one constant or an array of Maps for multiple constants.");
        }
    }

    setXVariable(xVariable) {
        /**
         * Set the x-variable in the equation Map.
         * Expected format: A descriptive string including the variable name and its unit.
         * Example: "T (K)" for temperature in Kelvin.
         */
        this.equationDict.set("x_variable", xVariable);
    }

    setYVariable(yVariable) {
        /**
         * Set the y-variable in the equation Map.
         * Expected format: A descriptive string including the variable name and its unit.
         * Example: "k (s**-1)" for a rate constant with inverse seconds as the unit.
         */
        this.equationDict.set("y_variable", yVariable);
    }

    setZVariable(zVariable) {
        /**
         * Set the z-variable in the equation Map.
         * Expected format: A descriptive string including the variable name and its unit.
         * Example: "E (J)" for energy with joules as the unit.
         */
        this.equationDict.set("z_variable", zVariable);
    }

    setXRangeDefault(xRange) {
        /**
         * Set the default x range.
         * Expected format: An array of two numeric values representing the range boundaries.
         * Example: setXRange([200, 500]) for temperatures between 200K and 500K.
         */
        if (!Array.isArray(xRange) || xRange.length !== 2 || !xRange.every(i => typeof i === 'number')) {
            throw new Error("x_range must be an array of two numeric values.");
        }
        this.equationDict.set('x_range_default', xRange);
    }

    setXRangeLimits(xLimits) {
        /**
         * Set the hard limits for x values.
         * Expected format: An array of two values (numeric or null) defining absolute boundaries.
         * Example: setXRangeLimits([100, 600]) to prevent x values outside this range.
         * Example: setXRangeLimits([null, 500]) allows an open lower limit.
         */
        if (!Array.isArray(xLimits) || xLimits.length !== 2) {
            throw new Error("x_limits must be an array of two elements (numeric or null).");
        }
        if (!xLimits.every(i => typeof i === 'number' || i === null)) {
            throw new Error("Elements in x_limits must be numeric or null.");
        }
        this.equationDict.set('x_range_limits', xLimits);
    }

    setYRangeDefault(yRange) {
        /**
         * Set the default y range.
         * Expected format: An array of two numeric values representing the range boundaries.
         * Example: setYRange([0, 100]) for a percentage scale.
         */
        if (!Array.isArray(yRange) || yRange.length !== 2 || !yRange.every(i => typeof i === 'number')) {
            throw new Error("y_range must be an array of two numeric values.");
        }
        this.equationDict.set('y_range_default', yRange);
    }

    setYRangeLimits(yLimits) {
        /**
         * Set the hard limits for y values.
         * Expected format: An array of two values (numeric or null) defining absolute boundaries.
         * Example: setYRangeLimits([null, 50]) allows an open lower limit but restricts the upper limit.
         */
        if (!Array.isArray(yLimits) || yLimits.length !== 2) {
            throw new Error("y_limits must be an array of two elements (numeric or null).");
        }
        if (!yLimits.every(i => typeof i === 'number' || i === null)) {
            throw new Error("Elements in y_limits must be numeric or null.");
        }
        this.equationDict.set('y_range_limits', yLimits);
    }

    setZRangeDefault(zRange) {
        /**
         * Set the default z range.
         * Expected format: An array of two numeric values representing the range boundaries.
         * Example: setZRange([0, 5000]) for energy values in Joules.
         */
        if (!Array.isArray(zRange) || zRange.length !== 2 || !zRange.every(i => typeof i === 'number')) {
            throw new Error("z_range must be an array of two numeric values.");
        }
        this.equationDict.set('z_range_default', zRange);
    }

    setZRangeLimits(zLimits) {
        /**
         * Set the hard limits for z values.
         * Expected format: An array of two values (numeric or null) defining absolute boundaries.
         * Example: setZRangeLimits([100, null]) allows an open upper limit but restricts the lower boundary.
         */
        if (!Array.isArray(zLimits) || zLimits.length !== 2) {
            throw new Error("z_limits must be an array of two elements (numeric or null).");
        }
        if (!zLimits.every(i => typeof i === 'number' || i === null)) {
            throw new Error("Elements in z_limits must be numeric or null.");
        }
        this.equationDict.set('z_range_limits', zLimits);
    }

    getZMatrix(xPoints = null, yPoints = null, zPoints = null) {
        /**
         * Constructs a Z matrix mapping unique (x, y) values to corresponding z values.
         *
         * Parameters:
         * - xPoints (Array): Array of x coordinates.
         * - yPoints (Array): Array of y coordinates.
         * - zPoints (Array): Array of z values.
         *
         * Returns:
         * - zMatrix (2D Array): Matrix of z values.
         */
        if (xPoints === null) {
            xPoints = this.equationDict.get('x_points');
        }
        if (yPoints === null) {
            yPoints = this.equationDict.get('y_points');
        }
        if (zPoints === null) {
            zPoints = this.equationDict.get('z_points');
        }

        // Get unique x and y values
        const uniqueX = [...new Set(xPoints)].sort((a, b) => a - b);
        const uniqueY = [...new Set(yPoints)].sort((a, b) => a - b);

        // Create an empty matrix filled with NaNs
        const zMatrix = Array(uniqueX.length).fill(0).map(() => Array(uniqueY.length).fill(NaN));

        // Map z values to corresponding x, y indices
        let pointIndex = 0; // For 3D, z_points are flattened
        for (let x of uniqueX) {
            for (let y of uniqueY) {
                const xIdx = uniqueX.indexOf(x);
                const yIdx = uniqueY.indexOf(y);
                // This assumes z_points are ordered by x then y, which the dummy evaluateEquationDict does.
                // A more robust solution would iterate through (x, y, z) triplets.
                if (this.equationDict.get('graphical_dimensionality') === 3 && zPoints && zPoints[pointIndex] !== undefined) {
                    zMatrix[xIdx][yIdx] = zPoints[pointIndex];
                    pointIndex++;
                } else if (this.equationDict.get('graphical_dimensionality') !== 3 && xPoints && yPoints && zPoints) {
                    // For 2D, find the matching (x,y) pair
                    for (let k = 0; k < xPoints.length; k++) {
                        if (xPoints[k] === x && yPoints[k] === y) {
                             zMatrix[xIdx][yIdx] = zPoints[k];
                             break; // Found the point
                        }
                    }
                }
            }
        }

        return zMatrix;
    }


    setNumOfPoints(numPoints) {
        /**
         * Set the number of calculation points.
         * Expected format: Integer, specifies the number of discrete points for calculations.
         * Example: setNumOfPoints(10) for ten data points.
         */
        if (!Number.isInteger(numPoints) || numPoints <= 0) {
            throw new Error("Number of points must be a positive integer.");
        }
        this.equationDict.set("num_of_points", numPoints);
    }

    setEquation(equationString) {
        /**Modify the equation string.*/
        this.equationDict.set('equation_string', equationString);
    }

    getEquationDict() {
        /**Return the complete equation Map.*/
        return this.equationDict;
    }

    evaluateEquation(removeEquationFields = false, verbose = false) {
        // Direct call to the imported function
        const evaluatedDict = evaluateEquationDict(this.equationDict, verbose);

        let graphicalDimensionality = evaluatedDict.has("graphical_dimensionality") ? evaluatedDict.get("graphical_dimensionality") : 2;

        this.equationDict.set("x_units", evaluatedDict.get("x_units"));
        this.equationDict.set("y_units", evaluatedDict.get("y_units"));
        this.equationDict.set("x_points", evaluatedDict.get("x_points"));
        this.equationDict.set("y_points", evaluatedDict.get("y_points"));

        if (graphicalDimensionality === 3) {
            this.equationDict.set("z_units", evaluatedDict.get("z_units"));
            this.equationDict.set("z_points", evaluatedDict.get("z_points"));
            console.log("line 223 (JS equivalent - z_points):", this.equationDict.get("z_points"));
        }

        if (removeEquationFields === true) {
            const newEquationDict = new Map();
            newEquationDict.set("x_units", this.equationDict.get("x_units"));
            newEquationDict.set("y_units", this.equationDict.get("y_units"));
            newEquationDict.set("x_points", this.equationDict.get("x_points"));
            newEquationDict.set("y_points", this.equationDict.get("y_points"));
            if (graphicalDimensionality === 3) {
                newEquationDict.set("z_units", this.equationDict.get("z_units"));
                newEquationDict.set("z_points", this.equationDict.get("z_points"));
            }
            this.equationDict = newEquationDict;
        }
        return this.equationDict;
    }

    printEquationDict(prettyPrint = true, evaluateEquation = true, removeEquationFields = false) {
        let equationDictToPrint = new Map(this.equationDict);

        if (evaluateEquation === true) {
            const evaluatedDict = this.evaluateEquation(removeEquationFields);
            equationDictToPrint = new Map(evaluatedDict);
        }

        if (removeEquationFields === true) {
            const tempDict = new Map();
            if (this.equationDict.has("x_units")) tempDict.set("x_units", this.equationDict.get("x_units"));
            if (this.equationDict.has("y_units")) tempDict.set("y_units", this.equationDict.get("y_units"));
            if (this.equationDict.has("x_points")) tempDict.set("x_points", this.equationDict.get("x_points"));
            if (this.equationDict.has("y_points")) tempDict.set("y_points", this.equationDict.get("y_points"));
            if (this.equationDict.has("z_units")) tempDict.set("z_units", this.equationDict.get("z_units"));
            if (this.equationDict.has("z_points")) tempDict.set("z_points", this.equationDict.get("z_points"));
            equationDictToPrint = tempDict;
        }

        if (prettyPrint === false) {
            console.log(equationDictToPrint);
        } else {
            const obj = {};
            for (let [key, value] of equationDictToPrint) {
                if (value instanceof Map) {
                    obj[key] = Object.fromEntries(value);
                } else {
                    obj[key] = value;
                }
            }
            const equationJsonString = JSON.stringify(obj, null, 4);
            console.log(equationJsonString);
        }
    }

    exportToJsonFile(filename, evaluateEquation = true, removeEquationFields = false) {
        let equationDictToExport = new Map(this.equationDict);

        if (evaluateEquation === true) {
            const evaluatedDict = this.evaluateEquation(removeEquationFields);
            equationDictToExport = new Map(evaluatedDict);
        }

        if (removeEquationFields === true) {
            const tempDict = new Map();
            if (this.equationDict.has("x_units")) tempDict.set("x_units", this.equationDict.get("x_units"));
            if (this.equationDict.has("y_units")) tempDict.set("y_units", this.equationDict.get("y_units"));
            if (this.equationDict.has("x_points")) tempDict.set("x_points", this.equationDict.get("x_points"));
            if (this.equationDict.has("y_points")) tempDict.set("y_points", this.equationDict.get("y_points"));
            if (this.equationDict.has("z_units")) tempDict.set("z_units", this.equationDict.get("z_units"));
            if (this.equationDict.has("z_points")) tempDict.set("z_points", this.equationDict.get("z_points"));
            equationDictToExport = tempDict;
        }

        console.log(`(Simulated) Exporting to file: ${filename}`); // Browser environment doesn't allow direct file writing.
        // In a real browser scenario, you'd trigger a download:
        // const obj = {};
        // for (let [key, value] of equationDictToExport) {
        //     if (value instanceof Map) {
        //         obj[key] = Object.fromEntries(value);
        //     } else {
        //         obj[key] = value;
        //     }
        // }
        // const jsonString = JSON.stringify(obj, null, 4);
        // const blob = new Blob([jsonString], { type: 'application/json' });
        // const url = URL.createObjectURL(blob);
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = filename.toLowerCase().includes('.json') ? filename : filename + ".json";
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
        // URL.revokeObjectURL(url);

        return equationDictToExport;
    }
}

// Global scope for the example usage (since it's not a Node.js module)
// We will instantiate and run the example in the HTML <script type="module"> block.
// Export the class to be accessible in the HTML file
export { Equation };