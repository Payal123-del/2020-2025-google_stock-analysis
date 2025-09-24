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

    // Keep last 50 data points for clarity
    const recentData = parsed.slice(-50);

    const trace = {
      x: recentData.map(d => d.time),
      y: recentData.map(d => d.value),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Close',
      line: { color: 'royalblue', width: 3 },
      marker: { size: 6, color: 'orange', symbol: 'circle' },
      fill: 'tozeroy',
      fillcolor: 'rgba(135, 206, 250, 0.3)',
      hovertemplate: '%{x}: $%{y}<extra></extra>'
    };

    const layout = {
      title: '📈 Google Stock Price (Close)',
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      xaxis: { showgrid: true, gridcolor: 'lightgrey' },
      yaxis: { showgrid: true, gridcolor: 'lightgrey' },
      margin: { t: 50, l: 50, r: 50, b: 50 }
    };

    // Plot or update chart
    Plotly.newPlot('dataChart', [trace], layout, {responsive: true});

    document.getElementById('status').textContent = "Updated: " + new Date().toLocaleTimeString();

  } catch (error) {
    console.error("Error fetching/parsing CSV:", error);
    document.getElementById('status').textContent = "Error fetching data.";
  }
}

// Initial fetch & update every 60 seconds
fetchData();
setInterval(fetchData, 60000);
