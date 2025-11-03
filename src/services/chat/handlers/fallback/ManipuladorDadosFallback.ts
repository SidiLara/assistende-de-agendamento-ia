import { Lead, LeadKey } from "../../modelos/LeadModel";
import { extractAllData, extractName } from "../../../../utils/parsers";
// FIX: Standardizing import to use PascalCase file to avoid casing conflicts.
import { parseHumanNumber } from "../../../../utils/formatters/Number";

export class ManipuladorDadosFallback {
    public handle(
        lastUserMessage: string,
        currentData: Partial<Lead>,
        keyToCollect: LeadKey | null
    ): Partial<Lead> {
        let updatedLeadData = { ...currentData };

        const extractedData = extractAllData(lastUserMessage);
        updatedLeadData = { ...updatedLeadData, ...extractedData };
        
        if (keyToCollect && lastUserMessage) {
            if (keyToCollect === 'clientName' && !updatedLeadData.clientName) {
                const extractedName = extractName(lastUserMessage);
                if (extractedName) {
                    updatedLeadData.clientName = extractedName;
                }
            } else if (keyToCollect === 'startDatetime' && updatedLeadData.startDatetime && !updatedLeadData.startDatetime.includes('às')) {
                if (lastUserMessage !== updatedLeadData.startDatetime) {
                    updatedLeadData.startDatetime = `${updatedLeadData.startDatetime} às ${lastUserMessage}`;
                }
            } else if (keyToCollect === 'creditAmount' && !updatedLead-Data.creditAmount) {
                const numericValue = parseHumanNumber(lastUserMessage, true);
                if (!isNaN(numericValue)) updatedLeadData.creditAmount = numericValue;
            } else if (keyToCollect === 'monthlyInvestment' && !updatedLeadData.monthlyInvestment) {
                const numericValue = parseHumanNumber(lastUserMessage, false);
                if (!isNaN(numericValue)) updatedLeadData.monthlyInvestment = numericValue;
            } else if (!updatedLeadData[keyToCollect]) {
                (updatedLeadData as Record<string, unknown>)[keyToCollect] = lastUserMessage;
            }
        }

        return updatedLeadData;
    }
}