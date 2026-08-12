"use server";

import { revalidatePath } from "next/cache";

import { COURIERS } from "@/lib/couriers";
import { createClient } from "@/lib/supabase/server";
import {
  SHIPMENT_STATUSES,
  type NewShipmentInput,
  type ShipmentStatus,
  type UpdateShipmentInput,
} from "@/lib/types";

export type ActionResult = { error: string | null };

const MAX_LENGTHS = {
  trackingNumber: 64,
  nickname: 120,
  courier: 64,
} as const;

function clean(value: string, max: number) {
  return value.trim().slice(0, max);
}

function isCourier(value: string): boolean {
  return (COURIERS as readonly string[]).includes(value);
}

function isStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUSES as readonly string[]).includes(value);
}

/** Inserts a shipment owned by the signed-in user (RLS enforced). */
export async function createShipment(
  input: NewShipmentInput
): Promise<ActionResult> {
  const trackingNumber = clean(input.trackingNumber, MAX_LENGTHS.trackingNumber);
  const courier = clean(input.courier, MAX_LENGTHS.courier);
  const nickname = clean(input.nickname, MAX_LENGTHS.nickname);

  if (!trackingNumber) {
    return { error: "Tracking number is required." };
  }
  if (!isCourier(courier)) {
    return { error: "Please choose a courier from the list." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You need to be signed in." };
  }

  const { error } = await supabase.from("shipments").insert({
    user_id: user.id,
    tracking_number: trackingNumber,
    courier,
    nickname: nickname || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

/** Updates one of the user's own shipments (RLS enforced). */
export async function updateShipment(
  id: string,
  input: UpdateShipmentInput
): Promise<ActionResult> {
  const trackingNumber = clean(input.trackingNumber, MAX_LENGTHS.trackingNumber);
  const courier = clean(input.courier, MAX_LENGTHS.courier);
  const nickname = clean(input.nickname, MAX_LENGTHS.nickname);

  if (!trackingNumber) {
    return { error: "Tracking number is required." };
  }
  if (!isCourier(courier)) {
    return { error: "Please choose a courier from the list." };
  }
  if (!isStatus(input.status)) {
    return { error: "Invalid status." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("shipments")
    .update({
      tracking_number: trackingNumber,
      courier,
      nickname: nickname || null,
      status: input.status,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}

/** Deletes one of the user's own shipments (RLS enforced). */
export async function deleteShipment(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.from("shipments").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { error: null };
}
