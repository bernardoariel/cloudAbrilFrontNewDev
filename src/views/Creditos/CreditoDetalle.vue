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
                      <div v-if="isPagada(cuota)" class="text-gray-500 dark:text-gray-400">
                        Ya pagado
                      </div>
                      <div v-else-if="processingCuota === cuota.nroCuota" class="flex items-center justify-center">
                        <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Procesando...</span>
                      </div>
                      <div v-else>
                        <!-- Botón mejorado de Mercado Pago -->
                        <button
                          @click="realizarPago(cuota)"
                          class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors shadow-sm text-white bg-blue-600 hover:bg-blue-700 border border-blue-600"
                        >
                          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                          </svg>
                          Pagar con Mercado Pago
                        </button>
                      </div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import BreadCrumb from '@/components/ui/Breadcrumb.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useClienteCreditoPago } from '@/composables/useClienteCreditoPagos'
import axios from 'axios'
import '@/assets/css/mercado-pago.css'
import mercadoPagoService from '@/services/mercadoPago.service'

const route = useRoute()
const codCredito = ref(route.params.codCredito as string || '')
const processingCuota = ref<number | null>(null) // Tracking qué cuota está en proceso
const isDevelopment = process.env.NODE_ENV !== 'production'
const mercadoPagoPublicKey = 'APP_USR-0592010c-6b73-4480-ba4e-e058a011f9ec'

onMounted(() => {
  // Cargar el script de Mercado Pago
  const script = document.createElement('script')
  script.src = 'https://sdk.mercadopago.com/js/v2'
  script.async = true
  document.body.appendChild(script)

  script.onload = () => {
    // Inicializar Mercado Pago cuando el script está cargado
    if (window.MercadoPago) {
      const mp = new window.MercadoPago(mercadoPagoPublicKey, {
        locale: 'es-AR'
      })
      window.mp = mp
      console.log('Mercado Pago SDK inicializado correctamente');
    }
  }

  // Verificar si hay algún pago pendiente de verificar (por si el usuario regresa después de pagar)
  const checkPendingPayment = async () => {
    const transactionData = localStorage.getItem('mp_transaction_data')

    if (transactionData) {
      try {
        const { id, timestamp, codCredito: storedCodCredito, nroCuota } = JSON.parse(transactionData)

        // Solo verificar pagos recientes (menos de 30 minutos) y del mismo crédito
        const isRecent = (Date.now() - timestamp) < (30 * 60 * 1000)
        const isSameCredit = storedCodCredito === codCredito.value

        if (isRecent && isSameCredit) {
          console.log('Verificando pago pendiente:', id)

          // Verificar el estado del pago consultando al backend
          try {
            const response = await axios.get(`http://localhost:3000/api/mercado-pago/verificar-pago/${id}`)

            if (response.data && response.data.status === 'approved') {
              // Notificar al backend y actualizar la UI
              await notificarPagoRealizado(storedCodCredito, nroCuota, id)
              alert('¡Pago verificado con éxito!')

              // Actualizar los datos del crédito para reflejar el pago
              // Si hay un método refetch disponible en el composable
              if (typeof credito.value?.refetch === 'function') {
                await credito.value.refetch()
              }
            }
          } catch (error) {
            console.error('Error al verificar pago pendiente:', error)
          } finally {
            // Limpiar el storage para no volver a verificar
            localStorage.removeItem('mp_transaction_data')
          }
        } else {
          // Si el pago es antiguo o de otro crédito, limpiar
          localStorage.removeItem('mp_transaction_data')
        }
      } catch (error) {
        console.error('Error al procesar datos de transacción guardados:', error)
        localStorage.removeItem('mp_transaction_data')
      }
    }
  }

  // Verificar pagos pendientes después de que se carga la página
  setTimeout(checkPendingPayment, 1000)
})

onUnmounted(() => {
  // Eliminar el script al desmontar el componente
  const script = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')
  if (script) {
    document.body.removeChild(script)
  }
})

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

// Interfaces para Mercado Pago
import type { Detalle } from '@/interface/ClienteCreditoPagos'

// Extender la interfaz Window para incluir MercadoPago
declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: Record<string, unknown>) => unknown;
    mp: unknown;
  }
}

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

// Manejar el pago de la cuota con Mercado Pago
const realizarPago = async (cuota: Detalle) => {
  try {
    // Establecer qué cuota específica está siendo procesada
    processingCuota.value = cuota.nroCuota
    console.log('Iniciando pago con Mercado Pago para la cuota:', cuota.nroCuota)

    // 1. Llamada a la API del backend para generar el link de pago utilizando el servicio
    const preferenceData = await mercadoPagoService.generarLinkPago(codCredito.value, cuota.nroCuota)

    if (preferenceData && preferenceData.init_point) {
      console.log('Preferencia de pago creada:', preferenceData)

      // 2. Determinar qué URL utilizar según el entorno
      const checkoutUrl = isDevelopment
        ? preferenceData.sandbox_init_point
        : preferenceData.init_point

      // 3. Almacenar temporalmente los datos de la transacción para verificación posterior
      // Esto puede ser útil para verificar cuando el usuario regrese desde la página de pago
      localStorage.setItem('mp_transaction_data', JSON.stringify({
        codCredito: codCredito.value,
        nroCuota: cuota.nroCuota,
        id: preferenceData.id,
        timestamp: new Date().getTime()
      }))

      // 4. Crear un listener para cuando la ventana de pago se cierre
      const checkPaymentStatus = async () => {
        try {
          // Verificar el estado del pago consultando al backend
          const paymentStatus = await mercadoPagoService.verificarPago(preferenceData.id)

          if (paymentStatus && paymentStatus.status === 'approved') {
            // Si el pago fue aprobado, notificar al backend
            await mercadoPagoService.confirmarPago(codCredito.value, cuota.nroCuota, preferenceData.id)

            // Actualizar la UI para reflejar el pago
            alert('¡Pago realizado con éxito!')

            // Actualizar los datos del crédito
            // Recargar la página o refrescar los datos usando la función disponible
            if (typeof credito.value?.refetch === 'function') {
              await credito.value.refetch()
            } else {
              // Si no hay método refetch, recargar la página como fallback
              window.location.reload()
            }
          }
        } catch (error) {
          console.error('Error al verificar el estado del pago:', error)
        }
      }

      // 5. Abrir la ventana de pago
      const paymentWindow = window.open(checkoutUrl, '_blank')

      // 6. Verificar periódicamente el estado del pago cuando el usuario regrese
      // Este enfoque verifica si la ventana fue cerrada
      if (paymentWindow) {
        const checkWindowInterval = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkWindowInterval)
            // Esperar un momento para que se procese el pago y luego verificar
            setTimeout(() => {
              checkPaymentStatus()
            }, 2000)
          }
        }, 1000)
      }
    } else {
      throw new Error('No se recibió una respuesta válida del servicio de pagos')
    }
  } catch (error) {
    console.error('Error al iniciar el pago con Mercado Pago:', error)
    alert('Ha ocurrido un error al intentar procesar el pago. Por favor, intente nuevamente.')
  } finally {
    // Restablecer el estado de procesamiento
    processingCuota.value = null
  }
}
</script>
