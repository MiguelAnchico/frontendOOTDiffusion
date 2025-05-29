import { useRef, useState, useEffect } from "react";
import { Camera, Upload, Image, X, RotateCcw } from "lucide-react";

const PhotoUploader = ({ onPhotoSelected, selectedPhoto }) => {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onPhotoSelected({
          file: file,
          preview: e.target.result,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      setIsVideoReady(false);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user", // Cámara frontal
        },
      });

      setStream(mediaStream);
      setIsCameraOpen(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Esperar a que el video esté listo
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .then(() => {
              setIsVideoReady(true);
            })
            .catch((err) => {
              console.error("Error al reproducir video:", err);
              setError("Error al inicializar la cámara");
            });
        };
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      setError("No se pudo acceder a la cámara. Verifica los permisos.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    setIsVideoReady(false);
    setCountdown(null);
    setError(null);
  };

  const startCountdown = () => {
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            capturePhoto();
            setCountdown(null);
          }, 1000); // Esperar 1 segundo después del "1" antes de tomar la foto
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && isVideoReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Configurar el canvas con las dimensiones del video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar el frame actual del video en el canvas
      context.drawImage(video, 0, 0);

      // Convertir a blob y crear archivo
      canvas.toBlob(
        (blob) => {
          const file = new File([blob], `foto_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          const preview = canvas.toDataURL("image/jpeg");

          onPhotoSelected({
            file: file,
            preview: preview,
            name: file.name,
          });

          stopCamera();
        },
        "image/jpeg",
        0.8
      );
    }
  };

  // Limpiar recursos al desmontar el componente
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 mb-6 flex-1">
      <h2 className="text-xl font-semibold mb-4 text-white">Sube tu foto</h2>

      {isCameraOpen ? (
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-80 h-60 object-cover rounded-lg border-2 border-blue-500 bg-gray-700"
            />

            {/* Overlay de carga */}
            {!isVideoReady && (
              <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Iniciando cámara...</p>
                </div>
              </div>
            )}

            {/* Overlay de cuenta regresiva */}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="text-6xl font-bold animate-pulse mb-2">
                    {countdown}
                  </div>
                  <p className="text-lg">¡Prepárate!</p>
                </div>
              </div>
            )}

            {/* Mensaje de captura */}
            {countdown === 0 && (
              <div className="absolute inset-0 bg-green-600 bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-lg font-bold">¡Foto tomada!</p>
                </div>
              </div>
            )}

            <button
              onClick={stopCamera}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <div className="flex justify-center space-x-4">
            <button
              onClick={startCountdown}
              disabled={!isVideoReady || countdown !== null}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                !isVideoReady || countdown !== null
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <Camera className="w-5 h-5" />
              <span>
                {countdown !== null ? "Tomando foto..." : "Tomar Foto"}
              </span>
            </button>

            <button
              onClick={stopCamera}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      ) : selectedPhoto ? (
        <div className="text-center">
          <img
            src={selectedPhoto.preview}
            alt="Foto seleccionada"
            className="w-32 h-32 object-cover rounded-lg mx-auto mb-4 border-2 border-green-500"
          />
          <p className="text-sm text-blue-400 mb-4">
            ✓ Foto seleccionada: {selectedPhoto.name}
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cambiar foto
            </button>
            <button
              onClick={startCamera}
              className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Usar cámara</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center bg-gray-700/50">
          <div className="flex flex-col items-center space-y-4">
            <Image className="w-12 h-12 text-gray-400" />
            <p className="text-gray-300 mb-4">
              Selecciona una foto de ti mismo
            </p>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <div className="flex space-x-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Subir archivo</span>
              </button>

              <button
                onClick={startCamera}
                className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Camera className="w-4 h-4" />
                <span>Usar cámara</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas oculto para capturar la foto */}
      <canvas ref={canvasRef} className="hidden" />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default PhotoUploader;
