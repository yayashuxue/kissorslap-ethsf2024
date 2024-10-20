import { NextResponse } from "next/server";
import { db } from "@/app/db"; // Adjust the path to your Prisma client
import jwt from "jsonwebtoken"; // Ensure you have jwt for decoding tokens

export async function POST(request: Request) {
  try {
    // Extract token from cookies
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

    // Decode the token to get the outsideId
    const decoded = jwt.decode(privyToken) as { sub: string };
    const outsideId = decoded.sub;

    // Find the user in the database
    const user = await db.user.findUnique({
      where: { outsideId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse the request body
    const { transactionId, points } = await request.json();

    // Logic to credit points to the user's account
    await db.user.update({
      where: { outsideId },
      data: {
        points: {
          increment: points,
        },
      },
    });

    return NextResponse.json({ message: 'Points credited successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating user points:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
