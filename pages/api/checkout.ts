import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
const stripe = new Stripe(stripeSecretKey, { apiVersion: "2020-08-27" });nst 
/**
 * This endpoint creates a Stripe Checkout Session and automatically adds
 * a 3% surcharge to the base amount provided via the `amount` query parameter.
 * Only applies the surcharge to credit card transactions by including it in the
 * checkout amount. Debit cards and other payment methods may not be surcharged,
 * but Stripe will still charge the total amount.
 *
 * Query parameters:
 * - amount: The base amount you wish to receive (in USD, as a decimal).
 * - name: A short description of what the customer is paying for.
 *
 * Environment variables:
 * - NEXT_PUBLIC_SUCCESS_URL: URL to redirect upon successful payment.
 * - NEXT_PUBLIC_CANCEL_URL: URL to redirect if the payment is cancelled.
 * - NEXT_PUBLIC_CURRENCY: (Optional) currency code, defaults to 'usd'.
 *
 * Example: /api/checkout?amount=100.00&name=Donation
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { amount, name = "Payment" } = req.query;
  const baseAmount = parseFloat(String(amount));
  if (isNaN(baseAmount) || baseAmount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const surchargePercent = 0.03;
  const totalAmount = baseAmount * (1 + surchargePercent);
  const unitAmount = Math.round(totalAmount * 100);
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "usd";

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: unitAmount,
            product_data: {
              name: String(name),
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url:
        process.env.NEXT_PUBLIC_SUCCESS_URL || `${req.headers.origin}/success`,
      cancel_url:
        process.env.NEXT_PUBLIC_CANCEL_URL || `${req.headers.origin}/cancel`,
      payment_intent_data: {
        description: String(name),
        metadata: {
          base_amount: baseAmount.toFixed(2),
          surcharge_rate: surchargePercent.toString(),
          total_amount: (unitAmount / 100).toFixed(2),
        },
      },
    });
    return res.status(302).setHeader("Location", session.url || "").end();
  } catch (error: any) {
    console.error("Error creating checkout session", error);
    return res
      .status(500)
      .json({ error: "Error creating checkout session", details: error.message });
  }
}
