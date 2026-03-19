export interface MailchimpList {
  id: string;
  name: string;
  member_count: number;
}

export interface CreateCampaignParams {
  listId: string;
  subject: string;
  fromName: string;
  replyTo: string;
  htmlContent: string;
}

export interface MailchimpCampaignResponse {
  id: string;
  web_id: number;
  status: string;
}
