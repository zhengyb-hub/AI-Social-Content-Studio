import { env } from "cloudflare:workers";
import { generateDemoCopy } from "../../lib/echoflow";
import { demoFallbackReason, GenerationRequest, isGenerationRequest } from "../../lib/generation";


function extractText(payload: unknown) {
  const response = payload as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (response.output_text) return response.output_text;
  return response.output?.flatMap((item) => item.content ?? []).filter((item) => item.type === "output_text").map((item) => item.text ?? "").join("\n") ?? "";
}

export async function POST(request: Request) {
  let body: GenerationRequest;
  try { body = await request.json() as GenerationRequest; } catch { return Response.json({ error: "请求必须包含有效的 JSON 数据。" }, { status: 400 }); }
  if (!isGenerationRequest(body)) return Response.json({ error: "必须提供解决方案、关键角色和信息策略。" }, { status: 400 });

  const demo = generateDemoCopy(body.solution, body.stakeholder, body.strategy);
  const runtime = env as unknown as Record<string, string | undefined>;
  const apiKey = runtime.OPENAI_API_KEY;
  const fallbackReason = demoFallbackReason(body.requestedMode, apiKey);
  if (fallbackReason) return Response.json({ ...demo, mode: "demo", fallbackReason });

  const prompt = `请面向“${body.stakeholder.name}”创作一份“${body.strategy.content_type}”。

已提供的解决方案事实
${JSON.stringify(body.solution, null, 2)}

已提供的关键角色画像
${JSON.stringify(body.stakeholder, null, 2)}

经用户审核的信息策略
${JSON.stringify(body.strategy, null, 2)}

规则：
- 仅使用上方明确提供的事实。
- 不得虚构统计数据、政府合作、客户案例、技术能力或部署情况。
- 明确区分已提供事实与生成的营销表达。
- 当来源为虚构演示记录时，必须附上证据说明。
- 只返回 JSON，且仅包含两个字符串字段："title" 和 "content"。`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: runtime.OPENAI_MODEL || "gpt-5.6-luna", input: prompt, reasoning: { effort: "low" }, text: { verbosity: "medium" }, max_output_tokens: 1400 }),
    });
    if (!response.ok) return Response.json({ ...demo, mode: "demo", fallbackReason: `api_${response.status}` });
    const text = extractText(await response.json());
    const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, "")) as { title?: string; content?: string };
    if (!parsed.title?.trim() || !parsed.content?.trim()) throw new Error("模型输出不完整");
    return Response.json({ title: parsed.title.trim(), content: parsed.content.trim(), mode: "api" });
  } catch {
    return Response.json({ ...demo, mode: "demo", fallbackReason: "api_error" });
  }
}
