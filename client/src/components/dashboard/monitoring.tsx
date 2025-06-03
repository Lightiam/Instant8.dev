import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export function Monitoring() {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Monitoring Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2 text-white">Monitoring Section</h3>
            <p className="text-slate-400">Real-time monitoring dashboard and alerts</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
