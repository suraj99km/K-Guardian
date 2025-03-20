"use client";

import { useEffect, useState } from "react";
import supabase from "@/lib/db/supabaseClient";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { AlertTriangle, Calendar, Check, Clock, Filter, Loader, MapPin, Shield } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  location: string;
  media_url: string | null;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("all");

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const { data, error } = await supabase.from("incidents").select("*");
        if (error) throw error;
        if (data) setIncidents(data);
      } catch (error) {
        console.error("Error fetching incidents:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIncidents();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-10 w-10 animate-spin text-cyan-400" />
          <p className="text-lg font-medium text-cyan-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Metrics calculation
  const totalIncidents = incidents.length;
  const pendingIncidents = incidents.filter(i => i.status === "Pending").length;
  const ongoingIncidents = incidents.filter(i => i.status === "Under Investigation").length;
  const resolvedIncidents = incidents.filter(i => i.status === "Resolved").length;

  // Incident type distribution for pie chart
  const incidentTypeData = Object.entries(
    incidents.reduce<Record<string, number>>((acc, { incident_type }) => {
      acc[incident_type] = (acc[incident_type] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  // Location distribution for bar chart
  const locationData = Object.entries(
    incidents.reduce<Record<string, number>>((acc, { location }) => {
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 locations

  // Time-based aggregation for trend analysis
  const getFilteredIncidents = () => {
    if (timeRange === "all") return incidents;
    
    const now = new Date();
    const timeLimit = new Date();
    
    if (timeRange === "week") {
      timeLimit.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      timeLimit.setMonth(now.getMonth() - 1);
    }
    
    return incidents.filter(incident => new Date(incident.created_at) >= timeLimit);
  };

  const filteredIncidents = getFilteredIncidents();
  
  // Create a map of dates and count incidents per day
  const incidentsByDate = filteredIncidents.reduce<Record<string, number>>((acc, incident) => {
    const date = incident.created_at.split("T")[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  
  // Sort dates and create dataset for line chart
  const trendData = Object.entries(incidentsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Status distribution for pie chart
  const statusData = [
    { name: "Pending", value: pendingIncidents, color: "#FBBF24" }, // Adjusted amber color
    { name: "Under Investigation", value: ongoingIncidents, color: "#38BDF8" }, // Adjusted blue color
    { name: "Resolved", value: resolvedIncidents, color: "#34D399" } // Adjusted emerald color
  ].filter(item => item.value > 0);

  // Improved colors that match the incident details page theme
  const TYPE_COLORS = ["#38BDF8", "#34D399", "#FBBF24", "#FB7185", "#A78BFA"];
  const STATUS_COLORS = statusData.map(item => item.color);

  // Enhanced tooltip styling
  const customTooltipStyle = {
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    border: '1px solid rgba(75, 85, 99, 0.5)',
    borderRadius: '0.5rem',
    padding: '8px 12px',
    color: 'white',
    labelStyle: { color: 'white' },
    itemStyle: { color: 'white' },
    fontSize: '14px', // Optional: Improve readability
    fontWeight: '500', // Optional: Enhance contrast
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/20 text-amber-500 border border-amber-500/30";
      case "Under Investigation":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "Resolved":
        return "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white p-4 md:p-6 lg:p-8">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-7 w-7 text-cyan-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            K-Guardian Analytics
          </h1>
        </div>
        
        {/* Time range selector */}
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-cyan-500" />
          <span className="text-gray-300 text-sm">Time Period:</span>
          <div className="inline-flex bg-gray-800/50 rounded-lg p-1 border border-gray-700/50">
            <button
              onClick={() => setTimeRange("week")}
              className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                timeRange === "week" 
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" 
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange("month")}
              className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                timeRange === "month" 
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" 
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange("all")}
              className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                timeRange === "all" 
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" 
                  : "text-gray-300 hover:text-white hover:bg-gray-700/50"
              }`}
            >
              All Time
            </button>
          </div>
        </div>
      </header>

      {/* Main grid for dashboard content */}
      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        {/* Summary Cards */}
        <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-cyan-900/20 transition-all duration-300 hover:border-cyan-600/50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-400">Total Incidents</p>
                <p className="text-3xl font-bold text-white mt-1">{totalIncidents}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-700/50">
                <AlertTriangle className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {timeRange !== "all" ? 
                `Filtered to ${timeRange === "week" ? "last 7 days" : "last 30 days"}` : 
                "All time total"}
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-amber-900/20 transition-all duration-300 hover:border-amber-600/50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <p className="text-3xl font-bold text-amber-400 mt-1">{pendingIncidents}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {((pendingIncidents / totalIncidents) * 100).toFixed(1)}% of total
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-blue-900/20 transition-all duration-300 hover:border-blue-600/50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-400">Investigating</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{ongoingIncidents}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Loader className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {((ongoingIncidents / totalIncidents) * 100).toFixed(1)}% of total
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-emerald-900/20 transition-all duration-300 hover:border-emerald-600/50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm text-gray-400">Resolved</p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">{resolvedIncidents}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Check className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              {((resolvedIncidents / totalIncidents) * 100).toFixed(1)}% of total
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="col-span-12 lg:col-span-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-cyan-900/20 transition-all duration-300 hover:border-cyan-600/50">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-medium text-white">Incident Trends</h2>
          </div>
          <div className="h-60 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(75, 85, 99, 0.3)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={customTooltipStyle}
                  labelFormatter={(date) => `Date: ${new Date(date).toLocaleDateString()}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Incidents" 
                  stroke="#22d3ee" 
                  strokeWidth={3}
                  dot={{ fill: '#22d3ee', r: 4, strokeWidth: 2, stroke: '#0e7490' }}
                  activeDot={{ fill: '#06b6d4', r: 6, stroke: '#0891b2', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="col-span-12 lg:col-span-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-cyan-900/20 transition-all duration-300 hover:border-cyan-600/50">
          <div className="flex items-center gap-2 mb-4">
            <Check className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-medium text-white">Status Distribution</h2>
          </div>
          <div className="h-60 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="rgba(17, 24, 39, 0.8)" 
                      strokeWidth={2} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    ...customTooltipStyle,
                    color: "white", // ✅ Explicitly setting text color
                  }}
                  itemStyle={{ color: "white" }} // ✅ Ensures list items are also white
                  formatter={(value, name) => [`${value} incidents (${((value as number) / totalIncidents * 100).toFixed(1)}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Types Chart */}
        <div className="col-span-12 lg:col-span-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-cyan-900/20 transition-all duration-300 hover:border-cyan-600/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-medium text-white">Incident Types</h2>
          </div>
          <div className="h-60 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incidentTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {incidentTypeData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={TYPE_COLORS[index % TYPE_COLORS.length]} 
                      stroke="rgba(17, 24, 39, 0.8)" 
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    ...customTooltipStyle,
                    color: "white", // ✅ Explicitly setting text color
                  }}
                  itemStyle={{ color: "white" }} // ✅ Ensures list items are also white
                  formatter={(value, name) => [`${value} incidents (${((value as number) / totalIncidents * 100).toFixed(1)}%)`, name]}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right" 
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={{ 
                    fontSize: 12, 
                    paddingLeft: 20,
                    color: "#e5e7eb"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location Bar Chart */}
        <div className="col-span-12 lg:col-span-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-cyan-900/20 transition-all duration-300 hover:border-cyan-600/50">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-medium text-white">Top Locations</h2>
          </div>
          <div className="h-60 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={locationData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 40, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(75, 85, 99, 0.3)" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#9ca3af" 
                  tick={{ fontSize: 12 }} 
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{
                    ...customTooltipStyle,
                    color: "white", // ✅ Ensures tooltip text is white
                  }}
                  itemStyle={{ color: "white" }} // ✅ Ensures list items are also white
                  formatter={(value) => [`${value} incidents`, "Count"]}
                />
                <Bar 
                  dataKey="value" 
                  name="Incidents" 
                  radius={[0, 4, 4, 0]}
                >
                  {locationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`rgba(56, 189, 248, ${0.9 - (index * 0.15)})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent incidents table */}
        <div className="col-span-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 shadow-lg hover:shadow-cyan-900/20 transition-all duration-300 hover:border-cyan-600/50">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            <span>Recent Incidents</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {incidents.slice(0, 5).map((incident) => (
                  <tr key={incident.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-white">{incident.title}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">{incident.incident_type}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">{incident.location}</td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(incident.status)}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(incident.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}