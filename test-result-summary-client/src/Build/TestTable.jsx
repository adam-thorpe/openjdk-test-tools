import React, { Component } from 'react';
import TextFilter from '../utils/TextFilter';
import { Table, Input } from 'antd';
import { params } from '../utils/query';
import { Link } from 'react-router-dom';
import renderDuration from './Duration';
import Highlighter from 'react-highlight-words';

export default class TestTable extends Component {
    state = {
            filteredData: [],
        };

    async componentDidUpdate( prevProps ) {
        if ( prevProps.testData !== this.props.testData ) {
            this.setState( {
                filteredData: this.props.testData,
            } );
        }
    }

    handleFilterChange = ( filteredData ) => {
        this.setState( { filteredData } );
    }

    render() {
        const { title, testData, parents } = this.props;
        const { filteredData } = this.state;

        const renderResult = ( { testResult, testId } ) => {
            return <div>
                {testId ? <Link to={{ pathname: '/output/test', search: params( { id: testId } ) }}
                    style={{ color: testResult === "PASSED" ? "#2cbe4e" : ( testResult === "FAILED" ? "#f50" : "#DAA520" ) }}>
                    {testResult}
                </Link> : testResult}
            </div>;
        };

        const renderAction = ( { testId, testName } ) => {
            const issueUrl = `https://github.com/eclipse/openj9/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aopen+${testName}`
            return <span>
                <Link to={{ pathname: '/testPerPlatform', search: params( { testId } ) }}>
                    All Platforms
                </Link>
                <span className="ant-divider" />
                <Link to={{ pathname: '/deepHistory', search: params( { testId } ) }}>
                    Deep History
                </Link>
                <span className="ant-divider" />
                <a href={issueUrl} target="_blank" rel="noopener noreferrer">Possible Issues</a>
            </span>
        }

        var columns = [{
            title: 'Test Name',
            dataIndex: 'testName',
            key: 'testName',
            sorter: ( a, b ) => {
                return a.sortName.localeCompare( b.sortName );
            },
            filterDropdown: <TextFilter dataIndex={"testName"} dataSource={testData} handleFilterChange={this.handleFilterChange} />
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: renderAction,
        },
        {
            title: 'Duration',
            dataIndex: 'duration',
            key: 'duration',
            width: 100,
            render: renderDuration,
            sorter: ( a, b ) => {
                return a.duration - b.duration;
            },
        },
        {
            title: 'Machine',
            dataIndex: 'machine',
            key: 'machine',
            sorter: ( a, b ) => {
                return a.sortMachine.localeCompare( b.sortMachine );
            },
            filterDropdown: <TextFilter dataIndex={"machine"} dataSource={testData} handleFilterChange={this.handleFilterChange} />
        }];
        if (parents) {
            columns.push(...parents.map(( parent, i ) => {
                return {
                    title: <div>Build # {parent.buildNum}<br />{new Date( parent.timestamp ).toLocaleString()}</div>,
                    dataIndex: i.toString(),
                    key: i.toString(),
                    render: renderResult,
                    width: 120,
                    filters: [{
                        text: 'FAILED',
                        value: 'FAILED',
                    }, {
                        text: 'PASSED',
                        value: 'PASSED',
                    }, {
                        text: 'DISABLED',
                        value: 'DISABLED',
                    }, {
                        text: 'SKIPPED',
                        value: 'SKIPPED',
                    }],
                    onFilter: ( value, record ) => {
                        const testResult = record[i.toString()].testResult;
                        return testResult.indexOf( value ) === 0;
                    },
                };
            } ));
        } else {
            columns.push({
                    title: 'Result',
                    dataIndex: 'result',
                    key: 'result',
                    render: renderResult,
                    filters: [{
                        text: 'FAILED',
                        value: 'FAILED',
                    }, {
                        text: 'PASSED',
                        value: 'PASSED',
                    }, {
                        text: 'DISABLED',
                        value: 'DISABLED',
                    }, {
                        text: 'SKIPPED',
                        value: 'SKIPPED',
                    }],
                    onFilter: ( value, record ) => {
                        const res = record.result;
                        return res.testResult.indexOf( value ) === 0;
                    },
            });
            columns.push({
                title: 'Build',
                dataIndex: 'build',
                key: 'build',
                render: ( { buildName } ) => ( buildName ),
                sorter: ( a, b ) => {
                    return a.build.buildName.localeCompare( b.build.buildName );
                },
            });

        }
        
        return <div>
            <Table
                columns={columns}
                dataSource={filteredData}
                bordered
                title={() => title}
                pagination={{ pageSize: 50 }}
            />
        </div>
    }
}