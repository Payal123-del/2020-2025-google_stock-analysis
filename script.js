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
    const lowIndex = headers.indexOf('Low');
    const highIndex = headers.indexOf('High');
    const volumeIndex = headers.indexOf('Volume');

    if ([dateIndex, closeIndex, lowIndex, highIndex, volumeIndex].includes(-1)) {
      throw new Error("CSV headers not found (Date, Close, Low, High, Volume)");
    }

    const parsed = rows.slice(1).map(row => {
      const cols = row.split(',');
      return {
        time: cols[dateIndex],
        close: parseFloat(cols[closeIndex]),
        low: parseFloat(cols[lowIndex]),
        high: parseFloat(cols[highIndex]),
        volume: parseInt(cols[volumeIndex])
      };
    });

    const recentData = parsed.slice(-50);

    // Gradient for Close markers
    const minVal = Math.min(...recentData.map(d => d.close));
    const maxVal = Math.max(...recentData.map(d => d.close));
    const norm = d => (d - minVal) / (maxVal - minVal);
    const colors = recentData.map(d => `rgb(0, 0, ${100 + norm(d.close)*155})`);

    // Main Close price line
    const closeTrace = {
      x: recentData.map(d => d.time),
      y: recentData.map(d => d.close),
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Close Price',
      line: { width: 3, color: 'rgba(0,0,0,0)', shape: 'spline' },
      marker: { size: 8, color: colors, symbol: 'circle' },
      hovertemplate: 
        'Date: %{x}<br>Close: $%{y}<br>Low: %{customdata[0]}<br>High: %{customdata[1]}<br>Volume: %{customdata[2]}<extra></extra>',
      customdata: recentData.map(d => [d.low, d.high, d.volume]),
      fill: 'tozeroy',
      fillcolor: 'rgba(135,206,250,0.2)'
    };

    // Shaded range between Low and High
    const rangeTrace = {
      x: [...recentData.map(d => d.time), ...recentData.map(d => d.time).reverse()],
      y: [...recentData.map(d => d.high), ...recentData.map(d => d.low).reverse()],
      fill: 'toself',
      fillcolor: 'rgba(173,216,230,0.3)',
      line: { color: 'rgba(0,0,0,0)' },
      type: 'scatter',
      name: 'Price Range',
      hoverinfo: 'skip'
    };

    const layout = {
      title: '📈 Google Stock Analysis (2020–2025)',
      xaxis: { title: 'Date', showgrid: true, gridcolor: 'lightgrey' },
      yaxis: { title: 'Price (USD)', showgrid: true, gridcolor: 'lightgrey' },
      plot_bgcolor: 'white',
      paper_bgcolor: 'white',
      margin: { t: 60, l: 60, r: 40, b: 60 },
      hovermode: 'x unified'
    };

    Plotly.newPlot('dataChart', [rangeTrace, closeTrace], layout, {responsive: true});
    document.getElementById('status').textContent = "Updated: " + new Date().toLocaleTimeString();

  } catch (error) {
    console.error("Error fetching/parsing CSV:", error);
    document.getElementById('status').textContent = "Error fetching data.";
  }
}

fetchData();
setInterval(fetchData, 60000);
