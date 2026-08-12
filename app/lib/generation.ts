import type { BrandProfile, Campaign, MessagingStrategy, Solution, Stakeholder } from "./echoflow";

export type GenerationRequest = {
  solution?: Solution;
  stakeholder?: Stakeholder;
  strategy?: MessagingStrategy;
  brand?: BrandProfile;
  campaign?: Campaign;
  channel?: string;
  requestedMode?: "demo" | "api";
};

const safeText = (value: unknown, max: number) => typeof value === "string" && value.trim().length > 0 && value.length <= max;
const safeList = (value: unknown, maxItems = 12) => Array.isArray(value) && value.length <= maxItems && value.every((item) => safeText(item, 240));

export function isGenerationRequest(body: GenerationRequest): body is Required<Pick<GenerationRequest, "solution" | "stakeholder" | "strategy" | "brand" | "campaign" | "channel">> & GenerationRequest {
  return Boolean(
    safeText(body.solution?.solution_id, 64) && safeText(body.solution?.solution_name, 120) && safeText(body.solution?.short_description, 1200) &&
    safeList(body.solution?.key_capabilities) && safeList(body.solution?.business_value) &&
    safeText(body.stakeholder?.stakeholder_id, 64) && safeText(body.stakeholder?.name, 120) &&
    safeList(body.stakeholder?.goals) && safeList(body.stakeholder?.risk_concerns) &&
    safeText(body.strategy?.core_value_proposition, 1200) && safeText(body.strategy?.content_type, 80) &&
    safeList(body.strategy?.key_messages) && safeList(body.strategy?.supporting_proof_points) &&
    safeText(body.brand?.brand_name, 120) && safeText(body.brand?.positioning, 600) &&
    safeList(body.brand?.voice_traits) && safeList(body.brand?.preferred_terms) && safeList(body.brand?.blocked_terms) &&
    safeText(body.campaign?.campaign_id, 64) && safeText(body.campaign?.campaign_name, 160) &&
    safeText(body.channel, 80),
  );
}

export function demoFallbackReason(requestedMode: "demo" | "api" | undefined, apiKey: string | undefined) {
  if (requestedMode !== "api") return "demo_requested";
  return apiKey ? null : "missing_api_key";
}
