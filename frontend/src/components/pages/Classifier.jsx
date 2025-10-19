import React, { useState } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import {
  UploadIcon,
  ImageIcon,
  TrashIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from 'lucide-react';

export const Classifier = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [result, setResult] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      handleFile(selectedFile);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      handleFile(selectedFile);
    }
  };

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);

    // Simulate classification
    setTimeout(() => {
      const categories = [
        { category: 'Plastic', confidence: 96, color: 'blue' },
        { category: 'Paper', confidence: 89, color: 'green' },
        { category: 'Organic', confidence: 92, color: 'green' },
        { category: 'Metal', confidence: 94, color: 'yellow' },
        { category: 'E-Waste', confidence: 97, color: 'red' },
      ];
      setResult(categories[Math.floor(Math.random() * categories.length)]);
    }, 1500);
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      // Simulate classification
      setTimeout(() => {
        const categories = [
          { category: 'Plastic', confidence: 96, color: 'blue' },
          { category: 'Paper', confidence: 89, color: 'green' },
          { category: 'Organic', confidence: 92, color: 'green' },
          { category: 'Metal', confidence: 94, color: 'yellow' },
          { category: 'E-Waste', confidence: 97, color: 'red' },
        ];
        setResult(categories[Math.floor(Math.random() * categories.length)]);
      }, 1000);
    }
  };

  const clearAll = () => {
    setFile(null);
    setPreview(null);
    setTextInput('');
    setResult(null);
  };

  const sampleWasteItems = [
    {
      name: 'Plastic Bottle',
      image:
        'https://images.unsplash.com/photo-1616118132534-381148898bb4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=764',
      category: 'Plastic',
    },
    {
      name: 'Newspaper',
      image:
        'https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      category: 'Paper',
    },
    {
      name: 'Banana Peel',
      image:
        'https://images.unsplash.com/photo-1528825871115-3581a5387919?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      category: 'Organic',
    },
    {
      name: 'Battery',
      image:
        'https://plus.unsplash.com/premium_photo-1683120793196-0797cec08a7d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmF0dGVyeXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600',
      category: 'E-Waste',
    },
  ];

  const handleSampleClick = (item) => {
    setPreview(item.image);
    // Simulate classification
    setTimeout(() => {
      setResult({
        category: item.category,
        confidence: 90 + Math.floor(Math.random() * 10),
        color:
          item.category === 'Plastic'
            ? 'blue'
            : item.category === 'Paper'
            ? 'green'
            : item.category === 'Organic'
            ? 'green'
            : 'red',
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Waste Category Classifier
      </h1>

      {/* Sample Waste Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-lg font-medium text-gray-800 mb-4">
          Common Waste Items
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sampleWasteItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleSampleClick(item)}
            >
              <div className="h-24 w-24 rounded-lg overflow-hidden mb-2">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm font-medium text-gray-700">{item.name}</p>
              <Badge
                color={
                  item.category === 'Plastic'
                    ? 'blue'
                    : item.category === 'Paper'
                    ? 'green'
                    : item.category === 'Organic'
                    ? 'green'
                    : 'red'
                }
                className="mt-1"
              >
                {item.category}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card title="Upload Image">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors"
            >
              {!preview ? (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <UploadIcon size={40} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-700">
                      Drag and drop an image here, or
                    </p>
                    <label className="mt-2 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-colors">
                      <span>Browse Files</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                    </label>
                  </div>
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
                    {file?.name || 'Sample Image'}
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
                  placeholder="Describe the item you want to classify (e.g., 'plastic water bottle with blue cap')"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={4}
                ></textarea>
                <button
                  type="submit"
                  disabled={!textInput.trim()}
                  className="w-full py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700 transition-colors"
                >
                  Classify
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Classification Result */}
        <div>
          <Card title="Classification Result" className="h-full">
            {!result ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <ImageIcon size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500">
                  Upload an image or describe an item to see the classification
                  result
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
                        {result.category === 'E-Waste'
                          ? 'Special Handling'
                          : 'Common'}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircleIcon size={30} className="text-green-600" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Confidence Score
                  </p>
                  <div className="mt-2 relative pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-green-600">
                        {result.confidence}%
                      </span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 rounded bg-gray-200">
                      <div
                        style={{ width: `${result.confidence}%` }}
                        className="h-2 bg-green-500"
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex">
                    <AlertCircleIcon size={20} className="text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 font-medium">
                        Did you know?
                      </p>
                      <p className="text-sm text-blue-600">
                        {result.category === 'Plastic' &&
                          'Plastic takes up to 1,000 years to decompose in landfills.'}
                        {result.category === 'Paper' &&
                          'Recycling one ton of paper saves 17 trees and 7,000 gallons of water.'}
                        {result.category === 'Organic' &&
                          'Composting organic waste reduces methane emissions from landfills.'}
                        {result.category === 'Metal' &&
                          'Aluminum cans can be recycled infinitely without quality degradation.'}
                        {result.category === 'E-Waste' &&
                          'E-waste contains valuable materials like gold, silver, and copper that can be recovered.'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    (window.location.href = '#recycling-guide')
                  }
                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Recycling Guide
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
