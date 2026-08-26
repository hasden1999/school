"use client";

import React, { useState } from "react";
import { SchoolVideo, SCHOOL_VIDEOS } from "@/data/schoolActivitiesData";
import {
  Play,
  Clock,
  Eye,
  X,
  Share2,
  Film,
  CheckCircle2,
} from "lucide-react";

export const VideoReelsSection: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<SchoolVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleShare = (vid: SchoolVideo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <section id="school-videos" className="space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold">
            <Film className="w-4 h-4" />
            <span>تغطيات مرئية وأفلام وثائقية حصرية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            مقاطع الفيديو والقصص المصورة
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            شاهد نبض الحياة المدرسية اليومية، تجارب طلابنا العلمية، ولحظات التكريم والتفوق بصوت وصورة عالية الدقة.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 font-bold">
            {SCHOOL_VIDEOS.length} مقاطع وثائقية
          </span>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SCHOOL_VIDEOS.map((vid) => (
          <div
            key={vid.id}
            onClick={() => {
              setActiveVideo(vid);
              setIsPlaying(true);
            }}
            className="group cursor-pointer card-surface overflow-hidden hover:border-brand-300 shadow-card hover:shadow-pop transition-all duration-300 flex flex-col justify-between"
          >
            {/* Video Thumbnail */}
            <div className="relative aspect-video overflow-hidden bg-slate-100">
              <img
                src={vid.thumbnail}
                alt={vid.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Pulsing Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-2 bg-brand-500/40 rounded-full animate-ping opacity-75" />
                  <div className="w-14 h-14 rounded-full bg-brand-700 text-white flex items-center justify-center shadow-pop group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white translate-x-[-1px]" />
                  </div>
                </div>
              </div>

              {/* Top Highlight Badge */}
              {vid.highlight && (
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-brand-700 text-white text-[10px] font-bold border border-brand-600">
                  {vid.highlight}
                </div>
              )}

              {/* Category */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-bold">
                {vid.category}
              </div>

              {/* Duration and Views */}
              <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between text-[10px] text-white">
                <span className="flex items-center gap-1 bg-black/75 px-2 py-0.5 rounded-md backdrop-blur-sm font-mono font-bold">
                  <Clock className="w-3 h-3 text-brand-400" />
                  <span>{vid.duration}</span>
                </span>

                <span className="flex items-center gap-1 bg-black/75 px-2 py-0.5 rounded-md backdrop-blur-sm font-medium">
                  <Eye className="w-3 h-3 text-blue-400" />
                  <span>{vid.views}</span>
                </span>
              </div>
            </div>

            {/* Video Meta Info */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug">
                  {vid.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed font-medium">
                  {vid.description}
                </p>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-brand-700 font-bold flex items-center gap-1">
                  <span>مشاهدة الفيديو</span>
                  <span>▶</span>
                </span>

                <span className="text-slate-500 font-medium">{vid.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Video Player Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn cursor-pointer"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full overflow-hidden shadow-pop my-auto text-slate-800 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Video Player Wrapper */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <video
                src={activeVideo.videoUrl}
                poster={activeVideo.thumbnail}
                controls
                autoPlay={isPlaying}
                className="w-full h-full object-contain"
              >
                متصفحك لا يدعم تشغيل مقاطع الفيديو.
              </video>

              {/* Close Button */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 left-4 p-2.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-all z-20"
                title="إغلاق مشغل الفيديو"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Details Bottom Container */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-brand-700 text-white font-bold text-xs">
                    {activeVideo.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                    {activeVideo.views}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleShare(activeVideo, e)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>مشاركة المقطع</span>
                  </button>

                  <button
                    onClick={() => setActiveVideo(null)}
                    className="px-4 py-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all"
                  >
                    إغلاق
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base sm:text-xl font-bold text-slate-900">
                  {activeVideo.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
                  {activeVideo.description}
                </p>
              </div>

              {copiedLink && (
                <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تم نسخ الرابط بنجاح!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
