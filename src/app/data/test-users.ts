/**
 * Usuarios de prueba para ViniHotel
 * Usa estos usuarios para iniciar sesión y probar diferentes funcionalidades
 */

export const testUsers = {
  clientes: [
    {
      email: "cliente@ejemplo.com",
      password: "cliente123",
      name: "Carlos Mendoza",
      role: "customer" as const,
      description: "Cliente regular"
    },
    {
      email: "maria@ejemplo.com",
      password: "maria123",
      name: "María García",
      role: "customer" as const,
      description: "Cliente frecuente"
    },
    {
      email: "pedro@ejemplo.com",
      password: "pedro123",
      name: "Pedro López",
      role: "customer" as const,
      description: "Cliente nuevo"
    }
  ],
  
  staff: [
    {
      email: "staff@vinihotel.com",
      password: "staff123",
      name: "Ana Rodríguez",
      role: "staff" as const,
      description: "Recepcionista - Gestiona reservas y limpieza"
    },
    {
      email: "recepcion@vinihotel.com",
      password: "recepcion123",
      name: "Luis Martínez",
      role: "staff" as const,
      description: "Personal de recepción"
    }
  ],
  
  administracion: [
    {
      email: "admin@vinihotel.com",
      password: "admin123",
      name: "Roberto Administrador",
      role: "admin" as const,
      description: "Administrador principal - Acceso completo"
    },
    {
      email: "gerente@vinihotel.com",
      password: "gerente123",
      name: "Sofia Gerente",
      role: "admin" as const,
      description: "Gerente general"
    }
  ]
};

// Lista plana de todos los usuarios para autenticación
export const allTestUsers = [
  ...testUsers.clientes,
  ...testUsers.staff,
  ...testUsers.administracion
];
