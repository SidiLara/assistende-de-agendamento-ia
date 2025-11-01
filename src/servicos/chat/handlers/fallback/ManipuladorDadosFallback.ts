import { Lead, LeadKey } from "../../modelos/LeadModel";
import { extractAllData, extractName } from "../../../../utils/parsers";
// FIX: Correct casing for 'Number.ts' import to resolve case-sensitive path errors.
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