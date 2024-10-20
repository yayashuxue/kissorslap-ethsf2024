import { NextResponse } from "next/server";
import { db } from "../../db";
import jwt from "jsonwebtoken";
import { Coinbase, Wallet } from "@coinbase/coinbase-sdk";
import my_seed from "../../../my_seed.json";
export async function POST(request: Request) {
  try {
    // Retrieve privy-token from cookies
    const cookiesHeader = request.headers.get("cookie");
    const privyToken = cookiesHeader
      ? cookiesHeader
          .split("; ")
          .find((cookie) => cookie.startsWith("privy-token="))
          ?.split("=")[1]
      : null;

    if (!privyToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Decode JWT to get user's outsideId
    const decoded = jwt.decode(privyToken) as { sub: string };
    const outsideId = decoded.sub;

    // Find user in the database
    const user = await db.user.findUnique({
      where: { outsideId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request body to get withdrawal details
    const { chain, amount, address } = await request.json();

    // Validate input
    if (!chain || !amount || !address) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Check if user has enough points
    if (user.points < amount) {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 });
    }

    // Process the withdrawal 
    console.log(`Processing withdrawal: ${amount} points to ${address} on ${chain}`);

    Coinbase.configureFromJson({ filePath: '/Users/jingyushi/project/kissorslap-ethsf-2024/api_keys/cdp_api_key.json' });

    // Get the unhydrated wallet from the server.
    const fetchedWallet = await Wallet.fetch(Object.keys(my_seed)[0]);

    // You can now load the seed into the wallet from the local file.
    // fetchedWallet will be equivalent to importedWallet.
    await fetchedWallet.loadSeed("/Users/jingyushi/project/kissorslap-ethsf-2024/my_seed.json");

    console.log(fetchedWallet);

    // Deduct points from user's account
    await db.user.update({
      where: { id: user.id },
      data: { points: user.points - amount },
    });

    // Return a success response
    return NextResponse.json({ message: 'Withdrawal processed successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal" },
      { status: 500 }
    );
  }
}
