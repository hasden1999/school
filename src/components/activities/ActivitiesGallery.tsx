"use client";

import React, { useState, useMemo } from "react";
import {
  SchoolActivity,
  SCHOOL_ACTIVITIES,
} from "@/data/schoolActivitiesData";
import {
  Sparkles,
  Calendar,
  Eye,
  Heart,
  Search,
  Filter,
  X,
  MapPin,
  CheckCircle2,
  Share2,
  ZoomIn,
  Compass,
  Trophy,
  GraduationCap,
  FlaskConical,
  Palette,
  Laptop,
} from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "جميع الأنشطة والفعاليات", icon: Sparkles },
  { id: "science", label: "العلوم والابتكار والروبوت", icon: FlaskConical },
  { id: "honors", label: "التكريم والتفوق والشهادات", icon: GraduationCap },
  { id: "sports", label: "البطولات والأنشطة الرياضية", icon: Trophy },
  { id: "trips", label: "الرحلات والاستكشاف", icon: Compass },
  { id: "arts", label: "الفنون والثقافة والمسرح", icon: Palette },
  { id: "workshops", label: "ورش العمل والتقنية", icon: Laptop },
];

export const ActivitiesGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeItem, setActiveItem] = useState<SchoolActivity | null>(null);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const filteredActivities = useMemo(() => {
    return SCHOOL_ACTIVITIES.filter((item) => {
      const matchCat =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentLiked = !!likedMap[id];
    setLikedMap((prev) => ({ ...prev, [id]: !currentLiked }));
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (currentLiked ? -1 : 1),
    }));
  };

  const handleShare = (activity: SchoolActivity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <section id="activities-gallery" className="space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold tracking-wide">
          <Sparkles className="w-4 h-4 text-brand-700" />
          <span>توثيق حي ومباشر لإنجازات وتجارب طلابنا</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
          معرض الأنشطة والفعاليات المدرسية
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          نؤمن بأن بناء شخصية الطالب يتجاوز المناهج النظرية ليشمل التجارب المعملية الحية، المنافسات الرياضية، المهرجانات الثقافية، والرحلات الاستكشافية الميدانية.
        </p>
      </div>

      {/* Filter and Search Hub */}
      <div className="card-surface p-4 sm:p-6 space-y-4">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في معارض الصور والفعاليات (مثال: روبوت، تكريم، بطولة، كيمياء، مرصد...)"
            className="w-full pl-10 pr-12 py-3.5 rounded-lg bg-white border border-slate-300 focus:border-brand-600 text-slate-900 placeholder-slate-400 text-xs sm:text-sm outline-none transition-colors font-medium"
          />
          <Search className="w-5 h-5 text-brand-700 absolute right-4 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute left-4 top-3.5 p-1 rounded-full text-slate-500 hover:text-slate-900 bg-slate-100"
              title="مسح البحث"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? "bg-brand-700 text-white border-transparent"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-500"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Share Toast Banner */}
      {copiedLink && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg bg-brand-700 text-white text-xs sm:text-sm font-bold shadow-pop flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>تم نسخ رابط النشاط بنجاح للمشاركة!</span>
        </div>
      )}

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="card-surface text-center py-16 space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Filter className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">لا توجد نشاطات مطابقة لمعايير البحث</h3>
          <p className="text-xs text-slate-500 font-medium">
            جرب البحث بكلمة أخرى أو الضغط على "جميع الأنشطة" بالأعلى
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="px-5 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-md"
          >
            عرض كافة الأنشطة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredActivities.map((act) => {
            const isLiked = !!likedMap[act.id];
            const currentLikes = (act.likesCount || 0) + (likes[act.id] || 0);

            return (
              <div
                key={act.id}
                onClick={() => setActiveItem(act)}
                className="group cursor-pointer card-surface overflow-hidden hover:border-brand-300 shadow-card hover:shadow-pop transition-all duration-300 flex flex-col justify-between"
              >
                {/* Media Thumbnail Container */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={act.image}
                    alt={act.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-85 group-hover:opacity-60 transition-opacity" />

                  {/* Top Badge */}
                  {act.badge && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-brand-700 text-white text-[11px] font-bold shadow-sm border border-brand-600 flex items-center gap-1">
                      <span>{act.badge}</span>
                    </div>
                  )}

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold border border-white/10">
                    {act.categoryLabel}
                  </div>

                  {/* Zoom Indicator */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="p-3 rounded-full bg-brand-700 text-white shadow-pop backdrop-blur-md scale-90 group-hover:scale-100 transition-transform">
                      <ZoomIn className="w-6 h-6" />
                    </span>
                  </div>

                  {/* Bottom Image Stats */}
                  <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between text-[11px] text-white">
                    <span className="flex items-center gap-1 font-medium bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                      <Calendar className="w-3.5 h-3.5 text-brand-400" />
                      <span>{act.date}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>{act.viewsCount || 950}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2 leading-snug">
                      {act.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-medium">
                      {act.description}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-brand-700 flex items-center gap-1 group-hover:translate-x-[-2px] transition-transform">
                      <span>عرض التفاصيل والصور</span>
                      <span>←</span>
                    </span>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleLike(act.id, e)}
                        className={`p-2 rounded-xl border transition-all flex items-center gap-1 text-[11px] font-bold ${
                          isLiked
                            ? "bg-rose-50 text-rose-700 border-rose-100"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:text-rose-700 hover:bg-slate-100"
                        }`}
                        title="إعجاب بالنشاط"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                        <span>{currentLikes}</span>
                      </button>

                      <button
                        onClick={(e) => handleShare(act, e)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 hover:text-slate-900 hover:bg-slate-100 transition-all"
                        title="مشاركة الرابط"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* High-Resolution Interactive Lightbox Modal */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn cursor-pointer"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full overflow-hidden shadow-pop my-auto text-slate-800 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Media */}
            <div className="relative aspect-[16/10] sm:aspect-[21/9] bg-slate-100 overflow-hidden">
              <img
                src={activeItem.image}
                alt={activeItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 left-4 p-2.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Top Badges */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {activeItem.badge && (
                  <span className="px-3 py-1 rounded-full bg-brand-700 text-white font-bold text-xs shadow-sm border border-brand-600">
                    {activeItem.badge}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white font-bold text-xs border border-white/10">
                  {activeItem.categoryLabel}
                </span>
              </div>

              {/* Location and Date Overlay */}
              <div className="absolute bottom-3 right-4 left-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white">
                {activeItem.location && (
                  <span className="flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-lg backdrop-blur-sm font-medium">
                    <MapPin className="w-4 h-4 text-brand-400" />
                    <span>{activeItem.location}</span>
                  </span>
                )}

                <span className="flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-lg backdrop-blur-sm font-medium">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  <span>{activeItem.date}</span>
                </span>
              </div>
            </div>

            {/* Modal Body Info */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-2xl font-bold text-slate-900">
                  {activeItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {activeItem.description}
                </p>
              </div>

              {/* Key Details Bullets */}
              {activeItem.details && activeItem.details.length > 0 && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 sm:p-5 space-y-3">
                  <h4 className="text-xs font-bold text-brand-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>أبرز محاور ومخرجات الفعالية:</span>
                  </h4>
                  <div className="space-y-2">
                    {activeItem.details.map((detail, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Interactions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLike(activeItem.id)}
                    className={`px-4 py-2.5 rounded-lg border font-bold flex items-center gap-2 transition-all ${
                      likedMap[activeItem.id]
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:text-rose-700"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${likedMap[activeItem.id] ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>
                      {(activeItem.likesCount || 0) + (likes[activeItem.id] || 0)} إعجاب
                    </span>
                  </button>

                  <button
                    onClick={() => handleShare(activeItem)}
                    className="px-4 py-2.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300 font-bold flex items-center gap-2 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>مشاركة الفعالية</span>
                  </button>
                </div>

                <button
                  onClick={() => setActiveItem(null)}
                  className="px-6 py-2.5 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-bold transition-all shadow-pop"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
