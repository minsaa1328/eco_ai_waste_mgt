import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { Card } from "../ui/Card.jsx";
import { Badge } from "../ui/Badge.jsx";
import {
  UploadIcon,
  ImageIcon,
  TrashIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  CameraIcon,
} from "lucide-react";

export const Classifier = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const navigate = useNavigate();
  const { getToken } = useAuth();

  // ✅ Backend base URL
  const API_URL = import.meta.env.VITE_API_URL + "/api/orchestrator";

  // ---------------- FILE UPLOAD ----------------
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(selectedFile);

    try {
      setLoading(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", selectedFile);
      const params = { needs: "guide,awareness,quiz" };

      const res = await axios.post(`${API_URL}/handle/image`, formData, {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;
      const classifierStep = data.steps?.find(
        (s) => s.agent.toLowerCase() === "classifier"
      );

      if (classifierStep) {
        setResult({
          item: selectedFile.name || "Uploaded Image",
          category: classifierStep.output || "Unknown",
          confidence: 95,
          color: "green",
        });
      } else {
        setResult({
          item: selectedFile.name,
          category: "Not Detected",
          confidence: 0,
          color: "gray",
        });
      }
    } catch (err) {
      console.error("❌ Image classification failed:", err.response?.data || err);
      alert("Failed to connect to backend. Check logs or CORS setup.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- CAMERA ACCESS ----------------
  const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    setCameraOn(true);

    // Wait for the <video> element to appear in the DOM
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }, 200);
  } catch (err) {
    alert("Camera access denied or not available.");
    console.error("Camera start error:", err);
  }
};


  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  const capturePhoto = () => {
    if (!cameraOn) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const fileFromCamera = new File([blob], "captured_image.jpg", {
          type: "image/jpeg",
        });
        handleFile(fileFromCamera);
        stopCamera();
      }
    }, "image/jpeg");
  };


  const goToQuiz = () => {
  if (!result) return;
  navigate("/quiz", {
    state: {
      item: result.item,
      category: result.category,
      from: "classifier",
    },
  });
};


  // ---------------- TEXT CLASSIFICATION ----------------
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    try {
      setLoading(true);
      const token = await getToken();
      console.log("🔑 Clerk token:", token);

      const payload = {
        task: "custom", // ✅ backend supports custom multi-agent chain
        need: ["classify", "awareness", "quiz"],
        payload: { item: textInput },
      };

      const res = await axios.post(`${API_URL}/handle`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = res.data;
      const classifierStep = data.steps?.find(
        (s) => s.agent.toLowerCase() === "classifier"
      );

      if (classifierStep) {
        setResult({
          item: textInput,
          category: classifierStep.output || "Unknown",
          confidence: 95,
          color: "green",
        });
      } else {
        setResult({ category: "Not Detected", confidence: 0, color: "gray" });
      }
    } catch (err) {
      console.error("❌ Text classification failed:", err.response?.data || err);
      alert("Failed to connect to backend. Check payload or token.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UTILITIES ----------------
  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setTextInput("");
    setResult(null);
  };

  const goToAwareness = () => {
    if (!result) return;
    navigate("/awareness", {
      state: {
        item: result.item,
        category: result.category,
        from: "classifier",
      },
    });
  };

  const goToRecyclingGuide = () => {
    if (!result) return;
    navigate("/recycling-guide", {
      state: {
        item: result.item,
        category: result.category,
        from: "classifier",
      },
    });
  };

  // ---------------- UI ----------------
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Waste Category Classifier
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* -------- Left: Input Section -------- */}
        <div className="space-y-6">
          <Card title="Upload Image or Use Camera">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors"
            >
              {!preview ? (
                <div className="space-y-4">
                  {/* Upload Section */}
                  <div className="flex justify-center">
                    <UploadIcon size={40} className="text-gray-400" />
                  </div>
                  <p className="text-gray-700">Drag and drop an image here, or</p>
                  <label className="mt-2 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>

                  {/* Camera Section */}
                  {!cameraOn ? (
                    <button
                      onClick={startCamera}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CameraIcon size={18} className="mr-2" /> Use Camera
                    </button>
                  ) : (
                    <div className="mt-4 space-y-3">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="mx-auto rounded-lg border border-gray-300"
                        width="320"
                        height="240"
                      />
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={capturePhoto}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Capture & Analyze
                        </button>
                        <button
                          onClick={stopCamera}
                          className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                        >
                          Stop
                        </button>
                      </div>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                  <p className="text-xs text-gray-500">
                    Supported formats: JPG, PNG, WEBP
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      onClick={clearAll}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {file?.name || "Selected Image"}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card title="Or Describe the Item">
            <form onSubmit={handleTextSubmit}>
              <div className="space-y-4">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Describe the item (e.g., 'plastic water bottle with blue cap')"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                ></textarea>
                <button
                  type="submit"
                  disabled={!textInput.trim() || loading}
                  className="w-full py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                >
                  {loading ? "Classifying..." : "Classify"}
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* -------- Right: Result Section -------- */}
        <div>
          <Card title="Classification Result" className="h-full">
            {!result ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <ImageIcon size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500">
                  Upload an image, use the camera, or describe an item to see
                  the classification result.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-medium">Category</p>
                    <div className="flex items-center mt-1">
                      <h3 className="text-2xl font-bold">{result.category}</h3>
                      <Badge color={result.color} className="ml-3">
                        {result.category === "E-Waste"
                          ? "Special Handling"
                          : "Common"}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircleIcon size={30} className="text-green-600" />
                  </div>
                </div>

                {/* Confidence Bar */}
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Confidence Score
                  </p>
                  <div className="mt-2 relative pt-1">
                    <span className="text-xs font-semibold text-green-600">
                      {result.confidence}%
                    </span>
                    <div className="overflow-hidden h-2 mb-4 rounded bg-gray-200">
                      <div
                        style={{ width: `${result.confidence}%` }}
                        className="h-2 bg-green-500"
                      ></div>
                    </div>
                  </div>
                </div>

                <div
                  className="p-4 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={goToAwareness}
                >
                  <div className="flex">
                    <AlertCircleIcon size={20} className="text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 font-medium">
                        Did you know?
                      </p>
                      <p className="text-sm text-blue-600">
                        Click to learn more about{" "}
                        <strong>{result.category}</strong> waste and its impact.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recycling Guide */}
                <button
                  onClick={goToRecyclingGuide}
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Recycling Guide
                </button>

                {/* Generate Quiz */}
                <button
                  onClick={goToQuiz}
                  className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Generate Quiz
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
