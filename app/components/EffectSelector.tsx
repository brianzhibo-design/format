"use client";

import { useState } from "react";
import { Wand2, User, PawPrint, Users, Layers } from "lucide-react";
import {
  WANX_TEMPLATES,
  EFFECT_CATEGORY_LABELS,
  type EffectCategory,
  type WanxTemplate,
} from "@/app/lib/wanx-templates";

interface EffectSelectorProps {
  selectedTemplate: WanxTemplate | null;
  onSelect: (template: WanxTemplate) => void;
}

const CATEGORY_ICONS: Record<EffectCategory, React.ReactNode> = {
  general: <Wand2 size={13} />,
  single: <User size={13} />,
  single_animal: <PawPrint size={13} />,
  double: <Users size={13} />,
  kf_single: <Layers size={13} />,
};

const CATEGORIES: EffectCategory[] = [
  "general",
  "single",
  "single_animal",
  "double",
  "kf_single",
];

export default function EffectSelector({
  selectedTemplate,
  onSelect,
}: EffectSelectorProps) {
  const [activeCategory, setActiveCategory] =
    useState<EffectCategory>("general");

  const filteredTemplates = WANX_TEMPLATES.filter(
    (t) => t.category === activeCategory
  );

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        特效模板
      </h3>

      {/* Category tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`
              flex-shrink-0 flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg
              text-[11px] font-medium transition-all duration-200 whitespace-nowrap
              ${
                activeCategory === cat
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }
            `}
          >
            {CATEGORY_ICONS[cat]}
            {EFFECT_CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto custom-scrollbar pr-0.5">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`
                flex flex-col gap-1.5 px-3 py-2.5 rounded-xl text-left
                transition-all duration-200 border
                ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-300 text-gray-800"
                    : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }
              `}
            >
              <span className="text-xs font-semibold">{template.name}</span>
              <span className="text-[10px] text-gray-400 leading-tight line-clamp-2">
                {template.inputTip}
              </span>
              {/* Model badge */}
              <div className="flex gap-1 flex-wrap mt-0.5">
                {template.supportedModels.includes("wanx2.1-i2v-turbo") && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-green-50 text-green-600 border border-green-100">
                    turbo
                  </span>
                )}
                {template.supportedModels.includes("wanx2.1-i2v-plus") && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100">
                    plus
                  </span>
                )}
                {template.supportedModels.includes("wanx2.1-kf2v-plus") && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 border border-amber-100">
                    首尾帧
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
