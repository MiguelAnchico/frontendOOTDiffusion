import axios from "axios";

const VTO_API_BASE_URL = "http://127.0.0.1:8384";

const PhotoService = {
  // Función principal para procesar fotos con VTO
  processPhotos: async (userPhoto, templatePhoto) => {
    console.log("🚀 Iniciando procesamiento VTO...");
    console.log("👤 Usuario:", userPhoto);
    console.log("👗 Template:", templatePhoto);

    try {
      // Crear FormData según el formato que espera tu API
      const formData = new FormData();

      // Agregar imagen de la persona (archivo binario)
      formData.append("person_image", userPhoto.file);

      // Agregar ID de la ropa - extraer el número del nombre del template
      // Asumiendo que templatePhoto.name contiene el ID o que templatePhoto tiene un id
      const clotheId =
        templatePhoto.id || PhotoService.extractIdFromName(templatePhoto.name);
      formData.append("clothe_id", clotheId.toString());

      console.log(`📤 Enviando: imagen + clothe_id=${clotheId}`);

      // Realizar petición POST a tu API VTO
      const response = await axios.post(`${VTO_API_BASE_URL}/vto`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Timeout de 5 minutos para el procesamiento
        timeout: 300000,
        // Mostrar progreso de subida
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`📤 Subida: ${percentCompleted}%`);
        },
      });

      console.log("✅ VTO Response:", response.data);

      // Verificar si la respuesta fue exitosa
      if (response.data.success) {
        // SOLUCIÓN ANTI-CACHÉ: Agregar timestamp único a la URL
        const baseImageUrl = `${VTO_API_BASE_URL}${response.data.image_url}`;
        const timestamp = Date.now();
        const noCacheImageUrl = `${baseImageUrl}?t=${timestamp}&nocache=${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        console.log(`🔄 URL sin caché: ${noCacheImageUrl}`);

        return {
          success: true,
          imageUrl: noCacheImageUrl,
          originalUrl: baseImageUrl, // URL original sin parámetros anti-caché
          message: `Imagen procesada exitosamente en ${response.data.processing_time.toFixed(
            2
          )}s`,
          metadata: {
            clotheId: response.data.clothe_id,
            clotheName: response.data.clothe_name,
            category: response.data.category,
            modelType: response.data.model_type,
            processingTime: response.data.processing_time,
            timestamp: timestamp,
            // Incluir métricas si están disponibles
            ...(response.data.metrics && { metrics: response.data.metrics }),
          },
        };
      } else {
        throw new Error(
          response.data.error || "Error desconocido en el procesamiento"
        );
      }
    } catch (error) {
      console.error("❌ Error en VTO:", error);

      let errorMessage = "Error al procesar las imágenes";

      if (error.response) {
        // Error del servidor (4xx, 5xx)
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);

        if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 404) {
          errorMessage = "Ropa no encontrada. Verifica el ID de la prenda.";
        } else if (error.response.status === 500) {
          errorMessage =
            "Error interno del servidor. Intenta de nuevo más tarde.";
        }
      } else if (error.request) {
        // Error de red
        errorMessage =
          "No se pudo conectar con el servidor. Verifica que esté funcionando.";
      } else if (error.code === "ECONNABORTED") {
        // Timeout
        errorMessage =
          "La petición tardó demasiado. El servidor podría estar sobrecargado.";
      }

      throw new Error(errorMessage);
    }
  },

  // Función auxiliar para extraer ID del nombre del archivo
  extractIdFromName: (name) => {
    // Si el nombre tiene formato como "clothe_1.jpg" o "1_shirt.png"
    const match = name.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1; // Default a 1 si no encuentra número
  },

  // Función para obtener lista de ropas disponibles
  getAvailableClothes: async () => {
    try {
      console.log("👗 Obteniendo lista de ropas...");
      const response = await axios.get(`${VTO_API_BASE_URL}/clothes`);

      if (response.data.success) {
        console.log(`📋 ${response.data.total} ropas disponibles`);
        return response.data.clothes;
      } else {
        throw new Error("Error obteniendo lista de ropas");
      }
    } catch (error) {
      console.error("❌ Error obteniendo ropas:", error);
      throw new Error("No se pudo obtener la lista de ropas disponibles");
    }
  },

  // Función para verificar estado del servidor
  checkServerHealth: async () => {
    try {
      const response = await axios.get(`${VTO_API_BASE_URL}/health`, {
        timeout: 5000,
      });

      console.log("🏥 Server Health:", response.data);
      return {
        isHealthy: response.data.status === "healthy",
        detectorReady: response.data.detector_ready,
        clotheCount: response.data.clothe_count,
        // Incluir métricas de rendimiento si están disponibles
        ...(response.data.performance && {
          performance: response.data.performance,
        }),
      };
    } catch (error) {
      console.error("❌ Server health check failed:", error);
      return {
        isHealthy: false,
        error: "Servidor no disponible",
      };
    }
  },

  // Función para obtener métricas del servidor
  getServerMetrics: async () => {
    try {
      console.log("📊 Obteniendo métricas del servidor...");
      const response = await axios.get(`${VTO_API_BASE_URL}/metrics`, {
        timeout: 5000,
      });

      if (response.data.success) {
        console.log("📈 Métricas obtenidas:", response.data.metrics);
        return response.data.metrics;
      } else {
        throw new Error("Error obteniendo métricas");
      }
    } catch (error) {
      console.error("❌ Error obteniendo métricas:", error);
      throw new Error("No se pudieron obtener las métricas del servidor");
    }
  },

  // Función para descargar imagen resultado SIN parámetros de caché
  downloadResult: async (imageUrl, filename = "vto_result.png") => {
    try {
      // Limpiar URL de parámetros anti-caché para descarga
      const cleanUrl = imageUrl.split("?")[0];

      const response = await axios.get(cleanUrl, {
        responseType: "blob",
        // Headers anti-caché para asegurar descarga fresca
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      // Crear link de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log("📥 Imagen descargada:", filename);
    } catch (error) {
      console.error("❌ Error descargando imagen:", error);
      throw new Error("No se pudo descargar la imagen");
    }
  },

  // Función para crear URL sin caché para cualquier imagen
  createNoCacheUrl: (baseUrl) => {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}t=${timestamp}&nocache=${randomId}`;
  },

  // Función para precargar imagen sin caché (útil para evitar delays en el render)
  preloadImage: (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();

      // Asegurar que no use caché del navegador
      img.crossOrigin = "anonymous";

      img.onload = () => {
        console.log("🖼️ Imagen precargada exitosamente");
        resolve(img);
      };

      img.onerror = (error) => {
        console.error("❌ Error precargando imagen:", error);
        reject(error);
      };

      // Agregar parámetros anti-caché si no los tiene
      const noCacheUrl = imageUrl.includes("?t=")
        ? imageUrl
        : PhotoService.createNoCacheUrl(imageUrl);

      img.src = noCacheUrl;
    });
  },
};

export default PhotoService;
