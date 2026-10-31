import { env } from "cloudflare:workers";
import { getChatGPTUser } from "@/app/chatgpt-auth";

const ADMIN = "c7609chj8@gmail.com";
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/x-hwp": "hwp",
  "application/haansofthwp": "hwp",
  "application/vnd.hancom.hwp": "hwp",
  "application/vnd.hancom.hwpx": "hwpx",
};

const typesByExtension: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  hwp: "application/x-hwp",
  hwpx: "application/vnd.hancom.hwpx",
};

function originalFileName(req: Request) {
  try {
    return decodeURIComponent(req.headers.get("x-file-name") ?? "")
      .split(/[\\/]/)
      .pop()!
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .slice(0, 120);
  } catch {
    return "";
  }
}

function hasSignature(bytes: Uint8Array, ext: string) {
  const starts = (...values: number[]) =>
      values.every((value, index) => bytes[index] === value),
    text = (start: number, length: number) =>
      String.fromCharCode(...bytes.slice(start, start + length));
  if (ext === "jpg") return starts(0xff, 0xd8, 0xff);
  if (ext === "png")
    return starts(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  if (ext === "gif") return ["GIF87a", "GIF89a"].includes(text(0, 6));
  if (ext === "webp") return text(0, 4) === "RIFF" && text(8, 4) === "WEBP";
  if (ext === "pdf") return text(0, 5) === "%PDF-";
  if (ext === "doc" || ext === "hwp")
    return starts(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1);
  if (ext === "docx" || ext === "hwpx")
    return (
      starts(0x50, 0x4b, 0x03, 0x04) ||
      starts(0x50, 0x4b, 0x05, 0x06) ||
      starts(0x50, 0x4b, 0x07, 0x08)
    );
  return false;
}

export async function POST(req: Request) {
  const user = await getChatGPTUser();
  if (user?.email.toLowerCase() !== ADMIN)
    return Response.json(
      { error: "관리자 로그인이 만료되었습니다. 다시 로그인해 주세요." },
      { status: 403 },
    );

  const name = originalFileName(req),
    requestedType = (req.headers.get("content-type") ?? "").split(";")[0],
    nameExtension = name.split(".").pop()?.toLowerCase() ?? "",
    type = extensions[requestedType]
      ? requestedType
      : (typesByExtension[nameExtension] ?? ""),
    ext = extensions[type],
    buffer = await req.arrayBuffer(),
    bytes = new Uint8Array(buffer);
  if (!ext)
    return Response.json(
      { error: "JPG, PNG, WEBP, GIF, PDF, HWP, HWPX, DOC, DOCX 파일만 올릴 수 있습니다." },
      { status: 400 },
    );
  if (!bytes.byteLength)
    return Response.json({ error: "파일을 선택해 주세요." }, { status: 400 });
  if (bytes.byteLength > 20 * 1024 * 1024)
    return Response.json(
      { error: "파일 용량이 너무 큽니다. 20MB 이하 파일을 선택해 주세요." },
      { status: 413 },
    );
  if (!hasSignature(bytes, ext))
    return Response.json(
      { error: "파일 형식과 실제 내용이 일치하지 않습니다." },
      { status: 400 },
    );

  try {
    const folder = type.startsWith("image/") ? "images" : "files",
      key = `${folder}/${crypto.randomUUID()}.${ext}`;
    await env.BUCKET.put(key, buffer, {
      httpMetadata: {
        contentType: type,
        cacheControl: "public, max-age=31536000",
      },
      customMetadata: name ? { originalName: encodeURIComponent(name) } : {},
    });
    return Response.json({ url: `/api/media?key=${encodeURIComponent(key)}` });
  } catch {
    return Response.json(
      {
        error: "파일 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (
    !key ||
    !/^(images\/[a-z0-9-]+\.(jpg|png|webp|gif)|files\/[a-z0-9-]+\.(pdf|hwp|hwpx|doc|docx))$/.test(
      key,
    )
  )
    return new Response("Not found", { status: 404 });
  const obj = await env.BUCKET.get(key);
  if (!obj) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  if (key.startsWith("files/")) {
    let name = key.split("/")[1];
    try {
      name = decodeURIComponent(obj.customMetadata?.originalName ?? name);
    } catch {}
    name = name.replace(/[\r\n"\\]/g, "").slice(0, 120);
    const disposition = key.endsWith(".pdf") ? "inline" : "attachment";
    headers.set(
      "content-disposition",
      `${disposition}; filename="download.${key.split(".").pop()}"; filename*=UTF-8''${encodeURIComponent(name)}`,
    );
  }
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(obj.body, { headers });
}
