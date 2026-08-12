"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ShipmentDialog } from "@/components/dashboard/shipment-dialog";

export function AddShipmentButton() {
  return (
    <ShipmentDialog
      trigger={
        <Button>
          <Plus data-icon="inline-start" />
          Add Shipment
        </Button>
      }
    />
  );
}
