// --- START OF EXTERNAL DEPENDENCY PLACEHOLDERS (You MUST implement these) ---

/**
 * @typedef {object} UnitObject_PYTHON
 * @property {(targetUnits: string) => number} to_PYTHON - A method that converts the current unit object to the target units and returns the numerical scaling ratio.
 * This is a placeholder for `unitpy.U(units_string_1).to(units_string_2)`.
 * You will need to replace this with your actual unit conversion library or custom logic.
 */

/**
 * **_PYTHON**
 * This is a placeholder for `unitpy.U()`.
 * You MUST replace this with your actual unit parsing and object creation logic.
 *
 * @param {string} unitsString - The unit string (e.g., "kg/m/s").
 * @returns {UnitObject_PYTHON} A placeholder unit object with a `to_PYTHON` method.
 */
function unitpy_U_PYTHON(unitsString) {
    console.warn("unitpy_U_PYTHON is a placeholder. You need to implement your actual unit parsing logic.");
    // In a real implementation, this would parse `unitsString` and prepare for conversion.
    return {
        unit: unitsString, // Store the unit string for the placeholder
        /**
         * **_PYTHON**
         * Placeholder for the `.to()` method of a unit object.
         * You MUST replace this with your actual unit conversion calculation.
         *
         * @param {string} targetUnits - The units to convert to.
         * @returns {number} The scaling ratio.
         */
        to_PYTHON: function(targetUnits) {
            console.warn(`unitpy_U_PYTHON.to_PYTHON is a placeholder. Performing a dummy conversion from "${this.unit}" to "${targetUnits}".`);
            // Example dummy conversion:
            if (this.unit === "kg" && targetUnits === "g") return 1000;
            if (this.unit === "g" && targetUnits === "kg") return 0.001;
            if (this.unit === "m" && targetUnits === "cm") return 100;
            if (this.unit === "cm" && targetUnits === "m") return 0.01;
            if (this.unit === "s" && targetUnits === "ms") return 1000;
            if (this.unit === targetUnits) return 1;
            // Add more specific conversions as needed in your real implementation.
            throw new Error(`_PYTHON placeholder: Cannot convert ${this.unit} to ${targetUnits}. Implement your unit conversion logic.`);
        }
    };
}

/**
 * **_PYTHON**
 * This is a placeholder for `add_custom_unit_to_unitpy`.
 * You MUST replace this with your actual logic for registering custom units
 * in your chosen JavaScript unit library or system.
 *
 * @param {string} unitString - The custom unit string to add.
 */
function addCustomUnitToUnitpy_PYTHON(unitString) {
    console.warn(`addCustomUnitToUnitpy_PYTHON is a placeholder. You need to implement your custom unit registration for: "${unitString}".`);
    // Example: If using a custom unit registry:
    // myUnitRegistry.add(unitString);
}

// --- END OF EXTERNAL DEPENDENCY PLACEHOLDERS ---

// Import the `separateLabelTextFromUnits` function if it's in a different module
// Assuming it's in 'dataUtils.js' from our previous conversation.
// Adjust the path as necessary.
// import { separateLabelTextFromUnits } from './dataUtils.js'; // Example import if separate.


/**
 * Converts a string by removing tags surrounded by '<' and '>' characters.
 * @param {string} text - The input string.
 * @returns {string} The string with tags removed.
 */
function removeTaggedStrings(text) {
    // This is the inverse of `extract_tagged_strings` used internally for processing.
    // It replaces <TAG> with TAG, effectively removing the delimiters.
    return text.replace(/<([^>]*)>/g, '$1');
}

/**
 * Extracts tags surrounded by `<` and `>` from a given string. Used for custom units.
 * Returns them as a list sorted from longest to shortest.
 *
 * @param {string} text - The input string.
 * @returns {string[]} A list of extracted tags, sorted by length in descending order.
 */
function extractTaggedStrings(text) {
    const matches = text.match(/<([^>]*)>/g); // Find all occurrences of <...>
    if (!matches) {
        return [];
    }
    const list_of_tags = matches.map(match => match.slice(1, -1)); // Remove < and >
    const set_of_tags = new Set(list_of_tags); // Remove duplicates
    const sorted_tags = Array.from(set_of_tags).sort((a, b) => b.length - a.length); // Sort longest to shortest
    return sorted_tags;
}

/**
 * Puts markup around custom units with '<' and '>'.
 *
 * @param {string} unitsString - The units string.
 * @param {string[]} customUnitsList - A list of custom unit strings.
 * @returns {string} The units string with custom units marked up.
 */
function returnCustomUnitsMarkup(unitsString, customUnitsList) {
    // Sort custom units from longest to shortest to prevent partial matches.
    const sortedCustomUnitsList = [...customUnitsList].sort((a, b) => b.length - a.length);

    for (const customUnit of sortedCustomUnitsList) {
        // Use a regular expression to replace only whole word matches to avoid issues
        // with partial names (e.g., "m" in "mm").
        // This regex ensures we're replacing the whole custom unit string.
        // It might need refinement if custom units can contain special regex characters.
        const regex = new RegExp(`\\b${customUnit}\\b`, 'g');
        unitsString = unitsString.replace(regex, `<${customUnit}>`);
    }
    return unitsString;
}

/**
 * Tags micro-units by replacing "µX" with "<microfrogX>" due to potential
 * incompatibilities with specific unit libraries (like `unitpy` in Python).
 *
 * @param {string} unitsString - The unit string to process.
 * @returns {string} The unit string with micro-units "frogified".
 */
function tagMicroUnits(unitsString) {
    // Unicode representations of micro symbols:
    // U+00B5 ? µ (Micro Sign)
    // U+03BC ? µ (Greek Small Letter Mu)
    // U+1D6C2 ? ?? (Mathematical Greek Small Letter Mu)
    // U+1D6C1 ? ?? (Mathematical Bold Greek Small Letter Mu)
    const microSymbols = ["µ", "µ", "??", "??"];

    // Check if any micro symbol is in the string
    if (!microSymbols.some(symbol => unitsString.includes(symbol))) {
        return unitsString; // If none are found, return the original string unchanged
    }

    // Construct a regex pattern to detect any micro symbol followed by letters
    // Example: (µ|µ|??|??)([a-zA-Z]+)
    const pattern = new RegExp(`[${microSymbols.join('')}]([a-zA-Z]+)`, 'g');

    // Extract matches and sort them by length (longest first) for safe replacement
    // This part is a bit trickier in JS regex replace directly as re.findall in Python.
    // We'll use a replacer function to capture and modify.
    let tempMatches = [];
    let match;
    const findPattern = new RegExp(pattern.source, 'g'); // Ensure global flag for finding all matches
    while ((match = findPattern.exec(unitsString)) !== null) {
        tempMatches.push(match[0]); // Push the full matched string (e.g., "µm")
    }
    // Sort matches by length (longest first)
    const sortedMatches = [...new Set(tempMatches)].sort((a, b) => b.length - a.length);

    // Replace matches with custom unit notation <X>
    for (const matchStr of sortedMatches) {
        // Create the frogified version (e.g., "µm" becomes "<microfrogm>")
        // Note: matchStr[0] is the micro symbol, matchStr.slice(1) is the unit part.
        const frogifiedMatch = `<microfrog${matchStr.slice(1)}>`;
        // Replace all occurrences of this specific matchStr
        unitsString = unitsString.split(matchStr).join(frogifiedMatch);
    }

    return unitsString;
}

/**
 * Untags micro-units, converting them back from "<microfrogX>" to "µX".
 *
 * @param {string} unitsString - The unit string to process.
 * @returns {string} The unit string with micro-units untagged.
 */
function untagMicroUnits(unitsString) {
    if (!unitsString.includes("<microfrog")) { // Check if any frogified unit exists
        return unitsString;
    }
    // Pattern to detect the frogified micro-units: <microfrog([a-zA-Z]+)>
    const pattern = /<microfrog([a-zA-Z]+)>/g;
    // Replace frogified units with µ + the original unit suffix
    return unitsString.replace(pattern, 'µ$1');
}

/**
 * Converts inverse unit notations (e.g., `1/bar`) to exponential form (e.g., `(bar)**(-1)`).
 * This function is designed to work iteratively.
 *
 * @param {string} expression - The unit expression string.
 * @param {number} [depth=100] - The maximum number of iterations to prevent infinite loops.
 * @returns {string} The converted unit expression.
 */
function convertInverseUnits(expression, depth = 100) {
    // Patterns to match valid reciprocals while ignoring multiplied units
    // e.g., (1/bar)*bar should be handled correctly.
    // Pattern 1: 1/((1/.*?)) -> handles nested inverses like 1/(1/m)
    // Pattern 2: 1/([a-zA-Z]+) -> handles simple inverses like 1/bar
    const patterns = [
        /1\/\((1\/.*?)\)/g, // Group 1 captures the inner (1/...)
        /1\/([a-zA-Z]+)/g    // Group 1 captures the unit name
    ];

    let currentExpression = expression;
    for (let i = 0; i < depth; i++) {
        let newExpression = currentExpression;
        for (const pattern of patterns) {
            // Need to reset lastIndex for global regex in a loop
            pattern.lastIndex = 0;
            newExpression = newExpression.replace(pattern, `($1)**(-1)`);
        }

        // Stop early if no more changes are made
        if (newExpression === currentExpression) {
            break;
        }
        currentExpression = newExpression;
    }
    return currentExpression;
}

/**
 * Takes two units strings and returns the scaling ratio of `unitsString1 / unitsString2`.
 * E.g., `("kg/m/s", "g/m/s")` would return `1000`.
 * This function relies on a **_PYTHON** placeholder for the core unit conversion logic.
 *
 * @param {string} unitsString1 - The first units string.
 * @param {string} unitsString2 - The second units string.
 * @returns {number} The scaling ratio.
 * @throws {Error} If unit conversion fails or unit definitions are invalid.
 */
export function getUnitsScalingRatio(unitsString1, unitsString2) {
    // Ensure both strings are properly encoded (JS strings are inherently UTF-8, so this is a no-op from Python's .encode().decode())
    // JavaScript strings are already UTF-8 internally, so no explicit encoding/decoding needed.

    // If the unit strings are identical, there is no need to go further.
    if (unitsString1 === unitsString2) {
        return 1;
    }

    // Replace "^" with "**" for unit conversion purposes.
    let processedUnitsString1 = unitsString1.replace(/\^/g, "**");
    let processedUnitsString2 = unitsString2.replace(/\^/g, "**");

    // For now, we need to tag µ symbol units as if they are custom units.
    processedUnitsString1 = tagMicroUnits(processedUnitsString1);
    processedUnitsString2 = tagMicroUnits(processedUnitsString2);

    // Next, need to extract custom units and add them using the _PYTHON placeholder.
    const customUnits1 = extractTaggedStrings(processedUnitsString1);
    const customUnits2 = extractTaggedStrings(processedUnitsString2);

    for (const customUnit of customUnits1) {
        addCustomUnitToUnitpy_PYTHON(customUnit); // Calls your _PYTHON placeholder
    }
    for (const customUnit of customUnits2) {
        addCustomUnitToUnitpy_PYTHON(customUnit); // Calls your _PYTHON placeholder
    }

    // Now, remove the "<" and ">" and will put them back later if needed.
    // The `removeTaggedStrings` function will handle this.
    processedUnitsString1 = removeTaggedStrings(processedUnitsString1);
    processedUnitsString2 = removeTaggedStrings(processedUnitsString2);

    let ratioOnly;
    try {
        // Instantiate your unit converter object (placeholder)
        const unitsObjectConverted = unitpy_U_PYTHON(processedUnitsString1); // Calls your _PYTHON placeholder

        // Perform the conversion using the _PYTHON placeholder method
        const ratioWithUnitsObject = unitsObjectConverted.to_PYTHON(processedUnitsString2); // Calls your _PYTHON placeholder

        // The _PYTHON.to_PYTHON method should return the numerical ratio directly,
        // so we don't need to stringify and split like in Python's `unitpy` output.
        ratioOnly = ratioWithUnitsObject;

    } catch (generalException) {
        // The above can fail if there are reciprocal units like 1/bar rather than (bar)**(-1),
        // so we have an except statement that tries "that" fix if there is a failure.
        console.warn(`Attempting inverse unit conversion fix for: ${generalException.message}`);

        processedUnitsString1 = convertInverseUnits(processedUnitsString1);
        processedUnitsString2 = convertInverseUnits(processedUnitsString2);

        try {
            const unitsObjectConverted = unitpy_U_PYTHON(processedUnitsString1); // Calls your _PYTHON placeholder
            ratioOnly = unitsObjectConverted.to_PYTHON(processedUnitsString2); // Calls your _PYTHON placeholder
        } catch (e) {
            // Re-throw specific errors for clarity
            if (e.name === 'Error') { // Assuming your _PYTHON placeholders throw generic Error
                if (e.message.includes("Cannot convert") || e.message.includes("Missing key")) {
                     throw new Error(`Error during unit conversion in getUnitsScalingRatio: ${e.message}. Ensure all unit definitions are correctly set. Unit 1: ${unitsString1}, Unit 2: ${unitsString2}`);
                } else if (e.message.includes("invalid") || e.message.includes("formatted")) {
                    throw new Error(`Error during unit conversion in getUnitsScalingRatio: ${e.message}. Make sure unit values are valid and properly formatted. Unit 1: ${unitsString1}, Unit 2: ${unitsString2}`);
                }
            }
            throw new Error(`An unexpected error occurred in getUnitsScalingRatio when trying to convert units: ${e.message}. Double-check that your records have the same units. Original Unit 1: ${unitsString1}, Original Unit 2: ${unitsString2}. Processed Unit 1: ${processedUnitsString1}, Processed Unit 2: ${processedUnitsString2}`);
        }
    }
    return ratioOnly;
}

/**
 * Scales the x, y, and z values within a single data series dictionary.
 *
 * @param {object} dataseriesDict - The data series dictionary to scale.
 * @param {number} [numToScaleXValuesBy=1] - The factor to scale x values by.
 * @param {number} [numToScaleYValuesBy=1] - The factor to scale y values by.
 * @param {number} [numToScaleZValuesBy=1] - The factor to scale z values by.
 * @returns {object} The scaled data series dictionary (modified in place).
 */
export function scaleDataseriesDict(dataseriesDict, numToScaleXValuesBy = 1, numToScaleYValuesBy = 1, numToScaleZValuesBy = 1) {
    // In JavaScript, array multiplication can be done directly with `map`.
    // No `numpy` equivalent needed.
    // Ensure float conversion is done for each element.

    if (dataseriesDict.x && numToScaleXValuesBy !== 1) {
        dataseriesDict.x = datasereriesDict.x.map(val => parseFloat(val) * numToScaleXValuesBy);
    }
    if (dataseriesDict.y && numToScaleYValuesBy !== 1) {
        dataseriesDict.y = dataseriesDict.y.map(val => parseFloat(val) * numToScaleYValuesBy);
    }
    if (dataseriesDict.z && numToScaleZValuesBy !== 1) {
        dataseriesDict.z = dataseriesDict.z.map(val => parseFloat(val) * numToScaleZValuesBy);
    }
    return dataseriesDict;
}

/**
 * Scales the values in the data of a figure dictionary (figDict) and returns the scaled figDict.
 *
 * @param {object} figDict - The figure dictionary.
 * @param {number} [numToScaleXValuesBy=1] - The factor to scale x values by.
 * @param {number} [numToScaleYValuesBy=1] - The factor to scale y values by.
 * @returns {object} A new figure dictionary with scaled data values.
 */
export function scaleFigDictValues(figDict, numToScaleXValuesBy = 1, numToScaleYValuesBy = 1) {
    // Deep copy the figDict to avoid modifying the original.
    const scaledFigDict = JSON.parse(JSON.stringify(figDict));

    // Iterate across the data objects inside and change them.
    for (let i = 0; i < scaledFigDict.data.length; i++) {
        // Assuming z scaling is not directly controlled here, so pass 1.
        scaledFigDict.data[i] = scaleDataseriesDict(scaledFigDict.data[i], numToScaleXValuesBy, numToScaleYValuesBy, 1);
    }
    return scaledFigDict;
}