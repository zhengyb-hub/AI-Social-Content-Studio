import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { workspaceState } from "../../../db/schema";
import { normaliseWorkspace } from "../../lib/echoflow";

const WORKSPACE_KEY = "solution-marketing-workspace";
function validKey(value: string | null) {
  return value === WORKSPACE_KEY;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
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
    }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "暂时无法读取工作区，请稍后重试。" }, { status: 500, headers: { "cache-control": "no-store" } });
  }
}

export async function PUT(request: Request) {
  try {
    if (!sameOrigin(request)) return Response.json({ error: "不允许跨站写入工作区。" }, { status: 403, headers: { "cache-control": "no-store" } });
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 1_000_000) return Response.json({ error: "工作区状态数据过大。" }, { status: 413, headers: { "cache-control": "no-store" } });
    const payload = (await request.json()) as { key?: string; value?: unknown; expectedUpdatedAt?: string | null };
    if (!validKey(payload.key ?? null)) {
      return Response.json({ error: "必须提供有效的状态键。" }, { status: 400 });
    }

    const workspace = normaliseWorkspace(payload.value);
    if (!workspace) return Response.json({ error: "工作区数据结构无效。" }, { status: 422, headers: { "cache-control": "no-store" } });
    const encoded = JSON.stringify(workspace);
    if (encoded.length > 1_000_000) {
      return Response.json({ error: "工作区状态数据过大。" }, { status: 413 });
    }

    const db = getDb();
    const [current] = await db.select().from(workspaceState).where(eq(workspaceState.key, payload.key!)).limit(1);
    const currentRevision = current?.updatedAt?.toISOString() ?? null;
    if (payload.expectedUpdatedAt !== undefined && payload.expectedUpdatedAt !== currentRevision) {
      return Response.json({ error: "工作区已被其他会话更新。", updatedAt: currentRevision }, { status: 409, headers: { "cache-control": "no-store" } });
    }
    const now = new Date();
    await db
      .insert(workspaceState)
      .values({ key: payload.key!, value: encoded, updatedAt: now })
      .onConflictDoUpdate({
        target: workspaceState.key,
        set: { value: encoded, updatedAt: now },
      });

    return Response.json({ ok: true, updatedAt: now }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "暂时无法保存工作区，请稍后重试。" }, { status: 500, headers: { "cache-control": "no-store" } });
  }
}
