<script setup>
import { ref, onMounted, computed } from 'vue'
import { getHumidity, controlRelay } from '@/services/http'
import { useDark, useToggle } from '@vueuse/core'

// Configuração do tema escuro
const isDark = useDark({
  selector: 'html',
  valueDark: 'dark',
  valueLight: 'light',
  storageKey: 'color-scheme',
})
const alternarTema = useToggle(isDark)

// Estado
const umidade = ref(null)
const temperatura = ref(null)
const umidadeAr = ref(null)
const statusConexao = ref('Conectando...')
const ultimaAtualizacao = ref(null)

// Sugestão com base na umidade
const sugestaoUmidade = computed(() => {
  if (!umidade.value && umidade.value !== 0) return 'Aguardando dados...'
  if (umidade.value <= 20) return 'Irrigação imediata necessária.'
  if (umidade.value < 50) return 'Umidade moderada. Acompanhar.'
  return 'Umidade do solo ideal.'
})

const corUmidade = computed(() => {
  if (!umidade.value && umidade.value !== 0) return 'text-gray-500'
  if (umidade.value <= 20) return 'text-red-600'
  if (umidade.value < 50) return 'text-amber-600'
  return 'text-green-600'
})

// Busca inicial
async function buscarUmidadeInicial() {
  try {
    const response = await getHumidity()
    const valor = response.data.humidity ?? response.data.umidadeSolo ?? response.data.umidade
    umidade.value = valor
    ultimaAtualizacao.value = new Date().toLocaleTimeString()
  } catch (error) {
    console.error('Erro ao buscar umidade inicial:', error)
    statusConexao.value = 'Falha na conexão'
  }
}

// WebSocket
function iniciarWebSocket() {
  // IMPORTANTE: Substitua 'YOUR_MACHINE_IP_ADDRESS' pelo endereço IP real da sua máquina onde a API está rodando
  const socket = new WebSocket(`ws://${window.location.hostname}:4000`)

  socket.onopen = () => {
    statusConexao.value = 'Conectado'
    console.log('Web Frontend: Conectado ao WebSocket');
  }

  socket.onclose = () => {
    statusConexao.value = 'Desconectado'
    console.log('Web Frontend: Conexão WebSocket fechada. Tentando reconectar em 3 segundos...');
    setTimeout(iniciarWebSocket, 3000);
  }

  socket.onerror = (error) => {
    console.error('Web Frontend: Erro no WebSocket:', error)
    statusConexao.value = 'Erro de conexão'
  }

  socket.onmessage = (event) => {
    try {
      const dados = JSON.parse(event.data)
      console.log('Web Frontend: Dados recebidos via WebSocket:', dados)

      const valor = dados.humidity ?? dados.umidadeSolo ?? dados.umidade
      if (typeof valor === 'number') {
        umidade.value = valor
      }
      // Parse temperatura and umidadeAr
      if (typeof dados.temperatura === 'number') {
        temperatura.value = dados.temperatura
      }
      if (typeof dados.umidadeAr === 'number') {
        umidadeAr.value = dados.umidadeAr
      }
      ultimaAtualizacao.value = new Date().toLocaleTimeString()
    } catch (error) {
      console.error('Web Frontend: Mensagem inválida via WebSocket:', error)
    }
  }

  return socket
}

// Função para controlar o relé
async function controlarRele(estado) {
  try {
    await controlRelay(estado);
    console.log(`Comando de relé '${estado}' enviado com sucesso.`);
    // Opcional: Adicionar feedback visual ao usuário
  } catch (error) {
    console.error('Erro ao enviar comando de relé:', error);
    // Opcional: Adicionar feedback de erro ao usuário
  }
}

// Inicialização
onMounted(() => {
  buscarUmidadeInicial()
  iniciarWebSocket()
})
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center p-6 sm:p-10 transition-colors duration-500"
  >
    <div
      class="w-full max-w-4xl bg-white dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-10 sm:p-12 transition-all duration-300"
      role="main"
      aria-labelledby="titulo-monitor"
    >
      <!-- Cabeçalho -->
      <header class="flex justify-between items-center mb-10">
        <h1 id="titulo-monitor" class="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Monitor de Umidade do Solo
        </h1>
        <button
          @click="alternarTema()"
          class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Alternar tema"
        >
          <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          <span class="text-sm font-medium">{{ isDark ? 'Escuro' : 'Claro' }}</span>
        </button>
      </header>

      <!-- Conteúdo Principal -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Exibição da Umidade -->
        <div class="flex flex-col items-center justify-center text-center">
          <div class="text-7xl sm:text-8xl font-extrabold mb-2" :class="corUmidade" aria-live="polite">
            {{ umidade ?? '--' }}<span class="text-3xl sm:text-4xl">%</span>
          </div>
          <p class="mt-2 text-base text-gray-600 dark:text-gray-400 font-medium">
            {{ sugestaoUmidade }}
          </p>
          <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Última atualização: {{ ultimaAtualizacao || 'Pendente' }} • <span class="font-semibold">{{ statusConexao }}</span>
          </p>
        </div>

        <!-- Barra de Progresso -->
        <div class="flex flex-col">
          <label
            for="barra-umidade"
            class="text-base font-semibold text-gray-700 dark:text-gray-300 mb-3"
          >
            Nível de Umidade do Solo
          </label>
          <div
            class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner"
            role="progressbar"
            :aria-valuenow="umidade ?? 0"
            aria-valuemin="0"
            aria-valuemax="100"
            id="barra-umidade"
          >
            <div
              class="h-full transition-all duration-500 ease-in-out"
              :class="{
                'bg-red-500': umidade <= 20,
                'bg-amber-400': umidade > 20 && umidade < 50,
                'bg-green-500': umidade >= 50,
              }"
              :style="{ width: umidade ? `${umidade}%` : '0%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Adicionado para Temperatura e Umidade do Ar -->
      <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
        <div class="bg-white dark:bg-gray-800/70 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center justify-center gap-2">
            <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Temperatura
          </h3>
          <p class="text-5xl font-bold text-blue-600 dark:text-blue-400">
            {{ temperatura ?? '--' }}°C
          </p>
        </div>
        <div class="bg-white dark:bg-gray-800/70 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center justify-center gap-2">
            <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M14 10a2 2 0 11-4 0h4zM7 6h10l4 14H3L7 6z"></path></svg>
            Umidade do Ar
          </h3>
          <p class="text-5xl font-bold text-purple-600 dark:text-purple-400">
            {{ umidadeAr ?? '--' }}%
          </p>
        </div>
      </div>

      <!-- Controle do Relé -->
      <div class="mt-10 text-center">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Controle da Bomba D'água</h2>
        <div class="flex justify-center items-center gap-4">
          <button
            @click="controlarRele('ligar')"
            class="px-8 py-4 bg-green-500 text-white font-bold rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-700"
          >
            Ligar Bomba
          </button>
          <button
            @click="controlarRele('desligar')"
            class="px-8 py-4 bg-red-500 text-white font-bold rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-700"
          >
            Desligar Bomba
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.animate-fade-in) {
  animation: fade-in 0.5s ease-out;
}

button:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.transition-all {
  transition: all 0.3s ease-in-out;
}
</style>
