import React, { useEffect, useState, useRef } from 'react';
import Axios from 'axios';
// Chart.js imports
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
// Add imports for PDF and CSV export
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const FILTER_OPTIONS = [
  { value: 'd', label: 'Day' },
  { value: 'w', label: 'Week' },
  { value: 'm', label: 'Month' },
  { value: 'y', label: 'Year' },
  { value: 'all', label: 'All Time' },
];

const ADDITIONAL_FILTERS = [
  { value: 'all', label: 'All Attempts' },
  { value: 'success', label: 'Success Only' },
  { value: 'fail', label: 'Failed Only' },
];

function filterByDate(attempts, filter) {
  if (filter === 'all') return attempts;
  const now = new Date();
  return attempts.filter(a => {
    const date = new Date(a.attempt_time);
    switch (filter) {
      case 'd':
        return date.toDateString() === now.toDateString();
      case 'w': {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo && date <= now;
      }
      case 'm': {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return date >= monthAgo && date <= now;
      }
      case 'y': {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return date >= yearAgo && date <= now;
      }
      default:
        return true;
    }
  });
}

function filterByType(attempts, type) {
  if (type === 'all') return attempts;
  if (type === 'success') return attempts.filter(a => a.success);
  if (type === 'fail') return attempts.filter(a => !a.success);
  return attempts;
}

function downloadCSV(data, filename) {
  const replacer = (key, value) => value === null ? '' : value;
  const header = Object.keys(data[0] || {});
  const csv = [
    header.join(','),
    ...data.map(row => header.map(fieldName =>
      JSON.stringify(row[fieldName], replacer)
    ).join(','))
  ].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

const PAGE_SIZE = 10;

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const dashboardRef = useRef();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await Axios.get('http://localhost:5000/api/login-analytics');
        setAnalytics(res.data);
      } catch (err) {
        setAnalytics(null);
      }
    };
    const fetchBlockedUsers = async () => {
      try {
        const res = await Axios.get('http://localhost:5000/api/blocked-users');
        setBlockedUsers(res.data.blockedUsers || []);
      } catch (err) {
        setBlockedUsers([]);
      }
    };
    Promise.all([fetchAnalytics(), fetchBlockedUsers()]).finally(() => setLoading(false));
  }, []);

  // Filtering logic
  const allAttempts = analytics?.recentAttempts ?? [];
  const filteredAttempts = filterByType(filterByDate(allAttempts, dateFilter), typeFilter);

  // Calculate summary from filteredAttempts
  const totalAttempts = filteredAttempts.length;
  const successCount = filteredAttempts.filter(a => a.success).length;
  const failCount = totalAttempts - successCount;

  // Prepare chart data using calculated values
  const summaryData = {
    labels: ['Success', 'Fail'],
    datasets: [{
      data: [successCount, failCount],
      backgroundColor: ['#198754', '#dc3545'],
      borderWidth: 1,
    }]
  };

  const ipBarData = {
    labels: analytics?.attemptsByIP?.map(ip => ip.ip_address) ?? [],
    datasets: [{
      label: 'Attempts',
      data: analytics?.attemptsByIP?.map(ip => ip.count) ?? [],
      backgroundColor: '#0d6efd'
    }]
  };

  const browserBarData = {
    labels: analytics?.attemptsByBrowser?.map(b => b.browser) ?? [],
    datasets: [{
      label: 'Attempts',
      data: analytics?.attemptsByBrowser?.map(b => b.count) ?? [],
      backgroundColor: '#0dcaf0'
    }]
  };

  const locationBarData = {
    labels: analytics?.attemptsByLocation?.map(l => l.location) ?? [],
    datasets: [{
      label: 'Attempts',
      data: analytics?.attemptsByLocation?.map(l => l.count) ?? [],
      backgroundColor: '#6c757d'
    }]
  };

  // PDF Download
  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = canvas.height * (imgWidth / canvas.width);
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight > pageHeight ? pageHeight : imgHeight);
    pdf.save('dashboard_report.pdf');
  };

  // CSV Download
  const handleDownloadCSV = () => {
    if (!filteredAttempts.length) return;
    downloadCSV(filteredAttempts, 'dashboard_report.csv');
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredAttempts.length / PAGE_SIZE);
  const paginatedAttempts = filteredAttempts.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Reset to page 1 if filter changes and currentPage is out of range
  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
    // eslint-disable-next-line
  }, [filteredAttempts.length]);

  if (loading) {
    return <div className="text-center mt-5">Loading dashboard...</div>;
  }

  return (
    <main id="main" className="main dashboard-main-margin" style={{ minHeight: '100vh' }}>
      <div className="pagetitle d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div>
          <h1>Login Analytics Dashboard</h1>
          <nav>
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="/">Dashboard</a></li>
              <li className="breadcrumb-item active">Analytics</li>
            </ol>
          </nav>
        </div>
        <div className="d-flex gap-2">
          <select
            className="form-select"
            style={{ width: 120 }}
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            aria-label="Filter by date"
          >
            {FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="form-select"
            style={{ width: 150 }}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            aria-label="Filter by type"
          >
            {ADDITIONAL_FILTERS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button className="btn btn-outline-primary" onClick={handleDownloadPDF} title="Download PDF">
            <i className="bi bi-file-earmark-pdf"></i> PDF
          </button>
          <button className="btn btn-outline-success" onClick={handleDownloadCSV} title="Download CSV">
            <i className="bi bi-file-earmark-spreadsheet"></i> CSV
          </button>
        </div>
      </div>

      <section className="section dashboard" ref={dashboardRef}>
        <div className="row" style={{ minHeight: '80vh' }}>
          {/* Left Split: Summary, Doughnut, Blocked Users */}
          <div className="col-lg-4 d-flex flex-column gap-4">
            {/* Summary Cards */}
            <div className="row g-3">
              <div className="col-12">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h5 className="card-title">Total Attempts</h5>
                    <span className="h2">{totalAttempts}</span>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h5 className="card-title">Success</h5>
                    <span className="h2 text-success">{successCount}</span>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="card shadow-sm border-0">
                  <div className="card-body">
                    <h5 className="card-title">Failed</h5>
                    <span className="h2 text-danger">{failCount}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Doughnut Chart */}
            <div className="card shadow-sm border-0 mt-3 d-flex align-items-center justify-content-center" style={{ minHeight: 220 }}>
              <div style={{ width: '180px', height: '180px' }}>
                <Doughnut data={summaryData} options={{
                  plugins: { legend: { display: true, position: 'bottom' } }
                }} />
              </div>
            </div>
            {/* Blocked Users */}
            <div className="card shadow-sm border-0 mt-3 flex-grow-1">
              <div className="card-body">
                <h5 className="card-title">Blocked Users</h5>
                <table className="table table-borderless mb-0">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>User Name</th>
                      <th>Lock Until</th>
                      <th>Failed Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedUsers.length > 0 ? blockedUsers.map((u, idx) => (
                      <tr key={idx}>
                        <td>{u.user_id}</td>
                        <td>{u.user_name}</td>
                        <td>{u.lock_until}</td>
                        <td>{u.failed_attempts}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4}>No blocked users</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Split: Analytics Charts & Recent Attempts */}
          <div className="col-lg-8 d-flex flex-column gap-4">
            {/* Analytics Charts */}
            <div className="row g-3">
              <div className="col-md-4">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <h5 className="card-title">Top IPs</h5>
                    <ul className="list-group mb-3">
                      {analytics?.attemptsByIP?.map(ip => (
                        <li key={ip.ip_address} className="list-group-item d-flex justify-content-between align-items-center">
                          {ip.ip_address}
                          <span className="badge bg-primary rounded-pill">{ip.count}</span>
                        </li>
                      ))}
                      {(!analytics?.attemptsByIP || analytics.attemptsByIP.length === 0) && <li className="list-group-item">No data</li>}
                    </ul>
                    <Bar data={ipBarData} options={{
                      plugins: { legend: { display: false } },
                      scales: { x: { ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 } } }
                    }} height={120} />
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <h5 className="card-title">Top Browsers</h5>
                    <ul className="list-group mb-3">
                      {analytics?.attemptsByBrowser?.map(b => (
                        <li key={b.browser} className="list-group-item d-flex justify-content-between align-items-center">
                          {b.browser}
                          <span className="badge bg-info rounded-pill">{b.count}</span>
                        </li>
                      ))}
                      {(!analytics?.attemptsByBrowser || analytics.attemptsByBrowser.length === 0) && <li className="list-group-item">No data</li>}
                    </ul>
                    <Bar data={browserBarData} options={{
                      plugins: { legend: { display: false } }
                    }} height={120} />
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <h5 className="card-title">Top Locations</h5>
                    <ul className="list-group mb-3">
                      {analytics?.attemptsByLocation?.map(loc => (
                        <li key={loc.location} className="list-group-item d-flex justify-content-between align-items-center">
                          {loc.location}
                          <span className="badge bg-secondary rounded-pill">{loc.count}</span>
                        </li>
                      ))}
                      {(!analytics?.attemptsByLocation || analytics.attemptsByLocation.length === 0) && <li className="list-group-item">No data</li>}
                    </ul>
                    <Bar data={locationBarData} options={{
                      plugins: { legend: { display: false } },
                      scales: { x: { ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 } } }
                    }} height={120} />
                  </div>
                </div>
              </div>
            </div>
            {/* Recent Login Attempts */}
            <div className="card shadow-sm border-0 flex-grow-1">
              <div className="card-body">
                <h5 className="card-title">Recent Login Attempts</h5>
                <div className="table-responsive">
                  <table className="table table-borderless datatable mb-0">
                    <thead>
                      <tr>
                        <th>User ID</th>
                        <th>User Name</th>
                        <th>Time</th>
                        <th>Success</th>
                        <th>IP</th>
                        <th>Browser</th>
                        <th>Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedAttempts.map((a, idx) => (
                        <tr key={idx}>
                          <td>{a.user_id}</td>
                          <td>{a.user_name}</td>
                          <td>{a.attempt_time}</td>
                          <td>
                            <span className={`badge ${a.success ? 'bg-success' : 'bg-danger'}`}>
                              {a.success ? 'Success' : 'Fail'}
                            </span>
                          </td>
                          <td>{a.ip_address}</td>
                          <td>{a.browser}</td>
                          <td>{a.location}</td>
                        </tr>
                      ))}
                      {paginatedAttempts.length === 0 && (
                        <tr><td colSpan={7}>No recent attempts</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <nav className="mt-3">
                    <ul className="pagination justify-content-end mb-0">
                      <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                          Previous
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i} className={`page-item${currentPage === i + 1 ? ' active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Dashboard;
