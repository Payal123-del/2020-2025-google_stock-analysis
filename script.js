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

    const recentData = parsed.slice(-50);

    // Create gradient colors along the line based on value (higher value = brighter blue)
    const lineColors = recentData.map(d => {
      const intensity = Math.floor(100 + (d.value - Math.min(...parsed.map(p => p.value))) * 155 / (Math.max(...parsed.map(p => p.value)) - Math.min(...parsed.map(p => p.value))));
      return `rgb(0, 0, ${intensity})`;
    });

    const trace = {
      x: recentData.map(d => d.time),
      y: recentData.map(d => d.value),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Google Close Price',
      line: { 
        width: 4,
        color: 'blue', // default line, gradient simulated via markers
        shape: 'spline' 
      },
      marker: {
        size: 8,
        color: lineColors,
        symbol: 'circle'
      },
      fill: 'tozeroy',
      fillcolor: 'rgba(135, 206, 250, 0.3)',
      hovertemplate: 'Date: %{x}<br>Close: $%{y}<extra></extra>'
    };

    const layout = {
      title: '📈 Google Stock Price (Close, 2020–2025)',
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      xaxis: { title: 'Date', showgrid: true, gridcolor: 'lightgrey' },
      yaxis: { title: 'Close Price (USD)', showgrid: true, gridcolor: 'lightgrey' },
      margin: { t: 60, l: 60, r: 40, b: 60 },
      hovermode: 'x unified'
    };

    Plotly.newPlot('dataChart', [trace], layout, {responsive: true});
    document.getElementById('status').textContent = "Updated: " + new Date().toLocaleTimeString();

  } catch (error) {
    console.error("Error fetching/parsing CSV:", error);
    document.getElementById('status').textContent = "Error fetching data.";
  }
}

fetchData();
setInterval(fetchData, 60000);
