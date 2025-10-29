import { LeadData, LeadDataKey } from "./Lead.model";

export type AiResponse = {
    updatedLeadData: Partial<LeadData>;
    responseText: string;
    action: string | null;
    nextKey: LeadDataKey | null;
};
