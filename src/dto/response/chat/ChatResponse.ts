import { LeadData, LeadDataKey } from "../../../model/lead/LeadModel";

export type AiResponse = {
    updatedLeadData: Partial<LeadData>;
    responseText: string;
    action: string | null;
    nextKey: LeadDataKey | null;
};
