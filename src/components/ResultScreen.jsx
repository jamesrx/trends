import React from 'react';

class LineChart extends React.Component {
  constructor(props) {
    super(props);

    this.chartEntries = [];
    this.numEntries = 0;
    this.chart;
    this.chartData;
    this.chartOptions;
    this.chartElement;
  }

  componentDidMount = () => {
    this.chartElement = document.getElementById('line-chart');
    this.chartEntries = this.props.fullResults.map((dataPoint) => (
      [
        dataPoint.formattedAxisTime,
        ...dataPoint.value
      ]
    ));
    this.numEntries = this.chartEntries.length;

    const headingRow = Object.keys(this.props.lastRound).map((player) => (
      this.props.lastRound[player].fullTerm
    ));

    this.chartEntries.unshift(['Date', ...headingRow]);
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(this.setupChart);
    window.addEventListener('resize', this.drawChart);
  }

  setupChart = () => {
    const textStyle = {
      fontName: 'Roboto, Arial, sans-serif',
      fontSize: 12,
      color: '#9e9e9e',
    }

    this.chartData = google.visualization.arrayToDataTable(this.chartEntries);
    this.chartOptions = {
      curveType: 'function',
      legend: {
        position: 'none',
      },
      animation: {
        startup: true,
        duration: 1000,
      },
      vAxis: {
        gridlines: {
          count: 4,
        },
        textStyle,
        viewWindow: {
          min: 0,
          max: 100,
        },
      },
      hAxis: {
        showTextEvery: (this.numEntries / 2) - 1,
        maxTextLines: 1,
        textStyle,
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
      colors: [
        '#2196f3',
        '#f44336',
        '#ffca28',
        '#43a047',
        '#9c27b0',
      ]
    };

    this.chart = new google.visualization.LineChart(this.chartElement);
    this.drawChart();
  }
  
  drawChart = () => {
    this.chart.draw(this.chartData, this.chartOptions);
  }

  render() {
    return (
      <div id="line-chart"></div>
    );
  }
}

class ResultScreen extends React.Component {
  constructor(props) {
    super(props);

    this.currentRound = this.props.state.rounds.length;
  }

  componentDidMount = () => {
    this.props.socket.on('room.startNextRound', () => {
      const nextScreen = this.currentRound < this.props.numRounds ? 'ANSWER' : 'END';
      this.props.updateGameState({ screen: nextScreen });
    });
  }

  startNextRound = () => {
    this.props.socket.emit('startNextRound', this.props.state.room);
  }

  render() {
    const lastRound = this.props.state.rounds[this.currentRound - 1] || {};

    return (
      <div id="resultscreen">
        <h3>Results from round {this.currentRound}:</h3>
        <ul>
          {
            Object.keys(lastRound).map(player => (
              <li key={player}>
                {player}:
                {lastRound[player].fullTerm ? `guessed ${lastRound[player].fullTerm}` : 'didn\'t answer in time'}
                ({lastRound[player].points} points)
              </li>
            ))
          }
        </ul>
        <LineChart fullResults={this.props.fullResults} lastRound={lastRound} />
        <h3>Rounds left: {(this.props.numRounds - this.currentRound)}</h3>
        {this.props.state.isLeader && <button type="button" onClick={this.startNextRound}>Next</button>}
      </div>
    );
  }
}

export default ResultScreen;
