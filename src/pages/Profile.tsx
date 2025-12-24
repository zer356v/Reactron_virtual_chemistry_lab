import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  LogOut,
  Edit2,
  Camera,
  Beaker,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
  Mail,
  ArrowLeft,
  FileText,
  Zap,
  Trash2,
  AlertTriangle,
  CheckSquare,
  Square,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";

export default function ChemistryLabProfilePage() {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  
  // 🔥 NEW: Selection state
  const [selectedExperiments, setSelectedExperiments] = useState<string[]>([]);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [stats, setStats] = useState({
    totalExperiments: 0,
    totalScore: 0,
    totalChemicals: 0,
    totalReactions: 0,
    totalTime: 0,
  });

  // Fetch user data and experiments
  useEffect(() => {
    fetchExperiments();
  }, [user]);

  const fetchExperiments = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/add-experiment/${user.uid}`
      );
      
      const userExperiments = response.data || [];
      setExperiments(userExperiments.reverse()); // Latest first
      
      // Calculate stats
      const totalScore = userExperiments.reduce((sum, exp) => sum + (exp.score || 0), 0);
      const totalChemicals = userExperiments.reduce(
        (sum, exp) => sum + (exp.chemicals_used?.length || 0), 
        0
      );
      const totalReactions = userExperiments.reduce(
        (sum, exp) => sum + (exp.results?.reactions || 0), 
        0
      );
      const totalTime = userExperiments.reduce(
        (sum, exp) => sum + (exp.results?.session_duration || 0), 
        0
      );
      
      setStats({
        totalExperiments: userExperiments.length,
        totalScore,
        totalChemicals,
        totalReactions,
        totalTime: Math.round(totalTime / 60),
      });
      
    } catch (error) {
      console.error("Error fetching experiments:", error);
      toast({
        title: "Error",
        description: "Failed to load experiments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || "");
      setPhotoURL(currentUser.photoURL || "");
    }
  }, [currentUser]);

  // 🔥 NEW: Toggle experiment selection
  const toggleExperimentSelection = (expId: string) => {
    setSelectedExperiments(prev => 
      prev.includes(expId)
        ? prev.filter(id => id !== expId)
        : [...prev, expId]
    );
  };

  // 🔥 NEW: Select all experiments
  const toggleSelectAll = () => {
    if (selectedExperiments.length === experiments.length) {
      setSelectedExperiments([]);
    } else {
      setSelectedExperiments(experiments.map(exp => exp.id));
    }
  };

 // 🔥 UPDATE: Delete selected experiments (bulk delete)
const handleDeleteSelected = async () => {
  if (selectedExperiments.length === 0) {
    toast({
      title: "No Selection",
      description: "Please select experiments to delete",
      variant: "destructive",
    });
    return;
  }

  try {
    setDeleting(true);
    
    // ✅ FIXED: Use correct endpoint
    await axios.delete(
      `${import.meta.env.VITE_SERVER_URL}/api/add-experiment`,
      {
        data: { 
          experimentIds: selectedExperiments,
          userId: user.uid 
        }
      }
    );

    toast({
      title: "Experiments Deleted",
      description: `${selectedExperiments.length} experiment(s) removed successfully`,
    });

    // Reset states
    setSelectedExperiments([]);
    setIsDeleteMode(false);
    setShowDeleteConfirm(false);
    
    // Refresh experiments
    fetchExperiments();
    
  } catch (error) {
    console.error("Delete error:", error);
    toast({
      title: "Delete Failed",
      description: "Could not delete experiments. Please try again.",
      variant: "destructive",
    });
  } finally {
    setDeleting(false);
  }
};

// 🔥 UPDATE: Delete single experiment
const handleDeleteSingle = async (expId: string) => {
  try {
    setDeleting(true);
    
    // ✅ FIXED: Use correct endpoint
    await axios.delete(
      `${import.meta.env.VITE_SERVER_URL}/api/add-experiment/${expId}`,
      {
        data: { userId: user.uid }
      }
    );

    toast({
      title: "Experiment Deleted",
      description: "Experiment removed successfully",
    });

    fetchExperiments();
    
  } catch (error) {
    console.error("Delete error:", error);
    toast({
      title: "Delete Failed",
      description: "Could not delete experiment",
      variant: "destructive",
    });
  } finally {
    setDeleting(false);
  }
};

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoURL(String(reader.result || ''));
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-indigo-600 mx-auto"></div>
          <p className="text-lg font-semibold text-slate-700 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/lab")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Lab
              </Button>
              <div className="h-6 w-px bg-slate-300" />
              <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
            </div>
            
            <Button
              variant="outline"
              onClick={() => {
                auth.signOut().then(() => navigate("/"));
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600" />
              <CardContent className="relative pt-0 pb-6">
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="relative group">
                    <img
                      src={photoURL || `https://ui-avatars.com/api/?name=${displayName}&size=120&background=6366f1&color=fff&bold=true`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
                    />
                    <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                      <Camera className="h-4 w-4 text-indigo-600" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                </div>

                <div className="text-center mb-4">
                  {isEditingName ? (
                    <div className="flex items-center gap-2 justify-center">
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="text-xl font-bold text-center border-b-2 border-indigo-500 outline-none"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => setIsEditingName(false)}
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 justify-center group">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {displayName || "Chemistry Student"}
                      </h2>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit2 className="h-4 w-4 text-slate-400 hover:text-indigo-600" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-slate-600 flex items-center justify-center gap-2 mt-2">
                    <Mail className="h-4 w-4" />
                    {currentUser?.email}
                  </p>
                </div>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Beaker className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Experiments</p>
                        <p className="text-lg font-bold text-slate-900">{stats.totalExperiments}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Total Score</p>
                        <p className="text-lg font-bold text-slate-900">{stats.totalScore}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Lab Time</p>
                        <p className="text-lg font-bold text-slate-900">{stats.totalTime} min</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 shadow-lg border-0">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  Activity Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Chemicals Used</span>
                    <span className="text-sm font-bold text-slate-900">{stats.totalChemicals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Reactions Performed</span>
                    <span className="text-sm font-bold text-slate-900">{stats.totalReactions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Avg. Session Time</span>
                    <span className="text-sm font-bold text-slate-900">
                      {stats.totalExperiments > 0 
                        ? Math.round(stats.totalTime / stats.totalExperiments) 
                        : 0} min
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Experiments */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Recent Experiments
                  </h3>
                  
                  {/* 🔥 DELETE MODE TOGGLE */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      {experiments.length} sessions
                    </span>
                    {experiments.length > 0 && (
                      <Button
                        variant={isDeleteMode ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => {
                          setIsDeleteMode(!isDeleteMode);
                          setSelectedExperiments([]);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeleteMode ? "Cancel" : "Delete"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* 🔥 DELETE MODE TOOLBAR */}
                {isDeleteMode && experiments.length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
                        >
                          {selectedExperiments.length === experiments.length ? (
                            <CheckSquare className="h-5 w-5 text-indigo-600" />
                          ) : (
                            <Square className="h-5 w-5" />
                          )}
                          Select All
                        </button>
                        {selectedExperiments.length > 0 && (
                          <span className="text-sm text-slate-600">
                            ({selectedExperiments.length} selected)
                          </span>
                        )}
                      </div>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={selectedExperiments.length === 0 || deleting}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deleting ? "Deleting..." : `Delete (${selectedExperiments.length})`}
                      </Button>
                    </div>
                  </div>
                )}

                {experiments.length === 0 ? (
                  <div className="text-center py-12">
                    <Beaker className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No experiments yet</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Start your first experiment in the lab!
                    </p>
                    <Button
                      onClick={() => navigate("/lab")}
                      className="mt-4"
                    >
                      Go to Lab
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {experiments.map((exp, index) => (
                      <div
                        key={exp.id}
                        className={`group p-4 rounded-xl border transition-all ${
                          isDeleteMode
                            ? selectedExperiments.includes(exp.id)
                              ? "bg-red-50 border-red-300"
                              : "bg-slate-50 border-slate-200 hover:border-slate-300"
                            : "bg-gradient-to-r from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-purple-50 border-slate-200 hover:border-indigo-300"
                        } cursor-pointer`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {/* 🔥 CHECKBOX IN DELETE MODE */}
                            {isDeleteMode && (
                              <div 
                                onClick={() => toggleExperimentSelection(exp.id)}
                                className="mt-1"
                              >
                                {selectedExperiments.includes(exp.id) ? (
                                  <CheckSquare className="h-5 w-5 text-red-600" />
                                ) : (
                                  <Square className="h-5 w-5 text-slate-400" />
                                )}
                              </div>
                            )}
                            
                            {!isDeleteMode && (
                              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                <Beaker className="h-4 w-4 text-indigo-600" />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900">
                                {exp.experiment_name || `Experiment ${index + 1}`}
                              </h4>
                              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3" />
                                {formatDate(exp.results?.timestamp || exp.created_at)}
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                                <div className="bg-white rounded-lg p-2">
                                  <p className="text-xs text-slate-500">Score</p>
                                  <p className="text-sm font-bold text-slate-900">{exp.score || 0}</p>
                                </div>
                                <div className="bg-white rounded-lg p-2">
                                  <p className="text-xs text-slate-500">Reactions</p>
                                  <p className="text-sm font-bold text-slate-900">
                                    {exp.results?.reactions || 0}
                                  </p>
                                </div>
                                <div className="bg-white rounded-lg p-2">
                                  <p className="text-xs text-slate-500">Chemicals</p>
                                  <p className="text-sm font-bold text-slate-900">
                                    {exp.results?.chemicals_mixed || 0}
                                  </p>
                                </div>
                                <div className="bg-white rounded-lg p-2">
                                  <p className="text-xs text-slate-500">Duration</p>
                                  <p className="text-sm font-bold text-slate-900">
                                    {Math.round((exp.results?.session_duration || 0) / 60)} min
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {!isDeleteMode && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSingle(exp.id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                disabled={deleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 🔥 DELETE CONFIRMATION DIALOG */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Experiments?</h3>
                  <p className="text-sm text-slate-600">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p className="text-slate-700 mb-6">
                You are about to delete <strong>{selectedExperiments.length}</strong> experiment(s). 
                All associated data will be permanently removed.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSelected}
                  className="flex-1"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}