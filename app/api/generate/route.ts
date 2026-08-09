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
  try { body = await request.json() as GenerationRequest; } catch { return Response.json({ error: "A valid JSON request is required." }, { status: 400 }); }
  if (!isGenerationRequest(body)) return Response.json({ error: "Solution, stakeholder and messaging strategy are required." }, { status: 400 });

  const demo = generateDemoCopy(body.solution, body.stakeholder, body.strategy);
  const runtime = env as unknown as Record<string, string | undefined>;
  const apiKey = runtime.OPENAI_API_KEY;
  const fallbackReason = demoFallbackReason(body.requestedMode, apiKey);
  if (fallbackReason) return Response.json({ ...demo, mode: "demo", fallbackReason });

  const prompt = `Create one ${body.strategy.content_type} for a ${body.stakeholder.name}.

SUPPLIED SOLUTION FACTS
${JSON.stringify(body.solution, null, 2)}

SUPPLIED STAKEHOLDER PROFILE
${JSON.stringify(body.stakeholder, null, 2)}

USER-REVIEWED MESSAGING STRATEGY
${JSON.stringify(body.strategy, null, 2)}

Rules:
- Use only facts explicitly present above.
- Do not invent statistics, government partnerships, client cases, technical capabilities or deployment claims.
- Separate supplied facts from generated marketing language.
- Include an evidence note when the supplied source is a fictional demo record.
- Return JSON only with two string properties: "title" and "content".`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: runtime.OPENAI_MODEL || "gpt-5.6-luna", input: prompt, reasoning: { effort: "low" }, text: { verbosity: "medium" }, max_output_tokens: 1400 }),
    });
    if (!response.ok) return Response.json({ ...demo, mode: "demo", fallbackReason: `api_${response.status}` });
    const text = extractText(await response.json());
    const parsed = JSON.parse(text.replace(/^```json\s*|\s*```$/g, "")) as { title?: string; content?: string };
    if (!parsed.title?.trim() || !parsed.content?.trim()) throw new Error("Incomplete model output");
    return Response.json({ title: parsed.title.trim(), content: parsed.content.trim(), mode: "api" });
  } catch {
    return Response.json({ ...demo, mode: "demo", fallbackReason: "api_error" });
  }
}
