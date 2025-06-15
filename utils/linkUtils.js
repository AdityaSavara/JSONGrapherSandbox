// Function to retrieve JSON record from URL
export async function loadJsonFromUrl(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not OK");
        const jsonData = await response.json();
        return jsonData;
    } catch (error) {
        console.error("Error fetching JSON:", error);
        return null;
    }
}

// Function to validate a URL string
export function isValidUrl(urlString) {
    var urlPattern = new RegExp(
        "^(https?:\\/\\/)?" +                     // validate protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+" + // validate domain name
        "[a-z]{2,}|" +                            // OR
        "((\\d{1,3}\\.){3}\\d{1,3}))" +           // validate IP (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +       // validate port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" +              // validate query string
        "(\\#[-a-z\\d_]*)?$",                     // validate fragment locator
        "i"
    );
    return !!urlPattern.test(urlString);
}

// A function that will create a download link for the JSON file
export function createDownloadJSONLink(json, filename) {
    if (filename === null) {
        filename = "JSONGrapherRecord.json";
    }
    let jsonFile;
    let downloadLink;
    // JSON file
    jsonFile = new Blob([JSON.stringify(json, null, 4)], {
        type: "application/json",
    });
    // Download link
    downloadLink = document.createElement("a");
    // File name
    downloadLink.download = filename;
    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(jsonFile);
    // Hide download link
    downloadLink.style.display = "none";
    return downloadLink;
}

// A function that will create a BZ2 and encoded URL for the final graph.
// This approach was abandoned because the URL strings were too long for both some browsers and some web server limits.
export function jsonToUrl(json) {
    // For now, hardcoding the base URL for clarity
    const prefix = `http://www.jsongrapher.com?fromUrl=`;
    // const url = window.location.href.split('?')[0]; // gets url from browser and removes query parameters
    // const prefix = `${url}?fromUrl=`;
    // Convert JSON to a string
    let jsonString = JSON.stringify(json);
    // Concatenate with prefix and apply URL encoding
    let urlString = prefix + encodeURIComponent(jsonString);
    // Intended to compress using Bzip2, but importing a JS version posed issues
    // urlString = compressjs.Bzip2.compressFile(new TextEncoder().encode(urlString));
    return urlString;
}

// A function that will create a URL string that allows graphing from a remote JSON
export function createCopyUrlLink(jsonURL) {
    // For now, hardcoding the base URL for clarity
    const prefix = `http://www.jsongrapher.com?fromUrl=`;
    // const url = window.location.href.split('?')[0]; // gets url from browser and removes query parameters
    // const prefix = `${url}?fromUrl=`;
    // Concatenate with prefix and apply URL encoding
    let urlString = prefix + encodeURIComponent(jsonURL);
    // Intended to compress using Bzip2, but importing a JS version posed issues
    // urlString = compressjs.Bzip2.compressFile(new TextEncoder().encode(urlString));
    return urlString;
}


window.loadJsonFromUrl = loadJsonFromUrl; //line needed for index.html to see the function after importing.
window.isValidUrl = isValidUrl; //line needed for index.html to see the function after importing.
window.createDownloadJSONLink = createDownloadJSONLink; //line needed for index.html to see the function after importing.
window.jsonToUrl = jsonToUrl; //line needed for index.html to see the function after importing.
window.createCopyUrlLink = createCopyUrlLink; //line needed for index.html to see the function after importing.