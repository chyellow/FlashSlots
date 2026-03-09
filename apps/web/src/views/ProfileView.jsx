import React from 'react'
import { ArrowLeft } from "lucide-react";
import { useParams, Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export function ProfileView() {
    const { username } = useParams();

  return (
    <div>ProfileView
        <h1>Welcome, {username}!</h1>
    
        <Button
        asChild
        variant="outline"
        className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground">
        <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
        </Link>
        </Button>
    </div>
  );
}

export default ProfileView;