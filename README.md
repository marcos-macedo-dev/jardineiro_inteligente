# Jardineiro - Sistema de Monitoramento e Irrigação Automática

![Badge](https://img.shields.io/badge/version-1.1.0-blue)
![Badge](https://img.shields.io/badge/license-MIT-green)

Um sistema completo para monitorar a umidade do solo, temperatura e umidade do ar, com um sistema de irrigação automática e um dashboard web + aplicativo móvel para visualização dos dados e controle manual.

## Para o Entusiasta (Visão Geral)

O projeto Jardineiro é um assistente que cuida das suas plantas. Ele não apenas mede a umidade da terra e do ar, mas também **liga uma bomba d'água automaticamente** quando a planta precisa.

### Como Funciona?

1.  **Sensores**: Medem a umidade do solo e a temperatura/umidade do ar.
2.  **O Cérebro (Arduino)**: Lê os sensores e, se a umidade do solo estiver baixa, **aciona a bomba d'água sozinho**.
3.  **Comunicação**: Envia todos os dados para um servidor no seu computador.
4.  **Visualização**: Você pode ver tudo em tempo real em uma página da web ou em um aplicativo no seu celular.
5.  **Controle Total**: Pelo app ou pela web, você pode **pausar o modo automático** para ligar ou desligar a bomba manualmente. Depois, pode reativar o modo automático com um único clique.

---

## Para o Desenvolvedor (Detalhes Técnicos)

Este projeto é uma aplicação full-stack IoT. A mudança mais recente foi a introdução de um **modo de irrigação automática** diretamente no microcontrolador, com a capacidade de ser controlado pela API.

### Arquitetura

*   **Microcontrolador (`sketch_aug7a`)**: Agora inclui uma lógica de controle autônomo. Se a umidade do solo for menor que `UMIDADE_MINIMA` (configurável no sketch), ele ativa o relé. O modo automático é desativado temporariamente se um comando manual (`RELAY_ON`/`RELAY_OFF`) é recebido. Um novo comando `AUTO` reativa a lógica automática.
*   **Backend (`api`)**: Foi adicionado um endpoint para reativar o modo automático do Arduino.
*   **Frontend Web (`client`)**: Dashboard em Vue.js.
*   **Frontend Móvel (Externo)**: App em React Native/Expo.

---

## Instalação e Execução

(As seções de Hardware, Backend e Frontend Web permanecem as mesmas)

---

## 📱 Aplicativo Móvel (React Native + Expo)

O aplicativo móvel permite não só visualizar os dados e controlar a bomba, mas também gerenciar o novo modo automático.

### Passo a Passo da Conexão

1.  **Inicie o Backend**: `cd api && npm start`
2.  **Crie o Túnel com o Ngrok**: Em um novo terminal, `npx ngrok http 4000`. Copie a URL pública.
3.  **Configure e Rode o App Expo**: Cole a URL do `ngrok` no código do `App.js` abaixo e inicie com `npx expo start`.

---

### Detalhes da API

O controle do relé e do modo automático foi atualizado.

**`POST /api/rele`**

Envia um comando manual para ligar ou desligar o relé. **Efeito colateral**: Desativa o modo automático no Arduino para que o comando manual seja respeitado.

*   **Corpo da Requisição (JSON)**: `{"estado": "ligar"}` ou `{"estado": "desligar"}`

**`POST /api/rele/auto`**

Reativa o modo de irrigação automática no Arduino.

*   **Corpo da Requisição**: Vazio.
*   **Resposta de Sucesso (200 OK)**: `Comando para reativar o modo automático enviado com sucesso.`

## Licença

Este projeto está sob a licença MIT.
