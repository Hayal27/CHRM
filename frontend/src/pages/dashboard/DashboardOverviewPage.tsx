import React, { useState, useMemo } from 'react';
import { useAuth } from '../../components/Auth/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { faker } from '@faker-js/faker'; // For generating realistic-looking data

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController
);

interface DashboardData {
  totalPosts?: number;
  totalPages?: number;
  pendingComments?: number;
  registeredUsers?: number;
  totalVehicles?: number;
  totalQueues?: number;
  totalBookings?: number;
  totalCashiers?: number;
  revenue?: number;
  ticketsSold?: number;
}

const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const userRoleId = user?.role_id ? Number(user.role_id) : null;
  const [timeFilter, setTimeFilter] = useState<'w' | 'm' | 'y'>('w'); // 'w'eek, 'm'onth, 'y'ear

  // Sample data generation function (using faker)
  const generateSampleData = (count: number, dataType: 'revenue' | 'bookings'): number[] => {
    return Array.from({ length: count }, () =>
      dataType === 'revenue' ? faker.number.int({ min: 1000, max: 10000 }) : faker.number.int({ min: 10, max: 500 })
    );
  };

  // Sample data based on roles
  const baseDashboardData: DashboardData = useMemo(() => {
    switch (userRoleId) {
      case 1: // Admin
        return {
          totalPosts: faker.number.int({ min: 50, max: 200 }),
          totalPages: faker.number.int({ min: 10, max: 50 }),
          pendingComments: faker.number.int({ min: 0, max: 20 }),
          registeredUsers: faker.number.int({ min: 100, max: 500 }),
        };
      case 5: // Deputy Manager
        return {
          totalVehicles: faker.number.int({ min: 10, max: 50 }),
          totalQueues: faker.number.int({ min: 5, max: 20 }),
          totalBookings: faker.number.int({ min: 20, max: 100 }),
        };
      case 4: // Casher
        return {
          totalCashiers: faker.number.int({ min: 5, max: 15 }),
          revenue: faker.number.int({ min: 2000, max: 10000 }),
          ticketsSold: faker.number.int({ min: 50, max: 300 }),
        };
      case 6: // Agent
        return {
          totalBookings: faker.number.int({ min: 10, max: 80 }),
          revenue: faker.number.int({ min: 1000, max: 5000 }),
          ticketsSold: faker.number.int({ min: 30, max: 200 }),
        };
      default:
        return {};
    }
  }, [userRoleId]);

  // Time-based data (simulated)
  const labels = useMemo(() => {
    switch (timeFilter) {
      case 'w':
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      case 'm':
        return Array.from({ length: 30 }, (_, i) => `${i + 1}`); // Days 1-30
      case 'y':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      default:
        return [];
    }
  }, [timeFilter]);

  const revenueData = useMemo(() => generateSampleData(labels.length, 'revenue'), [labels]);
  const bookingsData = useMemo(() => generateSampleData(labels.length, 'bookings'), [labels]);

  // Chart data
  const revenueChartData = useMemo(() => ({
    labels,
    datasets: [
      {
        // type: 'line', // Remove type property, Chart type is set by <Chart type="line" ... />
        label: 'Revenue',
        data: revenueData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
    ],
  }), [labels, revenueData]);

  const bookingsChartData = useMemo(() => ({
    labels,
    datasets: [
      {
        // type: 'bar', // Remove type property, Chart type is set by <Chart type="bar" ... />
        label: 'Bookings',
        data: bookingsData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  }), [labels, bookingsData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Revenue and Bookings',
      },
    },
  }), []);

  return (
    <div className="container-fluid">
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Dashboard Overview</h1>
        {/* Time Filter */}
        <div>
          <label htmlFor="timeFilter">Time Filter:</label>
          <select
            id="timeFilter"
            className="form-control"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as 'w' | 'm' | 'y')}
          >
            <option value="w">Weekly</option>
            <option value="m">Monthly</option>
            <option value="y">Yearly</option>
          </select>
        </div>
      </div>

      <div className="row">
        {/* Role-based content rendering */}
        {userRoleId === 1 && (
          <>
            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-primary shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Posts
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {baseDashboardData.totalPosts}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-pencil-alt fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-success shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Total Pages
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {baseDashboardData.totalPages}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="far fa-file-alt fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-info shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                        Pending Comments
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {baseDashboardData.pendingComments}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-comments fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-md-6 mb-4">
              <div className="card border-left-warning shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                        Registered Users
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {baseDashboardData.registeredUsers}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-users fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {userRoleId === 5 && (
          <>
            <div className="col-xl-4 col-md-6 mb-4">
              <div className="card border-left-primary shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Vehicles
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {baseDashboardData.totalVehicles}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-car fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6 mb-4">
              <div className="card border-left-success shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Total Queues
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {baseDashboardData.totalQueues}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-list-ol fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4 col-md-6 mb-4">
              <div className="card border-left-info shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                        Total Bookings
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {baseDashboardData.totalBookings}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {userRoleId === 4 && (
          <>
            <div className="col-xl-4 col-md-6 mb-4">
              <div className="card border-left-primary shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Cashiers
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {baseDashboardData.totalCashiers}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-cash-register fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-6 mb-4">
              <div className="card border-left-success shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Revenue
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        ${baseDashboardData.revenue}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-6 mb-4">
              <div className="card border-left-info shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                        Tickets Sold
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {baseDashboardData.ticketsSold}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-ticket-alt fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {userRoleId === 6 && (
          <>
            <div className="col-xl-4 col-md-6 mb-4">
              <div className="card border-left-primary shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                        Total Bookings
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {baseDashboardData.totalBookings}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-book fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-6 mb-4">
              <div className="card border-left-success shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                        Revenue
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        ${baseDashboardData.revenue}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-6 mb-4">
              <div className="card border-left-info shadow h-100 py-2">
                <div className="card-body">
                  <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                      <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                        Tickets Sold
                      </div>
                      <div className="h5 mb-0 font-weight-bold text-gray-800">
                        {baseDashboardData.ticketsSold}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i className="fas fa-ticket-alt fa-2x text-gray-300"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Revenue Chart</h6>
            </div>
            <div className="card-body">
              <Chart type='line' data={revenueChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Bookings Chart</h6>
            </div>
            <div className="card-body">
              <Chart type='bar' data={bookingsChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewPage;

// Fix chart data typing: ensure 'type' property is typed correctly for Chart.js datasets
// Example: use type: 'line' | 'bar' instead of string, or remove 'type' property from dataset objects if not required by Chart.js
