"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import supabase from "@/lib/db/supabaseClient";
// import Image from "next/image";
import { Calendar, MapPin, AlertCircle, Clock, ArrowLeft } from "lucide-react";

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

export default function IncidentDetail() {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchIncident = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) {
        console.error("Error fetching incident:", error);
        return;
      }
      
      setIncident(data);
      setLoading(false);
    };
    
    fetchIncident();
  }, [id]);
  
  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-pulse text-white space-y-4">
          <div className="h-8 w-48 bg-gray-700 rounded"></div>
          <div className="h-4 w-32 bg-gray-700 rounded"></div>
          <div className="h-64 w-full max-w-2xl bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Incident Not Found</h2>
        <p className="text-gray-400 mb-6">The requested incident could not be found.</p>
        <button 
          onClick={handleBack} 
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 transition rounded-lg"
        >
          <ArrowLeft size={16} className="mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500 text-amber-950";
      case "Under Investigation":
        return "bg-blue-500 text-white";
      case "Resolved":
        return "bg-green-500 text-white";
      case "Closed":
        return "bg-gray-500 text-white";
      default:
        return "bg-purple-500 text-white";
    }
  };

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Header with back button */}
      <div className="sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10 p-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={handleBack} 
            className="flex items-center p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          {/* Status banner */}
          <div className={`px-4 py-2 rounded-md ${getStatusColor(incident.status)} flex items-center`}>
            <AlertCircle size={18} className="mr-2" />
            <span className="font-medium">{incident.status}</span>
            <span className="font-medium ml-4">{incident.id.substring(0,8)}</span>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto p-6">

        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and metadata */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{incident.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-blue-400" />
                  <span>{formatDate(incident.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2 text-red-400" />
                  <span>{incident.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-green-400" />
                  <span>{incident.incident_type}</span>
                </div>
              </div>
            </div>
            
            {/* Image */}
            {incident.media_url && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                <img
                  src={incident.media_url.trim()}
                  alt="Incident Image not loaded"
                  className="object-cover w-full h-auto hover:scale-105 transition duration-300"
                />
              </div>
            )}
            
            {/* Description */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AlertCircle size={20} className="mr-2 text-blue-400" />
                Incident Description
              </h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {incident.description}
              </p>
            </div>
          </div>
          
          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Status card */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-4">Status Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Status:</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium lg:text-md ${getStatusColor(incident.status)}`}>
                    {incident.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white">{incident.incident_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-white">{incident.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Reported:</span>
                  <span className="text-white">{new Date(incident.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">{new Date(incident.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-400">Incident ID:</span>
                  <span className="text-white font-mono text-sm">{incident.id.substring(0, 8)}</span>
                </div>
              </div>
            </div>
            
            {/* Actions card */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 transition rounded-lg flex items-center justify-center">
                  Update Status
                </button>
                <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 transition rounded-lg flex items-center justify-center">
                  Add Comment
                </button>
                <button className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 transition rounded-lg flex items-center justify-center">
                  Share Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}