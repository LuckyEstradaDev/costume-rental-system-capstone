import {Card, CardContent, CardHeader} from "@/components/ui/card";
import React from "react";

export default function OutfitAnalytics() {
  return (
    <>
      <div className="flex flex-row w-full gap-5">
        <Card className="w-full">
          <CardHeader>Total Outfits</CardHeader>
          <CardContent>
            <span>20</span>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>Total Outfits</CardHeader>
          <CardContent>
            <span>20</span>
          </CardContent>
        </Card>
        <Card className="w-full">
          <CardHeader>Total Outfits</CardHeader>
          <CardContent>
            <span>20</span>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
