"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function AddShipmentButton() {
  return (
    <Button
      onClick={() =>
        toast.info("Coming in Track 2", {
          description:
            "Shipment creation is next on the roadmap. This button is a placeholder for now.",
        })
      }
    >
      <Plus data-icon="inline-start" />
      Add Shipment
    </Button>
  );
}
