// Define the chart data
var chartData = {
  labels: [],
  datasets: [{
    label: 'Mositure Level (ADC Counts)',
    borderColor: 'rgb(75, 192, 192)',
    cubicInterpolationMode: 'monotone', // Smooth line
    data: []
  }]
};

// Function to update the chart with new data
function updateChart(newLabels, newData) {
  chartData.labels = newLabels;
  chartData.datasets[0].data = newData;

  myChart.update();
}

// Initialize the chart
var ctx = document.getElementById('myChart').getContext('2d');
var myChart = new Chart(ctx, {
  type: 'line',
  data: chartData,
  options: {
    responsive: true,
    scales: {
      y: {
        reverse: true,
        ticks: {
          color: '#f2f2f2'
        },
      },
      x: {
        ticks: {
          color: '#f2f2f2'
        },
        type: 'time',
        time: {
          unit: 'hour',
        }
      }
    }
  }
});

// Function to map ADC count to percentage
function mapValue(value, fromLow, fromHigh, toLow, toHigh) {
  if (value <= fromLow)
  {
    return toLow
  }
  if (value >= fromHigh)
  {
    return toHigh
  }
  return toLow + (toHigh - toLow) * ((value - fromLow) / (fromHigh - fromLow));
}

// Function to update progress bar based on latest data value
function updateProgressBar(value) {
  var progressBar = document.getElementById('progressBar');
  var percentage = mapValue(value, 375, 425, 100, 0)
  progressBar.style.width = percentage + '%';
  progressBar.textContent = percentage.toFixed(1) + '%';
  if (percentage > 90 || percentage < 10)
  {
    progressBar.style.backgroundColor = '#dc3545'; // Red color
  }
  else if (percentage > 80 || percentage < 20)
  {
    progressBar.style.backgroundColor = '#ffc107'; // Yellow color
  }
  else
  {
    progressBar.style.backgroundColor = '#28a745'; // Green color
  }
}

// Function to fetch data from ThingSpeak
function fetchData() {
  var channelID = '2499687';
  var url = 'https://api.thingspeak.com/channels/' + channelID + '/feeds.json?results=17';

  fetch(url)
    .then(response => response.json())
    .then(data => {
      var latestValue = parseFloat(data.feeds[data.feeds.length - 1].field1);
      updateProgressBar(latestValue);

      // Extract data from the response
      var newData = [];
      var newLabels = [];
      data.feeds.forEach(feed => {
        newData.push(parseFloat(feed.field1));
        newLabels.push(new Date(feed.created_at));
      });

      // Update the chart with new data
      updateChart(newLabels, newData);
    })
    .catch(error => console.error('Error fetching data:', error));
}

// Fetch data from ThingSpeak initially
fetchData();

// Update data every minute
setInterval(fetchData, 60000);
