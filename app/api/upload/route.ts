import { NextResponse } from "next/server";
import { db } from "../../db";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    // 获取 privy-token
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

    // 解析 JWT 并获取用户的 outsideId
    const decoded = jwt.decode(privyToken) as { sub: string };
    const outsideId = decoded.sub;

    // 查找用户
    const user = await db.user.findUnique({
      where: { outsideId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 解析请求体，获取文件名、文件数据和图片类型
    const { fileName, fileData, imageType } = await request.json();

    // 验证 imageType
    if (!["PROFILE", "GALLERY"].includes(imageType)) {
      return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
    }

    // 使用 Walrus 上传文件
    const PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
    const response = await fetch(`${PUBLISHER}/v1/store?epochs=5`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream", // 指定为二进制流
      },
      body: Buffer.from(fileData, 'base64'), // 将 base64 转换为二进制数据上传
    });

    // 检查上传是否成功
    if (!response.ok) {
      const errorText = await response.text(); // 获取错误详情
      throw new Error(`Failed to upload file to Walrus: ${errorText}`);
    }

    const result = await response.json();
    console.log("upload result", result);
    // 从 result 中获取 blobId
    const blobId = result.newlyCreated?.blobObject?.blobId;

    if (!response.ok || !blobId) {
      throw new Error(`No blobId returned from Walrus. Response: ${JSON.stringify(result)}`);
    }

    // 拼接完整的 URL
    const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
    const fileUrl = `${AGGREGATOR}/v1/${blobId}`;

    // 如果 imageType 是 PROFILE，更新之前的 PROFILE 图片为 GALLERY
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

    // 在数据库中创建新的 Image 记录
    const image = await db.image.create({
      data: {
        userId: user.id,
        imageUrl: fileUrl, // 存储完整的 URL
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
