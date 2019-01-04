import React from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';

class LineChart extends React.Component {
  constructor(props) {
    super(props);

    this.numEntries = 0;
  }

  getLineChartData = (fullResults, lastRound) => {
    const chartData = fullResults.map(dataPoint => (
      [
        dataPoint.formattedAxisTime,
        ...dataPoint.value,
      ]
    ));

    this.numEntries = chartData.length;

    const headingRow = Object.keys(lastRound).map(player => (
      lastRound[player].fullTerm
    ));

    chartData.unshift(['Date', ...headingRow]);

    return chartData;
  }

  render() {
    const {
      fullResults,
      lastRound,
      colors,
    } = this.props;

    // call getLineChartData before setting options so that numEntries is set
    const lineChartData = this.getLineChartData(fullResults, lastRound);
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
      colors,
    };

    return (
      <Chart
        visualization="LineChart"
        data={lineChartData}
        options={options}
      />
    );
  }
}

LineChart.propTypes = {
  fullResults: PropTypes.array.isRequired,
  lastRound: PropTypes.object.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default LineChart;
