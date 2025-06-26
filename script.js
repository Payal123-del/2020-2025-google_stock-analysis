const DATA_URL = 'https://raw.githubusercontent.com/Payal123-del/2020-2025-google_stock-analysis/main/google_stock.csv';


async function fetchData() {
  try {
    document.getElementById('status').textContent = "Fetching stock data...";

    const response = await fetch(DATA_URL);
    const csvText = await response.text();

    const rows = csvText.trim().split('\n');
    const headers = rows[0].split(',');

    const dateIndex = headers.indexOf('Date');
    const closeIndex = headers.indexOf('Close');

    if (dateIndex === -1 || closeIndex === -1) {
      throw new Error("CSV headers not found (Date, Close)");
    }

    const parsed = rows.slice(1).map(row => {
      const cols = row.split(',');
      return {
        time: cols[dateIndex],
        value: parseFloat(cols[closeIndex])
      };
    });

    const recentData = parsed.slice(-50); // show last 50 records

    chart.data.labels = recentData.map(d => d.time);
    chart.data.datasets[0].data = recentData.map(d => d.value);
    chart.update();

    document.getElementById('status').textContent = "Updated: " + new Date().toLocaleTimeString();
  } catch (error) {
    console.error("Error fetching/parsing CSV:", error);
    document.getElementById('status').textContent = "Error fetching data.";
  }
}

const ctx = document.getElementById('dataChart').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [], // filled by fetchData
    datasets: [{
      label: 'Google Stock Price (Close)',
      data: [],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.3,
      fill: true
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: false
      }
    }
  }
});

// Call fetchData initially
fetchData();

// Optionally refresh every 60 seconds:
setInterval(fetchData, 60000);

