import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiAbrilSql } from '@/api/apiAbrilSql'

export interface UserState {
  codCliente: string
  nroDoc: string
  token: string | null
  isAuthenticated: boolean
  userInfo: any | null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserState>({
    codCliente: '',
    nroDoc: '',
    token: null,
    isAuthenticated: false,
    userInfo: null
  })

  const isAuthenticated = computed(() => user.value.isAuthenticated)
  const userInfo = computed(() => user.value.userInfo)

  async function login(codCliente: string, nroDoc: string) {
    try {
      const { data } = await apiAbrilSql.post('/login', {
        codCliente,
        nroDoc
      })

      // Si la respuesta es exitosa, guardar los datos del usuario
      user.value = {
        codCliente,
        nroDoc,
        token: data.token || null, // Asume que la API retorna un token
        isAuthenticated: true,
        userInfo: data.user || data // Guarda la información del usuario
      }

      // Guardar en localStorage para persistencia
      localStorage.setItem('user', JSON.stringify(user.value))

      return { success: true, data }
    } catch (error: any) {
      console.error('Error de login:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Error al iniciar sesión'
      }
    }
  }

  function logout() {
    // Resetear el estado
    user.value = {
      codCliente: '',
      nroDoc: '',
      token: null,
      isAuthenticated: false,
      userInfo: null
    }

    // Eliminar datos de localStorage
    localStorage.removeItem('user')
  }

  function initialize() {
    // Cargar datos del usuario desde localStorage al iniciar la aplicación
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        user.value = parsedUser
      } catch (e) {
        console.error('Error al parsear datos del usuario:', e)
        logout() // En caso de error, limpiar datos
      }
    }
  }

  // Inicializar al cargar el store
  initialize()

  return {
    user,
    isAuthenticated,
    userInfo,
    login,
    logout
  }
})
