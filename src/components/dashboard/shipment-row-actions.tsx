"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteShipment } from "@/app/dashboard/actions";
import type { Shipment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ShipmentDialog } from "@/components/dashboard/shipment-dialog";

export function ShipmentRowActions({ shipment }: { shipment: Shipment }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleDelete() {
    if (!window.confirm("Delete this shipment?")) return;

    setIsDeleting(true);
    const result = await deleteShipment(shipment.id);
    setIsDeleting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Shipment deleted");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <ShipmentDialog
        shipment={shipment}
        trigger={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Edit shipment"
            className="text-muted-foreground hover:text-foreground"
          >
            <Pencil />
          </Button>
        }
      />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Delete shipment"
        className="text-muted-foreground hover:text-destructive"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 />
      </Button>
    </div>
  );
}
