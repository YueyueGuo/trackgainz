import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsService, VolumeData } from '../../lib/analyticsService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const VolumeChart: React.FC = () => {
  const { user } = useAuth();
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(30);

  useEffect(() => {
    const fetchVolumeData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const data = await analyticsService.getVolumeData(user.id, timeRange);
        setVolumeData(data);
      } catch (error) {
        console.error('Error fetching volume data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVolumeData();
  }, [user, timeRange]);

  const chartData = {
    labels: volumeData.map(item => 
      new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Total Volume (lbs)',
        data: volumeData.map(item => item.totalVolume),
        borderColor: '#FF8C00',
        backgroundColor: 'rgba(255, 140, 0, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#FF8C00',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Total Sets',
        data: volumeData.map(item => item.totalSets),
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#FFD700',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#F5F5F5',
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      },
      title: {
        display: true,
        text: `Volume Trends - Last ${timeRange} Days`,
        color: '#F5F5F5',
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(42, 42, 42, 0.9)',
        titleColor: '#F5F5F5',
        bodyColor: '#F5F5F5',
        borderColor: '#FF8C00',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            if (label.includes('Volume')) {
              return `${label}: ${value.toLocaleString()} lbs`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#F5F5F5',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          color: '#FF8C00',
          font: {
            size: 11
          },
          callback: function(value) {
            return (value as number).toLocaleString() + ' lbs';
          }
        },
        grid: {
          color: 'rgba(255, 140, 0, 0.1)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: {
          color: '#FFD700',
          font: {
            size: 11
          }
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  if (loading) {
    return (
      <div className="volume-chart-container">
        <div className="loading">Loading volume data...</div>
      </div>
    );
  }

  return (
    <div className="volume-chart-container">
      <div className="chart-controls">
        <button 
          className={`time-range-btn ${timeRange === 30 ? 'active' : ''}`}
          onClick={() => setTimeRange(30)}
        >
          30 Days
        </button>
        <button 
          className={`time-range-btn ${timeRange === 60 ? 'active' : ''}`}
          onClick={() => setTimeRange(60)}
        >
          60 Days
        </button>
        <button 
          className={`time-range-btn ${timeRange === 90 ? 'active' : ''}`}
          onClick={() => setTimeRange(90)}
        >
          90 Days
        </button>
      </div>
      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}; 