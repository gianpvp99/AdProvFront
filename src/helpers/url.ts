export const AUTH = {
  login: '/security/login'
};

export const TABLAMAESTRA = {
  dropdown: '/container/TablaMaestra_Dropdown',
  puntajeFinal_List: '/container/PuntajeFinal_List',
};

export const CLIENTE = {
  clienteProyectoGrupo_List: '/container/ClienteProyectoGrupo_List',
  cliente_list: '/container/Cliente_List',
  cliente_Dropdown: '/container/Cliente_Dropdown',
  cliente_insertupdate: '/container/Cliente_InsertUpdate',
  contratistaDocumentos_Insert: '/container/ContratistaDocumentos_Insert',
  empleadosDocumentos_Insert: '/container/EmpleadosDocumentos_Insert',
  contratistaclienteHom_delete: '/container/ContratistaClienteHom_Delete',
  cliente_delete: '/container/Cliente_Delete',
  empresaMatriz_Get: '/container/EmpresaMatriz_Get',
  empleadoMatriz_Get: '/container/EmpleadoMatriz_Get',
  documentoHomEmpresa_List: '/container/DocumentoHomEmpresa_List',
  documentoEmpresa_Get: '/container/DocumentoEmpresa_Get',
  documentoEmpleado_Get: '/container/DocumentoEmpleado_Get',
  empresaDocumento_InsertUpdate: '/container/EmpresaDocumento_InsertUpdate',
  empleado_list_document: '/container/Empleado_List_document',
};

export const CONTRATISTA = {
  contratistaCliente_List: '/container/ContratistaCliente_List',
  empresadocpresentados_List: '/container/EmpresaDocPresentados_List',
  contratista_list: '/container/Contratista_List',
  contratista_dropdown: '/container/Contratista_Dropdown',
  contratista_insertupdate: '/container/Contratista_InsertUpdate',
  contratista_delete: '/container/Contratista_Delete',
  contratistaSustento_InsertUpdate: '/container/ContratistaSustento_InsertUpdate',
  contratistaLogin_insert: '/container/ContratistaLogin_Insert',
  contratistaGrupo_List: '/container/ContratistaGrupo_List',
  contratistaProyecto_InsertUpdate: '/container/ContratistaProyecto_InsertUpdate',
  contratistaProyecto_List: '/container/ContratistaProyecto_List',
  contratistaCliente_UpdateEstado: '/container/ContratistaCliente_UpdateEstado',
  contratistaEmpleado_UpdateEstado: '/container/ContratistaEmpleado_UpdateEstado',
  contratista_Report: '/container/Contratista_Report',
};

export const DOCUMENTO = {
  documento_List: '/container/Documento_List',
  documento_InsertUpdate: '/container/Documento_InsertUpdate',
  documento_Delete: '/container/Documento_Delete',
  homologacionEmpresa_Delete: '/container/HomologacionEmpresa_Delete',
}

export const EMPLEADO = {
  documentoHomEmpleado_List: '/container/DocumentoHomEmpleado_List',
  empleado_list: '/container/Empleado_List',
  empleado_insertupdate: '/container/Empleado_InsertUpdate',
  empleado_delete: '/container/Empleado_Delete',
  empleadoSustento_InsertUpdate: '/container/EmpleadoSustento_InsertUpdate',
  empleado_DocPresentados_List: '/container/Empleado_DocPresentados_List',
  empleadoClienteHom_Delete: '/container/EmpleadoClienteHom_Delete',
  empleadoClienteHom_Update: '/container/EmpleadoClienteHom_Update',
  empleadoCadenaQr: '/container/generate_cadena_qr',
  empleadoConvertCadenaQr: '/container/generateQr'
};

export const SEGURIDAD = {
  usuario_list: '/security/usuario_list',
  usuario_insertupdate: '/security/usuario_insertupdate',
  usuario_delete: '/security/usuario_delete',
  rol_list: '/security/role_list',
  role_add: '/security/role_add',
  role_update: '/security/role_update',
  rol_delete: '/security/role_LogDeleteRole',

  typeUser_list: '/security/tipo_user_list',
  access_list: '/security/access_list',
  role_access_list_Modal: '/security/role_aceess_list_Modal',
  role_access_list: '/security/role_aceess_list',
  role_accessNew_list: '/security/role_access',
  role_access_add: '/security/role_aceess_add',
  role_access_delete: '/security/AccessRole_delete',
  role_ForTypeUser_list: '/security/RoleForTypeUSer_list'


  // perfil_list: '/cotizacion/perfil_list',
  // perfil_insertupdate: '/cotizacion/perfil_insertupdate',
  // perfil_dropdown: '/cotizacion/perfil_dropdown',
  // perfil_delete: '/cotizacion/perfil_delete',
};

export const GOOGLEDRIVE = {
  drive_list: '/container/ObtenerArchivos',
  delete_files: '/container/EliminarArchivos',
  deleteEmp_files: '/container/EliminarArchivosEmp',
  create_Folder: '/container/IniciarCarpetaUnica',
  createEmp_Folder: '/container/IniciarCarpetaUnicaEmp'
}

export const MENU = {
  menu: ''
}