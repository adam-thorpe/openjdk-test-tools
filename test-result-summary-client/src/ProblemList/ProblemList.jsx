import React, { Component } from 'react';
import { Icon, Tooltip } from 'antd';

import './ProblemList.css';
import UpdateProblemLists from './UpdateProblemLists.js';
import Checkboxes from '../Build/Checkboxes';

const jdkVersions = ["8","9","10","11","12","13","14", "15"];
const jdkImpls = ["hs", "j9", "up"];
const testSuites = ["awt", "beans", "lang", "management", "jmx", "math", "net", "io", "jdi", "nio", "rmi", "security", "sound", "swing", "text", "time", "tools", "util", "misc"];

class CellBlock extends Component {
	render() {
		const { excludes, version } = this.props;
		return <div className="nested-wrapper">
			{jdkImpls.map((impl, x) => {

				// Get the Implementation
				var implFull = "";
				if (impl === "j9") {
					implFull = "OpenJ9";
				} else if (impl === "hs") {
					implFull = "Hotspot";
				} else if (impl === "up") {
					implFull = "Upstream";
				}

				// Default Cell states
				let toolTip = (
					<div>
						{"JDK" + version + " - " + implFull}
					</div>
						
				);
				let state = "UNDEFINED";
				let iconType = "exclamation-circle";
				
				{excludes.map((exclude) => {
					if (exclude.impl === impl) {
						state = exclude.state;

						if (state === "OPEN") {
							iconType = "check-circle";
						} else if (state === "CLOSED") {
							iconType = "minus-circle";
						} else if (state === "UNKNOWN") {
							iconType = "minus-circle";
						}
						
						let issueDisplay = exclude.issue;
						issueDisplay = issueDisplay.replace("https://github.com/", "");
						issueDisplay = issueDisplay.replace("/issues/", "#");


						toolTip = (
							<div>
								{toolTip}
								
								{exclude.platforms.map((platform) => {
									return <div>{platform}</div>
								})}
								<div>
									<a href={exclude.issue}>{issueDisplay}</a>
								</div>
							</div>
						);
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

export default class ProblemList extends Component {

	constructor(props) {
		super(props);
		this.state = {
			selectedJDKVersions: ["8"],
			selectedJDKImpls: ["hs"],
			selectedTestSuites: ["lang"],
			data: [],
			isRenderData: false
		};
	}

	async getTestData(selectedTestSuites, selectedJDKVersions, selectedJDKImpls) {
		this.setState({data: await UpdateProblemLists(selectedJDKVersions, selectedJDKImpls, selectedTestSuites), isRenderData: true});
	}

	render () {
		const { data, isRenderData, selectedJDKVersions, selectedJDKImpls, selectedTestSuites } = this.state

		return <div>
			<Checkboxes name="Versions" onChange={selectedJDKVersions => this.setState({ selectedJDKVersions })} value={selectedJDKVersions} options={jdkVersions}/>
			<Checkboxes name="Impls" onChange={selectedJDKImpls => this.setState({ selectedJDKImpls })} value={selectedJDKImpls} options={jdkImpls}/>
			<Checkboxes name="Suites" onChange={selectedTestSuites => this.setState({ selectedTestSuites })} value={selectedTestSuites} options={testSuites}/>
			<button onClick={() => this.getTestData(selectedTestSuites, selectedJDKVersions, selectedJDKImpls)}>Load Test Data</button>

			{(() => {

				// When data is ready to be rendered
				if (isRenderData) {
					return <div className="wrapper">

						{/* For each of suite in data */}
						{data.map((dataSuite, z) => {
							return <div className="wrapper suite-box" style={{ gridColumn: 1, gridRow: z + 1 }}>

								{/* Render the suite header */}
								<div className="title-header" style={{ gridColumn: 1, gridRow: 1 }}>jdk_{dataSuite.suite}</div>

								{/* Render the version headers */}
								{selectedJDKVersions.map((version, x) => {
									return <div className="version-header" style={{ gridColumn: x + 2, gridRow: 1 }}>
										{version}
									</div>
								})}

								{/* For each test in suite */}
								{dataSuite.tests.map((dataTest, y) => {
									return <>

										{/* Render the test Name */}
										<div className="box-small test-header" style={{ gridColumn: 1, gridRow: y + 3 }}>
											{dataTest.name}
										</div>
	
										{/* For each jdk version */}
										{selectedJDKVersions.map((version, x) => {
											let dataVersionExcludes = [];

											// Only get test excludes from data that are for this version, put them in a new array
											{dataTest.excludes.map((exclude) => {
												if (version === exclude.version) {
													dataVersionExcludes.push(exclude)
												}
											})}
	
											// Return a row of checkboxes for that version and test
											return <div className="box-small" style={{ gridColumn: x + 2, gridRow: y + 3 }}>
												<CellBlock excludes={dataVersionExcludes} version={version}/>
											</div>
										})}	
									</>
								})}
							</div>
						
						})}
					</div>
				}
			})()}
		</div>
	}
}
