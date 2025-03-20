import { NextRequest, NextResponse } from 'next/server';
import { envData } from '@/environment';
import axios from "axios";


export const dynamic = "force-dynamic"; // Ensures this API runs dynamically

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
  console.log("Request body:", req.body);
    try {
        const requestData = await req.json(); // This requires dynamic processing

        const { 
          partner_id, 
          account_id, 
          payment_method_types
        } = requestData;

        if (!partner_id || !account_id || !payment_method_types) {
          return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
          );
        }

        const apiKey = partnerApiKeys[partner_id];
    
        if (!apiKey) {
          return NextResponse.json(
            { error: 'Invalid partner ID' },
            { status: 400 }
          );
        }
        

        const response = await axiosInstance.post(
            `${envData.baseUrl}/payment_method_intents`,
            requestData,
            {
                headers: {
                    "x-api-key": apiKey,
                    "x-account-id": requestData.account_id,
                },
            }
        );

        console.log("Payment method intent created:", response.data);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error("Error creating payment method intent:", error);
        return NextResponse.json(
            { error: "Failed to create payment method intent" },
            { status: 500 }
        );
    }
}



