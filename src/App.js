import "./App.css";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import L from 'leaflet';
ChartJS.register(...registerables);

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Dummy dataset of crisis-related posts
const dummyPosts = [
  {
    id: 1,
    text: "Feeling low today...",
    severity: "high",
    location: { lat: 40.7128, lng: -74.006 },
    date: new Date("2025-04-15T10:30:00"),
    sentiment: "negative",
    topic: "suicidal ideation",
    engagement: { retweets: 10, replies: 4 }
  },
  {
    id: 2,
    text: "I need help, everything is overwhelming",
    severity: "high",
    location: { lat: 34.0522, lng: -118.2437 },
    date: new Date("2025-04-16T12:00:00"),
    sentiment: "negative",
    topic: "stress",
    engagement: { retweets: 5, replies: 2 }
  },
  {
    id: 3,
    text: "Had a good day for a change",
    severity: "low",
    location: { lat: 41.8781, lng: -87.6298 },
    date: new Date("2025-04-14T09:00:00"),
    sentiment: "positive",
    topic: "wellbeing",
    engagement: { retweets: 2, replies: 1 }
  },
  {
    id: 4,
    text: "I'm feeling anxious about the future",
    severity: "medium",
    location: { lat: 29.7604, lng: -95.3698 },
    date: new Date("2025-04-15T14:00:00"),
    sentiment: "neutral",
    topic: "anxiety",
    engagement: { retweets: 8, replies: 3 }
  },
  {
    id: 5,
    text: "Can't stop thinking about negative things",
    severity: "medium",
    location: { lat: 37.7749, lng: -122.4194 },
    date: new Date("2025-04-16T08:30:00"),
    sentiment: "negative",
    topic: "depression",
    engagement: { retweets: 15, replies: 7 }
  },
  {
    id: 6,
    text: "Therapy session went well today",
    severity: "low",
    location: { lat: 39.9526, lng: -75.1652 },
    date: new Date("2025-04-15T16:45:00"),
    sentiment: "positive",
    topic: "therapy",
    engagement: { retweets: 6, replies: 3 }
  }
];

// Dummy user role for role-based access (e.g., "publicHealth", "researcher", "user")
const currentUserRole = "publicHealth";

function App() {
  // Global state variables
  const [startDate, setStartDate] = useState(new Date("2025-04-14"));
  const [endDate, setEndDate] = useState(new Date("2025-04-16"));
  const [selectedSeverities, setSelectedSeverities] = useState(["high", "medium", "low"]);
  const [locationQuery, setLocationQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(dummyPosts);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);

  // Dummy effect for alerts: if more than one high severity post in the period, show alert.
  useEffect(() => {
    const highCount = filteredPosts.filter((post) => post.severity === "high").length;
    if (highCount >= 2) {
      setAlertMessage("High severity crisis alert: multiple critical posts detected!");
    } else {
      setAlertMessage("");
    }
  }, [filteredPosts]);

  // Filter posts based on date range, severity, and location query
  useEffect(() => {
    setLoading(true);
    // Simulate network delay for realistic filtering
    setTimeout(() => {
      const filtered = dummyPosts.filter((post) => {
        // Filter by date range
        if (post.date < startDate || post.date > endDate) {
          return false;
        }
        // Filter by severity
        if (!selectedSeverities.includes(post.severity)) {
          return false;
        }
        // Filter by location (if a query is provided, check if dummy location string includes query)
        if (locationQuery) {
          // In a real app, you could search against a location name property.
          // Here we simulate: if locationQuery is not empty and post id is odd then filter out.
          if (post.id % 2 === 0 && !locationQuery.toLowerCase().includes("los")) {
            return false;
          }
        }
        return true;
      });
      setFilteredPosts(filtered);
      setLoading(false);
    }, 300);
  }, [startDate, endDate, selectedSeverities, locationQuery]);

  // Get color based on severity
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#3b82f6";
    }
  };

  // Custom marker icons based on severity
  const getMarkerIcon = (severity) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${getSeverityColor(severity)}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  // Dummy data for sentiment chart
  const sentimentChartData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        label: "Sentiment Distribution",
        data: [
          filteredPosts.filter((p) => p.sentiment === "positive").length,
          filteredPosts.filter((p) => p.sentiment === "neutral").length,
          filteredPosts.filter((p) => p.sentiment === "negative").length
        ],
        backgroundColor: ["#10b981", "#3b82f6", "#ef4444"],
        borderWidth: 1,
        borderColor: "#ffffff"
      }
    ]
  };

  // Dummy data for a time-series engagement chart (sum of retweets over dummy dates)
  const sortedPosts = [...filteredPosts].sort((a, b) => a.date - b.date);
  const timeSeriesData = {
    labels: sortedPosts.map((post) => post.date.toLocaleDateString()),
    datasets: [
      {
        label: "Retweets",
        data: sortedPosts.map((post) => post.engagement.retweets),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderWidth: 2,
        tension: 0.3,
        fill: true
      },
      {
        label: "Replies",
        data: sortedPosts.map((post) => post.engagement.replies),
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.2)",
        borderWidth: 2,
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  // Handler for toggling severity filters
  const handleSeverityChange = (severity) => {
    setSelectedSeverities((prev) => {
      if (prev.includes(severity)) {
        return prev.filter((s) => s !== severity);
      } else {
        return [...prev, severity];
      }
    });
  };

  // Dummy download report function
  const handleDownloadReport = () => {
    // In a real app, you might generate a CSV/PDF from the filteredPosts data.
    console.log("Report downloaded. Data: ", filteredPosts);
    alert("Report downloaded (dummy functionality)");
  };

  // Dummy function to simulate feedback submission
  const submitFeedback = () => {
    // Simulate API call
    console.log("Feedback submitted for post", selectedPost, "Feedback:", feedbackText);
    setLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      setSelectedPost(null);
      setFeedbackText("");
      alert("Feedback submitted successfully!");
    }, 800);
  };

  return (
    <div className="App">
      <header>
        <h1>Suicidal Crisis Dashboard</h1>
      </header>

      {/* Alert Banner */}
      {alertMessage && (
        <div className="alert-banner">
          <p>{alertMessage}</p>
        </div>
      )}

      {/* Filters / Control Panel */}
      <div className="controls">
        <div className="date-picker">
          <label>Date Range:</label>
          <div>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="MMM d, yyyy"
            />
            <span style={{ margin: '0 0.5rem' }}>to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="MMM d, yyyy"
            />
          </div>
        </div>
        
        <div className="severity-filter">
          <label>Severity:</label>
          <div>
            {["high", "medium", "low"].map((level) => (
              <label key={level} style={{ color: getSeverityColor(level) }}>
                <input
                  type="checkbox"
                  checked={selectedSeverities.includes(level)}
                  onChange={() => handleSeverityChange(level)}
                />
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </label>
            ))}
          </div>
        </div>
        
        <div className="location-filter">
          <label>Location Search:</label>
          <input
            type="text"
            placeholder="Enter location keyword..."
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
          />
        </div>
        
        <button onClick={handleDownloadReport}>
          Download Report
        </button>
      </div>

      {/* Loading state display */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <p>Loading data...</p>
        </div>
      )}

      {/* Main Dashboard Section */}
      <div className="dashboard-content">
        {/* Map Section */}
        <div className="map-section">
          <h2>Interactive Crisis Map</h2>
          <MapContainer center={[39.5, -98.35]} zoom={4} style={{ height: "400px", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredPosts.map((post) => (
              <Marker 
                key={post.id} 
                position={[post.location.lat, post.location.lng]}
                icon={getMarkerIcon(post.severity)}
              >
                <Popup>
                  <div>
                    <p style={{ color: getSeverityColor(post.severity), fontWeight: 'bold' }}>
                      {post.severity.toUpperCase()} Severity
                    </p>
                    <p>
                      <strong>Post #{post.id}</strong>: {post.text}
                    </p>
                    <p>Topic: {post.topic}</p>
                    <p>Date: {post.date.toLocaleDateString()}</p>
                    <button onClick={() => setSelectedPost(post)}>View Details</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
            <span>Map Key: </span>
            <span style={{ color: '#ef4444', fontWeight: 'bold', marginRight: '0.5rem' }}>● High</span>
            <span style={{ color: '#f59e0b', fontWeight: 'bold', marginRight: '0.5rem' }}>● Medium</span>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>● Low</span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <h2>Sentiment & Engagement Analytics</h2>
          <div className="chart-wrapper">
            <div className="chart">
              <h3>Sentiment Distribution</h3>
              <Pie data={sentimentChartData} options={pieChartOptions} />
            </div>
            <div className="chart">
              <h3>Engagement Over Time</h3>
              <Line data={timeSeriesData} options={lineChartOptions} />
            </div>
          </div>
        </div>

        {/* Table/List of Posts */}
        <div className="posts-section">
          <h2>Recent Crisis Posts <span style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 'normal' }}>({filteredPosts.length} posts found)</span></h2>
          {filteredPosts.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>No posts match your filters</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Text</th>
                    <th>Severity</th>
                    <th>Topic</th>
                    <th>Date</th>
                    {currentUserRole === "publicHealth" && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post.id}>
                      <td>{post.id}</td>
                      <td>{post.text}</td>
                      <td style={{ color: getSeverityColor(post.severity), fontWeight: '500' }}>
                        {post.severity.charAt(0).toUpperCase() + post.severity.slice(1)}
                      </td>
                      <td>{post.topic}</td>
                      <td>{post.date.toLocaleString()}</td>
                      {currentUserRole === "publicHealth" && (
                        <td>
                          <button onClick={() => setSelectedPost(post)}>View Details</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Conditional Role-Based UI Example */}
      {currentUserRole === "publicHealth" && (
        <div className="admin-panel">
          <h2>Public Health Official Dashboard</h2>
          
          <div className="admin-stats">
            <div className="stat-card">
              <h3>Crisis Overview</h3>
              <div className="stat-value">{filteredPosts.filter(p => p.severity === "high").length}</div>
              <div className="stat-label">High Severity Cases</div>
              <div className="stat-trend positive">
                <span>↓ 12% from last week</span>
              </div>
            </div>
            
            <div className="stat-card">
              <h3>Response Rate</h3>
              <div className="stat-value">83%</div>
              <div className="stat-label">Of cases addressed</div>
              <div className="stat-trend positive">
                <span>↑ 7% from last week</span>
              </div>
            </div>
            
            <div className="stat-card">
              <h3>Avg. Response Time</h3>
              <div className="stat-value">4.2 hrs</div>
              <div className="stat-label">For high severity</div>
              <div className="stat-trend negative">
                <span>↑ 0.8 hrs from target</span>
              </div>
            </div>
            
            <div className="stat-card">
              <h3>Resource Utilization</h3>
              <div className="stat-value">76%</div>
              <div className="stat-label">Of available capacity</div>
              <div className="stat-trend neutral">
                <span>↔ No change</span>
              </div>
            </div>
          </div>
          
          <div className="admin-actions">
            <div className="action-section">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button className="action-btn primary">
                  Schedule Intervention
                </button>
                <button className="action-btn secondary">
                  Alert Crisis Team
                </button>
                <button className="action-btn secondary">
                  Generate Weekly Report
                </button>
                <button className="action-btn secondary">
                  View Resources Map
                </button>
              </div>
            </div>
            
            <div className="resource-section">
              <h3>Resource Allocation</h3>
              <table className="resource-table">
                <thead>
                  <tr>
                    <th>Resource Type</th>
                    <th>Available</th>
                    <th>Assigned</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Mental Health Specialists</td>
                    <td>12</td>
                    <td>8</td>
                    <td><span className="status available">Available</span></td>
                  </tr>
                  <tr>
                    <td>Crisis Counselors</td>
                    <td>24</td>
                    <td>20</td>
                    <td><span className="status limited">Limited</span></td>
                  </tr>
                  <tr>
                    <td>Emergency Response Teams</td>
                    <td>5</td>
                    <td>5</td>
                    <td><span className="status unavailable">Fully Assigned</span></td>
                  </tr>
                  <tr>
                    <td>Support Group Facilitators</td>
                    <td>18</td>
                    <td>11</td>
                    <td><span className="status available">Available</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="admin-footer">
            <div className="notifications">
              <h3>Recent Notifications</h3>
              <ul className="notification-list">
                <li className="notification high">
                  <div className="notification-time">10:42 AM</div>
                  <div className="notification-content">
                    <strong>High Priority:</strong> New crisis cluster identified in Los Angeles area
                  </div>
                </li>
                <li className="notification medium">
                  <div className="notification-time">Yesterday</div>
                  <div className="notification-content">
                    <strong>Medium Priority:</strong> Monthly resource allocation report ready for review
                  </div>
                </li>
                <li className="notification low">
                  <div className="notification-time">Apr 16</div>
                  <div className="notification-content">
                    <strong>Low Priority:</strong> System maintenance scheduled for April 20
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="modal">
          <div className="modal-content">
            <h3>Post Details</h3>
            <p>
              <strong>ID:</strong> {selectedPost.id}
            </p>
            <p>
              <strong>Text:</strong> {selectedPost.text}
            </p>
            <p>
              <strong>Severity:</strong> <span style={{ color: getSeverityColor(selectedPost.severity) }}>{selectedPost.severity}</span>
            </p>
            <p>
              <strong>Topic:</strong> {selectedPost.topic}
            </p>
            <p>
              <strong>Sentiment:</strong> {selectedPost.sentiment}
            </p>
            <p>
              <strong>Date:</strong> {selectedPost.date.toLocaleString()}
            </p>
            <p>
              <strong>Engagement:</strong> {selectedPost.engagement.retweets} retweets, {selectedPost.engagement.replies} replies
            </p>
            
            <div className="feedback-section">
              <label>
                Provide Feedback or Annotation:
                <textarea 
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Enter your analysis, notes, or intervention recommendations..." 
                />
              </label>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={submitFeedback} disabled={loading}>
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>
                <button onClick={() => setSelectedPost(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;