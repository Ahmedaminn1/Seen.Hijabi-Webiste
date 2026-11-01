"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/actions/products";
import type { DbOrderStatus, DbPaymentStatus } from "@/types";

/**
 * Server Action: Update Order Status
 * If the status is changed to CANCELLED, restores inventory safely and idempotently.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: DbOrderStatus
): Promise<ActionResult> {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) throw new Error("Order not found");

      // Idempotent inventory restoration on cancellation
      if (
        newStatus === "CANCELLED" &&
        order.isInventoryDeducted &&
        !order.isInventoryRestored
      ) {
        for (const item of order.items) {
          if (item.variantId) {
            await tx.inventory.updateMany({
              where: { variantId: item.variantId },
              data: {
                quantity: { increment: item.quantity },
              },
            });
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: {
            orderStatus: newStatus,
            isInventoryRestored: true,
          },
        });
      } else {
        await tx.order.update({
          where: { id: orderId },
          data: { orderStatus: newStatus },
        });
      }
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin/inventory");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "تعذر تحديث حالة الطلب" };
  }
}

/**
 * Server Action: Update Payment Status (for Cash on Delivery verification)
 */
export async function updatePaymentStatus(
  orderId: string,
  newPaymentStatus: DbPaymentStatus
): Promise<ActionResult> {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: newPaymentStatus },
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { success: false, error: "تعذر تحديث حالة الدفع" };
  }
}
