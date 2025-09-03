// services/onboardingApi.ts

const WEBHOOK_URL = 'https://evon8n-n8n-webhook.rwezkp.easypanel.host/webhook/criar-infra-usuario';

interface OnboardingPayload {
    email: string | undefined;
    id: string; // Supabase User ID
    instanceName: string;
    instanceId: string;
}

/**
 * Aciona o webhook n8n para configurar a infraestrutura de back-end para um novo usuário.
 * Esta é uma chamada do tipo "dispare e esqueça". Não esperamos a resposta para bloquear a UI.
 * @param payload - O e-mail do usuário, o ID do Supabase e o nome da instância da Evolution API.
 */
export async function triggerUserOnboarding(payload: OnboardingPayload): Promise<void> {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`O webhook retornou um erro: ${response.status} ${errorText}`);
        }
        
        console.log('Webhook de onboarding acionado com sucesso para o usuário:', payload.id, 'com a instância:', payload.instanceName);

    } catch (error) {
        // Registra o erro, mas não deixa que ele quebre o fluxo de cadastro do usuário.
        console.error('Falha ao acionar o webhook de onboarding do usuário:', error);
        // Lançamos o erro novamente para que o chamador possa estar ciente, se necessário.
        throw error;
    }
}