import React, { Component } from 'react';
//import { params, getParams } from '../utils/query';
import { Icon, Tooltip } from 'antd';
//import { Link } from 'react-router-dom';
import Checkboxes from '../Build/Checkboxes';

import './ProblemList.css';
import TestData from './testData.js';
import UpdateProblemLists from './UpdateProblemLists.js';

const jdkVersions = [{name: "JDK8", short: "8"}, {name: "JDK11", short: "11"}, {name: "JDK14", short: "14"}];
const jdkImpls = [{name: "HotSpot", short: "hs"}, {name: "OpenJ9", short: "j9"}];

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
			testData: UpdateProblemLists(jdkVersions, jdkImpls)
			//testData: TestData
		};
	
		// This binding is necessary to make `this` work in the callback
		// this.updatePLClick = this.updatePLClick.bind(this);
	}

	// updatePLClick() {
	// 	this.setState(state => ({
	// 		testData: UpdateProblemLists
	// 	}));
	// }

	render () {
		const { testData } = this.state

		return <div>
			
			{/* <button onClick={this.updatePLClick}>Update Problem Lists</button> */}
			
			<div className="wrapper">
				{testData.map((suite, z) => {
					return <>
						<div className="wrapper suite-box" style={{ gridColumn: 1, gridRow: z + 1 }}>
							<div className="title-header" style={{ gridColumn: 1, gridRow: 1 }}>{suite.suite}</div>
							{jdkVersions.map((version, x) => {
								return <>
									<div>
										<div className="version-header" style={{ gridColumn: x + 2, gridRow: 1 }}>
											{version.short}
										</div>
										{/* <div style={{ gridColumn: x + 2, gridRow: 2 }}>
											<PlatformCellBlock />
										</div> */}
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
