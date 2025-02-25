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
} from "chart.js"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler)

export function BarChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        label: "CO2 Emissions (tonnes)",
        data: data.map((d) => d.value),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return <Bar data={chartData} options={options} />
}

export function LineChart({ data }) {
  // Group matches by month and calculate total emissions
  const monthlyData = data.reduce((acc, match) => {
    if (!match.date) return acc

    const date = new Date(match.date)
    const monthYear = date.toLocaleString("default", { month: "long", year: "numeric" })

    if (!acc[monthYear]) {
      acc[monthYear] = {
        monthOrder: date.getTime(), // Store timestamp for sorting
        emissions: 0,
      }
    }

    // Add match emissions if available
    if (match.match_emissions?.[0]?.emissions) {
      acc[monthYear].emissions += match.match_emissions[0].emissions
    }

    return acc
  }, {})

  // Convert to array and sort by date
  const sortedMonths = Object.entries(monthlyData)
    .sort(([, a], [, b]) => a.monthOrder - b.monthOrder)
    .map(([month]) => month)

  const chartData = {
    labels: sortedMonths,
    datasets: [
      {
        label: "Monthly Emissions (tonnes)",
        data: sortedMonths.map((month) => monthlyData[month].emissions),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        tension: 0.1,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      filler: {
        propagate: true,
      },
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return <Line data={chartData} options={options} />
}

