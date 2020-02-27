import React, { Component } from 'react';
import TestData from './testData';

var gitToken = "842880109d008f5f5b4c3cb77e6254c846fcdeaf";

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


    //var issueName = "https://api.github.com/repos/adam-thorpe/dummyTest/issues/1";
    // var issueName = "https://api.github.com/repos/adoptopenjdk/openjdk-tests/issues/500";
    
    // data[0].tests.push({name: "java/lang/ClassLoader/LibraryPathProperty.java", 
    //     excludes: [
    //         { version: "JDK11", impl: "hs", state: await isIssueOpen(issueName), platforms: ["macosx-all", "windows-all"], issue: "https://github.com/AdoptOpenJDK/openjdk-tests/issues/1297"},
    //     ]
    // })

    console.log(data);

    return data;

    //this.setState({testData: TestData})
    //return TestData;
}


async function isIssueOpen(issue) {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    myHeaders.append('Authorization', 'token 842880109d008f5f5b4c3cb77e6254c846fcdeaf');

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
 * Determines whether the test links to an open or closed issue
 * @param {String} issue 
 * @returns open|closed|unknown
 */
// async function isIssueOpen(issue) {
//     var state = "UNKNOWN"
//     var request = new XMLHttpRequest();

//     request.open("GET", issue, true);
//     
//     request.send();

//     request.onreadystatechange = function () {
//         if (request.readyState == 4 && request.status == 200) {
//             var response = request.responseText;
//             var obj = JSON.parse(response); 
            
//             state = obj.state;
//             return state;
//         }
//     }

//     return state;
// }


/**
 * Fetches a Problem List
 * @param {{version: string; impl: string; url: string;}} PL Data about the problem list
 * @retuns An array of objects, each of which is a line in the problem list
 */
function getProblemList(PL) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", PL.url, false);
    xhttp.setRequestHeader("Authorization", "Bearer "+ gitToken);
    xhttp.send();

    var plStr = atob(JSON.parse(xhttp.responseText).content);
    return plStr.split("\n");
}


/**
 * Parses a single Test and adds it to the array of data
 * @param {{version: string; impl: string; url: string;}} PL Data about the problem list
 * @param {String} test Single line from the PL which will be parsed
 * @param {{suiteName: string; suiteSub: string; tests: any[];}[]} data Array of data which will be displayed 
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