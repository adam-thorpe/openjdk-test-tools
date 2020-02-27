import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Icon, Tooltip } from 'antd';

import './ProblemList.css';
import UpdateProblemLists from './UpdateProblemLists.js';
import { checkPropTypes } from 'prop-types';

const jdkVersions = [{name: "JDK8", short: "8"}, {name: "JDK11", short: "11"}, {name: "JDK14", short: "14"}];
const jdkImpls = [{name: "HotSpot", short: "hs"}, {name: "OpenJ9", short: "j9"}];
// const jdkVersions = [{name: "JDK11", short: "11"}];
// const jdkImpls = [{name: "HotSpot", short: "hs"}];

class CellBlock extends Component {
	render() {
		const { excludes, version } = this.props;
		return <div className="nested-wrapper">
			{jdkImpls.map((impl, x) => {
				let toolTip = (
					<div>
						{version + " - " + impl.name}
					</div>
						
				)
				let state = "UNDEFINED"
				let iconType = "exclamation-circle"
				
				{excludes.map((exclude) => {
					if (exclude.impl == impl.short) {
						state = exclude.state;

						if (state == "OPEN") {
							iconType = "check-circle"
						} else if (state == "CLOSED") {
							iconType = "minus-circle"
						} else if (state == "UNKNOWN") {
							iconType = "minus-circle"
						}
						
						let issueDisplay = exclude.issue
						issueDisplay = issueDisplay.replace("https://github.com/", "")
						issueDisplay = issueDisplay.replace("/issues/", "#")


						toolTip = (
							<div>
								<div>
									{version + " - " + impl.name}
								</div>
								
								{exclude.platforms.map((platform) => {
									return <div>{platform}</div>
								})}
								<div>
									<a href={exclude.issue}>{issueDisplay}</a>
								</div>
							</div>
						)
					}
				})}

				return <>
					<div className={`myCell ${state}`} style={{ gridColumn: x + 1, gridRow: 1 }}>
						<Tooltip title={<div>{toolTip}</div>}>
							<Icon type={iconType} style={{ color: "white" }} />
						</Tooltip>
					</div>
				</>
			})}
		</div>
	}
}

class PlatformCellBlock extends Component {
	render() {
		return <div className="box-small">
			<div className="nested-wrapper">
				{jdkImpls.map((impl, x) => {
					return <>
						<div className="platformCell" style={{ gridColumn: x + 1, gridRow: 1}}>
							{impl.short}
						</div>
					</>
				})}
			</div>
		</div>
	}
}

class SuiteBlock extends Component {
	render() {
		const { testData, suite } = this.props;

		return <div className="wrapper" style={{ gridColumn: 1, gridRow: 1 }}>
			<div className="title-header" style={{ gridColumn: 1, gridRow: 1 }}>{suite}</div>
			{jdkVersions.map((version, x) => {
				return <>
					<div>
						<div className="version-header" style={{ gridColumn: x + 2, gridRow: 1 }}>
							{version.short}
						</div>
						<div style={{ gridColumn: x + 2, gridRow: 2 }}>
							<PlatformCellBlock />
						</div>
					</div>
				</>
			})}

			{testData.map((test, y) => {
				return <>
					<div className="box-small test-header" style={{ gridColumn: 1, gridRow: y + 3 }}>{test.name}</div>

					{jdkVersions.map((version, x) => {
						let excludeVersions = [];
						{test.excludes.map((exclude) => {
							if (version.name == exclude.version) {
								excludeVersions.push(exclude)
							}
						})}

						return <>
							<div className="box-small" style={{ gridColumn: x + 2, gridRow: y + 3 }}>
								<CellBlock excludes={excludeVersions} version={version.name}/>
							</div>
						</>
					})}	
				</>
			})}
		</div>
	}
}

export default class ProblemList extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			testData: [
				{suite: "jdk_lang", suiteSub: "lang", tests: []}, 
				{suite: "jdk_management", suiteSub: "management", tests: []},
				{suite: "jdk_math", suiteSub: "math", tests: []}, 
				{suite: "jdk_net", suiteSub: "net", tests: []}, 
				{suite: "jdk_io", suiteSub: "io", tests: []}, 
				{suite: "jdk_nio", suiteSub: "nio", tests: []},
				{suite: "jdk_rmi", suiteSub: "rmi", tests: []}, 
				{suite: "jdk_util", suiteSub: "util", tests: []}, 
				{suite: "misc", suiteSub: "misc", tests: []}
			]
		};
	}

	async componentDidMount() {
		const { testData } = this.state;
		var newTestData = await UpdateProblemLists(testData, jdkVersions, jdkImpls);

		//var issueName = "https://api.github.com/repos/adam-thorpe/dummyTest/issues/1";
		//ar issueName = "https://api.github.com/repos/adoptopenjdk/openjdk-tests/issues/500";

		// testData[0].tests.push({
		// 	name: "java/lang/ClassLoader/LibraryPathProperty.java", 
		// 	excludes: [
		// 		{ version: "JDK11", impl: "hs", state: await this.isIssueOpen(issueName), platforms: ["macosx-all", "windows-all"], issue: "https://github.com/AdoptOpenJDK/openjdk-tests/issues/1297"},
		// 	]
		// })


		this.setState({testData: newTestData});
	}

	// async isIssueOpen(issue) {
	// 	// const settings = {
	// 	//     method: "GET",
	// 	//     headers: {
	// 	// 		"Authorization": "842880109d008f5f5b4c3cb77e6254c846fcdeaf"
	// 	// 	}
	// 	// };
	
	// 	const response = await fetch(issue);
	// 	const json = await response.json();
	
	// 	var x = json.state;
	// 	console.log(x);
	// 	return x.toUpperCase();
	// }

	// async isIssueOpen2(issue) {
	// 	var request = new XMLHttpRequest();

	// 	request.open("GET", issue, true);
	// 	request.setRequestHeader("Authorization", "Bearer "+ gitToken);
	// 	request.send();

	// 	request.onreadystatechange = function () {
	// 		if (request.readyState == 4 && request.status == 200) {
	// 			var response = request.responseText;
	// 			var obj = JSON.parse(response); 
				
	// 			state = obj.state;
	// 			return state;
	// 		}
	// 	}
	// }

	render () {
		const { testData } = this.state

		return <div>
			<div className="wrapper">
				{testData.map((suite, z) => {
					return <>
						<div className="wrapper suite-box" style={{ gridColumn: 1, gridRow: z + 1 }}>
							<div className="title-header" style={{ gridColumn: 1, gridRow: 1 }}>{suite.suite}</div>
							{jdkVersions.map((version, x) => {
								return <>
									<div className="version-header" style={{ gridColumn: x + 2, gridRow: 1 }}>
										{version.short}
									</div>
								</>
							})}
							{suite.tests.map((test, y) => {
								return <>
									<div className="box-small test-header" style={{ gridColumn: 1, gridRow: y + 3 }}>{test.name}</div>

									{jdkVersions.map((version, x) => {
										let excludeVersions = [];
										{test.excludes.map((exclude) => {
											if (version.name == exclude.version) {
												excludeVersions.push(exclude)
											}
										})}

										return <>
											<div className="box-small" style={{ gridColumn: x + 2, gridRow: y + 3 }}>
												<CellBlock excludes={excludeVersions} version={version.name}/>
											</div>
										</>
									})}	
								</>
							})}
						</div>
					</>
				})}
			</div>
		</div>
	}
}
