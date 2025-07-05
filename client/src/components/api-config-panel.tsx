import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Key, Settings, Shield, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConfigStatus {
  hasApiKey: boolean;
  source: 'api.json' | 'environment' | 'none';
  model: string;
  fallbackEnabled: boolean;
}

interface Config {
  hasApiKey: boolean;
  model: string;
  maxTokens: number;
  temperature: number;
}

export function ApiConfigPanel() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: status, isLoading: statusLoading } = useQuery<ConfigStatus>({
    queryKey: ['/api/config/status'],
    refetchInterval: 10000, // Check every 10 seconds
  });

  const { data: config, isLoading: configLoading } = useQuery<Config>({
    queryKey: ['/api/config'],
  });

  const updateApiKeyMutation = useMutation({
    mutationFn: async (newApiKey: string) => {
      const response = await fetch('/api/config/api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: newApiKey }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update API key');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "API key updated successfully",
      });
      setApiKey("");
      queryClient.invalidateQueries({ queryKey: ['/api/config/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/config'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update API key",
        variant: "destructive",
      });
    },
  });

  const handleUpdateApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    updateApiKeyMutation.mutate(apiKey.trim());
  };

  if (statusLoading || configLoading) {
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center shadow-lg">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">API Configuration</h2>
          <p className="text-xs text-gray-400">Configure your personal Gemini API key</p>
        </div>
      </div>

      {/* Current Status */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">API Key Status</span>
            <div className="flex items-center space-x-2">
              {status?.hasApiKey ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : (
                <XCircle className="h-4 w-4 text-red-400" />
              )}
              <Badge variant={status?.hasApiKey ? "default" : "destructive"}>
                {status?.hasApiKey ? "Configured" : "Not Set"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Source</span>
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              {status?.source === 'api.json' ? 'Local Config' : 
               status?.source === 'environment' ? 'Environment' : 'None'}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Model</span>
            <span className="text-sm text-white">{config?.model || 'N/A'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Fallback</span>
            <Badge variant={status?.fallbackEnabled ? "default" : "secondary"}>
              {status?.fallbackEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* API Key Configuration */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Key className="h-4 w-4 mr-2" />
            Set Your API Key
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter your personal Gemini API key to use the service
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your Gemini API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-black/30 border-white/10 text-white placeholder:text-gray-500 pr-12"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <i className={`fas ${showApiKey ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
              </button>
            </div>
            
            <Button
              onClick={handleUpdateApiKey}
              disabled={updateApiKeyMutation.isPending || !apiKey.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
            >
              {updateApiKeyMutation.isPending ? 'Saving...' : 'Save API Key'}
            </Button>
          </div>

          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-2">How to get your API key:</h4>
            <ol className="text-xs text-gray-300 space-y-1">
              <li>1. Go to <span className="text-blue-400">https://aistudio.google.com/app/apikey</span></li>
              <li>2. Sign in with your Google account</li>
              <li>3. Click "Create API Key" button</li>
              <li>4. Copy the key and paste it above</li>
            </ol>
          </div>

          <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-amber-200 mb-2 flex items-center">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Security Notice
            </h4>
            <p className="text-xs text-amber-300">
              Your API key is stored locally in the api.json file and is not shared with other team members. 
              Keep your key private and never commit it to version control.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Model Configuration */}
      <Card className="bg-black/20 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Model Settings</CardTitle>
          <CardDescription className="text-gray-400">
            Current model configuration (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-300">Max Tokens</span>
              <div className="text-lg font-semibold text-white">{config?.maxTokens || 'N/A'}</div>
            </div>
            <div>
              <span className="text-sm text-gray-300">Temperature</span>
              <div className="text-lg font-semibold text-white">{config?.temperature || 'N/A'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}