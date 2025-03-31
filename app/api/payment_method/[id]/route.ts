import { NextResponse } from 'next/server';
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

  export async function GET(
    request: Request,
    { params }: { params: { id: string } }
  ) {
  try {
    const { searchParams } = new URL(request.url);
    const partner_id = searchParams.get('partner_id');
    const account_id = searchParams.get('account_id');

    const id = params.id;
  
    if (!id ) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const apiKey = partnerApiKeys[partner_id ?? ""];
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Invalid partner ID' },
        { status: 400 }
      );
    }


    const response = await axiosInstance.get(
        `${envData.baseUrl}/payment_methods/${id}`,
        {
            headers: {
              "x-api-key": apiKey,
              "x-account-id": account_id
            }
          }
    );
    console.log("Payment method retrieved:", response.data);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error retrieving payment method:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment method' },
      { status: 500 }
    );
  }
  }