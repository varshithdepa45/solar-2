"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  usePredictions,
  useProjects,
  useCreatePrediction,
} from "@/lib/useFirestore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, Home } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const { predictions, loading: predictionsLoading } = usePredictions();
  const { projects, loading: projectsLoading } = useProjects();
  const { createPrediction } = useCreatePrediction();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateDemoProject = async () => {
    if (!user) return;
    setIsCreating(true);

    try {
      await createPrediction({
        userId: user.uid,
        endpoint: "solar_forecast",
        input: {
          latitude: 37.7749,
          longitude: -122.4194,
          month: new Date().getMonth() + 1,
        },
        result: {
          forecast_value: 150.5,
          confidence_interval: [120.3, 180.7],
          unit: "kWh/month",
        },
        metadata: {
          model_version: "v1.0",
          processing_time_ms: 45,
        },
      });
    } catch (error) {
      console.error("Failed to create prediction:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-white">Please log in to access the dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user.email}</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            Sign Out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Predictions</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {predictionsLoading ? "-" : predictions.length}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-neon-blue opacity-30" />
            </div>
          </Card>

          <Card className="p-6 bg-gray-900 border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Projects</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {projectsLoading ? "-" : projects.length}
                </p>
              </div>
              <Home className="h-12 w-12 text-neon-green opacity-30" />
            </div>
          </Card>

          <Card className="p-6 bg-gray-900 border-gray-800">
            <div>
              <p className="text-gray-400 text-sm">Account Status</p>
              <p className="text-xl font-bold text-neon-green mt-2">Active</p>
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
            </div>
          </Card>
        </div>

        {/* Recent Predictions */}
        <Card className="p-6 bg-gray-900 border-gray-800 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Predictions</h2>
            <Button
              onClick={handleCreateDemoProject}
              disabled={isCreating}
              className="bg-neon-blue hover:bg-neon-blue/90 text-black font-semibold"
            >
              {isCreating ? "Creating..." : "New Prediction"}
            </Button>
          </div>

          {predictionsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neon-blue border-r-transparent"></div>
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No predictions yet</p>
              <Button
                onClick={handleCreateDemoProject}
                disabled={isCreating}
                className="mt-4 bg-neon-green hover:bg-neon-green/90 text-black font-semibold"
              >
                Create Your First Prediction
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                      Endpoint
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                      Result
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.slice(0, 5).map((pred: any) => (
                    <tr
                      key={pred.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4 text-white">{pred.endpoint}</td>
                      <td className="py-3 px-4 text-neon-green">
                        {typeof pred.result === "object"
                          ? JSON.stringify(pred.result).substring(0, 50) + "..."
                          : pred.result}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {new Date(pred.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Projects Section */}
        <Card className="p-6 bg-gray-900 border-gray-800">
          <h2 className="text-xl font-bold text-white mb-6">Your Projects</h2>

          {projectsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neon-green border-r-transparent"></div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No projects yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj: any) => (
                <Card key={proj.id} className="p-4 bg-gray-800 border-gray-700">
                  <h3 className="font-semibold text-white">{proj.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {proj.description}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xs px-2 py-1 bg-neon-blue/20 text-neon-blue rounded">
                      {proj.status || "active"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
