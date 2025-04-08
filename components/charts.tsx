"use client"

import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  Filler,
  BarController,
  LineController,
  TimeScale,
} from "chart.js"
import 'chart.js/auto'
import { useRef, useEffect, useState } from "react"

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler,
  BarController,
  LineController,
  TimeScale
)

// Custom gradient function
const createGradient = (ctx, color1, color2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)
  return gradient
}

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
    <p className="text-emerald-500 font-medium">Loading data...</p>
  </div>
)

export function BarChart({ data, loading = false }) {
  const chartRef = useRef(null)
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  })

  useEffect(() => {
    const chart = chartRef.current
    
    if (!chart || !data?.length) return

    const gradient = createGradient(chart.ctx, 'rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.4)')
    
    // Calculate average for threshold highlighting
    const values = data.map(d => d.value)
    const average = values.reduce((a, b) => a + b, 0) / values.length
    
    setChartData({
      labels: data.map(d => d.label),
      datasets: [
        {
          label: "CO2 Emissions (tonnes)",
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.value > average ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.4)'),
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: gradient,
          barPercentage: 0.7,
        }
      ]
    })
  }, [data])

  // Determine if we're showing all leagues or a specific league
  // This should be determined from data patterns or context
  const isAllLeagues = data?.length > 0 && data[0]?.label?.includes("League")
  
  // Set step size based on whether we're viewing all leagues or a specific one
  const stepSize = isAllLeagues ? 500 : 50

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: 'bold'
          },
          color: "#fff",
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          family: 'Inter, system-ui, sans-serif',
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const values = context.chart.data.datasets[0].data;
            const average = values.reduce((a, b) => a + b, 0) / values.length;
            const value = context.parsed.y;
            let percentFromAverage = ((value - average) / average * 100).toFixed(1);
            const sign = percentFromAverage > 0 ? '+' : '';
            
            return [
              `Emissions: ${value.toFixed(2)} tonnes`,
              `${sign}${percentFromAverage}% from average`
            ];
          }
        }
      },
      title: {
        display: true,
        text: 'CO2 Emissions by Category',
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 16,
          weight: 'bold'
        },
        color: "#fff",
        padding: {
          top: 10,
          bottom: 20
        }
      },
      annotation: {
        annotations: {
          line1: {
            type: 'line',
            yMin: data?.length ? data.reduce((a, b) => a + b.value, 0) / data.length : 0,
            yMax: data?.length ? data.reduce((a, b) => a + b.value, 0) / data.length : 0,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 2,
            borderDash: [6, 4],
            label: {
              content: 'Average',
              enabled: true,
              position: 'end',
              color: "#fff"
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
          lineWidth: 1
        },
        border: {
          display: false
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          padding: 10,
          // Set a specific step size based on the view type
          stepSize: stepSize,
          callback: function(value) {
            return value + 't'
          }
        },
        title: {
          display: true,
          text: 'CO2 Emissions (tonnes)',
          color: "rgba(255, 255, 255, 0.9)",
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: 'bold'
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          padding: 5,
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 0,
        bottom: 10
      }
    }
  }

  return (
    <div className="w-full h-80 p-4 bg-gray-900 rounded-lg shadow-md relative">
      {loading ? (
        <LoadingSpinner />
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="text-gray-400 mb-2">No data available</div>
          <p className="text-sm text-gray-500">Please check your data source</p>
        </div>
      ) : (
        <Bar ref={chartRef} data={chartData} options={options} />
      )}
    </div>
  )
}

export function LineChart({ data, loading = false }) {
  const chartRef = useRef(null)
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  })
  const [dataProcessed, setDataProcessed] = useState(false)

  useEffect(() => {
    const chart = chartRef.current
    
    if (!chart || !data?.length) {
      setDataProcessed(true)
      return
    }

    // Group matches by month and calculate total emissions
    const monthlyData = data.reduce((acc, match) => {
      if (!match.date) return acc

      const date = new Date(match.date)
      const monthYear = date.toLocaleString("default", { month: "long", year: "numeric" })

      if (!acc[monthYear]) {
        acc[monthYear] = {
          monthOrder: date.getTime(),
          emissions: 0,
          count: 0
        }
      }

      // Add match emissions if available
      if (match.match_emissions?.[0]?.emissions) {
        acc[monthYear].emissions += match.match_emissions[0].emissions
        acc[monthYear].count += 1
      }

      return acc
    }, {})

    // Convert to array and sort by date
    const sortedMonths = Object.entries(monthlyData)
      .sort(([, a], [, b]) => a.monthOrder - b.monthOrder)
      .map(([month]) => month)

    // Calculate moving average (3-month)
    const movingAvg = []
    sortedMonths.forEach((month, index) => {
      if (index >= 2) {
        const avg = (
          monthlyData[sortedMonths[index]].emissions +
          monthlyData[sortedMonths[index - 1]].emissions +
          monthlyData[sortedMonths[index - 2]].emissions
        ) / 3
        movingAvg.push(avg)
      } else {
        movingAvg.push(null)
      }
    })

    const emissions = sortedMonths.map(month => monthlyData[month].emissions)
    const gradient = createGradient(
      chart.ctx, 
      'rgba(16, 185, 129, 0.5)', 
      'rgba(16, 185, 129, 0.1)'
    )

    setChartData({
      labels: sortedMonths,
      datasets: [
        {
          label: "Monthly Emissions",
          data: emissions,
          borderColor: "rgba(16, 185, 129, 1)",
          backgroundColor: gradient,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: "#1f2937",
          pointBorderColor: "rgba(16, 185, 129, 1)",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: "rgba(16, 185, 129, 1)",
          pointHoverBorderColor: "#1f2937",
        },
        {
          label: "3-Month Average",
          data: movingAvg,
          borderColor: "rgba(255, 255, 255, 0.7)",
          backgroundColor: "transparent",
          borderDash: [5, 5],
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 3,
        }
      ]
    })
    
    setDataProcessed(true)
  }, [data])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeOutCubic'
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      filler: {
        propagate: true,
      },
      legend: {
        position: "top",
        align: "end",
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: "#fff",
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        padding: 12,
        cornerRadius: 6,
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            const value = context.parsed.y;
            return `${datasetLabel}: ${value.toFixed(2)} tonnes`;
          }
        }
      },
      title: {
        display: true,
        text: 'CO2 Emissions Trend Over Time',
        font: {
          family: 'Inter, system-ui, sans-serif',
          size: 16,
          weight: 'bold'
        },
        color: "#fff",
        padding: {
          top: 10,
          bottom: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
          drawBorder: false,
          lineWidth: 1
        },
        border: {
          display: false
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          padding: 10,
          callback: function(value) {
            return value + 't'
          }
        },
        title: {
          display: true,
          text: 'CO2 Emissions (tonnes)',
          color: "rgba(255, 255, 255, 0.9)",
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12,
            weight: 'bold'
          },
          padding: {
            bottom: 10
          }
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        border: {
          display: false
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.8)",
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 11
          },
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }

  // Show loading state when either explicitly loading or data is still being processed
  const isLoading = loading || (data && data.length > 0 && !dataProcessed)

  return (
    <div className="w-full h-80 p-4 bg-gray-900 rounded-lg shadow-md relative">
      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="text-gray-400 mb-2">No emissions data available</div>
          <p className="text-sm text-gray-500">Try selecting a different time period</p>
        </div>
      ) : (
        <Line ref={chartRef} data={chartData} options={options} height={300} />
      )}
    </div>
  )
}