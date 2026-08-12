"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createShipment, updateShipment } from "@/app/dashboard/actions";
import { COURIERS } from "@/lib/couriers";
import {
  SHIPMENT_STATUSES,
  type Shipment,
  type ShipmentStatus,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ShipmentDialog({
  shipment,
  trigger,
}: {
  /** Pass a shipment to edit; omit to create a new one. */
  shipment?: Shipment;
  trigger: React.ReactElement;
}) {
  const router = useRouter();
  const isEdit = Boolean(shipment);

  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [trackingNumber, setTrackingNumber] = React.useState(
    shipment?.tracking_number ?? ""
  );
  const [courier, setCourier] = React.useState(shipment?.courier ?? "");
  const [nickname, setNickname] = React.useState(shipment?.nickname ?? "");
  const [status, setStatus] = React.useState<ShipmentStatus>(
    shipment?.status ?? "pending"
  );

  function reset() {
    setTrackingNumber(shipment?.tracking_number ?? "");
    setCourier(shipment?.courier ?? "");
    setNickname(shipment?.nickname ?? "");
    setStatus(shipment?.status ?? "pending");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = isEdit
      ? await updateShipment(shipment!.id, {
          trackingNumber,
          courier,
          nickname,
          status,
        })
      : await createShipment({ trackingNumber, courier, nickname });

    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Shipment updated" : "Shipment added");
    setOpen(false);
    reset();
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={trigger} />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit shipment" : "Add shipment"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details or status of this shipment."
              : "Track a new package. You can change the status later."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="tracking-number">Tracking number</Label>
            <Input
              id="tracking-number"
              name="trackingNumber"
              placeholder="e.g. 1Z999AA10123456784"
              required
              maxLength={64}
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Courier</Label>
            <Select value={courier} onValueChange={(value) => setCourier(value ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a courier" />
              </SelectTrigger>
              <SelectContent>
                {COURIERS.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="nickname">
              Nickname <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="nickname"
              name="nickname"
              placeholder="e.g. Gift for Mom"
              maxLength={120}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {isEdit && (
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus((value ?? "pending") as ShipmentStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHIPMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <DialogTrigger render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogTrigger>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add shipment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
