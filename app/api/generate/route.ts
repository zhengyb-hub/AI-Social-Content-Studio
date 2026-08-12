import { env } from "cloudflare:workers";
import { generateDemoCopy } from "../../lib/echoflow";
import { demoFallbackReason, GenerationRequest, isGenerationRequest } from "../../lib/generation";


function extractText(payload: unknown) {
  const response = payload as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (response.output_text) return response.output_text;
  return response.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("\n") ?? "";
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "不允许跨站调用生成接口。" }, { status: 403, headers: { "cache-control": "no-store" } });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 64_000) return Response.json({ error: "生成请求数据过大。" }, { status: 413, headers: { "cache-control": "no-store" } });
  let body: GenerationRequest;
  try { body = await request.json() as GenerationRequest; } catch { return Response.json({ error: "请求必须包含有效的 JSON 数据。" }, { status: 400, headers: { "cache-control": "no-store" } }); }
  if (!isGenerationRequest(body)) return Response.json({ error: "必须提供有效的解决方案、关键角色、活动、渠道、品牌和信息策略。" }, { status: 400, headers: { "cache-control": "no-store" } });

  const demo = generateDemoCopy(body.solution, body.stakeholder, body.strategy, body.brand, body.channel);
  const runtime = env as unknown as Record<string, string | undefined>;
  const apiKey = runtime.OPENAI_API_KEY;
  const fallbackReason = demoFallbackReason(body.requestedMode, apiKey);
  if (fallbackReason) return Response.json({ ...demo, mode: "demo", fallbackReason }, { headers: { "cache-control": "no-store" } });

  const instructions = `你是 EchoFlow 的企业内容策略助手。你的任务是根据经过审核的输入，创作简体中文营销内容。
必须遵守：只使用输入中的事实；不得虚构统计数据、客户案例、政府合作、生产部署或技术能力；保持品牌语气；避开禁用词；保留必要免责声明；用适合指定渠道和受众的结构表达。`;
  const input = JSON.stringify({
    task: `为“${body.campaign.campaign_name}”活动创作“${body.strategy.content_type}”，投放渠道为“${body.channel}”。`,
    solution: body.solution,
    stakeholder: body.stakeholder,
    campaign: body.campaign,
    strategy: body.strategy,
    brand: body.brand,
  });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: AbortSignal.timeout(30_000),
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: runtime.OPENAI_MODEL || "gpt-5.6-luna",
        instructions,
        input,
        reasoning: { effort: "low" },
        text: {
          verbosity: "medium",
          format: {
            type: "json_schema",
            name: "marketing_asset",
            strict: true,
            schema: {
              type: "object",
              properties: { title: { type: "string" }, content: { type: "string" } },
              required: ["title", "content"],
              additionalProperties: false,
            },
          },
        },
        max_output_tokens: 1600,
        store: false,
      }),
    });
    if (!response.ok) return Response.json({ ...demo, mode: "demo", fallbackReason: `api_${response.status}` }, { headers: { "cache-control": "no-store" } });
    const text = extractText(await response.json());
    const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, "")) as { title?: string; content?: string };
    if (!parsed.title?.trim() || !parsed.content?.trim()) throw new Error("模型输出不完整");
    return Response.json({ title: parsed.title.trim(), content: parsed.content.trim(), mode: "api" }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ ...demo, mode: "demo", fallbackReason: "api_error" }, { headers: { "cache-control": "no-store" } });
  }
}
