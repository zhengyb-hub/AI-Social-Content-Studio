import type { MessagingStrategy, Solution, Stakeholder } from "./echoflow";

export type GenerationRequest = {
  solution?: Solution;
  stakeholder?: Stakeholder;
  strategy?: MessagingStrategy;
  requestedMode?: "demo" | "api";
};

export function isGenerationRequest(body: GenerationRequest): body is Required<Pick<GenerationRequest, "solution" | "stakeholder" | "strategy">> & GenerationRequest {
  return Boolean(
    body.solution?.solution_id && body.solution.solution_name && body.solution.short_description &&
    body.stakeholder?.stakeholder_id && body.stakeholder.name &&
    body.strategy?.core_value_proposition && body.strategy.content_type,
  );
}

export function demoFallbackReason(requestedMode: "demo" | "api" | undefined, apiKey: string | undefined) {
  if (requestedMode !== "api") return "demo_requested";
  return apiKey ? null : "missing_api_key";
}
