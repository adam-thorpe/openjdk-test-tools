import githubToken from "./.githubToken.js";

/**
 * Gets data from the openjdk problem lists at AdoptOpenJDK/openjdk-tests
 * @param {*} data The array of data which will be passed back
 * @param {*} jdkVersions Default jdk versions that we're interested in
 * @param {*} jdkImpls Default implementations that we're interested in
 * @returns Data array of parsed tests and issues
 */
export default async function UpdateProblemLists( data, jdkVersions, jdkImpls ) {
    for (var jdkVersion of jdkVersions) {
        for (var jdkImpl of jdkImpls) {
            var url = ""
            if (jdkImpl.name == "OpenJ9") {
                url = "https://api.github.com/repos/adoptopenjdk/openjdk-tests/contents/openjdk/ProblemList_openjdk" + jdkVersion.short + "-openj9.txt";
            } else if (jdkImpl.name == "Upstream") {
                var path = ""
                if (jdkVersion.sub <= 9) {
                    path = "jdk/test/"
                } else {
                    path = "test/jdk/"
                }
                url = "https://api.github.com/repos/adoptopenjdk/openjdk-jdk" + jdkVersion.short + "u/contents/" + path + "ProblemList.txt";
            } else {
                url = "https://api.github.com/repos/adoptopenjdk/openjdk-tests/contents/openjdk/ProblemList_openjdk" + jdkVersion.short + ".txt";
            }
            var PL = {version: jdkVersion.name, impl: jdkImpl.short, url: url}

            var plArr = getProblemList(PL);
    
            for (var test of plArr) {
                await parseProblemList(PL, test, data);
            }
        }
    }

    return data;
}

/**
 * Uses the Github API to check the state of an issue
 * @param {String} issue API link to this issue
 * @returns State of the issue
 */
async function isIssueOpen(issue) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'token ' + githubToken);

    const settings = {
        method: "GET",
        headers: myHeaders
    }

    const response = await fetch(issue, settings);
    const json = await response.json();

    var x = json.state;
    return x.toUpperCase();
}


/**
 * Fetches a Problem List
 * @param {{version: string; impl: string; url: string;}} PL Data about the problem list
 * @retuns An array of objects, each of which is a line in the problem list
 */
function getProblemList(PL) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", PL.url, false);
    xhttp.setRequestHeader("Authorization", "Bearer "+ githubToken);
    xhttp.send();

    var plStr = atob(JSON.parse(xhttp.responseText).content);
    return plStr.split("\n");
}

/**
 * Parses a single Test and adds it to the array of data
 * @param {{version: string; impl: string; url: string;}} PL Data about the problem list
 * @param {String} test Single line from the PL which will be parsed
 * @param {{suiteName: string; suiteSub: string; tests: any[];}[]} data Array of data which will be displayed
 * @returns An updated version of the data array
 */
async function parseProblemList(PL, test, data) {
    if(test == "" || test.charAt(0) == "#") {
        return data;
    }

    var testItems = test.split(/[ |\t]+/);
    if (testItems.length == 0) {
        console.log("return");
        return data;
    }
    var testName = testItems[0];

    for (var dataSuite of data) {
        var suiteRegex = new RegExp(".*\/" + dataSuite.suiteSub + "\/");
        if (testName.match(suiteRegex)) {
            // Found correct suite

            var dataExcludes;
            for (var dataTest of dataSuite.tests) {
                if (testName == dataTest.name) {
                    // Test already exists, get the excludes list
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

            var issue = testItems[1];
            var state;

            if (!issue.includes("bugs.openjdk.java")) {
                var apiIssue = issue.replace("https://github.com", "https://api.github.com/repos");
                state = await isIssueOpen(apiIssue);
            } else {
                state = "UNKNOWN";
            }

            //console.log(state);

            //state = "UNKNOWN";

            // Add new exclude data
            dataExcludes.push({ version: PL.version, impl: PL.impl, state: state, platforms: [testItems[2]], issue: issue });
        }
    }

    return data;
}