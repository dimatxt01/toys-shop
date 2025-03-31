import { NextRequest, NextResponse } from 'next/server';
import { envData } from '@/environment';
import axios from "axios";


const axiosInstance = axios.create({
    //@ts-ignore
    proxy:
      process.env.USE_PROXY === "true"
        ? {
            protocol: process.env.PROXY_PROTOCOL,
            host: process.env.PROXY_HOST,
            port: Number(process.env.PROXY_PORT),
            auth: {
              username: process.env.PROXY_USERNAME,
              password: process.env.PROXY_PASSWORD,
            },
          }
        : false,
  });

  const partnerApiKeys: Record<string, string> = JSON.parse(
    process.env.PARTNER_API_KEYS || "{}"
  );

  export async function POST(req: NextRequest) {
    try {
      const requestData = await req.json();
     
      const partner_id = requestData.partner_id;
      const accountId = requestData.account_id;
      const paymentMethodId = requestData.payment_method_id;
      const paymentIntentId = requestData.payment_intent_id;
      const apiKey = partnerApiKeys[partner_id];

      if (!apiKey) {
        return NextResponse.json(
          { error: 'Invalid partner ID' },
          { status: 400 }
        );
      }

      const response = await axiosInstance.post(
        // @ts-ignore
        `${envData.baseUrl}/payment_intents/${paymentIntentId}/payments`,
        { payment_method_id: paymentMethodId },
        {
          headers: {
            "x-api-key": apiKey,
            "x-account-id": accountId,
          },
        },
      );
      console.log("Post Payments Response", response.data);
      return NextResponse.json(response.data);
    }catch (error) {
        console.error("Error creating payment intent:", error);
        return NextResponse.json(
            { error: "Failed to create payment intent" },
            { status: 500 }
        );
    }

  }