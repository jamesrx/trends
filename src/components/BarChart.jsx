import React from 'react';
import Chart from './Chart'

class BarChart extends React.Component {
  constructor(props) {
    super(props);
  }

  barChartData = (lastRound) => {
    const chartData = Object.keys(lastRound).map((player, i) => (
      [
        lastRound[player].fullTerm,
        lastRound[player].points,
        this.props.colors[i],
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

    return (
      <Chart
        visualization='ColumnChart'
        packages={['bar']}
        data={this.barChartData(this.props.lastRound)}
        options={options}
      />
    );
  }
}

export default BarChart;
