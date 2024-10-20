import { NextRequest, NextResponse } from 'next/server';
import { createRequest, fetchOnrampRequest } from "../helpers";

export async function POST(request: NextRequest) {
  try {
    const request_method = "POST";
    const { url, jwt } = await createRequest({
      request_method,
      request_path: "/onramp/v1/token",
    });
    const reqBody = await request.json();
    console.log("Request body:", reqBody);

    const body = {
      destination_wallets: [
        {
          address: reqBody.ethAddress,
          blockchains: reqBody.blockchains || ["base", "ethereum"],
        },
      ],
    };
    console.log("Onramp API request body:", body);

    const response = await fetchOnrampRequest({
      request_method,
      url,
      jwt,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Onramp API error response:", errorText);
      throw new Error(`Onramp API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in secure-token API route:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
