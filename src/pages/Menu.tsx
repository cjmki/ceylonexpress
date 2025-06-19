import React from "react";
import { Construction, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

const Menu = () => {
  return (
    <div className="min-h-screen bg-ceylon-bg flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <Construction className="h-16 w-16 text-ceylon-accent mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-ceylon-text mb-4">
          Menu Coming Soon
        </h1>
        <p className="text-gray-600 mb-8">
          We're working on our delicious Sri Lankan menu. Follow us on Instagram
          for updates!
        </p>
        <div className="space-y-4">
          <Button
            className="bg-ceylon-accent hover:bg-ceylon-dark text-white rounded-full px-6 py-3 flex items-center gap-2 mx-auto"
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
            className="border-ceylon-text text-ceylon-text hover:bg-ceylon-light rounded-full px-6"
            onClick={() => (window.location.href = "/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Menu;
