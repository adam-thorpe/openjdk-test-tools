import React, { Component } from 'react';
//import { params, getParams } from '../utils/query';
import { Icon, Tooltip } from 'antd';
//import { Link } from 'react-router-dom';
//import Checkboxes from './Checkboxes';

import './ProblemList2.css';
import './ProblemList.css';
import TestData from './testData.js';

const jdkVersions = [{name: "JDK8", short: "8"}, {name: "JDK11", short: "11"}, {name: "JDK13", short: "13"}, {name: "JDK14", short: "14"}];
const jdkImpls = [{name: "HotSpot", short: "hs"}, {name: "OpenJ9", short: "j9"}];

class Cell extends Component {
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

export default class ProblemList extends Component {
	state = {
		testData: TestData
    };

	render() {
		return <div className="wrapper">
			<div className="box title-header" style={{ gridColumn: 1, gridRow: 1}}>JDK Lang</div>
			{this.state.testData.map((test, y) => {
				return <>
					<div className="box-small test-header" style={{ gridColumn: 1, gridRow: y + 2 }}>{test.name}</div>

					{jdkVersions.map((version, x) => {
						let excludeVersions = [];
						{test.excludes.map((exclude) => {
							if (version.name == exclude.version) {
								excludeVersions.push(exclude)
							}
						})}

						return <>
							<div className="version-header" style={{ gridColumn: x + 2, gridRow: 1}}>{version.short}</div>
							<div className="box-small" style={{ gridColumn: x + 2, gridRow: y + 2}}>
								<Cell excludes={excludeVersions} version={version.name}/>
							</div>
						</>
					})}	
				</>
			})}
		</div>
	}
}
