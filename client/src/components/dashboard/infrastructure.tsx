import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server } from "lucide-react";

export function Infrastructure() {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Infrastructure Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Server className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2 text-white">Infrastructure Section</h3>
            <p className="text-slate-400">Infrastructure monitoring and management interface</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
