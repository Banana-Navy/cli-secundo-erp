import { getSettings } from "@/lib/settings";
import type { MailchimpList, CreateCampaignParams, MailchimpCampaignResponse } from "./types";

async function getConfig() {
  const settings = await getSettings(["mailchimp_api_key", "mailchimp_server_prefix"]);
  const apiKey = settings.mailchimp_api_key;
  const server = settings.mailchimp_server_prefix;
  if (!apiKey || !server) return null;
  return { apiKey, server };
}

async function mcFetch(
  path: string,
  apiKey: string,
  server: string,
  options: RequestInit = {}
) {
  const url = `https://${server}.api.mailchimp.com/3.0${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `Mailchimp error ${res.status}`);
  }

  return res.json();
}

export async function ping(): Promise<boolean> {
  const config = await getConfig();
  if (!config) return false;
  try {
    await mcFetch("/ping", config.apiKey, config.server);
    return true;
  } catch {
    return false;
  }
}

export async function getLists(): Promise<MailchimpList[]> {
  const config = await getConfig();
  if (!config) return [];

  const data = await mcFetch(
    "/lists?count=100&fields=lists.id,lists.name,lists.stats.member_count",
    config.apiKey,
    config.server
  );

  return (data.lists ?? []).map((l: { id: string; name: string; stats?: { member_count?: number } }) => ({
    id: l.id,
    name: l.name,
    member_count: l.stats?.member_count ?? 0,
  }));
}

export async function createAndSendCampaign(
  params: CreateCampaignParams
): Promise<MailchimpCampaignResponse> {
  const config = await getConfig();
  if (!config) throw new Error("Mailchimp non configuré");

  // 1. Create campaign
  const campaign = await mcFetch("/campaigns", config.apiKey, config.server, {
    method: "POST",
    body: JSON.stringify({
      type: "regular",
      recipients: { list_id: params.listId },
      settings: {
        subject_line: params.subject,
        from_name: params.fromName,
        reply_to: params.replyTo,
      },
    }),
  });

  // 2. Set HTML content
  await mcFetch(`/campaigns/${campaign.id}/content`, config.apiKey, config.server, {
    method: "PUT",
    body: JSON.stringify({ html: params.htmlContent }),
  });

  // 3. Send
  await mcFetch(`/campaigns/${campaign.id}/actions/send`, config.apiKey, config.server, {
    method: "POST",
  });

  return {
    id: campaign.id,
    web_id: campaign.web_id,
    status: "sent",
  };
}
