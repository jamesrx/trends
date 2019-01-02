import React from 'react';

class Chart extends React.Component {
  constructor(props) {
    super(props);

    this.chartRef = React.createRef();
    this.chart;
    this.chartData;
    this.chartOptions;
  }

  componentDidMount = () => {
    google.charts.load('current', {'packages':['corechart', ...(this.props.packages || [])]});
    google.charts.setOnLoadCallback(this.setupChart);
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

    this.chart = new google.visualization[this.props.visualization](chartElement);
    this.chartData = google.visualization.arrayToDataTable(this.props.data);
    this.chartOptions = {
      ...this.props.options,
      legend: {
        position: 'none',
      },
      vAxis: {
        ...this.props.options.vAxis,
        textStyle
      },
      hAxis: {
        ...this.props.options.hAxis,
        textStyle
      }
    };

    this.drawChart();
  }

  drawChart = () => {
    this.chart.draw(this.chartData, this.chartOptions);
  }

  render() {
    return <div ref={this.chartRef}></div>;
  }

}

export default Chart;
