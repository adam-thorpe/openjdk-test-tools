const TestData2 = [
    {
        suite: "jdk_lang",
        tests: [
            {
                name: "java/lang/ClassLoader/LibraryPathProperty.java", 
                excludes: [
                    { version: "JDK11", impl: "hs", state: "OPEN", platforms: ["macosx-all", "windows-all"], issue: "https://github.com/AdoptOpenJDK/openjdk-tests/issues/1297"},
                    { version: "JDK11", impl: "j9", state: "OPEN", platforms: ["macosx-all", "windows-all"], issue: "https://github.com/AdoptOpenJDK/openjdk-tests/issues/1297" },
                    { version: "JDK13", impl: "hs", state: "CLOSED", platforms: ["linux-s390x"], issue: "https://github.com/eclipse/openj9/issues/6768" }
                ]
            }
        ]
    }
]

export default TestData2