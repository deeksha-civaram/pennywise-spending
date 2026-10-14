import { request } from "./apiClient";

type WalletWiseResponse = {
  answer: string;
};

export async function askWalletWise(question: string): Promise<string> {
  const response = await request<WalletWiseResponse>(
    "POST",
    "/walletwise/ask",
    { question },
  );

  return response.answer;
}
