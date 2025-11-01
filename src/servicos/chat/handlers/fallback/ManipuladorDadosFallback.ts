import { Lead, LeadKey } from "../../modelos/LeadModel";
// FIX: Corrected import path to use the barrel file and resolve casing issues.
import { extractAllData, extractName } from "../../../../utils/parsers";
// FIX: Corrected import casing to use camelCase 'number.ts'.
import { parseHumanNumber } from "../../../../utils/formatters/number";

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
            } else if (keyToCollect === 'creditAmount' && !updatedLeadData.creditAmount) {
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