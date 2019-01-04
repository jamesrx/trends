import React from 'react';
import PropTypes from 'prop-types';

class Chart extends React.Component {
  constructor(props) {
    super(props);

    this.chartRef = React.createRef();
  }

  componentDidMount = () => {
    const { packages } = this.props;

    window.google.charts.load('current', { packages: ['corechart', ...(packages)] });
    window.google.charts.setOnLoadCallback(this.setupChart);
    window.addEventListener('resize', this.drawChart);
  }

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.drawChart);
  }

  setupChart = () => {
    const chartElement = this.chartRef.current;
    const textStyle = {
      fontSize: 12,
      color: '#9e9e9e',
    };
    const {
      visualization,
      data,
      options,
    } = this.props;

    this.chart = new window.google.visualization[visualization](chartElement);
    this.chartData = window.google.visualization.arrayToDataTable(data);
    this.chartOptions = {
      ...options,
      legend: {
        position: 'none',
      },
      vAxis: {
        ...options.vAxis,
        textStyle,
      },
      hAxis: {
        ...options.hAxis,
        textStyle,
      },
    };

    this.drawChart();
  }

  drawChart = () => {
    this.chart.draw(this.chartData, this.chartOptions);
  }

  render() {
    return <div ref={this.chartRef} />;
  }
}

Chart.propTypes = {
  packages: PropTypes.arrayOf(PropTypes.string),
  visualization: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  options: PropTypes.object,
};

Chart.defaultProps = {
  packages: [],
  options: {},
};

export default Chart;
