<template>
  <div>
    <AdminLayout>
      <BreadCrumb :pages="pages" />
      <div class="grid grid-cols-1 gap-6">
        <!-- Detalles del crédito -->
        <div class="bg-white dark:bg-gray-900/80 rounded-lg shadow-sm p-6">
          <div v-if="isLoading" class="flex justify-center items-center h-40">
            <LoadingSpinner />
          </div>
          <div v-else-if="error" class="text-error-600 dark:text-error-500 p-4">
            Error al cargar los datos: {{ error }}
          </div>
          <div v-else-if="credito">
            <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Crédito #{{ codCredito }}
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-sm text-gray-500 dark:text-gray-400">Monto Total</h3>
                <p class="text-xl font-semibold text-gray-900 dark:text-white">${{ credito.montoTotalCredito?.toFixed(2) }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-sm text-gray-500 dark:text-gray-400">Cantidad de Cuotas</h3>
                <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ credito.cantidadCuotas }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-sm text-gray-500 dark:text-gray-400">Estado</h3>
                <p
                  class="text-xl font-semibold"
                  :class="credito.montoPendiente <= 0 ? 'text-success-600 dark:text-success-500' : 'text-warning-600 dark:text-warning-500'"
                >
                  {{ credito.montoPendiente <= 0 ? 'Pagado' : 'Pendiente' }}
                </p>
              </div>
            </div>

            <!-- Tabla de cuotas -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50 dark:bg-gray-800">
                    <th class="py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Nº</th>
                    <th class="py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Vencimiento</th>
                    <th class="py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Capital</th>
                    <th class="py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Interés</th>
                    <th class="py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Total</th>
                    <th class="py-3 px-4 text-gray-500 dark:text-gray-400 font-medium">Estado</th>
                    <th class="py-3 px-4 text-gray-500 dark:text-gray-400 font-medium text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="cuota in credito.detalle"
                    :key="cuota.nroCuota"
                    class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td class="py-3 px-4 text-gray-900 dark:text-white">{{ cuota.nroCuota }}</td>
                    <td class="py-3 px-4 text-gray-900 dark:text-white">
                      {{ formatDate(cuota.fechaVencimiento) }}
                    </td>
                    <td class="py-3 px-4 text-gray-900 dark:text-white">${{ cuota.monCuoCap?.toFixed(2) }}</td>
                    <td class="py-3 px-4 text-gray-900 dark:text-white">${{ cuota.intFinCuo?.toFixed(2) }}</td>
                    <td class="py-3 px-4 text-gray-900 dark:text-white font-medium">${{ cuota.cuotaTotal?.toFixed(2) }}</td>
                    <td class="py-3 px-4">
                      <span
                        class="inline-block px-3 py-1 text-xs rounded-md font-medium"
                        :class="getPagoStatusClass(cuota)"
                      >
                        {{ getPagoStatusText(cuota) }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <button
                        @click="realizarPago(cuota)"
                        :disabled="isPagada(cuota)"
                        class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm"
                        :class="isPagada(cuota)
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed dark:bg-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-500'
                          : 'text-white bg-blue-600 hover:bg-blue-700 border border-blue-600'"
                      >
                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                        </svg>
                        Pagar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import BreadCrumb from '@/components/ui/Breadcrumb.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useClienteCreditoPago } from '@/composables/useClienteCreditoPagos'

const route = useRoute()
const codCredito = ref(route.params.codCredito as string || '')

const pages = [
  {
    name: 'Inicio',
    href: '/',
    current: false,
  },
  {
    name: 'Créditos',
    href: '/creditos',
    current: false,
  },
  {
    name: `Crédito #${codCredito.value}`,
    href: `/creditos/${codCredito.value}`,
    current: true,
  },
]

// Utilizar el composable para obtener los datos del crédito
const { credito, isLoading, error } = useClienteCreditoPago(codCredito.value)

// Formatear fecha
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
  // Formato alternativo: DD/MM/YYYY
  // const d = new Date(date)
  // return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

// Determinar el estado de la cuota
import type { Detalle } from '@/interface/ClienteCreditoPagos'

const getPagoStatusText = (cuota: Detalle) => {
  const haPagado = cuota.detallesPago?.totalPagado > 0 || cuota.pagada === true
  const estaVencida = new Date(cuota.fechaVencimiento) < new Date()

  if (haPagado) return 'Pagado'
  if (estaVencida) return 'Vencido'
  return 'Pendiente'
}

// Determinar la clase CSS según el estado
const getPagoStatusClass = (cuota: Detalle) => {
  const haPagado = cuota.detallesPago?.totalPagado > 0 || cuota.pagada === true
  const estaVencida = new Date(cuota.fechaVencimiento) < new Date()

  if (haPagado) return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-500'
  if (estaVencida) return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
}

// Verificar si una cuota está pagada
const isPagada = (cuota: Detalle) => {
  // Verificar si la cuota está pagada según los detalles de pago
  if (cuota.detallesPago?.totalPagado > 0) return true
  // También verificar si está marcada como pagada en su propiedad 'pagada'
  if (cuota.pagada === true) return true
  return false
}

// Manejar el pago de la cuota
const realizarPago = (cuota: Detalle) => {
  // Aquí implementarías la lógica para realizar el pago
  // Por ahora, solo mostraremos un mensaje en consola y simularemos una redirección
  console.log('Realizar pago de la cuota:', cuota)

  // O mostrar un modal de confirmación (requeriría implementar un sistema de modales)
  alert(`Se iniciará el proceso de pago para la cuota ${cuota.nroCuota} por $${cuota.cuotaTotal.toFixed(2)}`)

  // Si necesitas navegar a otra página para el pago:
  // const router = useRouter()
  // router.push(`/creditos/${codCredito.value}/pago/${cuota.nroCuota}`)
}
</script>
