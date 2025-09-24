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

    const recentData = parsed.slice(-50); // last 50 points

    // Normalize values for gradient (0–1)
    const minVal = Math.min(...recentData.map(d => d.value));
    const maxVal = Math.max(...recentData.map(d => d.value));
    const norm = d => (d - minVal) / (maxVal - minVal);

    // Generate RGB colors along the line
    const lineColors = recentData.map(d => {
      const n = norm(d.value);
      const r = Math.floor(0 + n*50);
      const g = Math.floor(100 + n*100);
      const b = Math.floor(200 + n*55);
      return `rgb(${r},${g},${b})`;
    });

    const trace = {
      x: recentData.map(d => d.time),
      y: recentData.map(d => d.value),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Google Close Price',
      line: {
        width: 4,
        color: 'rgba(0,0,0,0)', // line is transparent, we’ll use colored segments
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
      xaxis: { title: 'Date', showgrid: true, gridcolor: 'lightgrey' },
      yaxis: { title: 'Close Price (USD)', showgrid: true, gridcolor: 'lightgrey' },
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
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
    
