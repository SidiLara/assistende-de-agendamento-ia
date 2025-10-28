# TODO: Implementação de E-mail de Confirmação e Agendamento no Make.com

Este documento serve como um guia para aprimorar a automação no Make.com, adicionando o envio de um e-mail de confirmação ao cliente com um link para adicionar o evento à Agenda do Google.

## Objetivo

Melhorar a experiência do cliente após o agendamento, fornecendo uma confirmação formal por e-mail e facilitando a adição do compromisso à sua agenda pessoal.

---

### Parte 1: Enviar o E-mail de Confirmação

No seu cenário existente do Make.com, adicione um novo módulo **após** o passo que envia os dados para o CRM.

1.  **Adicionar Módulo de E-mail:**
    *   Clique para adicionar um novo módulo e procure por um serviço de e-mail.
    *   **Opções recomendadas:** `Gmail`, `Microsoft 365 Email`, `SendGrid`.

2.  **Configurar o E-mail:**
    *   **Destinatário (To):** Use a variável `client_email` que veio do webhook do chat.
    *   **Assunto (Subject):** Crie um assunto dinâmico. Exemplo: `Confirmação de Agendamento com {{1.consultantName}}` (a variável pode mudar de número dependendo do seu cenário).
    *   **Corpo (Body):**
        *   Utilize a variável `final_summary` que veio do webhook.
        *   **Importante:** Certifique-se de que o corpo do e-mail está configurado para interpretar HTML para que a formatação (`<strong>`, `<br>`) funcione.

---

### Parte 2: Criar e Adicionar o Link da Agenda Google

Este processo será feito em passos **dentro do mesmo cenário do Make.com**, antes do módulo de envio de e-mail.

1.  **Adicionar Módulo "Parse Date":**
    *   Adicione um módulo de **Ferramentas (Tools)** chamado **"Parse Date"**.
    *   **Objetivo:** Converter a data/hora recebida do chat (ex: "sexta-feira, 26/07/2024, 15:00") para um formato técnico que o Google entenda.
    *   Você precisará informar ao Make o formato em que a data está chegando para que ele possa convertê-la corretamente para o formato padrão (ISO 8601).

2.  **Construir a URL do Evento:**
    *   Você pode fazer isso usando um módulo "Set variable" ou diretamente no módulo de e-mail.
    *   A URL base é: `https://www.google.com/calendar/render?action=TEMPLATE`
    *   Adicione os seguintes parâmetros, preenchendo com as variáveis do webhook e do módulo "Parse Date":
        *   `&text=Reunião de Planejamento com {{1.consultantName}}`
        *   `&dates={{data_formatada_inicio}}/{{data_formatada_fim}}` (Você precisará usar o resultado do "Parse Date" aqui. Para a data de fim, você pode usar uma fórmula para adicionar 1 hora à data de início).
        *   `&details={{1.final_summary}}` (Use o resumo para os detalhes do evento).
        *   `&location={{1.meeting_type}}`

3.  **Adicionar o Link ao Corpo do E-mail:**
    *   No módulo de envio de e-mail (Parte 1), adicione o link que você acabou de construir.
    *   Use uma tag HTML `<a>` para criar um botão ou link clicável. Exemplo:
        ```html
        <p>Para facilitar, adicione este compromisso à sua agenda:</p>
        <a href="{{URL_DO_EVENTO_CRIADA_NO_PASSO_ANTERIOR}}">Adicionar à Agenda do Google</a>
        ```

---

### Resumo do Fluxo Final no Make.com

Seu cenário completo deverá ter a seguinte ordem de módulos:

1.  **Custom Webhook:** Recebe os dados do lead do chat.
2.  **Módulo CRM:** Envia os dados para o CRM do consultor.
3.  **Parse Date:** Formata a data e a hora do agendamento.
4.  **(Opcional) Set Multiple Variables:** Constrói a URL do Google Agenda e prepara outras variáveis.
5.  **Módulo de E-mail:** Envia o e-mail de confirmação para o `client_email`, contendo o `final_summary` e o link para a Agenda Google.
