import { NextResponse } from "next/server";
import { db } from "../../db";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    // Get the privy-token
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

    // Decode the JWT and extract the user's outsideId
    const decoded = jwt.decode(privyToken) as { sub: string };
    const outsideId = decoded.sub;

    // Find the user
    const user = await db.user.findUnique({
      where: { outsideId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse the request body to get fileName, fileData, and imageType
    const { fileName, fileData, imageType } = await request.json();

    // Validate imageType
    if (!["PROFILE", "GALLERY"].includes(imageType)) {
      return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
    }

    // Use Walrus to upload the file
    const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
    const response = await fetch(`${PUBLISHER}/v1/store?epochs=5`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream", // Specify as binary stream
      },
      body: Buffer.from(fileData, 'base64'), // Convert base64 to binary data for upload
    });

    // Check if the upload was successful
    if (!response.ok) {
      const errorText = await response.text(); // Get the error details
      throw new Error(`Failed to upload file to Walrus: ${errorText}`);
    }

    const result = await response.json();
    console.log("upload result", result);
    // Extract blobId from the result
    const blobId = result.newlyCreated?.blobObject?.blobId;

    if (!response.ok || !blobId) {
      throw new Error(`No blobId returned from Walrus. Response: ${JSON.stringify(result)}`);
    }

    // Construct the complete URL
    const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
    const fileUrl = `${AGGREGATOR}/v1/${blobId}`;

    // If imageType is PROFILE, update the previous PROFILE image to GALLERY
    if (imageType === "PROFILE") {
      await db.image.updateMany({
        where: {
          userId: user.id,
          imageType: "PROFILE",
        },
        data: {
          imageType: "GALLERY",
        },
      });
    }

    // Create a new Image record in the database
    const image = await db.image.create({
      data: {
        userId: user.id,
        imageUrl: fileUrl, // Store the complete URL
        imageType,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Error uploading file or creating image record:", error);
    return NextResponse.json(
      { error: "Failed to upload file or create image record" },
      { status: 500 }
    );
  }
}
