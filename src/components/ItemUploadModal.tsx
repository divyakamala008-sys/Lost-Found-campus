import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Tag,
  HelpCircle,
  DollarSign,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { CampusItem, CampusLocation, ItemCategory, ItemType } from '../types';
import { CAMPUS_LOCATIONS, CATEGORY_METADATA, DEMO_PRESET_ITEMS } from '../data/campusData';

interface ItemUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitItem: (item: CampusItem) => void;
  defaultType?: ItemType;
  existingItems: CampusItem[];
}

export const ItemUploadModal: React.FC<ItemUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmitItem,
  defaultType = 'lost',
  existingItems,
}) => {
  const [type, setType] = useState<ItemType>(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('electronics');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>(CAMPUS_LOCATIONS[0].id);
  const [specificDetails, setSpecificDetails] = useState('');
  const [dateOccurred, setDateOccurred] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [imageUrl, setImageUrl] = useState('');
  const [colors, setColors] = useState<string[]>(['Black']);
  const [distinctiveMarks, setDistinctiveMarks] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [heldAtOfficialDesk, setHeldAtOfficialDesk] = useState<boolean>(false);
  const [verificationQuestion, setVerificationQuestion] = useState('');
  const [verificationAnswerHint, setVerificationAnswerHint] = useState('');

  // Camera & AI State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setType(defaultType);
  }, [defaultType, isOpen]);

  // Clean up camera on unmount or close
  useEffect(() => {
    if (!isOpen && isCameraActive) {
      stopCamera();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      alert('Unable to access camera. Please upload an image file instead.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImageUrl(dataUrl);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // AI Auto Scan using Gemini API
  const handleAutoAnalyzeAI = async () => {
    setIsAnalyzingAI(true);
    setAiError(null);

    try {
      const payload: any = {
        userHint: `${title} ${description}`.trim(),
        description: description,
      };

      if (imageUrl && imageUrl.startsWith('data:image')) {
        payload.imageBase64 = imageUrl;
        payload.mimeType = 'image/jpeg';
      }

      const res = await fetch('/api/analyze-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('AI analysis service error');
      }

      const data = await res.json();

      if (data.title && !title) setTitle(data.title);
      if (data.category) setCategory(data.category as ItemCategory);
      if (data.brand) setBrand(data.brand);
      if (data.primaryColors && Array.isArray(data.primaryColors)) {
        setColors(data.primaryColors);
      }
      if (data.distinctiveFeatures && Array.isArray(data.distinctiveFeatures)) {
        setDistinctiveMarks(data.distinctiveFeatures.join(', '));
      }
      if (data.tags && Array.isArray(data.tags)) {
        setTags(data.tags);
      }
      if (data.description && (!description || description.length < 20)) {
        setDescription(data.description);
      }
    } catch (err: any) {
      console.warn('AI analysis fallback:', err);
      setAiError('Auto-analysis used standard detection. You can refine the fields manually.');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Apply a sample demo preset for rapid testing
  const handleApplyPreset = (preset: (typeof DEMO_PRESET_ITEMS)[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setBrand(preset.brand || '');
    setColors(preset.colors);
    setDescription(preset.description);
    setImageUrl(preset.imageUrl);
    setTags(preset.tags);
    setDistinctiveMarks('Clean condition, standard campus markings');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter an item title');
      return;
    }

    const selectedLoc =
      CAMPUS_LOCATIONS.find((l) => l.id === selectedLocationId) || CAMPUS_LOCATIONS[0];

    const newItem: CampusItem = {
      id: `item-${Date.now()}`,
      type,
      title: title.trim(),
      category,
      brand: brand.trim() || undefined,
      description: description.trim() || 'No additional details provided.',
      location: selectedLoc,
      specificLocationDetails: specificDetails.trim() || undefined,
      dateReported: new Date().toISOString(),
      dateOccurred: dateOccurred ? new Date(dateOccurred).toISOString() : new Date().toISOString(),
      imageUrl: imageUrl || CATEGORY_METADATA[category]?.placeholderImg || '',
      colors: colors.length > 0 ? colors : ['Unknown'],
      tags: tags.length > 0 ? tags : [category, title.toLowerCase()],
      distinctiveMarks: distinctiveMarks
        ? distinctiveMarks.split(',').map((m) => m.trim()).filter(Boolean)
        : [],
      contactName: contactName.trim() || (type === 'lost' ? 'Anonymous Student' : 'Good Samaritan'),
      contactEmail: contactEmail.trim() || 'student-contact@campus.edu',
      contactPhone: contactPhone.trim() || undefined,
      rewardAmount: type === 'lost' && rewardAmount > 0 ? rewardAmount : undefined,
      status: 'active',
      heldAtOfficialDesk: type === 'found' ? heldAtOfficialDesk : false,
      officialDeskLocation:
        type === 'found' && heldAtOfficialDesk ? selectedLoc.deskName || selectedLoc.name : undefined,
      verificationQuestion: verificationQuestion.trim()
        ? {
            question: verificationQuestion.trim(),
            expectedAnswerHint: verificationAnswerHint.trim() || undefined,
          }
        : undefined,
    };

    onSubmitItem(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850/50 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  type === 'lost' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              {type === 'lost' ? 'Report a Lost Belonging' : 'Report a Found Belonging'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide accurate details to trigger the AI auto-matching network.
            </p>
          </div>

          <button
            id="modal-close-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Step 1: Lost vs Found Toggle */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              type="button"
              id="report-type-lost-btn"
              onClick={() => setType('lost')}
              className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                type === 'lost'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-200" />
              I Lost Something (Seeking)
            </button>
            <button
              type="button"
              id="report-type-found-btn"
              onClick={() => setType('found')}
              className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                type === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-200" />
              I Found Something (Turned In)
            </button>
          </div>

          {/* Quick Demo Presets selector */}
          <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/50 rounded-xl">
            <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                Quick Campus Demo Presets (1-Click Fill)
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {DEMO_PRESET_ITEMS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`preset-btn-${idx}`}
                  onClick={() => handleApplyPreset(preset)}
                  className="p-1.5 text-left bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-900 hover:border-indigo-400 text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate transition-all shadow-2xs"
                >
                  {preset.title.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Upload / Camera Area */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Item Photo (Critical for AI Matching)
            </label>

            {isCameraActive ? (
              <div className="relative aspect-16/9 bg-black rounded-xl overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    id="camera-capture-btn"
                    onClick={capturePhoto}
                    className="px-4 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 hover:bg-slate-100"
                  >
                    <Camera className="w-4 h-4" />
                    Snap Photo
                  </button>
                  <button
                    type="button"
                    id="camera-cancel-btn"
                    onClick={stopCamera}
                    className="px-3 py-2 bg-slate-800 text-white font-medium text-xs rounded-xl hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : imageUrl ? (
              <div className="relative aspect-16/9 sm:aspect-21/9 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                <img
                  src={imageUrl}
                  alt="Item Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    id="change-photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-semibold hover:bg-slate-100"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    id="remove-photo-btn"
                    onClick={() => setImageUrl('')}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>

                {/* AI Scan Button Overlay */}
                <button
                  type="button"
                  id="ai-auto-scan-btn"
                  onClick={handleAutoAnalyzeAI}
                  disabled={isAnalyzingAI}
                  className="absolute bottom-2.5 right-2.5 px-3 py-1.5 bg-indigo-600/95 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md backdrop-blur-md flex items-center gap-1.5 transition-all"
                >
                  {isAnalyzingAI ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analyzing Photo with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      ✨ Auto-Fill Fields with Gemini
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center hover:border-indigo-400 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload an item photo for automated visual matching
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      id="upload-file-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                    >
                      Browse Files
                    </button>
                    <span className="text-xs text-slate-400">or</span>
                    <button
                      type="button"
                      id="open-camera-btn"
                      onClick={startCamera}
                      className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Take Photo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {aiError && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {aiError}
              </p>
            )}
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Item Title *
              </label>
              <input
                id="item-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Apple AirPods Pro in Black Case"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                id="item-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
              >
                {Object.entries(CATEGORY_METADATA).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Brand & Colors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Brand / Manufacturer (Optional)
              </label>
              <input
                id="item-brand-input"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Hydro Flask, Sony, Nike"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Primary Colors (Comma Separated)
              </label>
              <input
                id="item-colors-input"
                type="text"
                value={colors.join(', ')}
                onChange={(e) =>
                  setColors(
                    e.target.value
                      .split(',')
                      .map((c) => c.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="e.g. Black, Silver, Navy"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description & Context *
            </label>
            <textarea
              id="item-description-input"
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe where you left/found it, surrounding circumstances, any specific traits..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Location & Specific Spot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                Campus Building / Area *
              </label>
              <select
                id="item-location-select"
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
              >
                {CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.zone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Date & Approximate Time
              </label>
              <input
                id="item-datetime-input"
                type="datetime-local"
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Exact Room / Floor / Spot (e.g. 2nd floor desk #4, bench outside)
            </label>
            <input
              id="item-specific-spot-input"
              type="text"
              value={specificDetails}
              onChange={(e) => setSpecificDetails(e.target.value)}
              placeholder="e.g. 3rd Floor quiet study carrel, left bench"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          {/* Distinctive marks & Secret Verification Question */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Distinctive Marks (Scratches, Stickers, Engravings)
              </label>
              <input
                id="item-distinctive-marks-input"
                type="text"
                value={distinctiveMarks}
                onChange={(e) => setDistinctiveMarks(e.target.value)}
                placeholder="e.g. NASA sticker on back, engraved initials J.K., cracked camera glass"
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center justify-between">
                <span>Secret Verification Question (For Safe Return)</span>
                <span className="text-[11px] font-normal text-slate-400">Protects from wrongful claims</span>
              </label>
              <input
                id="item-verification-question-input"
                type="text"
                value={verificationQuestion}
                onChange={(e) => setVerificationQuestion(e.target.value)}
                placeholder="e.g. What is the phone wallpaper? What is stamped on the key?"
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            {type === 'found' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="held-at-desk-checkbox"
                  type="checkbox"
                  checked={heldAtOfficialDesk}
                  onChange={(e) => setHeldAtOfficialDesk(e.target.checked)}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <label
                  htmlFor="held-at-desk-checkbox"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  Turned into Official Campus Custody Desk (Library / Security / Union)
                </label>
              </div>
            )}

            {type === 'lost' && (
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Optional Reward for Safe Return ($ USD)
                </label>
                <div className="relative max-w-[140px]">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">$</span>
                  <input
                    id="item-reward-input"
                    type="number"
                    min="0"
                    max="500"
                    value={rewardAmount || ''}
                    onChange={(e) => setRewardAmount(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-6 pr-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Name / Alias *
              </label>
              <input
                id="contact-name-input"
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Campus Email *
              </label>
              <input
                id="contact-email-input"
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. a.rivera@campus.edu"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

        </form>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            id="cancel-report-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            id="submit-item-btn"
            onClick={handleSubmit}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md transition-all flex items-center gap-1.5 ${
              type === 'lost'
                ? 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-amber-500/20'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/20'
            }`}
          >
            <Check className="w-4 h-4" />
            {type === 'lost' ? 'Publish Lost Item Report' : 'Publish Found Item Report'}
          </button>
        </div>

      </div>
    </div>
  );
};
