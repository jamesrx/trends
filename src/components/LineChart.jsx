import React from 'react';
import Chart from './Chart'

class LineChart extends React.Component {
  constructor(props) {
    super(props);

    this.numEntries = 0;
  }

  lineChartData = (fullResults, lastRound) => {
    const chartData = fullResults.map((dataPoint) => (
      [
        dataPoint.formattedAxisTime,
        ...dataPoint.value
      ]
    ));

    this.numEntries = chartData.length;

    const headingRow = Object.keys(lastRound).map((player) => (
      lastRound[player].fullTerm
    ));

    chartData.unshift(['Date', ...headingRow]);

    return chartData;
  }

  render() {
    // call lineChartData before setting options so that numEntries is set
    const lineChartData = this.lineChartData(this.props.fullResults, this.props.lastRound);
    const options = {
      curveType: 'function',
      animation: {
        startup: true,
        duration: 1000,
      },
      vAxis: {
        gridlines: {
          count: 4,
        },
        viewWindow: {
          min: 0,
          max: 100,
        },
      },
      hAxis: {
        showTextEvery: (this.numEntries / 2) - 1,
        maxTextLines: 1,
      },
      lineWidth: 3,
      height: 350,
      chartArea: {
        width: '100%',
        left: 35,
        right: 30,
        top: 10,
        height: 315,
      },
      colors: this.props.colors,
    };

    return (
      <Chart
        visualization='LineChart'
        data={lineChartData}
        options={options}
      />
    );
  }
}

export default LineChart;
