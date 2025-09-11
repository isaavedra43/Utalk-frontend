# Módulo de Recursos Humanos - Funcionalidades de Empleados

## Nuevas Funcionalidades Implementadas

### 1. Agregar Nuevo Empleado

**Ubicación:** Botón "Agregar Empleado" en la lista de empleados

**Características:**
- Formulario multi-paso con 4 secciones:
  1. **Información Básica**: Nombre, apellido, teléfono (obligatorio), email (opcional), número de empleado (generado automáticamente), estado, fecha de ingreso
  2. **Información Personal**: RFC, CURP, NSS, fecha de nacimiento, género, estado civil, dirección completa
  3. **Información Laboral**: Puesto, departamento, nivel, reporta a, descripción del puesto
  4. **Nómina y Contrato**: Sueldo base, SBC, saldo de vacaciones, tipo de contrato, horas de trabajo, horario personalizado por día

**Funcionalidades:**
- ✅ Subida de foto de avatar del empleado
- ✅ **Generación automática de número de empleado en secuencia**
- ✅ Validación de campos obligatorios
- ✅ Barra de progreso visual
- ✅ Navegación entre pasos
- ✅ Validación en tiempo real
- ✅ Manejo de errores
- ✅ Indicador de carga para generación de número
- ✅ **Horario personalizado por día con horarios específicos**

### 2. Importar Empleados Masivos

**Ubicación:** Botón "Importar" en la lista de empleados

**Características:**
- Importación desde archivos Excel (.xlsx, .xls)
- Plantilla descargable con formato correcto
- Vista previa de datos antes de importar
- Validación de datos
- Reporte de resultados con errores detallados

**Campos Soportados en Excel:**
- Información básica: Número Empleado, Nombre, Apellido, Email, Teléfono
- Información personal: RFC, CURP, NSS, Fecha Nacimiento, Género, Estado Civil
- Información laboral: Puesto, Departamento, Nivel, Reporta a
- Nómina: Sueldo Base, SBC, Fecha Ingreso, Tipo Contrato, Horas Trabajo
- Vacaciones: Saldo Vacaciones, Saldo Enfermedad
- Dirección: Calle, Número, Colonia, Ciudad, Estado, Código Postal
- Contacto de emergencia: Nombre, Relación, Teléfono
- Información bancaria: Banco, Número Cuenta, CLABE

**Funcionalidades:**
- ✅ Drag & drop de archivos
- ✅ Validación de formato de archivo
- ✅ Vista previa de datos
- ✅ Plantilla descargable
- ✅ Reporte detallado de errores
- ✅ Estadísticas de importación

## Estructura de Archivos

```
src/modules/hr/components/
├── AddEmployeeModal.tsx      # Modal para agregar empleado
├── ImportEmployeesModal.tsx  # Modal para importar empleados
├── EmployeeList.tsx          # Lista de empleados (actualizada)
└── EmployeeDetail.tsx        # Detalle de empleado
```

## Generación Automática de Números de Empleado

### Formato del Número
- **Formato**: `EMP{YY}{NNNN}`
- **Ejemplo**: `EMP241001` (EMP + año 24 + número 1001)
- **Secuencia**: Los números se generan automáticamente en orden secuencial
- **Año**: Se incluye el año actual para facilitar la identificación

### Características
- ✅ **Generación automática**: No requiere entrada manual
- ✅ **Secuencia garantizada**: Cada empleado recibe un número único
- ✅ **Indicador visual**: Muestra estado de generación con spinner
- ✅ **Campo de solo lectura**: Previene modificaciones accidentales
- ✅ **Regeneración**: Se genera un nuevo número al resetear el formulario

### Integración con Backend
```typescript
// Endpoint recomendado para obtener el siguiente número
GET /api/employees/next-number
// Respuesta: { "nextNumber": "EMP241001" }
```

## Horarios Personalizados por Día

### Funcionalidad
- ✅ **Horario estándar**: Opciones predefinidas (Lunes a Viernes, Lunes a Sábado, etc.)
- ✅ **Horario personalizado**: Configuración individual por cada día de la semana
- ✅ **Horarios específicos**: Diferentes horarios para días específicos (ej: Sábado 9:00-14:00)
- ✅ **Vista previa**: Muestra el horario generado en tiempo real
- ✅ **Validación**: Solo permite horarios válidos

### Opciones de Horario Estándar
- **Días**: Lunes a Viernes, Lunes a Sábado, Martes a Sábado, etc.
- **Horarios**: 6:00-14:00 (Matutino), 9:00-18:00 (Regular), 14:00-22:00 (Vespertino), 22:00-6:00 (Nocturno)

### Horario Personalizado
- **Configuración por día**: Activar/desactivar cada día individualmente
- **Horarios específicos**: Hora de inicio y fin para cada día
- **Ejemplo de uso**: 
  - Lunes a Viernes: 9:00-18:00
  - Sábado: 9:00-14:00 (medio día)
  - Domingo: No laboral

### Formato de Salida
```
"Lunes 09:00-18:00, Martes 09:00-18:00, Miércoles 09:00-18:00, Jueves 09:00-18:00, Viernes 09:00-18:00, Sábado 09:00-14:00"
```

## Vista de Nómina para Empleado Específico

### Funcionalidad
- ✅ **Vista completa de nómina**: Información detallada de todos los períodos de pago
- ✅ **Navegación por pestañas**: Resumen, Nómina, Asistencia, Vacaciones, Documentos, etc.
- ✅ **Gráficos interactivos**: Visualización de tendencias de salarios
- ✅ **Filtros avanzados**: Por período, estado de pago, búsqueda
- ✅ **Exportación**: Descarga de recibos PDF
- ✅ **Desglose detallado**: Percepciones y deducciones por período

### Características de la Vista de Nómina
- **Resumen general**: Salario base, promedio neto, total deducciones, períodos
- **Lista de períodos**: Historial completo con filtros y búsqueda
- **Detalles por período**: Desglose completo de percepciones y deducciones
- **Gráficos de tendencias**: Comparación bruto vs neto, evolución temporal
- **Estados de pago**: Pagado, pendiente, procesando
- **Vista previa**: Información en tiempo real del período seleccionado

### Componentes Creados
1. **EmployeeDetailView**: Vista principal con navegación por pestañas
2. **EmployeePayrollView**: Vista específica de nómina con toda la funcionalidad
3. **EmployeeAttendanceView**: Vista específica de asistencia con toda la funcionalidad
4. **EmployeeVacationsView**: Vista específica de vacaciones con toda la funcionalidad
5. **EmployeeDocumentsView**: Vista específica de documentos con gestión completa de archivos
6. **EmployeeIncidentsView**: Vista específica de incidencias con gestión completa de reportes
7. **EmployeeEvaluationsView**: Vista específica de evaluaciones con gestión completa de rendimiento
8. **EmployeeSkillsView**: Vista específica de habilidades con gestión completa de competencias
9. **UploadFilesModal**: Modal completo para subir archivos con drag & drop
10. **PayrollChart**: Gráficos interactivos para visualizar datos de nómina
11. **AttendanceChart**: Gráficos interactivos para visualizar datos de asistencia
12. **VacationsChart**: Gráficos interactivos para visualizar datos de vacaciones

### Navegación
- **Desde lista de empleados**: Click en cualquier empleado abre la vista de detalle
- **Pestaña Nómina**: Acceso directo a toda la información de nómina
- **Pestaña Asistencia**: Acceso directo a toda la información de asistencia
- **Pestaña Vacaciones**: Acceso directo a toda la información de vacaciones
- **Pestaña Documentos**: Acceso directo a toda la información de documentos
- **Pestaña Incidencias**: Acceso directo a toda la información de incidencias
- **Pestaña Evaluaciones**: Acceso directo a toda la información de evaluaciones
- **Pestaña Habilidades**: Acceso directo a toda la información de habilidades
- **Botón regresar**: Navegación fluida de vuelta a la lista

## Vista de Vacaciones para Empleado Específico

### Funcionalidad
- ✅ **Vista completa de vacaciones**: Información detallada de saldo, solicitudes, historial y calendario
- ✅ **Navegación por pestañas**: Resumen, Solicitudes, Historial, Calendario
- ✅ **Gráficos interactivos**: Visualización de uso de vacaciones y distribución por tipo
- ✅ **Filtros avanzados**: Por período, tipo de vacaciones, estado y búsqueda
- ✅ **Exportación**: Descarga de reportes de vacaciones
- ✅ **Gestión de solicitudes**: Crear, editar, cancelar solicitudes de vacaciones

### Características de la Vista de Vacaciones
- **Resumen general**: Días disponibles, días usados, pendientes, última vacación
- **Solicitudes**: Historial completo con filtros y búsqueda
- **Historial**: Vacaciones pasadas con detalles de aprobación
- **Calendario**: Vista de calendario con vacaciones programadas
- **Gráficos de tendencias**: Uso de vacaciones, distribución por tipo
- **Política de vacaciones**: Días anuales, acumulación, períodos restringidos

### Tipos de Vacaciones Manejados
- **Vacaciones**: Días de descanso anual
- **Personal**: Días para asuntos personales
- **Incapacidad**: Días por enfermedad
- **Maternidad**: Días por maternidad
- **Paternidad**: Días por paternidad
- **Sin goce**: Días sin pago
- **Compensatorio**: Días compensatorios

### Estados de Solicitudes
- **Pendiente**: Esperando aprobación
- **Aprobada**: Solicitud aprobada
- **Rechazada**: Solicitud rechazada
- **Cancelada**: Solicitud cancelada

### Gráficos Disponibles
- **Uso de Vacaciones**: Línea temporal de días utilizados
- **Distribución por Tipo**: Gráfico de pastel por tipo de vacación
- **Tendencias**: Evolución del uso de vacaciones
- **Uso Mensual**: Distribución por meses

## Vista de Documentos para Empleado Específico

### Funcionalidad
- ✅ **Vista completa de documentos**: Información detallada de todos los archivos relacionados
- ✅ **Gestión de archivos**: Subir, descargar, ver, editar y eliminar documentos
- ✅ **Filtros avanzados**: Por tipo de archivo, categoría, fecha y búsqueda
- ✅ **Vista dual**: Modo de cuadrícula y lista para visualización
- ✅ **Categorización**: Organización por categorías específicas
- ✅ **Metadatos**: Información detallada de cada archivo

### Características de la Vista de Documentos
- **Resumen general**: Total de archivos, tamaño total, categorías, última subida
- **Categorías**: Contratos, identificación, médicos, académicos, desempeño, disciplinarios, personales
- **Filtros**: Por tipo de archivo, categoría, búsqueda por texto
- **Vista dual**: Cuadrícula y lista para diferentes preferencias
- **Acciones**: Ver, descargar, editar, eliminar, compartir
- **Metadatos**: Tamaño, fecha de subida, descargas, descripción, etiquetas

### Tipos de Archivos Soportados
- **PDF**: Documentos en formato PDF
- **Imágenes**: JPG, PNG, GIF, etc.
- **Videos**: MP4, AVI, MOV, etc.
- **Audios**: MP3, WAV, AAC, etc.
- **Documentos**: DOC, DOCX, TXT, etc.
- **Hojas de Cálculo**: XLS, XLSX, CSV, etc.
- **Presentaciones**: PPT, PPTX, etc.
- **Archivos**: ZIP, RAR, 7Z, etc.

### Categorías de Documentos
- **Contratos**: Contratos laborales, anexos, modificaciones
- **Identificación**: INE, pasaporte, credenciales
- **Médicos**: Certificados médicos, estudios, recetas
- **Académicos**: Títulos, certificados, diplomas
- **Desempeño**: Evaluaciones, reportes, presentaciones
- **Disciplinarios**: Reportes, sanciones, advertencias
- **Personales**: Fotos, documentos personales
- **Otros**: Documentos diversos

### Funcionalidades de Gestión
- **Subida de archivos**: Drag & drop, selección múltiple
- **Vista previa**: Visualización de archivos sin descargar
- **Descarga**: Descarga individual o múltiple
- **Edición**: Modificar metadatos, descripción, etiquetas
- **Eliminación**: Eliminar archivos con confirmación
- **Compartir**: Compartir archivos con otros usuarios
- **Exportar**: Exportar listado de documentos

### Metadatos de Archivos
- **Información básica**: Nombre, tipo, tamaño, fecha de subida
- **Categorización**: Categoría, etiquetas, descripción
- **Acceso**: Público/privado, número de descargas
- **Auditoría**: Quién subió, cuándo, último acceso
- **Estados**: Favoritos, archivado, eliminado

## Formulario de Subida de Archivos

### Funcionalidad
- ✅ **Drag & Drop**: Arrastrar y soltar archivos directamente
- ✅ **Selección múltiple**: Subir varios archivos simultáneamente
- ✅ **Validación completa**: Tipos de archivo y tamaños permitidos
- ✅ **Vista previa**: Previsualización de imágenes antes de subir
- ✅ **Metadatos**: Categoría, descripción, etiquetas, visibilidad
- ✅ **Progreso en tiempo real**: Barra de progreso y estados de subida
- ✅ **Gestión de errores**: Validación y manejo de errores

### Características del Formulario
- **Área de drop**: Zona grande para arrastrar archivos
- **Selección manual**: Botón para seleccionar archivos del sistema
- **Validación en tiempo real**: Verificación inmediata de archivos
- **Vista previa**: Imágenes mostradas antes de subir
- **Formulario de metadatos**: Campos para cada archivo individual
- **Progreso visual**: Barras de progreso durante la subida
- **Estados claros**: Pending, uploading, success, error

### Tipos de Archivos Soportados
- **PDF**: Documentos en formato PDF
- **Imágenes**: JPG, JPEG, PNG, GIF, BMP, WEBP
- **Videos**: MP4, AVI, MOV, WMV, FLV, WEBM
- **Audios**: MP3, WAV, AAC, FLAC, OGG
- **Documentos**: DOC, DOCX, TXT, RTF
- **Hojas de Cálculo**: XLS, XLSX, CSV
- **Presentaciones**: PPT, PPTX
- **Archivos**: ZIP, RAR, 7Z, TAR, GZ

### Validaciones Implementadas
- **Tamaño máximo**: 100MB por archivo
- **Tipos permitidos**: Solo extensiones soportadas
- **Validación de duplicados**: Prevención de archivos duplicados
- **Verificación de integridad**: Validación de archivos corruptos
- **Límites de cantidad**: Máximo de archivos por subida

### Metadatos Configurables
- **Categoría**: Selección de categoría específica
- **Descripción**: Texto descriptivo del archivo
- **Etiquetas**: Sistema de etiquetas personalizadas
- **Visibilidad**: Archivo público o privado
- **Información adicional**: Campos personalizables

### Estados de Subida
- **Pending**: Archivo listo para subir
- **Uploading**: Archivo en proceso de subida
- **Success**: Archivo subido exitosamente
- **Error**: Error en la subida del archivo

### Funcionalidades Avanzadas
- **Vista previa de imágenes**: Thumbnails automáticos
- **Progreso granular**: Porcentaje de subida por archivo
- **Cancelación**: Posibilidad de cancelar subidas
- **Reintento**: Reintentar archivos con error
- **Limpieza automática**: Eliminación de archivos temporales

## Vista de Incidencias para Empleado Específico

### Funcionalidad
- ✅ **Vista completa de incidencias**: Información detallada de todos los tipos de incidencias
- ✅ **Gestión de reportes**: Generar, imprimir, firmar, subir y guardar reportes
- ✅ **Tipos de incidencias**: Administrativas, robo, accidentes, lesiones, disciplinarias
- ✅ **Flujo de trabajo**: Generar → Imprimir → Firmar → Subir → Guardar
- ✅ **Seguimiento completo**: Control total de todos los casos posibles
- ✅ **Análisis y estadísticas**: Gráficos y métricas de incidencias

### Características de la Vista de Incidencias
- **Resumen general**: Total de incidencias, abiertas, cerradas, críticas
- **Navegación por pestañas**: Resumen, Incidencias, Reportes, Análisis
- **Filtros avanzados**: Por tipo, estado, severidad y búsqueda
- **Gestión de reportes**: Generación de diferentes tipos de reportes
- **Seguimiento de estados**: Borrador, pendiente, en revisión, aprobado, cerrado
- **Control de severidad**: Baja, media, alta, crítica

### Tipos de Incidencias Manejados
- **Administrativas**: Actas administrativas, faltas menores
- **Robo**: Reportes de robo, hurto, pérdida de equipos
- **Accidentes**: Accidentes laborales, caídas, lesiones en el trabajo
- **Lesiones**: Heridas, cortadas, lesiones menores
- **Disciplinarias**: Faltas graves, sanciones, advertencias
- **Seguridad**: Violaciones de seguridad, protocolos
- **Equipo**: Daño o pérdida de equipos de trabajo
- **Otros**: Incidencias diversas no categorizadas

### Estados de Incidencias
- **Borrador**: Incidencia en proceso de creación
- **Pendiente**: Esperando revisión o aprobación
- **En Revisión**: Siendo evaluada por supervisores
- **Aprobado**: Incidencia aprobada y documentada
- **Rechazado**: Incidencia rechazada o descartada
- **Cerrado**: Incidencia resuelta y archivada

### Niveles de Severidad
- **Baja**: Incidencias menores sin consecuencias graves
- **Media**: Incidencias moderadas con algunas consecuencias
- **Alta**: Incidencias importantes que requieren atención
- **Crítica**: Incidencias graves que requieren acción inmediata

### Flujo de Trabajo de Reportes
1. **Generar**: Crear nuevo reporte de incidencia
2. **Imprimir**: Generar documento físico para firma
3. **Firmar**: Obtener firmas de involucrados y supervisores
4. **Subir**: Cargar documento firmado al sistema
5. **Guardar**: Archivar y registrar en el sistema

### Información Detallada de Incidencias
- **Datos básicos**: Título, descripción, fecha, hora, ubicación
- **Personas involucradas**: Empleado, testigos, supervisores
- **Evidencia**: Documentos, fotos, videos relacionados
- **Acciones tomadas**: Medidas implementadas
- **Consecuencias**: Resultados y sanciones aplicadas
- **Medidas preventivas**: Acciones para evitar recurrencia
- **Seguimiento**: Fechas de seguimiento y resolución

### Funcionalidades de Gestión
- **Crear incidencia**: Formulario completo para nuevos reportes
- **Editar incidencia**: Modificar información existente
- **Imprimir reporte**: Generar documento para firma
- **Subir documentos**: Cargar evidencia y documentos firmados
- **Seguimiento**: Control de fechas y estados
- **Análisis**: Estadísticas y tendencias de incidencias

### Reportes Disponibles
- **Acta Administrativa**: Documento formal para faltas administrativas
- **Reporte de Robo**: Documento para robos y hurtos
- **Reporte de Accidente**: Documento para accidentes laborales
- **Reporte de Lesión**: Documento para lesiones en el trabajo
- **Reporte Disciplinario**: Documento para faltas disciplinarias
- **Reporte de Equipo**: Documento para daños o pérdidas de equipo

### Metadatos de Incidencias
- **Información básica**: ID, tipo, severidad, estado, prioridad
- **Fechas**: Fecha de ocurrencia, reporte, seguimiento
- **Ubicación**: Lugar específico donde ocurrió la incidencia
- **Personas**: Involucrados, testigos, supervisores, revisores
- **Documentos**: Evidencia, reportes médicos, policiales
- **Costos**: Gastos asociados, reclamaciones de seguro
- **Etiquetas**: Sistema de etiquetas para categorización

## Vista de Evaluaciones para Empleado Específico

### Funcionalidad
- ✅ **Vista completa de evaluaciones**: Información detallada de rendimiento, objetivos y competencias
- ✅ **Gestión de evaluaciones**: Generar, completar, aprobar y archivar evaluaciones
- ✅ **Tipos de evaluaciones**: Anual, trimestral, mensual, rendimiento, objetivos, competencias
- ✅ **Seguimiento de objetivos**: Control de metas y objetivos individuales
- ✅ **Evaluación de competencias**: Análisis de habilidades y competencias
- ✅ **Reportes de rendimiento**: Generación de reportes detallados

### Características de la Vista de Evaluaciones
- **Resumen general**: Total de evaluaciones, puntuación promedio, objetivos completados
- **Navegación por pestañas**: Resumen, Evaluaciones, Objetivos, Competencias, Reportes
- **Filtros avanzados**: Por tipo, estado, período y búsqueda
- **Métricas de rendimiento**: Puntuaciones, tendencias, comparaciones
- **Seguimiento de objetivos**: Estado, progreso, fechas de vencimiento
- **Análisis de competencias**: Niveles, evidencia, desarrollo

### Tipos de Evaluaciones Manejados
- **Anual**: Evaluación completa de rendimiento anual
- **Trimestral**: Evaluación trimestral de objetivos y rendimiento
- **Mensual**: Evaluación mensual de progreso
- **Rendimiento**: Evaluación específica de desempeño
- **Objetivos**: Evaluación de cumplimiento de objetivos
- **Competencias**: Evaluación de habilidades y competencias
- **360° Feedback**: Evaluación de múltiples fuentes
- **Período de Prueba**: Evaluación durante período de prueba

### Estados de Evaluaciones
- **Borrador**: Evaluación en proceso de creación
- **En Progreso**: Evaluación siendo completada
- **Completada**: Evaluación terminada y lista para revisión
- **Aprobada**: Evaluación aprobada por supervisores
- **Rechazada**: Evaluación rechazada o devuelta
- **Archivada**: Evaluación archivada y cerrada

### Categorías de Evaluación
- **Liderazgo**: Capacidad de liderar equipos y tomar decisiones
- **Comunicación**: Habilidades de comunicación verbal y escrita
- **Innovación**: Creatividad e innovación en proyectos
- **Resultados**: Cumplimiento de objetivos y resultados
- **Colaboración**: Trabajo en equipo y colaboración
- **Desarrollo**: Crecimiento profesional y aprendizaje

### Gestión de Objetivos
- **Objetivos individuales**: Metas específicas del empleado
- **Objetivos departamentales**: Metas del departamento
- **Objetivos corporativos**: Metas de la empresa
- **Seguimiento de progreso**: Control de avance y cumplimiento
- **Fechas de vencimiento**: Plazos y deadlines
- **Estados de objetivos**: No iniciado, en progreso, completado, superado, no cumplido

### Evaluación de Competencias
- **Competencias técnicas**: Habilidades específicas del puesto
- **Competencias blandas**: Habilidades interpersonales
- **Competencias de liderazgo**: Capacidades de gestión
- **Niveles de competencia**: Principiante, intermedio, avanzado, experto
- **Evidencia de competencias**: Ejemplos y demostraciones
- **Plan de desarrollo**: Acciones para mejorar competencias

### Métricas y KPIs
- **Puntuación promedio**: Score general de rendimiento
- **Tendencia de rendimiento**: Evolución a lo largo del tiempo
- **Cumplimiento de objetivos**: Porcentaje de objetivos logrados
- **Competencias dominadas**: Número de competencias en nivel experto
- **Comparación con pares**: Benchmarking interno
- **Progreso de desarrollo**: Avance en plan de desarrollo

### Reportes Disponibles
- **Reporte de Rendimiento**: Análisis completo de desempeño
- **Reporte de Objetivos**: Seguimiento de objetivos y metas
- **Reporte de Competencias**: Evaluación de competencias
- **Reporte de Tendencias**: Análisis de tendencias de rendimiento
- **360° Feedback**: Evaluación de múltiples fuentes
- **Reporte Consolidado**: Reporte completo de evaluaciones

### Plan de Desarrollo
- **Objetivos de desarrollo**: Metas de crecimiento profesional
- **Capacitación**: Cursos y entrenamientos recomendados
- **Mentoría**: Programas de mentoría y coaching
- **Timeline**: Cronograma de desarrollo
- **Recursos**: Herramientas y recursos disponibles
- **Seguimiento**: Control de progreso del plan

### Feedback y Comentarios
- **Fortalezas**: Aspectos positivos del empleado
- **Áreas de mejora**: Puntos a desarrollar
- **Recomendaciones**: Sugerencias específicas
- **Comentarios generales**: Observaciones del evaluador
- **Plan de acción**: Pasos concretos a seguir
- **Seguimiento**: Fechas de revisión y seguimiento

## Vista de Habilidades para Empleado Específico

### Funcionalidad
- ✅ **Vista completa de habilidades**: Información detallada de competencias, habilidades técnicas, blandas y certificaciones
- ✅ **Gestión de habilidades**: Registrar, evaluar, actualizar y desarrollar habilidades
- ✅ **Categorías de habilidades**: Técnicas, blandas, liderazgo, idiomas, certificaciones
- ✅ **Sistema de evaluación**: Niveles de competencia con puntuaciones y evidencia
- ✅ **Plan de desarrollo**: Objetivos de desarrollo, capacitación y mentoría
- ✅ **Gestión de certificaciones**: Control de certificaciones activas, expiradas y pendientes

### Características de la Vista de Habilidades
- **Resumen general**: Total de habilidades, nivel promedio, certificaciones activas, habilidades core
- **Navegación por pestañas**: Resumen, Habilidades, Certificaciones, Desarrollo, Evaluación
- **Filtros avanzados**: Por categoría, nivel y búsqueda
- **Métricas de competencias**: Puntuaciones, tendencias, comparaciones
- **Seguimiento de desarrollo**: Planes de desarrollo, mentoría, recursos
- **Análisis de certificaciones**: Estados, fechas de expiración, verificación

### Categorías de Habilidades Manejadas
- **Técnicas**: Habilidades específicas del puesto y tecnología
- **Blandas**: Habilidades interpersonales y de comunicación
- **Liderazgo**: Capacidades de gestión y liderazgo de equipos
- **Idiomas**: Dominio de idiomas extranjeros
- **Certificaciones**: Certificaciones profesionales y técnicas

### Niveles de Competencia
- **Principiante**: Conocimiento básico, necesita supervisión
- **Intermedio**: Conocimiento sólido, puede trabajar independientemente
- **Avanzado**: Conocimiento experto, puede enseñar a otros
- **Experto**: Dominio completo, puede innovar y liderar

### Gestión de Habilidades
- **Registro de habilidades**: Nombre, categoría, nivel, descripción
- **Evaluación continua**: Puntuaciones, evidencia, fechas de evaluación
- **Habilidades core**: Habilidades esenciales para el puesto
- **Habilidades requeridas**: Habilidades obligatorias para el rol
- **Plan de desarrollo**: Objetivos específicos para cada habilidad
- **Recursos de aprendizaje**: Cursos, libros, mentoría

### Sistema de Evaluación
- **Puntuación numérica**: Escala de 1 a 5 puntos
- **Evidencia**: Ejemplos concretos de aplicación de la habilidad
- **Última evaluación**: Fecha de la última evaluación
- **Próxima revisión**: Fecha programada para la siguiente evaluación
- **Mentor asignado**: Persona responsable del desarrollo
- **Recursos**: Herramientas y materiales de aprendizaje

### Gestión de Certificaciones
- **Certificaciones activas**: Certificaciones vigentes y válidas
- **Certificaciones expiradas**: Certificaciones que han vencido
- **Certificaciones pendientes**: Certificaciones en proceso de obtención
- **Certificaciones suspendidas**: Certificaciones temporalmente inactivas
- **Información detallada**: Emisor, fecha de emisión, expiración, ID de credencial
- **Verificación**: Enlaces para verificar la autenticidad
- **Archivos adjuntos**: Certificados y documentos de respaldo

### Plan de Desarrollo
- **Objetivos específicos**: Metas claras para cada habilidad
- **Capacitación**: Cursos y entrenamientos recomendados
- **Mentoría**: Programas de mentoría y coaching
- **Recursos**: Libros, videos, herramientas de aprendizaje
- **Timeline**: Cronograma de desarrollo
- **Seguimiento**: Control de progreso y avance

### Métricas y KPIs
- **Nivel promedio**: Score general de competencias
- **Habilidades dominadas**: Número de habilidades en nivel experto
- **Certificaciones activas**: Número de certificaciones vigentes
- **Habilidades core**: Porcentaje de habilidades esenciales dominadas
- **Tendencia de desarrollo**: Evolución de competencias a lo largo del tiempo
- **Progreso de desarrollo**: Avance en planes de desarrollo

### Evaluación de Habilidades
- **Auto-evaluación**: Evaluación personal de habilidades
- **Evaluación 360°**: Evaluación de múltiples fuentes
- **Evaluación por Supervisor**: Evaluación directa del supervisor
- **Evaluación por Objetivos**: Evaluación basada en resultados
- **Reporte de Competencias**: Análisis completo de competencias
- **Reporte de Desarrollo**: Plan de desarrollo personalizado

### Top Habilidades
- **Habilidades destacadas**: Habilidades con puntuación alta (4.0+)
- **Categorización**: Agrupación por tipo de habilidad
- **Evidencia**: Ejemplos de aplicación exitosa
- **Desarrollo continuo**: Planes para mantener y mejorar

### Áreas de Desarrollo
- **Habilidades en desarrollo**: Habilidades con puntuación baja (<3.5)
- **Priorización**: Habilidades más importantes para desarrollar
- **Plan de acción**: Pasos específicos para mejorar
- **Recursos asignados**: Herramientas y apoyo para el desarrollo
- **Seguimiento**: Control de progreso y avance

### Filtros y Búsqueda
- **Búsqueda por texto**: Nombre o descripción de habilidad
- **Filtro por categoría**: Técnicas, blandas, liderazgo, idiomas, certificaciones
- **Filtro por nivel**: Principiante, intermedio, avanzado, experto
- **Filtro por estado**: Activas, en desarrollo, dominadas
- **Ordenamiento**: Por nombre, nivel, fecha de evaluación

### Integración con Evaluaciones
- **Vínculo con evaluaciones**: Conexión con evaluaciones de rendimiento
- **Consistencia de datos**: Sincronización entre habilidades y evaluaciones
- **Historial completo**: Seguimiento de evolución de competencias
- **Reportes integrados**: Análisis combinado de rendimiento y competencias

## Vista de Asistencia para Empleado Específico

### Funcionalidad
- ✅ **Vista completa de asistencia**: Información detallada de horarios, horas extras, ausencias y puntualidad
- ✅ **Navegación por pestañas**: Resumen, Asistencia, Horas Extra, Ausencias
- ✅ **Gráficos interactivos**: Visualización de tendencias de asistencia y horas
- ✅ **Filtros avanzados**: Por período, tipo de asistencia, estado y búsqueda
- ✅ **Exportación**: Descarga de reportes de asistencia
- ✅ **Estadísticas detalladas**: Métricas de puntualidad y asistencia

### Características de la Vista de Asistencia
- **Resumen general**: Días presentes, horas totales, horas extra, puntualidad
- **Registro de asistencia**: Historial completo con filtros y búsqueda
- **Horas extra**: Registro detallado con aprobaciones
- **Ausencias**: Vacaciones, incapacidades, días personales
- **Gráficos de tendencias**: Asistencia, distribución de horas, puntualidad
- **Estados de asistencia**: Presente, tardanza, ausente, medio día, vacaciones, incapacidad

### Tipos de Datos Manejados
- **Registro de asistencia**: Entrada, salida, horas totales, horas extra, ubicación
- **Horas extra**: Tipo (regular, doble, triple, festivo), razón, aprobación
- **Ausencias**: Tipo (vacaciones, incapacidad, personal, maternidad, paternidad), días, estado
- **Estadísticas**: Score de puntualidad, score de asistencia, promedios

### Gráficos Disponibles
- **Tendencia de Asistencia**: Líneas para presente, tardanza y ausente
- **Distribución de Horas**: Áreas para horas regulares y horas extra
- **Puntualidad**: Evolución del score de puntualidad
- **Horas Extra**: Tendencias de horas extra por período

### Ejemplo de Datos de Nómina
```typescript
interface PayrollPeriod {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  status: 'paid' | 'pending' | 'processing';
  paymentDate?: string;
  pdfUrl?: string;
}

// Ejemplo de período
const examplePeriod: PayrollPeriod = {
  id: 'PER202401',
  period: 'Enero 2024',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  grossSalary: 25000,
  deductions: 3750,
  netSalary: 21250,
  status: 'paid',
  paymentDate: '2024-02-05',
  pdfUrl: '/receipts/EMP241001_PER202401.pdf'
};
```

### Tipos de Gráficos Disponibles
- **comparison**: Compara salario bruto vs neto
- **gross**: Solo salario bruto
- **net**: Solo salario neto
- **deductions**: Solo deducciones

## Uso

### Agregar Empleado Individual

```tsx
import { AddEmployeeModal } from './components/AddEmployeeModal';

const [isModalOpen, setIsModalOpen] = useState(false);

const handleSaveEmployee = async (employeeData) => {
  // Lógica para guardar empleado
  console.log('Guardando empleado:', employeeData);
};

<AddEmployeeModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={handleSaveEmployee}
/>
```

### Importar Empleados Masivos

```tsx
import { ImportEmployeesModal } from './components/ImportEmployeesModal';

const [isImportModalOpen, setIsImportModalOpen] = useState(false);

const handleImportEmployees = async (file) => {
  // Lógica para procesar archivo Excel
  console.log('Importando desde archivo:', file.name);
};

<ImportEmployeesModal
  isOpen={isImportModalOpen}
  onClose={() => setIsImportModalOpen(false)}
  onImport={handleImportEmployees}
/>
```

## Integración con Backend

### Endpoints Requeridos

1. **POST /api/employees** - Crear empleado individual
2. **POST /api/employees/import** - Importar empleados masivos
3. **GET /api/employees/template** - Descargar plantilla Excel

### Estructura de Datos

Los componentes esperan la siguiente estructura de datos según los tipos definidos en `src/types/hr.ts`:

```typescript
interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: EmployeeStatus;
  hireDate: Date;
  personalInfo: PersonalInfo;
  position: Position;
  location: Location;
  contract: Contract;
  salary: SalaryInfo;
  sbc: number;
  vacationBalance: number;
  sickLeaveBalance: number;
  metrics: EmployeeMetrics;
  // ... más campos
}
```

## Próximos Pasos

1. **Integración con Backend**: Conectar con APIs reales
2. **Validación Avanzada**: Validación de RFC, CURP, emails únicos
3. **Notificaciones**: Sistema de notificaciones para errores y éxitos
4. **Historial**: Log de cambios y auditoría
5. **Plantillas Personalizadas**: Diferentes plantillas por departamento
6. **Validación de Archivos**: Validación más robusta de archivos Excel

## Notas Técnicas

- Los componentes usan React hooks para manejo de estado
- Implementación responsive con Tailwind CSS
- Validación de formularios en tiempo real
- Manejo de errores y estados de carga
- Componentes reutilizables y modulares
- Tipado completo con TypeScript
