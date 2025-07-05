import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Download, Database, Brain, TrendingUp } from "lucide-react";

interface DatasetStats {
  totalGenerations: number;
  totalSize: string;
  latestGeneration: string | null;
}

export function DatasetPanel() {
  const [isExporting, setIsExporting] = useState(false);

  const { data: stats, isLoading } = useQuery<DatasetStats>({
    queryKey: ['/api/dataset/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleExportForTraining = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/dataset/training-format');
      const data = await response.json();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `c2-training-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting training data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDataset = async () => {
    try {
      const response = await fetch('/api/dataset/export');
      const data = await response.json();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gemini-dataset-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting dataset:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Database className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Training Dataset</h2>
          <p className="text-xs text-gray-400">Generated code for c2 model training</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Total Generations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.totalGenerations || 0}
            </div>
            <p className="text-xs text-gray-500">Code examples generated</p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Dataset Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.totalSize || '0 KB'}
            </div>
            <p className="text-xs text-gray-500">Total training data</p>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center">
              <Brain className="h-4 w-4 mr-2" />
              Latest Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-white">
              {stats?.latestGeneration ? 
                stats.latestGeneration.replace('generation_', '').substring(0, 10) + '...' : 
                'None'
              }
            </div>
            <p className="text-xs text-gray-500">Most recent code</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Export Training Data</CardTitle>
            <CardDescription className="text-gray-400">
              Download your generated code dataset to train a custom c2 model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleExportForTraining}
              disabled={isExporting || !stats?.totalGenerations}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export for c2 Training'}
            </Button>
            
            <Button
              onClick={handleExportDataset}
              disabled={!stats?.totalGenerations}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Raw Dataset
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-black/20 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Training Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong>Format:</strong> Input-output pairs for supervised learning</p>
              <p><strong>Input:</strong> Natural language prompts (max 100 chars)</p>
              <p><strong>Output:</strong> Structured HTML, CSS, and JavaScript code</p>
              <p><strong>Use case:</strong> Train a custom c2 model on your coding patterns</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}