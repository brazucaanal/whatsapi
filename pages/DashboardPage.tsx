import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import * as evolution from '../services/evolutionApi';
import QRCode from 'qrcode';
import { triggerUserOnboarding } from '../services/onboardingApi';

// Tipos de dados
interface DashboardPageProps {
  session: Session;
}

interface UserProfile {
  id: string;
  role: 'admin' | 'user';
  instance_name: string | null;
  user_details: Partial<User>;
}

type AdminTab = 'home' | 'users';
type UserTab = 'instances' | 'sendMessage' | 'chat' | 'profile';

type CampaignJobStatus = 'Aguardando' | 'Enviando' | 'Enviado' | 'Falhou';
interface CampaignJob {
    number: string;
    status: CampaignJobStatus;
    error?: string;
}

// Componentes de Visão (extraídos para estabilidade)

const renderStatusBadge = (status?: 'open' | 'close' | 'connecting') => {
    const statusMap = {
        open: { text: "Conectado", class: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
        close: { text: "Desconectado", class: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
        connecting: { text: "Conectando", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" }
    };
    const { text, class: className } = statusMap[status || 'close'];
    return <span className={`px-3 py-1 text-sm font-medium rounded-full ${className}`}>{text}</span>;
}

const UserInstanceView: React.FC<{
    isAutoCreating: boolean;
    userInstance: evolution.InstanceDetails | null;
    handleCreateInstance: () => void;
    loading: boolean;
    handleConnect: () => void;
    handleRestartUserInstance: () => void;
    handleOpenAiModal: () => void;
    handleOpenPaymentsModal: () => void;
}> = ({ isAutoCreating, userInstance, handleCreateInstance, loading, handleConnect, handleRestartUserInstance, handleOpenAiModal, handleOpenPaymentsModal }) => {
    if (isAutoCreating) {
       return (
        <div className="text-center p-10">
           <svg className="animate-spin h-8 w-8 text-green-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-4">Estamos preparando sua instância...</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Isso pode levar um momento.</p>
        </div>
      );
    }

    if (!userInstance) {
        return (
            <div className="text-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Nenhuma instância encontrada</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Se a criação automática falhar, você pode tentar manually.</p>
                <button
                    onClick={handleCreateInstance}
                    disabled={loading}
                    className="mt-6 px-6 py-3 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                    {loading ? 'Criando...' : 'Tentar Criar Instância'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userInstance.instanceName}</h2>
                    <div className="mt-2">{renderStatusBadge(userInstance.status)}</div>
                </div>
                <div className="flex space-x-2">
                    {userInstance.status !== 'open' && (
                        <button onClick={handleConnect} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Conectar</button>
                    )}
                    <button onClick={handleRestartUserInstance} className="px-4 py-2 text-sm font-medium text-gray-700 bg-yellow-400 rounded-md hover:bg-yellow-500">Reiniciar</button>
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"><p className="font-semibold text-gray-600 dark:text-gray-300">Proprietário (JID):</p><p className="text-gray-800 dark:text-gray-100 break-all">{userInstance.owner || 'Não conectado'}</p></div>
                 <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"><p className="font-semibold text-gray-600 dark:text-gray-300">Nome do Perfil:</p><p className="text-gray-800 dark:text-gray-100">{userInstance.profileName || 'N/A'}</p></div>
            </div>

            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Seu Plano</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="font-semibold text-gray-600 dark:text-gray-300">Plano Atual:</p>
                        <p className="text-gray-800 dark:text-gray-100 font-bold">Gratuito</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="font-semibold text-gray-600 dark:text-gray-300">Limite de Instâncias:</p>
                        <p className="text-gray-800 dark:text-gray-100 font-bold">1</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                 <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recursos Premium</h3>
                 <div className="space-y-4">
                     <button onClick={handleOpenAiModal} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 group">
                        <div className="flex items-center">
                            <svg className="h-7 w-7 opacity-80 group-hover:opacity-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            <span className="font-bold text-lg ml-3">Inteligência Artificial</span>
                        </div>
                         <div className="flex items-center bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                            <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            <span>BLOQUEADO</span>
                         </div>
                     </button>
                      <button onClick={handleOpenPaymentsModal} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg shadow-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 group">
                        <div className="flex items-center">
                            <svg className="h-7 w-7 opacity-80 group-hover:opacity-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            <span className="font-bold text-lg ml-3">Integração com Bancos</span>
                        </div>
                         <div className="flex items-center bg-white/20 px-3 py-1 rounded-full text-xs font-semibold">
                            <svg className="h-3 w-3 mr-1.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            <span>BLOQUEADO</span>
                         </div>
                     </button>
                 </div>
            </div>
        </div>
    );
};

const SendMessageView: React.FC<{
    userInstance: evolution.InstanceDetails | null;
    setUserActiveTab: (tab: UserTab) => void;
    showToast: (message: string, type: 'success' | 'error') => void;
}> = ({ userInstance, setUserActiveTab, showToast }) => {
    const [numbersInput, setNumbersInput] = useState('');
    const [messageText, setMessageText] = useState('');
    const [sendInterval, setSendInterval] = useState('5');
    const [campaignJobs, setCampaignJobs] = useState<CampaignJob[]>([]);
    const [isCampaignRunning, setIsCampaignRunning] = useState(false);
    const campaignCancelledRef = useRef(false);

    const handleResetCampaign = () => {
        setIsCampaignRunning(false);
        setCampaignJobs([]);
        setNumbersInput('');
        setMessageText('');
    };
    
    const handleStartCampaign = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        const numbers = numbersInput.split(/[,\n/:]/).map(n => n.trim()).filter(Boolean);
        if (numbers.length === 0 || !messageText) {
            showToast('A lista de números e a mensagem são obrigatórios.', 'error');
            return;
        }

        const initialJobs: CampaignJob[] = numbers.map(number => ({ number, status: 'Aguardando' }));
        setCampaignJobs(initialJobs);
        campaignCancelledRef.current = false;
        setIsCampaignRunning(true);
    };
    
    const handleStopCampaign = () => {
        campaignCancelledRef.current = true;
        setIsCampaignRunning(false);
        showToast("Disparos interrompidos pelo usuário.", 'error');
    };

    useEffect(() => {
        if (!isCampaignRunning || !userInstance) return;

        let isMounted = true;

        const processQueue = async () => {
            for (let i = 0; i < campaignJobs.length; i++) {
                if (!isMounted || campaignCancelledRef.current) break;

                setCampaignJobs(prev => prev.map((job, idx) => idx === i ? { ...job, status: 'Enviando' } : job));
                
                const job = campaignJobs[i];
                try {
                    const formattedNumber = `55${job.number.replace(/\D/g, "")}@s.whatsapp.net`;
                    await evolution.sendTextMessage(userInstance.instanceName, formattedNumber, messageText);
                    if (isMounted && !campaignCancelledRef.current) {
                        setCampaignJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'Enviado' } : j));
                    }
                } catch (err: any) {
                    if (isMounted && !campaignCancelledRef.current) {
                         setCampaignJobs(prev => prev.map((j, idx) => idx === i ? { ...j, status: 'Falhou', error: err.message } : j));
                    }
                }
                
                if (i < campaignJobs.length - 1 && !campaignCancelledRef.current) {
                    const delay = Math.max(1, parseInt(sendInterval, 10) || 5) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            if (isMounted && !campaignCancelledRef.current) {
                showToast("Disparos concluídos!", "success");
                setIsCampaignRunning(false);
            }
        };

        processQueue();

        return () => { isMounted = false; };
    }, [isCampaignRunning]);

    if (userInstance?.status !== 'open') {
      return (
        <div className="text-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">Instância Desconectada</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Você precisa conectar sua instância para poder enviar mensagens.</p>
          <button
            onClick={() => setUserActiveTab('instances')}
            className="mt-6 px-6 py-3 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Ir para Instâncias
          </button>
        </div>
      );
    }

    if (campaignJobs.length > 0) {
        const sentCount = campaignJobs.filter(j => j.status === 'Enviado' || j.status === 'Falhou').length;
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Progresso do Disparo</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Enviando {sentCount} de {campaignJobs.length}...</p>
                <div className="overflow-x-auto max-h-96">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Número</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {campaignJobs.map((job, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-white">{job.number}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            job.status === 'Enviado' ? 'bg-green-100 text-green-800' :
                                            job.status === 'Falhou' ? 'bg-red-100 text-red-800' :
                                            job.status === 'Enviando' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                                        }`}>{job.status}</span>
                                        {job.error && <p className="text-xs text-red-500 mt-1">{job.error}</p>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="flex justify-end pt-6 space-x-4">
                    {isCampaignRunning ? (
                         <button onClick={handleStopCampaign} className="px-6 py-3 text-white bg-red-600 rounded-lg font-semibold hover:bg-red-700 transition-colors">Parar Disparos</button>
                    ) : (
                         <button onClick={handleResetCampaign} className="px-6 py-3 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Fazer Novo Disparo</button>
                    )}
                </div>
            </div>
        );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Disparar Mensagens em Massa</h2>
        <form onSubmit={handleStartCampaign} className="space-y-4">
          <div>
            <label htmlFor="numbersInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Lista de Números (com DDD)
            </label>
            <textarea
                id="numbersInput"
                value={numbersInput}
                onChange={(e) => setNumbersInput(e.target.value)}
                rows={6}
                placeholder="Cole os números aqui, um por linha ou separados por vírgula, / ou :"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            />
          </div>
           <div>
            <label htmlFor="sendInterval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Intervalo entre mensagens (segundos)
            </label>
            <input
                type="number"
                id="sendInterval"
                value={sendInterval}
                onChange={(e) => setSendInterval(e.target.value)}
                min="1"
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="messageText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Mensagem
            </label>
            <textarea
                id="messageText"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                placeholder="Digite sua mensagem aqui..."
                required
                className="relative block w-full appearance-none rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:z-10 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button 
                type="submit" 
                disabled={isCampaignRunning}
                className="px-6 py-3 text-white bg-green-600 rounded-lg font-semibold hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
            >
                {isCampaignRunning ? 'Enviando...' : 'Iniciar Disparos'}
            </button>
          </div>
        </form>
      </div>
    );
};

const ChatView: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8">
        <div className="max-w-2xl mx-auto text-center">
            <svg className="mx-auto h-16 w-16 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>

            <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Acesse seu chat no celular
            </h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
                Para a melhor experiência, gerencie suas conversas através do aplicativo oficial do Chatwoot.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <a href="https://apps.apple.com/us/app/chatwoot/id1495796682" target="_blank" rel="noopener noreferrer" className="transform hover:scale-105 transition-transform">
                    <img src="https://www.chatwoot.com/features/mobileapps/app-store.png" alt="Download na App Store" className="h-12 sm:h-14" />
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.chatwoot.app&hl=en" target="_blank" rel="noopener noreferrer" className="transform hover:scale-105 transition-transform">
                    <img src="https://www.chatwoot.com/features/mobileapps/playstore.png" alt="Disponível no Google Play" className="h-12 sm:h-14" />
                </a>
            </div>

            <div className="mt-10 text-left border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Instruções de Configuração:</h3>
                <ol className="mt-4 space-y-4 list-decimal list-inside text-gray-600 dark:text-gray-400">
                    <li>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Baixe e instale o app</span> da sua loja de aplicativos.
                    </li>
                    <li>
                        Abra o aplicativo e, quando solicitado o <span className="font-semibold text-gray-700 dark:text-gray-300">"Endereço do Servidor"</span> (ou "Installation URL"), insira o seguinte:
                        <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-center">
                            <code className="font-mono text-green-600 dark:text-green-400 break-all">https://projt1-chatwoot.rwezkp.easypanel.host</code>
                        </div>
                    </li>
                    <li>
                       Faça login com o <span className="font-semibold text-gray-700 dark:text-gray-300">mesmo e-mail e senha</span> que você usa para acessar a plataforma WHATS API. Se for seu primeiro acesso ao chat, pode ser necessário criar uma conta dentro do app usando este mesmo e-mail.
                    </li>
                </ol>
            </div>
        </div>
    </div>
);

const ProfileView = () => (
    <div className="text-center p-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
      <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
      <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-white">Perfil do Usuário</h3>
      <p className="mt-2 text-gray-500 dark:text-gray-400">Esta funcionalidade estará disponível em breve.</p>
    </div>
);

const AdminInstancesView: React.FC<{
    allInstances: evolution.InstanceDetails[];
    handleAdminRestartInstance: (instanceName: string) => void;
    handleAdminDeleteInstance: (instanceName: string) => void;
}> = ({ allInstances, handleAdminRestartInstance, handleAdminDeleteInstance }) => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white px-4 sm:px-0">Todas as Instâncias ({allInstances.length})</h2>
      {allInstances.length === 0 ? <p className="text-gray-500">Nenhuma instância ativa encontrada na API.</p> :
        allInstances.map(inst => (
          <div key={inst.instanceName} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
              <div>
                <p className="font-bold text-lg text-gray-900 dark:text-white">{inst.instanceName}</p>
                <div className="mt-1">{renderStatusBadge(inst.status)}</div>
                <p className="text-xs text-gray-500 mt-1">{inst.owner || 'Não conectado'}</p>
              </div>
              <div className="flex space-x-2 mt-4 sm:mt-0">
                <button onClick={() => handleAdminRestartInstance(inst.instanceName)} className="px-3 py-1 text-xs font-medium text-gray-700 bg-yellow-400 rounded-md hover:bg-yellow-500">Reiniciar</button>
                <button onClick={() => handleAdminDeleteInstance(inst.instanceName)} className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Excluir</button>
              </div>
            </div>
          </div>
      ))}
    </div>
);

const AdminUsersView: React.FC<{
    allUsers: UserProfile[];
    handleUpdateRole: (userId: string, newRole: 'admin' | 'user') => void;
    handleDeleteUser: (userId: string) => void;
}> = ({ allUsers, handleUpdateRole, handleDeleteUser }) => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white px-4 sm:px-0">Todos os Usuários ({allUsers.length})</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Instância</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {allUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.user_details?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.instance_name || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleUpdateRole(user.id, user.role === 'admin' ? 'user' : 'admin')} className="text-indigo-600 hover:text-indigo-900">Alterar Role</button>
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
);


// Componente Principal do Dashboard
const DashboardPage: React.FC<DashboardPageProps> = ({ session }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de navegação
  const [adminActiveTab, setAdminActiveTab] = useState<AdminTab>('home');
  const [userActiveTab, setUserActiveTab] = useState<UserTab>('instances');
  
  // Estado para a visão de Usuário
  const [userInstance, setUserInstance] = useState<evolution.InstanceDetails | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPaymentsModalOpen, setIsPaymentsModalOpen] = useState(false);
  const [isAutoCreating, setIsAutoCreating] = useState(false);
  const autoCreationTriggered = useRef(false);

  // Estado para a visão de Admin
  const [allInstances, setAllInstances] = useState<evolution.InstanceDetails[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Estado para QR Code e Notificações
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrCountdown, setQrCountdown] = useState(45);
  const [qrError, setQrError] = useState<string | null>(null);
  const qrPollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qrRefreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        showToast(`Erro ao sair: ${error.message}`, 'error');
        console.error('Error signing out:', error);
    }
  };

  // Funções para Usuário
  const fetchUserInstance = useCallback(async (instanceName: string | null) => {
    setLoading(true);
    setError(null);
    try {
      if (instanceName) {
        const instanceDetails = await evolution.fetchInstanceDetails(instanceName);
        setUserInstance(instanceDetails);
      } else {
        setUserInstance(null);
      }
    } catch (err: any) {
      if (err.message.includes("Instância não encontrada")) {
        setUserInstance(null);
        await supabase.from('profiles').update({ instance_name: null }).eq('id', session.user.id);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [session.user.id]);
  
  const clearQrIntervals = () => {
    if (qrPollingIntervalRef.current) clearInterval(qrPollingIntervalRef.current);
    if (qrRefreshIntervalRef.current) clearInterval(qrRefreshIntervalRef.current);
    qrPollingIntervalRef.current = null;
    qrRefreshIntervalRef.current = null;
  };

  const handleCloseQrModal = () => {
      setIsQrModalOpen(false);
      clearQrIntervals();
  };
  
  const showQrCodeForInstance = useCallback(async (instanceName: string) => {
    if (!instanceName) return;

    clearQrIntervals();
    setIsQrModalOpen(true);
    setQrCodeDataUrl(null);
    setQrError(null);
    setQrCountdown(45);

    const fetchAndSetQrCode = async () => {
        try {
            const connection = await evolution.connectInstance(instanceName);
            if (connection.code) {
                setQrCodeDataUrl(await QRCode.toDataURL(connection.code, { width: 300 }));
                setQrError(null);
                setQrCountdown(45);
            } else {
                throw new Error("A API não retornou um QR code.");
            }
        } catch (err: any) {
            setQrError(`Falha ao gerar QR Code: ${err.message}`);
            setQrCodeDataUrl(null);
        }
    };

    await fetchAndSetQrCode();

    qrPollingIntervalRef.current = setInterval(async () => {
        try {
            const state = await evolution.getConnectionState(instanceName);
            if (state.status === 'open') {
                handleCloseQrModal();
                showToast("Instância conectada com sucesso!", 'success');
                await fetchUserInstance(instanceName);
            }
        } catch (pollError) {
            console.error("Erro ao verificar conexão:", pollError);
        }
    }, 3000);

    qrRefreshIntervalRef.current = setInterval(() => {
        setQrCountdown(prev => {
            if (prev <= 1) {
                fetchAndSetQrCode();
                return 45;
            }
            return prev - 1;
        });
    }, 1000);
  }, [fetchUserInstance]);

  const handleCreateInstance = useCallback(async () => {
    setLoading(true);
    setError(null);
    const newInstanceName = `inst${session.user.id.replace(/-/g, "").substring(0, 16)}`;
    try {
        const creationResponse = await evolution.createInstance(newInstanceName);
        const newInstanceId = creationResponse.instance.instanceId;

        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ instance_name: newInstanceName })
            .eq('id', session.user.id)
            .select().single();
        if (updateError) throw new Error(`Falha ao salvar no banco de dados: ${updateError.message}`);
        if (!updatedProfile) throw new Error("Não foi possível salvar a instância no seu perfil.");
        
        // Aciona o webhook de onboarding em segundo plano com todos os dados.
        triggerUserOnboarding({
            email: session.user.email,
            id: session.user.id,
            instanceName: newInstanceName,
            instanceId: newInstanceId,
        }).catch(onboardingError => {
            // Não bloqueia a UI do usuário se o webhook falhar.
            // Apenas registra o erro no console para depuração.
            console.error("Falha no processo de onboarding em segundo plano:", onboardingError);
        });

        await new Promise(resolve => setTimeout(resolve, 2000));
        await fetchUserInstance(newInstanceName);
        await showQrCodeForInstance(newInstanceName);

    } catch(err: any) {
        setError(`Falha na criação da instância. Detalhes: ${err.message}`);
        await evolution.deleteInstance(newInstanceName).catch(console.error);
    } finally {
        setLoading(false);
    }
  }, [session.user.id, session.user.email, fetchUserInstance, showQrCodeForInstance]);
  
  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`*`)
        .eq('id', session.user.id)
        .single();
        
      if (profileError) throw profileError;
      const userProfile: UserProfile = { ...profileData, user_details: session.user };
      setProfile(userProfile);

      if (userProfile.role === 'admin') {
        await fetchAdminData();
      } else {
        await fetchUserInstance(userProfile.instance_name);
      }
    } catch (err: any) {
       setError(err.message || "Não foi possível carregar seu perfil.");
    } finally {
      setLoading(false);
    }
  }, [session.user]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (profile?.role === 'user' && !userInstance && !loading && !error && !isAutoCreating && !autoCreationTriggered.current) {
      autoCreationTriggered.current = true;
      setIsAutoCreating(true);
      handleCreateInstance().finally(() => setIsAutoCreating(false));
    }
  }, [profile, userInstance, loading, error, isAutoCreating, handleCreateInstance]);
  
  const handleRestartUserInstance = async () => {
    if (!userInstance) return;
    if (!window.confirm("Tem certeza que deseja reiniciar a conexão? Isso irá desconectar o número atual e você precisará escanear um novo QR Code.")) return;
    
    setLoading(true);
    try {
        await evolution.logoutInstance(userInstance.instanceName);
        showToast("Desconectado com sucesso! Um novo QR Code será exibido.", 'success');
        
        // CORREÇÃO: Atualização otimista do estado para garantir que a UI responda imediatamente.
        setUserInstance(prev => prev ? { ...prev, status: 'close' } : null);

        // O modal ainda é exibido para conveniência.
        await showQrCodeForInstance(userInstance.instanceName);

    } catch(err: any) { 
        setError(err.message); 
        showToast(`Erro ao reiniciar: ${err.message}`, 'error');
    } finally { 
        setLoading(false); 
    }
  }

  const handleConnect = () => {
    if (userInstance) {
      showQrCodeForInstance(userInstance.instanceName);
    }
  }

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: usersData, error: usersError } = await supabase.rpc('get_all_users_with_profiles');
      if (usersError) throw usersError;
      
      const mappedUsers: UserProfile[] = usersData.map((u: any) => ({
        id: u.id,
        role: u.role,
        instance_name: u.instance_name,
        user_details: { id: u.id, email: u.email },
      }));

      const instances = await evolution.fetchAllInstances();
      
      setAllInstances(instances);
      setAllUsers(mappedUsers);
    } catch (err: any)
 {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'user') => {
    if (!window.confirm(`Tem certeza que deseja alterar a role deste usuário para ${newRole}?`)) return;
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      await fetchAdminData();
    } catch (err: any) {
      showToast(`Erro ao atualizar role: ${err.message}`, 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário? Esta ação é irreversível.")) return;
    try {
      const { error } = await supabase.rpc('delete_user_by_admin', { user_id_to_delete: userId });
      if (error) throw error;
      await fetchAdminData();
    } catch (err: any) {
      showToast(`Erro ao excluir usuário: ${err.message}`, 'error');
    }
  };

  const handleAdminRestartInstance = async (instanceName: string) => {
    showToast(`Reiniciando instância ${instanceName}...`, 'success');
    try {
      await evolution.restartInstance(instanceName);
      setTimeout(fetchAdminData, 5000);
    } catch (err: any) {
      showToast(`Erro ao reiniciar: ${err.message}`, 'error');
    }
  };

  const handleAdminDeleteInstance = async (instanceName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a instância ${instanceName}?`)) return;
    try {
      const userToUpdate = allUsers.find(u => u.instance_name === instanceName);
      await evolution.deleteInstance(instanceName);

      if (userToUpdate) {
        const { error: rpcError } = await supabase.rpc('admin_clear_instance_name', {
            user_id_to_update: userToUpdate.id
        });
        if (rpcError) throw new Error(`Instância deletada da API, mas falhou ao atualizar o perfil: ${rpcError.message}`);
      }
      showToast(`Instância ${instanceName} excluída.`, 'success');
      await fetchAdminData();
    } catch (err: any) {
      showToast(`Erro ao excluir: ${err.message}`, 'error');
    }
  };

  const renderMainContent = () => {
    if (loading && !isAutoCreating) return <div className="text-center p-10"><svg className="animate-spin h-8 w-8 text-green-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="mt-4 text-gray-500">Carregando dados...</p></div>;
    if (error) return <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">{error}</div>;
    if (!profile) return <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">Não foi possível carregar seu perfil.</div>;

    if (profile.role === 'admin') {
      const activeInstances = allInstances.filter(inst => inst.status === 'open').length;
      const connectionRate = allInstances.length > 0 ? ((activeInstances / allInstances.length) * 100).toFixed(0) : 0;
      
      return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{allUsers.length}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Total de Usuários</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
                    <h3 className="text-4xl font-bold text-green-600 dark:text-green-400">{activeInstances}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Instâncias Ativas</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
                    <h3 className="text-4xl font-bold text-blue-600 dark:text-blue-400">{connectionRate}%</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Taxa de Conexão</p>
                </div>
            </div>
            {adminActiveTab === 'home' 
                ? <AdminInstancesView allInstances={allInstances} handleAdminRestartInstance={handleAdminRestartInstance} handleAdminDeleteInstance={handleAdminDeleteInstance} /> 
                : <AdminUsersView allUsers={allUsers} handleUpdateRole={handleUpdateRole} handleDeleteUser={handleDeleteUser} />
            }
        </div>
      );
    } else {
      switch (userActiveTab) {
        case 'instances': return <UserInstanceView isAutoCreating={isAutoCreating} userInstance={userInstance} handleCreateInstance={handleCreateInstance} loading={loading} handleConnect={handleConnect} handleRestartUserInstance={handleRestartUserInstance} handleOpenAiModal={() => setIsAiModalOpen(true)} handleOpenPaymentsModal={() => setIsPaymentsModalOpen(true)} />;
        case 'sendMessage': return <SendMessageView userInstance={userInstance} setUserActiveTab={setUserActiveTab} showToast={showToast} />;
        case 'chat': return <ChatView />;
        case 'profile': return <ProfileView />;
        default: return <UserInstanceView isAutoCreating={isAutoCreating} userInstance={userInstance} handleCreateInstance={handleCreateInstance} loading={loading} handleConnect={handleConnect} handleRestartUserInstance={handleRestartUserInstance} handleOpenAiModal={() => setIsAiModalOpen(true)} handleOpenPaymentsModal={() => setIsPaymentsModalOpen(true)} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-28 sm:pb-24">
       {toast && (
        <div className={`fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'} animate-fade-in-right`}>
            {toast.message}
        </div>
      )}
      
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
               <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <span className="text-xl font-bold text-gray-900 dark:text-white">WHATS API</span>
            </div>
             <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">Logado como: <span className="font-semibold">{session.user.email}</span></p>
            <button onClick={handleSignOut} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Sair</button>
          </div>
        </div>
      </header>

       <div className="flex">
         <aside className="hidden sm:block sm:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
           <nav className="p-4 space-y-2">
            {profile?.role === 'admin' ? (
              <>
                <button onClick={() => setAdminActiveTab('home')} className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${adminActiveTab === 'home' ? 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  <span>Visão Geral</span>
                </button>
                <button onClick={() => setAdminActiveTab('users')} className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${adminActiveTab === 'users' ? 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 004.773-9.805A4 4 0 0012 3C9.239 3 7 5.239 7 8a4 4 0 004.227 3.992" /></svg>
                  <span>Usuários</span>
                </button>
              </>
            ) : (
               <>
                <button onClick={() => setUserActiveTab('instances')} className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${userActiveTab === 'instances' ? 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                    <span>Minha Instância</span>
                </button>
                <button onClick={() => setUserActiveTab('sendMessage')} className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${userActiveTab === 'sendMessage' ? 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                    <span>Disparos</span>
                </button>
                <button onClick={() => setUserActiveTab('chat')} className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${userActiveTab === 'chat' ? 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <span>Chat</span>
                </button>
                <button onClick={() => setUserActiveTab('profile')} className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${userActiveTab === 'profile' ? 'bg-green-100 text-green-700 dark:bg-gray-700 dark:text-green-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    <span>Perfil</span>
                </button>
               </>
            )}
           </nav>
         </aside>

         <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {renderMainContent()}
         </main>
       </div>
       
       {profile?.role === 'user' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:hidden">
            <div className="flex justify-around items-center h-16">
                <button onClick={() => setUserActiveTab('instances')} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors ${userActiveTab === 'instances' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
                    <span className="mt-1">Instância</span>
                </button>
                <button onClick={() => setUserActiveTab('sendMessage')} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors ${userActiveTab === 'sendMessage' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                    <span className="mt-1">Disparos</span>
                </button>
                <button onClick={() => setUserActiveTab('chat')} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors ${userActiveTab === 'chat' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <span className="mt-1">Chat</span>
                </button>
                <button onClick={() => setUserActiveTab('profile')} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors ${userActiveTab === 'profile' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    <span className="mt-1">Perfil</span>
                </button>
            </div>
        </div>
      )}

      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 text-center max-w-sm w-full mx-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white" id="modal-title">Conectar ao WhatsApp</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Abra o WhatsApp no seu celular e escaneie o código abaixo.</p>
                <div className="my-6 min-h-[250px] flex items-center justify-center">
                    {qrCodeDataUrl ? (
                        <img src={qrCodeDataUrl} alt="QR Code" className="rounded-lg"/>
                    ) : qrError ? (
                        <p className="text-red-500">{qrError}</p>
                    ) : (
                        <svg className="animate-spin h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    )}
                </div>
                {qrCodeDataUrl && <p className="text-sm text-gray-500 dark:text-gray-400">Novo código em: {qrCountdown}s</p>}
                <button onClick={handleCloseQrModal} type="button" className="mt-6 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm">
                    Fechar
                </button>
            </div>
        </div>
      )}

       {(isAiModalOpen || isPaymentsModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" aria-labelledby="premium-modal-title" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center max-w-md w-full mx-4 transform transition-all" >
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-tr from-purple-500 to-green-400">
                    <svg className="h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </div>
                <h3 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white" id="premium-modal-title">Recurso Premium</h3>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                    A funcionalidade de {isAiModalOpen ? 'Inteligência Artificial' : 'Integração com Bancos'} estará disponível em breve no nosso plano Premium.
                </p>
                <p className="mt-4 font-semibold text-green-600 dark:text-green-400">Aguarde as novidades!</p>
                <button onClick={() => { setIsAiModalOpen(false); setIsPaymentsModalOpen(false); }} type="button" className="mt-8 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-3 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 sm:text-sm">
                    Entendido
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;