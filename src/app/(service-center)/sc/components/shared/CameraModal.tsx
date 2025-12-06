"use client";
import { useState, useRef, useEffect } from "react";
import { Camera, X, RotateCcw, Check, AlertCircle } from "lucide-react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  title?: string;
}

export default function CameraModal({ isOpen, onClose, onCapture, title = "Capture Photo" }: CameraModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions and try again.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        stopCamera();
        onClose();
      }
    }, "image/jpeg", 0.9);
  };

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 z-[1201]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Camera className="text-indigo-600" size={20} />
            {title}
          </h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black">
          {error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertCircle className="text-red-500 mb-4" size={48} />
              <p className="text-red-600 font-medium mb-2">{error}</p>
              <p className="text-gray-600 text-sm">Please ensure camera permissions are granted and try again.</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto max-h-[60vh] object-contain"
              />
              <canvas ref={canvasRef} className="hidden" />
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={switchCamera}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
            title="Switch Camera"
          >
            <RotateCcw size={24} className="text-gray-700" />
          </button>
          <button
            onClick={capturePhoto}
            disabled={!!error || !stream}
            className="relative w-20 h-20 bg-white border-4 border-indigo-600 hover:border-indigo-700 disabled:border-gray-400 disabled:cursor-not-allowed rounded-full transition-all shadow-lg hover:shadow-xl disabled:shadow-none active:scale-95"
            title="Capture Photo"
          >
            <div className="absolute inset-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 rounded-full flex items-center justify-center transition-colors">
              <Check size={28} className="text-white" />
            </div>
          </button>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
            title="Cancel"
          >
            <X size={24} className="text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
}

