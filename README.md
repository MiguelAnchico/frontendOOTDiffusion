# OOTDiffusion Virtual Try-On - Frontend

## 🌟 Descripción del Proyecto

Esta es la aplicación web frontend para el sistema de Virtual Try-On basado en OOTDiffusion. Permite a los usuarios probar virtualmente prendas de vestir utilizando tecnología de inteligencia artificial avanzada.

## 🏗️ Arquitectura del Sistema

El sistema implementa una **arquitectura cliente-servidor** que separa la interfaz de usuario del procesamiento computacional intensivo:

- **Frontend (este repositorio)**: Aplicación web React que maneja la interacción con el usuario
- **Backend**: Servidor con procesamiento de IA alojado en vast.ai con GPUs especializadas
- **Modelos**: OOTDiffusion para virtual try-on y MobileNet-SSD para detección de personas

### Especificaciones del Servidor Backend

- **GPU**: NVIDIA RTX 3090 (24GB VRAM)
- **Almacenamiento**: 80GB SSD
- **OS**: Linux con soporte CUDA
- **Python**: 3.10

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o yarn

### Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/MiguelAnchico/OOTDifussionAcademicActivity.git
cd OOTDifussionAcademicActivity
```

2. **Instalar dependencias**

```bash
npm install
# o
yarn install
```

3. **Iniciar la aplicación**

```bash
npm run dev
# o
yarn dev
```

4. **Abrir en el navegador**

```
http://localhost:5173
```

## 🎯 Funcionalidades

- **📸 Captura de imagen**: Usa la cámara de tu dispositivo o sube una foto
- **👕 Selección de prendas**: Elige entre diferentes tipos de ropa:
  - Prendas superiores (camisetas, blusas)
  - Prendas inferiores (pantalones, faldas)
  - Vestidos completos
- **🤖 Procesamiento IA**: Virtual try-on realista powered by OOTDiffusion
- **📱 Responsive**: Funciona en desktop y móvil

## 🔗 Backend y Documentación Completa

Para el código completo del backend, implementación de modelos de IA, documentación técnica detallada y profundización en el funcionamiento completo del sistema, visita:

**🔗 [Backend Repository - OOTDiffusion Complete Implementation](https://github.com/MiguelAnchico/OOTDifussionAcademicActivity)**

El repositorio del backend contiene:

- Implementación completa de OOTDiffusion
- Detector MobileNet-SSD para personas
- API REST para procesamiento de imágenes
- Pipeline de preprocessing y postprocessing
- Documentación técnica completa
- Dockerización y deployment
- Análisis de rendimiento y resultados

## 🛠️ Tecnologías Utilizadas

- **React 18** - Interfaz de usuario
- **Vite** - Build tool y dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - HTTP client para API calls

## 🌐 Flujo de la Aplicación

1. **Captura/Upload**: Usuario toma foto o sube imagen
2. **Selección**: Elige el tipo de prenda a probar
3. **Envío**: Datos se envían al servidor via HTTP
4. **Procesamiento**: Backend ejecuta:
   - Detección de persona (MobileNet-SSD)
   - Virtual try-on (OOTDiffusion)
   - Post-procesamiento
5. **Resultado**: Imagen procesada se muestra al usuario

## 🤝 Contribución

Este proyecto forma parte de una actividad académica. Para contribuciones:

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte de una investigación académica sobre Virtual Try-On usando OOTDiffusion.

## 🆘 Soporte

Para problemas técnicos o preguntas sobre la implementación, por favor abre un issue en este repositorio o consulta la documentación completa del sistema en el repositorio del backend.

---

**⚡ Powered by OOTDiffusion & React + Vite**
