"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiSuccess, Transaction } from "@/types";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Transaction[]>>("/api/v1/transactions");
      return res.data.data;
    },
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Transaction>>(`/api/v1/transactions/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    // Poll while the transaction is still settling so the receipt page
    // updates itself once the webhook confirms payment.
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "pending" || status === "processing" ? 3000 : false;
    },
  });
}

interface CreateTransactionInput {
  service_id: string;
  recipient_number: string;
  amount_npr: number;
  currency: string;
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      const res = await apiClient.post<ApiSuccess<Transaction>>("/api/v1/transactions", input);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: async (transactionId: string) => {
      const res = await apiClient.post<ApiSuccess<{ redirect_url: string }>>(
        "/api/v1/payment/initiate",
        { transaction_id: transactionId }
      );
      return res.data.data.redirect_url;
    },
  });
}

// Dev-only analogue of the CyberSource webhook. Used when the backend runs with
// PAYMENT_BYPASS_CS=true: the initiate response's redirect_url carries a
// `?bypass=1` flag, and instead of redirecting to an external gateway we call
// this to mark the transaction paid and kick off delivery (Khalti fulfillment).

