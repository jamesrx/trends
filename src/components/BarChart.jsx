import React from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';

class BarChart extends React.Component {
  getBarChartData = (lastRound) => {
    const { colors } = this.props;
    const chartData = Object.keys(lastRound).map((player, i) => (
      [
        lastRound[player].fullTerm,
        lastRound[player].points,
        colors[i],
      ]
    ));

    chartData.unshift(['Term', 'Points', { role: 'style' }]);

    return chartData;
  }

  render() {
    const options = {
      width: 300,
      height: 400,
      animation: {
        startup: true,
        duration: 2000,
      },
      vAxis: {
        minValue: 0,
        maxValue: 100,
        gridlines: {
          count: 3,
        },
        minorGridlines: {
          count: 0,
        },
      },
    };
    const { lastRound } = this.props;

    return (
      <>
        <h3>Current Trend</h3>
        <Chart
          visualization="ColumnChart"
          packages={['bar']}
          data={this.getBarChartData(lastRound)}
          options={options}
        />
      </>
    );
  }
}

BarChart.propTypes = {
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  lastRound: PropTypes.object.isRequired,
};

export default BarChart;
