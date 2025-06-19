import React from "react";
import { Construction, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <Construction className="h-16 w-16 text-orange-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Admin Dashboard Coming Soon
        </h1>
        <p className="text-gray-600 mb-8">
          The admin dashboard is currently under development. Follow us on
          Instagram for updates!
        </p>
        <div className="space-y-4">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-3 flex items-center gap-2 mx-auto"
            onClick={() =>
              window.open(
                "https://www.instagram.com/ceylonexpress_se/",
                "_blank",
              )
            }
          >
            <Instagram className="h-5 w-5" />
            Follow Us on Instagram
          </Button>
          <Button
            variant="outline"
            className="border-gray-600 text-gray-600 hover:bg-gray-100 rounded-full px-6"
            onClick={() => (window.location.href = "/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
