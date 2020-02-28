import githubToken from "./.githubToken.js";

/**
 * Gets data from the openjdk problem lists at AdoptOpenJDK/openjdk-tests
 * @param {String[]} jdkVersions Selected JDK versions
 * @param {String[]} jdkImpls Selected JDK implementations
 * @param {String[]} testSuites Selected test suites
 * @returns Data array of parsed tests and issues
 */
export default async function UpdateProblemLists( jdkVersions, jdkImpls, testSuites ) {

    // Create the data array
    var data = [];
    for (const suite of testSuites) {
        data.push({suite: suite, tests: []});
    }

    // Determine the problem list url for each version and impl
    for (const version of jdkVersions) {
        for (const impl of jdkImpls) {
            var url = "";

            // OpenJ9 URL's
            if (impl === "j9") {
                url = "https://api.github.com/repos/adoptopenjdk/openjdk-tests/contents/openjdk/ProblemList_openjdk" + version + "-openj9.txt";

            // Upstream URL's
            } else if (impl === "up") {
                var path = "";
                if (version.sub <= 9) {
                    path = "jdk/test/";
                } else {
                    path = "test/jdk/";
                }
                url = "https://api.github.com/repos/adoptopenjdk/openjdk-jdk" + version + "u/contents/" + path + "ProblemList.txt";

            // Hotspot URL's
            } else {
                url = "https://api.github.com/repos/adoptopenjdk/openjdk-tests/contents/openjdk/ProblemList_openjdk" + version + ".txt";
            }

            // Collect the data together and go and fetch the relevent Problem List
            const plData = {version: version, impl: impl, url: url};
            const plArr = getProblemList(plData);
    
            // Iterate through each entry in the problem list, asyncronously
            for (const test of plArr) {
                await parseProblemList(test, plData, data);
            }
        }
    }

    return data;
}

/**
 * Fetches a Problem List
 * @param {{version: string; impl: string; url: string;}} plData Data about the problem list
 * @retuns An array of objects, each of which is a line in the problem list
 */
function getProblemList(plData) {
    // Create the request
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", plData.url, false);
    xhttp.setRequestHeader("Authorization", "Bearer "+ githubToken);
    xhttp.send();

    // Handle the result of the request and put into an array of items, where each item is a single line
    var plStr = atob(JSON.parse(xhttp.responseText).content);
    return plStr.split("\n");
}


/**
 * Parses a single test and adds it to the array of data
 * @param {String} test Single line from the PL which will be parsed
 * @param {{version: string; impl: string; url: string;}} plData Data about the problem list
 * @param {{suiteName: string; suiteSub: string; tests: any[];}[]} data Array of parsed tests and issues
 * @returns An updated version of the data array
 */
async function parseProblemList(test, plData, data) {

    // Return if entry isn't a valid test
    if(test === "" || test.charAt(0) === "#") {
        return data;
    }

    // Return if entry isn't in the correct format
    const testItems = test.split(/[ |\t]+/);
    if (testItems.length != 3) {
        return data;
    }

    const testName = testItems[0];
    const testIssue = testItems[1];
    const testPlatforms = testItems[2];

    // Iterate through each suite of the array
    for (var dataSuite of data) {
        var suiteRegex = new RegExp(".*\/" + dataSuite.suite + "\/");

        // Continue if suite is selected, ignore otherwise
        if (testName.match(suiteRegex)) {

            // Check whether the test already exists
            var dataExcludes;
            for (var dataTest of dataSuite.tests) {
                if (testName === dataTest.name) {

                    // Test already exists, get it's excludes list
                    dataExcludes = dataTest.excludes;
                    break;
                }
            } 

            // Test isnt already listed, create new entry
            if (dataExcludes == null) {
                var newTest = { name: testName, excludes: [] };
                var dataExcludes = newTest.excludes;
                dataSuite.tests.push(newTest);
            }

            // Determine whether we should check the state of the issue. Cannot check state of jbs issues yet
            var state;
            if (!testIssue.includes("bugs.openjdk.java")) {

                // Create the api url and go and check it
                var apiIssue = testIssue.replace("https://github.com", "https://api.github.com/repos");
                state = await isIssueOpen(apiIssue);
            } else {
                state = "UNKNOWN";
            }

            // Add new exclude data
            dataExcludes.push({ version: plData.version, impl: plData.impl, state: state, platforms: [testPlatforms], issue: testIssue });
        }
    }

    return data;
}


/**
 * Uses the Github API to check the state of an issue
 * @param {String} url Link to this issue
 * @returns State of the issue
 */
async function isIssueOpen(url) {
    
    // Create request
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'token ' + githubToken);
    const settings = {
        method: "GET",
        headers: myHeaders
    }

    // Parse response and return it
    const response = await fetch(url, settings);
    const json = await response.json();
    return json.state.toUpperCase();
}
