import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function HomeView() {
  return (
    <div className="w-full flex items-center justify-start flex-col gap-8 pt-24">
      
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">FlashSlots</h1>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-6 mt-4">
        <Button asChild size="lg" className="w-48 text-md">
          <Link to="/vendor">
            Vendor Portal
          </Link>
        </Button>
        
        <Button asChild variant="outline" size="lg" className="w-48 text-md">
          <Link to="/client">
            Client Portal
          </Link>
        </Button>
      </div>

    </div>
  );
}

export default HomeView