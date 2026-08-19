import {
  putRecord,
  getAllRecords,
  enqueueSync,
  getOfflineSession,
} from "@/lib/offline/offlineDB";
import { recordPaymentAction } from "@/app/actions/paymentActions";

export class PaymentRepository {
  /**
   * Fetch all payment receipts
   */
  static async getPayments(tenantId?: string): Promise<any[]> {
    return await getAllRecords<any>("payments", tenantId);
  }

  /**
   * Create payment receipt with optimistic local write & outbox queue
   */
  static async createReceipt(formData: {
    studentId: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
  }): Promise<{ success: boolean; receipt?: any; error?: string }> {
    const isOnline = typeof window !== "undefined" ? navigator.onLine : false;
    const session = await getOfflineSession();
    const tenantId = session?.tenantId || "default";
    const userId = session?.id || "admin";

    const operationId = `op_pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const receiptNumber = `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const receiptId = `rcp_local_${Date.now()}`;

    const receiptRecord = {
      id: receiptId,
      tenantId,
      studentId: formData.studentId,
      receiptNumber,
      amount: Number(formData.amount),
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: formData.paymentMethod || "CASH",
      notes: formData.notes || "سند قبض مالي",
      receivedByUserId: userId,
      createdAt: new Date().toISOString(),
    };

    // 1. Optimistic immediate local write (0ms)
    await putRecord("payments", receiptRecord);
    await putRecord("paymentsLocal", receiptRecord);

    // 2. If Online, attempt immediate server submission
    if (isOnline) {
      try {
        const res: any = await recordPaymentAction(formData as any);
        if (res.success && res.receipt) {
          await putRecord("payments", res.receipt);
          return { success: true, receipt: res.receipt };
        }
      } catch (err) {
        console.warn("Online payment creation failed, enqueuing for background sync:", err);
      }
    }

    // 3. Enqueue for background sync
    await enqueueSync("PAYMENT", "CREATE", { ...receiptRecord, operationId }, tenantId, userId);

    return {
      success: true,
      receipt: receiptRecord,
    };
  }
}
