import { CoreMenu } from '@core/types';


// Obtener los datos del menú almacenados en el localStorage
const storedMenu = localStorage.getItem('menuAux');
let menu: CoreMenu[] = [];

if (storedMenu) {
  // Si hay datos almacenados en el localStorage, convertirlos a formato JSON y asignarlos al menú
  menu = JSON.parse(storedMenu);
  console.log(menu); // Imprimir el menú obtenido del localStorage
} else {
  console.log('No se encontraron datos del menú en el localStorage');
}

export { menu };

// export const menu: CoreMenu[] = [
//   {
//     id: 'Titulo',
//     title: 'Inicio',
//     type: 'section',
//     icon: 'home',
//     children: [{
//       id: 'clientes',
//       title: 'Estadísticas',
//       disabled: true,
//       hidden: false,
//       type: 'item',
//       icon: 'bar-chart-2',
//       url: 'estadisticas'
//     }
//     ]
//   },
//   {
//     id: 'Proceso',
//     title: 'Control General',
//     type: 'section',
//     icon: 'hexagon',
//     children: [{
//       id: 'clientes',
//       title: 'Clientes',
//       type: 'item',
//       icon: 'users',
//       url: 'dashboard/cliente-parconsil'
//     },
//     {
//       id: 'contratistas',
//       title: 'Contratistas',
//       type: 'item',
//       icon: 'briefcase',
//       url: 'dashboard/contratista-parconsil'
//     },
    
//     ]
//   },
//   {

//     id: 'clientes',
//     title: 'Clientes',
//     type: 'section',
//     icon: 'users',
//     children: [
//       {
//         id: 'contratistas',	
//         title: 'Contratistas',
//         type: 'item',
//         icon: 'briefcase',
//         url: 'dashboard/clientes/cliente-contratista'
//       },
//       {
//         id: 'control-ingresos',	
//         title: 'Control Ingreso',
//         type: 'item',
//         icon: 'security-door',
//         url: 'dashboard/clientes/ingreso-empleados'
//       },
//       {
//         id: 'usuarios',
//         title: 'Usuarios',
//         type: 'item',
//         icon: 'user',
//         disabled: true,
//         url: 'dashboard/clientes/usuarios'
//       }
//     ]

// },
//   {
//     id: 'dashboard',
//     title: 'Perfil Contratista',
//     type: 'section',
//     icon: 'hexagon',
//     children: [
//       {
//         id: 'contratistas',
//         title: 'Clientes',
//         type: 'item',
//         icon: 'briefcase',
//         url: 'dashboard/contratistas/contratista-clientes',
//       }
//     ]
//   },
//   {
//     id: 'auditoria',
//     title: 'Auditoría',
//     type: 'section',
//     icon: 'layers',
//     children: [
//       {
//         id: 'auditoria',
//         title: 'Auditoría',
//         type: 'item',
//         icon: 'auditoria',
//         url: 'dashboard/auditoria'
//       },
//       {
//         id: 'documentos',
//         title: 'Documentos',
//         type: 'item',
//         icon: 'book',
//         url: 'dashboard/regimen'
//       }]
//   },
//   {
//     id: 'seguridad',
//     title: 'Seguridad',
//     type: 'section',
//     icon: 'shield',
//     children: [{
//       id: 'usuario',
//       title: 'Usuarios',
//       type: 'item',
//       icon: 'user',
//       url: 'seguridad/usuario'
//     },
//     {
//       id: 'roles',
//       title: 'Roles',
//       type: 'item',
//       icon: 'roles',
//       url: 'seguridad/roles'
//     },
//     {
//       id: 'sector',
//       title: 'Sector',
//       type: 'item',
//       icon: 'sector',
//       disabled: true,
//       url: 'seguridad/sector'
//     },
//     ]
//   }
// ];
