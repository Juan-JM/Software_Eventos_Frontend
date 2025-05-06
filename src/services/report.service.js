// frontend/src/services/report.service.js
import api from './api';

/**
 * Servicio para gestionar los reportes
 */
export const generateReport = async (reportType, endpoint, params = {}) => {
  try {
    // Construcción de la URL con los query params
    const url = new URL(`${api.defaults.baseURL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    // Realizar la petición con responseType blob para manejar archivos binarios
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error al generar el reporte: ${response.statusText}`);
    }

    // Obtener el blob del archivo
    const blob = await response.blob();

    // Crear un objeto URL para el blob
    const downloadUrl = window.URL.createObjectURL(blob);

    // Crear un elemento a para descargar el archivo
    const link = document.createElement('a');
    link.href = downloadUrl;

    // Obtener el nombre del archivo desde headers o usar un nombre por defecto
    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'reporte';
    
    if (contentDisposition) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, '');
      }
    } else {
      // Si no hay content-disposition, usar un nombre por defecto según el tipo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '').substring(0, 14);
      filename = `reporte_${timestamp}.${reportType}`;
    }

    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Limpieza
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(link);

    return { success: true, message: `Reporte ${filename} generado correctamente` };
  } catch (error) {
    console.error('Error generando reporte:', error);
    throw error;
  }
};

/**
 * Genera un reporte de auditoría en formato CSV
 * @param {Object} filters - Filtros a aplicar
 */
export const generateAuditCsvReport = async (filters = {}) => {
  return generateReport('csv', 'audit/export_csv/', filters);
};

/**
 * Genera un reporte de auditoría en formato Excel
 * @param {Object} filters - Filtros a aplicar
 */
export const generateAuditExcelReport = async (filters = {}) => {
  return generateReport('xlsx', 'audit/export_excel/', filters);
};

/**
 * Genera un reporte de auditoría en formato PDF
 * @param {Object} filters - Filtros a aplicar
 */
export const generateAuditPdfReport = async (filters = {}) => {
  return generateReport('pdf', 'audit/export_pdf/', filters);
};