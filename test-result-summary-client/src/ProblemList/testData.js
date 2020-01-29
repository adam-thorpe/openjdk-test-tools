const TestData = [
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
            },
            {
                name: "java/lang/annotation/loaderLeak/Main.java",
                excludes: [
                    { version: "JDK8", impl: "hs", state: "CLOSED", platforms: ["generic-all"], issue: "https://github.com/eclipse/openj9/issues/6768" },
                    { version: "JDK8", impl: "j9", state: "CLOSED", platforms: ["generic-all"], issue: "https://github.com/eclipse/openj9/issues/6768" },
                    { version: "JDK11", impl: "hs", state: "CLOSED", platforms: ["windows-all", "linux-all", "macosx-all"], issue: "https://github.com/eclipse/openj9/issues/6768" },
                    { version: "JDK11", impl: "j9", state: "CLOSED", platforms: ["windows-all", "linux-all", "macosx-all"], issue: "https://github.com/eclipse/openj9/issues/6768" }
                ]
            }
        ]
    },
    
    {
        suite: "jdk_nio",
        tests: [
            {
                name: "java/nio/channels/AsynchronousFileChannel/Basic.java",
                excludes: [
                    { version: "JDK11", impl: "hs", state: "OPEN", platforms: ["generic-all"], issue: "https://bugs.openjdk.java.net/browse/JDK-7052549" },
                    { version: "JDK11", impl: "j9", state: "OPEN", platforms: ["generic-all"], issue: "https://bugs.openjdk.java.net/browse/JDK-7052549" },
                ]
            }
        ]
    }
]

export default TestData