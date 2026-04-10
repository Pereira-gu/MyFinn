import axios from 'axios';

// Criamos o nosso carteiro apontando para a porta do nosso Spring Boot
export const api = axios.create({
    baseURL: 'http://localhost:8080',
});

// O "Carimbador Automático" de Tokens
api.interceptors.request.use(
    (config) => {
        // Vai no "cofre" do navegador procurar a nossa chave
        const token = localStorage.getItem('@MyFinn:token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);