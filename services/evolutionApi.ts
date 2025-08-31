// Configurações da API Evolution
const API_CONFIG = {
    baseUrl: 'https://evon8n-evolution.rwezkp.easypanel.host',
    apiKey: '4C5F2DEADF2EAD512671757FC3D35'
};

// Interface interna que a nossa aplicação usa.
export interface InstanceDetails {
  instanceName: string;
  status: 'open' | 'close' | 'connecting';
  owner: string;
  profileName: string;
  profilePictureUrl: string;
}

// Interface para o estado da conexão.
export interface ConnectionState {
    status: 'open' | 'close' | 'connecting';
}

// UTILITIES - Funções "tradutoras" para normalizar os dados da API

/**
 * Mapeia os diferentes 'states' da API para o nosso 'status' interno.
 */
function mapApiStateToStatus(state: string | undefined): 'open' | 'close' | 'connecting' {
    if (!state) return 'close';
    const lowerState = state.toLowerCase();

    if (lowerState === 'connected' || lowerState === 'open') {
        return 'open';
    }
    if (lowerState === 'qrcode' || lowerState === 'connecting') {
        return 'connecting';
    }
    return 'close';
}

/**
 * Converte um objeto de instância bruto da API para o nosso formato InstanceDetails.
 */
function normalizeInstanceData(rawInstance: any): InstanceDetails | null {
    // A API pode usar 'instanceName' ou 'name'.
    const instanceName = rawInstance.instanceName || rawInstance.name;
    if (!instanceName) {
        return null; // Instância inválida sem nome.
    }

    // A API pode usar 'state', 'status' ou 'connectionStatus'.
    const status = mapApiStateToStatus(rawInstance.state || rawInstance.status || rawInstance.connectionStatus);

    return {
        instanceName: instanceName,
        status: status,
        owner: rawInstance.owner || rawInstance.ownerJid || '',
        profileName: rawInstance.profileName || '',
        profilePictureUrl: rawInstance.profilePictureUrl || '',
    };
}


// UTILITY - Função central para fazer requisições à API
async function makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            'apikey': API_CONFIG.apiKey
        }
    };

    const finalOptions: RequestInit = { ...defaultOptions, ...options, headers: { ...defaultOptions.headers, ...options.headers } };

    try {
        const response = await fetch(url, finalOptions);
        const responseText = await response.text();

        if (!response.ok) {
            let errorMessage = `Erro na API: ${response.status}`;
            try {
                const errorJson = JSON.parse(responseText);
                errorMessage = errorJson.message || errorJson.error || responseText;
            } catch {
                errorMessage = responseText || errorMessage;
            }
            throw new Error(errorMessage);
        }
        
        // Se a resposta for bem-sucedida mas vazia, retorna um objeto vazio.
        return responseText ? JSON.parse(responseText) : ({} as T);
    } catch (error: any) {
        console.error(`Falha na requisição para ${endpoint}:`, error);
        throw new Error(error.message || 'Erro de rede ou na API.');
    }
}


// API FUNCTIONS - Funções que o nosso app chama

export async function createInstance(instanceName: string) {
    return await makeRequest('/instance/create', {
        method: 'POST',
        body: JSON.stringify({
            instanceName: instanceName,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS'
        })
    });
}

export async function fetchAllInstances(): Promise<InstanceDetails[]> {
    const result = await makeRequest<any[]>('/instance/fetchInstances');

    if (!Array.isArray(result)) {
        console.error("A resposta da API para buscar instâncias não foi uma lista (array).", result);
        return [];
    }

    return result
        .map(item => (item && item.instance ? item.instance : item)) // Extrai o objeto aninhado, se existir.
        .map(normalizeInstanceData) // "Traduz" cada objeto para o nosso formato.
        .filter((inst): inst is InstanceDetails => inst !== null); // Remove qualquer instância que não pôde ser traduzida.
}

export async function fetchInstanceDetails(instanceName: string): Promise<InstanceDetails> {
    const allInstances = await fetchAllInstances();
    const instanceData = allInstances.find(inst => inst.instanceName === instanceName);
    
    if (!instanceData) {
        throw new Error(`Instância "${instanceName}" não encontrada na API.`);
    }
    return instanceData;
}

export async function connectInstance(instanceName: string): Promise<{ code: string }> {
    return await makeRequest(`/instance/connect/${instanceName}`);
}

export async function getConnectionState(instanceName: string): Promise<ConnectionState> {
    const result = await makeRequest<any>(`/instance/connectionState/${instanceName}`);
    
    // A resposta da API pode estar aninhada ('result.instance') ou não ('result').
    const instanceData = result?.instance || result;
    
    // A API pode usar 'state', 'status' ou 'connectionStatus' para indicar o estado.
    const rawState = instanceData?.state || instanceData?.status || instanceData?.connectionStatus;
    
    if (typeof rawState === 'undefined') {
        // Se ainda não encontrarmos o estado, registramos o objeto recebido para depuração.
        console.error("Resposta do estado da conexão em formato inesperado:", result);
        throw new Error('Resposta do estado da conexão em formato inesperado.');
    }

    return { status: mapApiStateToStatus(rawState) };
}

export async function restartInstance(instanceName: string) {
    return await makeRequest(`/instance/restart/${instanceName}`, {
        method: 'PUT'
    });
}

export async function logoutInstance(instanceName: string) {
    return await makeRequest(`/instance/logout/${instanceName}`, {
        method: 'DELETE'
    });
}

export async function deleteInstance(instanceName: string) {
    return await makeRequest(`/instance/delete/${instanceName}`, {
        method: 'DELETE'
    });
}

export async function sendTextMessage(instanceName: string, number: string, text: string) {
    return await makeRequest(`/message/sendText/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify({
            number,
            text,
        }),
    });
}