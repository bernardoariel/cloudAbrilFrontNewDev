import { apiAbrilSql } from "@/api/apiAbrilSql"
import { useQuery } from "@tanstack/vue-query"

import type { ClienteContacto } from "@/interface/ClienteContacto"


const getClienteContacto = async(codCliente:string):Promise<ClienteContacto> =>{
  const { data } = await apiAbrilSql.get<ClienteContacto[]>(`/clientes-contactos/${codCliente}`)
  // Si data es un array, retorna solo el primero
  return Array.isArray(data) ? data[0] : data;
}

export const useClienteContacto = (codCliente:string) =>{

    const { isLoading, data} = useQuery<ClienteContacto>({
        queryKey: ['cliente-contacto', codCliente],
        queryFn: ()=> getClienteContacto(codCliente), // es una funcion no una ejecucion
        enabled: !!codCliente,// opcional: evita llamar si está vacío/undefined
    })

  return{
    clienteContacto:data,
    isLoading
  }

}

