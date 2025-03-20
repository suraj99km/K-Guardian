"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "@/lib/db/supabaseClient";
import { useRouter } from "next/navigation";
import { Shield, Search, Filter, Clock, MapPin, AlertTriangle } from "lucide-react";

interface Incident {
  id: string;
  title: string;
  incident_type: string;
  location: string;
  status: string;
  created_at: string;
}

export default function IncidentLogs() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      setUser(data.user?.id || null);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("id, title, incident_type, location, status, created_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching incidents:", error);
        return;
      }

      setIncidents(data || []);
      setFilteredIncidents(data || []);
      setLoading(false);
    };

    fetchIncidents();
  }, [user, router]);

  useEffect(() => {
    let filtered = incidents;
    if (searchQuery) {
      filtered = filtered.filter((incident) =>
        incident.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== "All") {
      filtered = filtered.filter((incident) => incident.status === filterStatus);
    }

    setFilteredIncidents(filtered);
  }, [searchQuery, filterStatus, incidents]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950 text-cyan-400">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-6 h-6 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
          <p className="font-medium">Loading incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-14 min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white px-4 py-8 sm:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-cyan-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Your Reported Incidents</h1>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative w-full sm:w-2/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-gray-800/50 text-white border border-gray-700/50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
            />
          </div>
          <div className="relative w-full sm:w-1/3">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-3 pl-10 rounded-lg bg-gray-800/50 text-white border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Resolved">Resolved</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Results counter */}
        <div className="mb-4 text-sm text-gray-400">
          Showing {filteredIncidents.length} {filteredIncidents.length === 1 ? 'incident' : 'incidents'}
          {filterStatus !== "All" ? ` with status "${filterStatus}"` : ''}
          {searchQuery ? ` matching "${searchQuery}"` : ''}
        </div>

        {/* Incidents Grid */}
        {filteredIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <AlertTriangle className="h-12 w-12 text-gray-500 mb-4" />
            <p className="text-gray-400 text-center">No incidents match your criteria.</p>
            <button 
              onClick={() => {setSearchQuery(""); setFilterStatus("All");}}
              className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIncidents.map((incident) => (
              <Link 
                key={incident.id} 
                href={`/incident-logs/${incident.id}`}
                className="block group"
              >
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-5 rounded-xl shadow-lg hover:shadow-cyan-900/20 transition-all duration-300 h-full hover:border-cyan-600/50 group-hover:bg-gray-800/80">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyles(incident.status)}`}>
                      {incident.status}
                    </span>
                    <span className="text-gray-500 text-xs">{incident.id.substring(0, 8)}</span>
                  </div>
                  
                  <h2 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors mb-2">{incident.title}</h2>
                  
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-gray-500" />
                      <span>{incident.incident_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{incident.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{new Date(incident.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-xs text-right">
                    <span className="text-cyan-400 opacity-90 group-hover:opacity-100 transition-opacity">
                      View details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>
        )}
      </div>
    </div>
  );
}