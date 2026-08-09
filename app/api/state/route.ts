import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { workspaceState } from "../../../db/schema";

function validKey(value: string | null) {
  return Boolean(value && /^[a-z0-9_-]{1,64}$/i.test(value));
}

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!validKey(key)) {
    return Response.json({ error: "必须提供有效的状态键。" }, { status: 400 });
  }

  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(workspaceState)
      .where(eq(workspaceState.key, key!))
      .limit(1);

    return Response.json({
      key,
      value: row ? JSON.parse(row.value) : null,
      updatedAt: row?.updatedAt ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法读取工作区状态。";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as { key?: string; value?: unknown };
    if (!validKey(payload.key ?? null)) {
      return Response.json({ error: "必须提供有效的状态键。" }, { status: 400 });
    }

    const encoded = JSON.stringify(payload.value);
    if (encoded.length > 200_000) {
      return Response.json({ error: "工作区状态数据过大。" }, { status: 413 });
    }

    const db = getDb();
    const now = new Date();
    await db
      .insert(workspaceState)
      .values({ key: payload.key!, value: encoded, updatedAt: now })
      .onConflictDoUpdate({
        target: workspaceState.key,
        set: { value: encoded, updatedAt: now },
      });

    return Response.json({ ok: true, updatedAt: now });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法保存工作区状态。";
    return Response.json({ error: message }, { status: 500 });
  }
}
