import React, { useState } from "react";
import { Image, Check, Loader2 } from "lucide-react";
import PhotoService from "./components/PhotoService";
import PhotoUploader from "./components/PhotoUploader";

import chaqueta1 from "./assets/chaqueta1.jpg";
import chaqueta2 from "./assets/chaqueta2.jpg";
import dress1 from "./assets/dress1.jpg";
import dress2 from "./assets/dress2.jpg";
import dress_3 from "./assets/dress_3.jpg";
import pants1 from "./assets/pants1.jpg";

// Componente principal
const PhotoApp = () => {
  const [userPhoto, setUserPhoto] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Fotos de plantilla simuladas
  const templatePhotos = [
    {
      id: 1,
      name: "chaqueta.jpg",
      url: chaqueta1,
    },
    {
      id: 2,
      name: "chaqueta2.jpg",
      url: chaqueta2,
    },
    {
      id: 3,
      name: "dress1.jpg",
      url: dress1,
    },
    {
      id: 4,
      name: "dress2.jpg",
      url: dress2,
    },
    {
      id: 5,
      name: "dress_3.jpg",
      url: dress_3,
    },
    {
      id: 6,
      name: "pants1.jpg",
      url: pants1,
    },
  ];

  const handleProcessPhotos = async () => {
    if (!userPhoto || !selectedTemplate) {
      setError("Por favor selecciona tu foto y una plantilla");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await PhotoService.processPhotos(
        userPhoto,
        selectedTemplate
      );
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetApp = () => {
    setUserPhoto(null);
    setSelectedTemplate(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          🎨 Virtual Try-On OOTDifussion
        </h1>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Componente de subida */}
          <PhotoUploader
            onPhotoSelected={setUserPhoto}
            selectedPhoto={userPhoto}
          />

          {/* Grid de plantillas */}
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 mb-6 flex-1">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Selecciona una plantilla
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templatePhotos.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 border-2 ${
                    selectedTemplate?.id === template.id
                      ? "ring-4 ring-blue-500 shadow-xl border-blue-500"
                      : "hover:shadow-lg border-gray-600 hover:border-blue-400"
                  }`}
                >
                  <img
                    src={template.url}
                    alt={template.name}
                    className="w-full aspect-square object-cover"
                  />
                  {selectedTemplate?.id === template.id && (
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-30 flex items-center justify-center">
                      <Check className="w-8 h-8 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedTemplate && (
              <p className="text-sm text-blue-400 mt-4">
                ✓ Plantilla seleccionada: {selectedTemplate.name}
              </p>
            )}
          </div>
        </div>

        {/* Botón de procesar */}
        <div className="text-center mb-6">
          <button
            onClick={handleProcessPhotos}
            disabled={!userPhoto || !selectedTemplate || isProcessing}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
              !userPhoto || !selectedTemplate || isProcessing
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </span>
            ) : (
              "Procesar Fotos"
            )}
          </button>
        </div>

        {/* Contenedor de resultado */}
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Resultado</h2>

          {isProcessing && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-300">Procesando tus fotos...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-300">❌ {error}</p>
            </div>
          )}

          {result && (
            <div className="text-center">
              <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 mb-4">
                <p className="text-green-300">✅ {result.message}</p>
              </div>

              <img
                src={result.imageUrl}
                alt="Resultado procesado"
                className="max-w-full h-auto rounded-lg shadow-lg mx-auto mb-4"
              />

              <div className="flex justify-center space-x-4">
                <a
                  href={result.imageUrl}
                  download="imagen-procesada.jpg"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Descargar
                </a>

                <button
                  onClick={resetApp}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Nueva foto
                </button>
              </div>
            </div>
          )}

          {!result && !isProcessing && !error && (
            <div className="text-center py-8 text-gray-400">
              <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>El resultado aparecerá aquí después del procesamiento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoApp;
