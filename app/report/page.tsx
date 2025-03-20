"use client";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/db/supabaseClient";
import { ChevronDown, Camera, AlertCircle, ShieldAlert, Lock, Flame, Car, CheckCircle } from "lucide-react";
import { uploadImage } from "@/lib/storage/uploadImage";

const incidentCategories = [
  { value: "unauthorized-entry", label: "Unauthorized Entry", icon: <ShieldAlert size={24} /> },
  { value: "suspicious-activity", label: "Suspicious Activity", icon: <AlertCircle size={24} /> },
  { value: "theft", label: "Theft", icon: <Lock size={18} /> },
  { value: "physical-altercation", label: "Physical Altercation", icon: <AlertCircle size={24} /> },
  { value: "fire-incident", label: "Fire Incident", icon: <Flame size={18} /> },
  { value: "road-accident", label: "Road Accident", icon: <Car size={18} /> },
];

// For the incidents table, create a csv file with my user id of the ten incidents with the below image_urls, create the incidents from the perspective of the security guards of the IIM Kozhikode.

const locations = [
  "Main Gate",
  "Library",
  "PGP Auditorium",
  "D Landing",
  "Phase V",
  "Hostel Block",
  "Academic Block",
  "H-Mess",
  "Sports Complex",
  "Faculty Area",
  "Parking Lot",
  "Other (not mentioned)"
];

export default function Report() {
  // Form input states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [incidentType, setIncidentType] = useState("");
  const [location, setLocation] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null); // New state for uploaded file URL
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/login"); // Redirect if not authenticated
      } else {
        setUser(data.user.id);
      }
    };
    
    checkUserAuth();
  }, []);

  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [success]);
  
  // Form validation states
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    incidentType: "",
    location: ""
  });

  // Scrolling ref for validation
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const incidentTypeRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLSelectElement>(null);

  // Validation function
  const validateForm = () => {
    let isValid = true;
    const newErrors = { title: "", description: "", incidentType: "", location: "" };

    // Title validation
    if (title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters long";
      isValid = false;
      titleRef.current?.focus();
    }

    // Description validation
    if (description.trim().length < 20) {
      newErrors.description = "Please provide more details (at least 20 characters)";
      if (isValid) descriptionRef.current?.focus();
      isValid = false;
    }

    // Incident type validation
    if (!incidentType) {
      newErrors.incidentType = "Please select an incident type";
      if (isValid) incidentTypeRef.current?.scrollIntoView({ behavior: 'smooth' });
      isValid = false;
    }

    // Location validation
    if (!location) {
      newErrors.location = "Please select a location";
      if (isValid) locationRef.current?.focus();
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to report an incident.");
      router.push("/login");
      return;
    }

    if (!validateForm()) return;
  
    setLoading(true);
  
    const { data, error } = await supabase
      .from("incidents")
      .insert([
        {
          title,
          description,
          incident_type: incidentType,
          location,
          media_url: mediaUrl, // Use the uploaded image URL
          reported_by: user,
        },
      ])
      .select("id")
      .single();
  
    if (error) {
      console.error(error);
      toast.error("Error submitting report: " + error.message, {
        style: { backgroundColor: "white", border: "1px solid black", color: "black" },
      });
      setLoading(false);
      return;
    }
  
    setIncidentId(data.id);
    setSuccess(true);
    setLoading(false);
  
    toast.success("Incident reported successfully!", {
      style: { backgroundColor: "white", border: "1px solid black", color: "black" },
    });
  
    setTimeout(() => {
      setTitle("");
      setDescription("");
      setIncidentType("");
      setLocation("");
      setMedia(null);
      setMediaUrl(null); // Reset mediaUrl
      setSuccess(false);
      router.push("/");
    }, 5000);
  };

  // Handle file size and type validation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Unsupported file type. Please upload an image or video.");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File is too large. Maximum size is 10MB.");
      return;
    }

    setMedia(file); // Store file for display

    if (isImage) {
      try {
        const uploadedUrl = await uploadImage(file, "kguardian");
        if (uploadedUrl) {
          setMediaUrl(uploadedUrl); // Store image URL for preview and database
        }
      } catch (error) {
        console.error("Image upload failed:", error);
        toast.error("Image upload failed. Please try again.");
      }
    }
  };

  return (
    <div className="mt-14 min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header with logo text */}
        <div className="bg-black p-4">
          <div className="text-2xl font-bold text-white text-center">Incident Report Form</div>
        </div>

        {success ? (
          <div className="flex items-start justify-center mt-10">
            <div className="p-8 flex flex-col items-center justify-center text-center bg-white shadow-lg rounded-lg">
              <CheckCircle size={64} className="text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Report Submitted!</h2>
              <p className="text-gray-600">Thank you for reporting this incident. The security team will review your report.</p>
              <p className="text-gray-600">IncidentID: {incidentId?.substring(0, 8)}</p>
            </div>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Incident Type Selection */}
            <div ref={incidentTypeRef}>
              <label className="block font-medium text-gray-800 mb-2">
                Incident Type<span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {incidentCategories.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${
                      incidentType === item.value 
                        ? "border-black bg-black text-white" 
                        : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                    } transition`}
                    onClick={() => {
                      setIncidentType(item.value);
                      setErrors({...errors, incidentType: ""});
                    }}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
              {errors.incidentType && (
                <p className="mt-1 text-sm text-red-500">{errors.incidentType}</p>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label className="block font-medium text-gray-800 mb-2">
                Title<span className="text-red-500">*</span>
              </label>
              <input
                ref={titleRef}
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                placeholder="Brief title of the incident"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value.length >= 5) {
                    setErrors({...errors, title: ""});
                  }
                }}
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Description Input */}
            <div>
              <label className="block font-medium text-gray-800 mb-2">
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                ref={descriptionRef}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                rows={3}
                placeholder="What happened? When? Who was involved?"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (e.target.value.length >= 20) {
                    setErrors({...errors, description: ""});
                  }
                }}
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
              <div className="flex justify-end mt-1">
                <span className={`text-xs ${
                  description.length < 20 ? "text-red-500" : "text-gray-500"
                }`}>
                  {description.length}/300 characters
                </span>
              </div>
            </div>

            {/* Location Dropdown */}
            <div>
              <label className="block font-medium text-gray-800 mb-2">
                Location<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  ref={locationRef}
                  className="appearance-none w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setErrors({...errors, location: ""});
                  }}
                  required
                >
                  <option value="" disabled>Select where it happened</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc} className="bg-white text-gray-800">
                      {loc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-gray-600 pointer-events-none" size={16} />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-500">{errors.location}</p>
              )}
            </div>

            {/* Media Upload */}
            <div>
              <label className="block font-medium text-gray-800 mb-2">
                Evidence (Optional)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  id="fileUpload"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="fileUpload"
                  className="flex items-center justify-center gap-2 w-full cursor-pointer bg-gray-50 text-gray-700 border border-gray-300 p-3 rounded-lg hover:bg-gray-100 transition"
                >
                  <Camera size={18} />
                  {media ? "Change File" : "Upload Photo/Video"}
                </label>
              </div>
              {media && (
                <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 text-sm">
                    <span className="truncate max-w-xs">{media.name}</span><br/>
                    <span className="flex justify-left">({(media.size / 1024).toFixed(2)} KB)</span> {/* Fixed file size calculation */}
                  </p>

                  {/* Show image preview if it's an image */}
                  {media.type.startsWith("image/") && mediaUrl && (
                    <div className="mt-2">
                      <img src={mediaUrl} alt="Uploaded preview" className="w-full rounded-lg" />
                    </div>
                  )}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">Maximum size: 10MB</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-black text-white py-3.5 rounded-lg font-medium hover:bg-gray-900 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}