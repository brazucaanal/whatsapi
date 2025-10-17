import React from 'react';

// Icons for features
const FeatureIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 dark:bg-gray-700 dark:text-green-400 mx-auto">
        {children}
    </div>
);

const HomePage: React.FC<{ onNavigateToAuth: () => void }> = ({ onNavigateToAuth }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="text-xl font-bold">WHATS API</span>
                        </div>
                        <button
                            onClick={onNavigateToAuth}
                            className="px-6 py-2 text-sm font-semibold text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                        >
                            Acessar Plataforma
                        </button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 text-center bg-white dark:bg-gray-800">
                    <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                            Automatize seu WhatsApp com <span className="text-green-600">Inteligência</span>
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                            Gerencie instâncias, dispare mensagens em massa, integre IAs e sistemas de pagamento. Tudo em um só lugar.
                        </p>
                        <button
                            onClick={onNavigateToAuth}
                            className="mt-10 px-8 py-4 text-lg font-bold text-white bg-green-600 rounded-full shadow-lg hover:bg-green-700 transform hover:scale-105 transition-all"
                        >
                            Comece Gratuitamente
                        </button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight">Funcionalidades Poderosas</h2>
                            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Ferramentas projetadas para economizar seu tempo e impulsionar seus resultados.</p>
                        </div>
                        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                {/* FIX: Provided SVG icon as a child to the FeatureIcon component to resolve the missing 'children' prop error. */}
                                <FeatureIcon>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8z" /></svg>
                                </FeatureIcon>
                                <h3 className="mt-5 text-xl font-semibold">Disparos em Massa</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">Envie mensagens para sua lista de contatos com intervalos configuráveis e acompanhamento em tempo real.</p>
                            </div>
                            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                {/* FIX: Provided SVG icon as a child to the FeatureIcon component to resolve the missing 'children' prop error. */}
                                <FeatureIcon>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                </FeatureIcon>
                                <h3 className="mt-5 text-xl font-semibold">Integração com IA</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">Conecte modelos como OpenAI e Google para criar chatbots e automatizar respostas inteligentes.</p>
                            </div>
                            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                                {/* FIX: Provided SVG icon as a child to the FeatureIcon component to resolve the missing 'children' prop error. */}
                                <FeatureIcon>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                </FeatureIcon>
                                <h3 className="mt-5 text-xl font-semibold">Cobranças e Pagamentos</h3>
                                <p className="mt-2 text-gray-500 dark:text-gray-400">Integre com gateways de pagamento para enviar links de cobrança e automatizar o fluxo financeiro.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Use Cases Section */}
                <section className="py-20 bg-white dark:bg-gray-800">
                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Aplicações para o seu Negócio</h2>
                                <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                                    Deixe a automação trabalhar para você, seja no atendimento ao cliente, na recuperação de carrinhos abandonados ou na gestão de cobranças.
                                </p>
                            </div>
                            <div className="mt-10 lg:mt-0">
                                <div className="space-y-6">
                                    <div className="flex">
                                        <div className="flex-shrink-0"><div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div></div>
                                        <div className="ml-4">
                                            <h4 className="text-lg leading-6 font-medium">Cobranças Inteligentes</h4>
                                            <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Envie lembretes de vencimento e links de pagamento (Mercado Pago, PagSeguro, Nubank) automaticamente.</p>
                                        </div>
                                    </div>
                                    <div className="flex">
                                         <div className="flex-shrink-0"><div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-500 text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></div></div>
                                        <div className="ml-4">
                                            <h4 className="text-lg leading-6 font-medium">Atendimento 24/7</h4>
                                            <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Use IAs para responder perguntas frequentes, qualificar leads e direcionar clientes, a qualquer hora do dia.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Plans Section */}
                <section className="py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold tracking-tight">Planos Acessíveis</h2>
                            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Comece de graça e evolua conforme sua necessidade.</p>
                        </div>
                        <div className="mt-12 space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8">
                             <div className="relative p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col">
                                <h3 className="text-2xl font-semibold">Gratuito</h3>
                                <p className="mt-4 text-gray-500 dark:text-gray-400">Ideal para testar e começar a automatizar.</p>
                                <div className="mt-6">
                                    <span className="text-5xl font-extrabold">R$0</span>
                                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">/mês</span>
                                </div>
                                <ul className="mt-6 space-y-4">
                                    <li className="flex space-x-3"><svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-gray-700 dark:text-gray-300">1 Instância</span></li>
                                    <li className="flex space-x-3"><svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-gray-700 dark:text-gray-300">Disparos em Massa</span></li>
                                </ul>
                                <button onClick={onNavigateToAuth} className="mt-8 block w-full bg-green-600 border border-transparent rounded-md py-3 text-base font-medium text-white text-center hover:bg-green-700">Começar Agora</button>
                            </div>

                             <div className="relative p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-semibold text-purple-600 dark:text-purple-400">Premium</h3>
                                    <p className="mt-4 text-gray-500 dark:text-gray-400">Desbloqueie todo o potencial da plataforma.</p>
                                    <p className="mt-6 text-2xl font-bold">Em breve</p>
                                    <ul className="mt-6 space-y-4">
                                        <li className="flex space-x-3"><svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-gray-700 dark:text-gray-300">Múltiplas Instâncias</span></li>
                                        <li className="flex space-x-3"><svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-gray-700 dark:text-gray-300">Integração com IA</span></li>
                                        <li className="flex space-x-3"><svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg><span className="text-gray-700 dark:text-gray-300">Integração de Pagamentos</span></li>
                                    </ul>
                                </div>
                                <button disabled className="mt-8 block w-full bg-gray-300 border border-transparent rounded-md py-3 text-base font-medium text-gray-500 text-center cursor-not-allowed">Aguarde</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} WHATS API. Todos os direitos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;