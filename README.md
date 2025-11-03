<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Execute e implante seu aplicativo do AI Studio

Este arquivo contém tudo o que você precisa para executar seu aplicativo localmente.

Veja seu aplicativo no AI Studio: https://ai.studio/apps/drive/1F87IRIjkUdbhz9BGcshIy5QCzC6rtL1f

## Executar Localmente

**Pré-requisitos:** Node.js

### 1. Instale as dependências:
   ```bash
   npm install
   ```

### 2. Configure sua Chave de API do Gemini

Para usar a API Gemini, você precisará de uma chave de API. Se você não tiver uma, pode criar uma chave no Google AI Studio: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey).

1.  **Crie um arquivo `.env`** no diretório raiz do projeto.
2.  Adicione sua chave de API ao arquivo `.env`:
    ```
    VITE_GEMINI_API_KEY=SUA_CHAVE_DE_API_AQUI
    ```
    > Substitua `SUA_CHAVE_DE_API_AQUI` pela sua chave real. O prefixo `VITE_` é importante para que a chave seja acessível no aplicativo.

### 3. Execute o aplicativo:
   ```bash
   npm run dev
   ```

---

### ⚠️ Aviso de Segurança

Este aplicativo está configurado para usar a chave de API diretamente no lado do cliente. Isso é conveniente para desenvolvimento e prototipagem local, mas **NÃO é uma prática segura para ambientes de produção**.

-   **Risco:** Expor sua chave de API no navegador torna possível que outras pessoas a encontrem e usem, o que pode levar a cobranças inesperadas em sua conta.
-   **Recomendação para Produção:** Para uma aplicação em produção, você deve sempre intermediar as chamadas de API através de um servidor backend. O servidor pode armazenar e usar sua chave de API com segurança, sem nunca expô-la ao cliente.
