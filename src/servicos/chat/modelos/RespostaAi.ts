import { Lead, LeadKey } from "./LeadModel";

export type RespostaAi = {
    updatedLeadData: Partial<Lead>;
    responseText: string;
    action: string | null;
    nextKey: LeadKey | null;
    options?: { label: string; value: string; }[];
    triggeredObjectionText?: string;
};
