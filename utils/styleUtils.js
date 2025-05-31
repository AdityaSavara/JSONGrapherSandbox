//The below two lines allow us to use syntax more like in python:
// layout_styles.styles_library.default
// trace_styles_collection.styles_library.default

///// start of parse plot style and applying plot style functions ////

function parsePlotStyle(plotStyle) {
    /**
     * Parses the given plot style and returns a structured object with layout and data series styles.
     * If `plotStyle` is missing a `layout_style` or `trace_styles_collection`, it sets them to an empty string.
     *
     * @param {null|string|Array|Object} plotStyle - None, string, list of two items, or a dictionary.
     * @returns {Object} An object with `layout_style` and `trace_styles_collection` ensuring defaults.
     */
    let parsedPlotStyle;

    if (plotStyle === null) {
        parsedPlotStyle = { layout_style: null, trace_styles_collection: null };
    } else if (typeof plotStyle === "string") {
        parsedPlotStyle = { layout_style: plotStyle, trace_styles_collection: plotStyle };
    } else if (Array.isArray(plotStyle) && plotStyle.length === 2) {
        parsedPlotStyle = { layout_style: plotStyle[0], trace_styles_collection: plotStyle[1] };
    } else if (typeof plotStyle === "object") {
        if (!plotStyle.trace_styles_collection) {
            if (plotStyle.trace_style_collection) {
                console.warn("Warning: plotStyle has 'trace_style_collection', this key should be 'trace_styles_collection'. Using it, but fix the spelling error.");
                plotStyle.trace_styles_collection = plotStyle.trace_style_collection;
            } else if (plotStyle.traces_style_collection) {
                console.warn("Warning: plotStyle has 'traces_style_collection', this key should be 'trace_styles_collection'. Using it, but fix the spelling error.");
                plotStyle.trace_styles_collection = plotStyle.traces_style_collection;
            } else {
                plotStyle.trace_styles_collection = "";
            }
        }
        if (!plotStyle.layout_style) {
            plotStyle.layout_style = "";
        }

        parsedPlotStyle = {
            layout_style: plotStyle.layout_style ?? null,
            trace_styles_collection: plotStyle.trace_styles_collection ?? null,
        };
    } else {
        throw new Error("Invalid plot style: Must be null, a string, an array of two items, or an object with valid fields.");
    }

    return parsedPlotStyle;
}

function applyPlotStyleToPlotlyDict(figDict, plotStyle = null) {
    /**
     * Applies both layout_style and trace_styles_collection to a Plotly figure dictionary.
     * If either value is missing or an empty string, it is set to 'default'.
     *
     * @param {Object} figDict - The figure dictionary to update.
     * @param {Object|null} plotStyle - The plot style dictionary, or null to initialize defaults.
     * @returns {Object} Updated figure dictionary.
     */
    if (plotStyle === null) {
        plotStyle = { layout_style: {}, trace_styles_collection: {} }; // Fresh object per function call
    }

    // Parse and ensure defaults for missing values
    plotStyle = parsePlotStyle(plotStyle);
    plotStyle.layout_style ??= "";
    plotStyle.trace_styles_collection ??= "";

    // Apply layout style if not "none"
    if (String(plotStyle.layout_style).toLowerCase() !== "none") {
        if (plotStyle.layout_style === "") {
            plotStyle.layout_style = "default";
        }
        //figDict = removeLayoutStyleFromPlotlyDict(figDict);
        figDict = applyLayoutStyleToPlotlyDict(figDict, plotStyle.layout_style);
    }

    // Apply trace_styles_collection if not "none"
    if (String(plotStyle.trace_styles_collection).toLowerCase() !== "none") {
        if (plotStyle.trace_styles_collection === "") {
            plotStyle.trace_styles_collection = "default";
        }
        //figDict = removeTraceStylesCollectionFromPlotlyDict(figDict);
        figDict = applyTraceStylesCollectionToPlotlyDict(figDict, plotStyle.trace_styles_collection);
    }

    return figDict;
}



///// end of parse plot style and applying plot style functions ////

function applyTraceStylesCollectionToPlotlyDict(figDict, traceStylesCollection = "", traceStyleToApply = "") {
    /**
     * Iterates over all traces in the `data` array of a Plotly figure dictionary 
     * and applies styles to each one.
     *
     * @param {Object} figDict - A dictionary containing a `data` field with Plotly traces.
     * @param {String|Object} traceStylesCollection - Optional style preset or object.
     * @param {String} traceStyleToApply - Optional style preset to apply. Default is "default".
     * @returns {Object} Updated Plotly figure dictionary with defaults applied to each trace.
     */

    let traceStylesCollectionName;

    if (typeof traceStylesCollection === "string") {
        traceStylesCollectionName = traceStylesCollection;
    } else {
        traceStylesCollectionName = traceStylesCollection.name;
    }

    if (figDict.data && Array.isArray(figDict.data)) {
        figDict.data = figDict.data.map(trace => 
            applyTraceStyleToSingleDataSeries(trace, traceStylesCollection, traceStyleToApply)
        );
    }

    if (!figDict.plot_style) {
        figDict.plot_style = {};
    }
    figDict.plot_style.trace_styles_collection = traceStylesCollectionName;

    return figDict;
}

function applyTraceStyleToSingleDataSeries(dataSeries, traceStylesCollection = "", traceStyleToApply = "") {
    /**
     * Applies predefined styles to a single Plotly data series while preserving relevant fields.
     *
     * @param {Object} dataSeries - An object representing a single Plotly data series.
     * @param {String|Object} traceStylesCollection - Style preset or custom style dictionary.
     * @param {String} traceStyleToApply - Name of the style preset or custom style dictionary. Default is "default".
     * @returns {Object} Updated data series with style applied.
     */

    if (typeof dataSeries !== "object" || dataSeries === null) {
        return dataSeries; // Return unchanged if the data series is invalid.
    }

    if (typeof traceStyleToApply === "object") {
        dataSeries.trace_style = traceStyleToApply;
    }

    if (traceStyleToApply !== "") {
        dataSeries.trace_style = traceStyleToApply;
    } else {
        let traceStyle = dataSeries.trace_style || "";

        // If "none", return unchanged
        if (String(traceStyle).toLowerCase() === "none") {
            return dataSeries;
        }

        // If traceStyle is a dictionary, set traceStyleToApply to it
        if (typeof traceStyle === "object") {
            traceStyleToApply = traceStyle;
        }
    }

    // If traceStyleToApply is a string but no traceStylesCollection was provided, return unchanged
    if (typeof traceStyleToApply === "string" &&
        (traceStylesCollection === "" || String(traceStylesCollection).toLowerCase() === "none")) {
        return dataSeries;
    }

    // If traceStyleToApply is "none", return unchanged
    if (String(traceStyleToApply).toLowerCase() === "none") {
        return dataSeries;
    }

    // Handle predefined hardcoded cases
    if (typeof traceStyleToApply === "string") {
        if (traceStyleToApply.toLowerCase() === "nature" || traceStyleToApply.toLowerCase() === "science") {
            traceStyleToApply = "default";
        }
    }

    // Remove existing formatting before applying new formatting
    //dataSeries = removeTraceStyleFromSingleDataSeries(dataSeries);

    // -------------------------------
    // Predefined traceStylesCollection
    // -------------------------------
    // Each traceStylesCollection is defined as an object containing multiple trace styles.
    // Users can select a style preset traceStylesCollection (e.g., "default", "minimalist", "bold"),
    // and this function will apply appropriate settings for the given traceStyle.
    //
    // Examples of Supported traceStyles:
    // - "scatter_spline" (default when type is not specified)
    // - "scatter"
    // - "spline"
    // - "bar"
    // - "heatmap"
    //
    // Note: Colors are intentionally omitted to allow users to define their own.
    // However, predefined colorscales are applied for heatmaps.

    const stylesAvailable = trace_styles_collection_library

    // Get the appropriate style dictionary
    let stylesCollectionDict;

    if (typeof traceStylesCollection === "object") {
        stylesCollectionDict = traceStylesCollection; // Use custom style directly
    } else {
        stylesCollectionDict = stylesAvailable[traceStylesCollection] || {};
        if (Object.keys(stylesCollectionDict).length === 0) {
            console.warn(`Warning: traceStylesCollection named '${traceStylesCollection}' not found. Using 'default' traceStylesCollection instead.`);
            stylesCollectionDict = stylesAvailable["default"] || {};
        }
    }

    // Determine the traceStyle, defaulting to the first item in a given style if none is provided
    let traceStyle = traceStyleToApply || dataSeries.trace_style || "";

    if (traceStyle === "") {
        traceStyle = Object.keys(stylesCollectionDict)[0]; // Take the first traceStyle name in the styleDict
    }

    ({ dataSeries, colorscaleStructure, colorscale } = determineColorScaleStructure(dataSeries));

    // Apply type and other predefined settings
    dataSeries.type = traceStyle?.type;

    // Apply other attributes while preserving existing values
    for (const [key, value] of Object.entries(traceStyle)) {
        if (key !== "type") {
            if (typeof value === "object" && value !== null) { // Ensure value is an object
                dataSeries[key] = { ...dataSeries[key], ...value }; // Merge existing and new values
            } else {
                dataSeries[key] = value; // Direct assignment for non-object values
            }
        }
    }

    updatedDataSeries = applyColorScale(dataSeries);

    return dataSeries;
}


function determineColorScaleStructure(dataSeries) {
    let colorscale = ""; // Initialize variable
    let colorscaleStructure = ""; // Initialize variable for later use
    let traceStyle = dataSeries.trace_style; // Get traceStyle from dataSeries

    // Check if traceStyle is a string and extract colorscale if applicable
    if (typeof traceStyle === "string") {
        if (traceStyle.includes("__")) {
            [traceStyle, colorscale] = traceStyle.split("__");
        }
    }

    // 3D and bubble plots have a colorscale by default
    if (traceStyle === "bubble") {
        dataSeries = prepareBubbleSizes(dataSeries);
        colorscaleStructure = "bubble";
    } else if (traceStyle === "mesh3d") {
        colorscaleStructure = "mesh3d";
    } else if (traceStyle === "scatter3d") {
        colorscaleStructure = "scatter3d";
    }

    // Check if colorscale is provided and determine the colorscale structure
    if (colorscale !== "") {
        if (dataSeries.mode.includes("markers") || dataSeries.mode.includes("markers+lines") || dataSeries.mode.includes("lines+markers")) {
            colorscaleStructure = "marker";
        } else if (dataSeries.mode.includes("lines")) {
            colorscaleStructure = "line";
        } else if (dataSeries.type.includes("bar")) {
            colorscaleStructure = "marker";
        }
    }

    return { dataSeries, colorscaleStructure, colorscale };
}

function applyColorScale(dataSeries) {
    const { dataSeries: updatedDataSeries, colorscaleStructure, colorscale } = determineColorScaleStructure(dataSeries);

    function cleanColorValues(listOfValues, variableStringForWarning) {
        if (listOfValues.includes(null)) {
            console.warn(`Warning: A colorscale based on ${variableStringForWarning} was requested. None values were found. They are being replaced with 0 values. It is recommended to provide data without None values.`);
            return listOfValues.map(value => value === null ? 0 : value);
        }
        return listOfValues;
    }

    // Apply colorscale based on structure type
    if (colorscaleStructure === "bubble" || colorscaleStructure === "scatter3d") {
        updatedDataSeries.marker.colorscale = "viridis_r"; // Apply default colorscale
        updatedDataSeries.marker.showscale = true;
        if (updatedDataSeries.z) {
            updatedDataSeries.marker.color = cleanColorValues(updatedDataSeries.z, "z");
        } else if (updatedDataSeries.z_points) {
            updatedDataSeries.marker.color = cleanColorValues(updatedDataSeries.z_points, "z_points");
        }
    } else if (colorscaleStructure === "mesh3d") {
        updatedDataSeries.colorscale = "viridis_r"; // Apply default colorscale
        updatedDataSeries.showscale = true;
        if (updatedDataSeries.z) {
            updatedDataSeries.intensity = cleanColorValues(updatedDataSeries.z, "z");
        } else if (updatedDataSeries.z_points) {
            updatedDataSeries.intensity = cleanColorValues(updatedDataSeries.z_points, "z_points");
        }
    } else if (colorscaleStructure === "marker") {
        updatedDataSeries.marker.colorscale = colorscale;
        updatedDataSeries.marker.showscale = true;
        updatedDataSeries.marker.color = cleanColorValues(updatedDataSeries.y, "y");
    } else if (colorscaleStructure === "line") {
        updatedDataSeries.line.colorscale = colorscale;
        updatedDataSeries.line.showscale = true;
        updatedDataSeries.line.color = cleanColorValues(updatedDataSeries.y, "y");
    }

    return updatedDataSeries;
}





function prepareBubbleSizes(dataSeries) {
    // To make a bubble plot with Plotly, we use a 2D plot
    // and assign z values to marker sizes, scaling them to a max bubble size.
    
    if (!dataSeries.marker) {
        dataSeries.marker = {};
    }

    if (dataSeries.z_points) {
        dataSeries.marker.size = dataSeries.z_points;
    } else if (dataSeries.z) {
        dataSeries.marker.size = dataSeries.z;
    }

    // Function to normalize values to the max value in the list
    function normalizeToMax(startingList) {
        const maxValue = Math.max(...startingList);
        if (maxValue === 0) {
            return startingList.map(() => 0); // If max value is zero, return zeros
        } else {
            return startingList.map(value => value / maxValue); // Normalize values
        }
    }

    try {
        dataSeries.marker.size = normalizeToMax(dataSeries.marker.size);
    } catch (error) {
        throw new Error("Error: During bubble plot bubble size normalization, an issue occurred. This usually means the z variable hasn't been populated, such as by equation evaluation set to false or simulation evaluation set to false.");
    }

    // Scale the bubbles to a max size
    const maxBubbleSize = dataSeries.max_bubble_size || 10;
    dataSeries.marker.size = dataSeries.marker.size.map(value => value * maxBubbleSize);

    // Set hover text to original z values
    if (dataSeries.z_points) {
        dataSeries.text = dataSeries.z_points;
    } else if (dataSeries.z) {
        dataSeries.text = dataSeries.z;
    }

    return dataSeries;
}


function applyLayoutStyleToPlotlyDict(figDict, layoutStyleToApply = "default") {
    /**
     * Apply a predefined style to a Plotly figDict while preserving non-cosmetic fields.
     * 
     * @param {Object} figDict - Plotly-style figure dictionary.
     * @param {String|Object} layoutStyleToApply - Name of the style or a style dictionary to apply.
     * @returns {Object} Updated Plotly-style figure dictionary.
     */

    let layoutStyleToApplyName;

    if (typeof layoutStyleToApply === "string") {
        layoutStyleToApplyName = layoutStyleToApply;
    } else {
        layoutStyleToApplyName = Object.keys(layoutStyleToApply)[0]; // If it's a dictionary, it will have one key which is its name
    }

    if (!layoutStyleToApply || String(layoutStyleToApply).toLowerCase() === "none") {
        return figDict;
    }

    // Hardcoding some cases to call the default layout, for convenience
    if (["minimalist", "bold"].includes(layoutStyleToApply.toLowerCase())) {
        layoutStyleToApply = "default";
    }

    //get the local layout_styles_library
    const stylesAvailable = layout_styles_library

    // Use or get the specified style, or fallback to default if not found
    let styleDict;

    if (typeof layoutStyleToApply === "object") {
        styleDict = layoutStyleToApply;
    } else {
        // If stylesAvailable[layoutStyleToApply] exists, use it.
        // Otherwise, fallback to an empty object `{}` to prevent errors.
        styleDict = stylesAvailable[layoutStyleToApply] || {};
    }

    if (Object.keys(styleDict).length === 0) {
        console.warn(`Style named '${layoutStyleToApply}' not found with explicit layout dictionary. Using 'default' layout style.`);
        styleDict = stylesAvailable["default"] || {};
    }

    // Ensure layout exists in the figure
    figDict.layout = figDict.layout || {};
    console.log("inside styleUtils.js in applyLayoutStyleToPlotlyDict style itself before applying style", styleDict.layout)

    // Extract non-cosmetic fields
    const nonCosmeticFields = {
        "title.text": figDict?.layout?.title?.text || null,
        "xaxis.title.text": figDict?.layout?.xaxis?.title?.text || null,
        "yaxis.title.text": figDict?.layout?.yaxis?.title?.text || null,
        "zaxis.title.text": figDict?.layout?.zaxis?.title?.text || null,
        "legend.title.text": figDict?.layout?.legend?.title?.text || null,
        "annotations.text": figDict?.layout?.annotations?.map(annotation => annotation.text) || [],
        "updatemenus.buttons.label": figDict?.layout?.updatemenus?.flatMap(menu => menu.buttons?.map(button => button.label)) || [],
        "coloraxis.colorbar.title.text": figDict?.layout?.coloraxis?.colorbar?.title?.text || null,
    };

    // Apply style dictionary to create a fresh layout object //using JSON to create a deep cpoy of the styleDict.layout
    const newLayout = structuredClone(styleDict.layout);
    console.log("inside styleUtils.js in applyLayoutStyleToPlotlyDict new layout before adding things back in", JSON.parse(JSON.stringify(newLayout)));
    console.log("inside styleUtils.js in applyLayoutStyleToPlotlyDict before applying style", figDict.layout)
    // Restore non-cosmetic fields
    if (nonCosmeticFields["title.text"] != null) {
        newLayout.title = newLayout.title || {}; // Ensure title exists
        newLayout.title.text = nonCosmeticFields["title.text"];
    }

    console.log("inside styleUtils.js in applyLayoutStyleToPlotlyDict new layout right before x axis line", JSON.parse(JSON.stringify(newLayout)));

    if (nonCosmeticFields["xaxis.title.text"] != null) {
        newLayout.xaxis = newLayout.xaxis || {}; // Ensure xaxis exists
        newLayout.xaxis.title = newLayout.xaxis.title || {}; // Ensure title exists
        newLayout.xaxis.title.text = nonCosmeticFields["xaxis.title.text"];
    }

    console.log("inside styleUtils.js in applyLayoutStyleToPlotlyDict new layout right after x axis line", JSON.parse(JSON.stringify(newLayout)));

    if (nonCosmeticFields["yaxis.title.text"] != null) {
        newLayout.yaxis = newLayout.yaxis || {}; // Ensure yaxis exists
        newLayout.yaxis.title = newLayout.yaxis.title || {};
        newLayout.yaxis.title.text = nonCosmeticFields["yaxis.title.text"];
    }

    if (nonCosmeticFields["zaxis.title.text"] != null) {
        newLayout.zaxis = newLayout.zaxis || {}; // Ensure zaxis exists
        newLayout.zaxis.title = newLayout.zaxis.title || {};
        newLayout.zaxis.title.text = nonCosmeticFields["zaxis.title.text"];
    }

    if (nonCosmeticFields["legend.title.text"] != null) {
        newLayout.legend = newLayout.legend || {}; // Ensure legend exists
        newLayout.legend.title = newLayout.legend.title || {};
        newLayout.legend.title.text = nonCosmeticFields["legend.title.text"];
    }



    console.log("inside styleUtils.js in applyLayoutStyleToPlotlyDict new layout after adding things back in", JSON.parse(JSON.stringify(newLayout)));
    // Assign the new layout back into the figure dictionary
    figDict.layout = newLayout;
    console.log("inside styleUtils.js in applyLayoutStyleToPlotlyDict after applying style", figDict.layout)
    // Update figDict to signify the new layout style used
    figDict.plot_style = figDict.plot_style || {};
    figDict.plot_style.layout_style = layoutStyleToApplyName;
    console.log("Inside styleUtils.js, applyLayoutStyleToPlotlyDict", figDict)
    return figDict;
}
