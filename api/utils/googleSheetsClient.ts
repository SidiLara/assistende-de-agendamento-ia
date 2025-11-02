// This file mocks a Google Sheets client and provides data persistence via localStorage.

const DB_KEY = 'googleSheetsMockDb';

// Initial data to seed localStorage if it's empty.
const initialDb = {
    'Clientes': [
        ['id', 'nome', 'plano', 'telefone', 'status'],
        ['1', 'Empresa Alpha', 'Premium', '(11) 91111-1111', 'Ativo'],
        ['2', 'Soluções Beta', 'Empresarial', '(21) 92222-2222', 'Ativo'],
        ['3', 'Tecnologia Gamma', 'Básico', '(31) 93333-3333', 'Inativo'],
        ['4', 'Consultoria Delta', 'Premium', '(41) 94444-4444', 'Ativo'],
    ],
    'Planos': [
        ['id', 'nome', 'valor'],
        ['1', 'Plano Básico', 99.90],
        ['2', 'Plano Premium', 199.90],
        ['3', 'Plano Empresarial', 499.90],
    ],
    'Consultores': [
        ['id', 'nome', 'plano', 'telefone'],
        ['1', 'Sidinei Lara', 'Premium', '(11) 98765-4321'],
        ['2', 'Maria Silva', 'Básico', '(21) 91234-5678'],
        ['3', 'Carlos Souza', 'Premium', '(31) 95555-8888'],
        ['4', 'Ana Pereira', 'Básico', '(41) 99999-0000'],
    ]
};

const getDb = (): typeof initialDb => {
    try {
        const dbString = localStorage.getItem(DB_KEY);
        if (dbString) {
            return JSON.parse(dbString);
        }
    } catch (e) {
        console.error("Failed to parse mock DB from localStorage", e);
    }
    // If nothing in localStorage, seed it with initial data
    localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
    return initialDb;
};

const saveDb = (db: typeof initialDb) => {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
        console.error("Failed to save mock DB to localStorage", e);
    }
};

const getSheetNameFromRange = (range: string): keyof typeof initialDb | null => {
    const sheetName = range.split('!')[0];
    if (sheetName in initialDb) {
        return sheetName as keyof typeof initialDb;
    }
    return null;
}

export const getSheetsClient = async () => {
    console.log("Initializing Google Sheets client (localStorage mock)...");
    
    const mockSheets = {
        spreadsheets: {
            values: {
                get: async (params: { spreadsheetId: string, range: string }) => {
                    const db = getDb();
                    const sheetName = getSheetNameFromRange(params.range);
                    console.log(`MOCK GET from ${params.range}`);
                    if (sheetName) {
                        return { data: { values: db[sheetName] }};
                    }
                    return { data: { values: [] }};
                },
                append: async (params: { spreadsheetId: string, range: string, valueInputOption: string, requestBody: { values: any[][] } }) => {
                    const db = getDb();
                    const sheetName = getSheetNameFromRange(params.range);
                    console.log(`MOCK APPEND to ${params.range}`, params.requestBody.values);
                    if (sheetName && params.requestBody.values) {
                        db[sheetName].push(...params.requestBody.values);
                        saveDb(db);
                    }
                    return { status: 200 };
                },
                update: async (params: { spreadsheetId: string, range: string, valueInputOption: string, requestBody: { values: any[][] } }) => {
                    const db = getDb();
                    const sheetName = getSheetNameFromRange(params.range);
                    console.log(`MOCK UPDATE to ${params.range}`, params.requestBody.values);
                    if (sheetName && params.requestBody.values && params.requestBody.values.length > 0) {
                        const idToUpdate = params.requestBody.values[0][0]; // Assuming ID is the first column
                        const sheetData = db[sheetName];
                        const rowIndex = sheetData.findIndex(row => row[0] === idToUpdate);
                        if (rowIndex > 0) { // Don't update header
                            sheetData[rowIndex] = params.requestBody.values[0];
                            saveDb(db);
                        } else {
                            console.error(`ID ${idToUpdate} not found in sheet ${sheetName} for update.`);
                        }
                    }
                    return { status: 200 };
                }
            }
        }
    };
    
    return Promise.resolve(mockSheets);
};

export const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || 'mock-spreadsheet-id';