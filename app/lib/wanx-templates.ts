export type EffectCategory =
  | "general"
  | "single"
  | "single_animal"
  | "double"
  | "kf_single";

export interface WanxTemplate {
  id: string;
  name: string;
  template: string;
  category: EffectCategory;
  supportedModels: string[];
  inputTip: string;
  /** "i2v" = 首帧生视频, "kf2v" = 首尾帧生视频 */
  type: "i2v" | "kf2v";
}

export const EFFECT_CATEGORY_LABELS: Record<EffectCategory, string> = {
  general: "通用特效",
  single: "单人特效",
  single_animal: "单人/动物",
  double: "双人特效",
  kf_single: "首尾帧特效",
};

/**
 * 根据模板类型自动选择默认模型
 */
export function getDefaultModel(template: WanxTemplate): string {
  if (template.type === "kf2v") return "wanx2.1-kf2v-plus";
  // turbo 模型支持的模板优先使用 turbo（更快）
  if (template.supportedModels.includes("wanx2.1-i2v-turbo")) {
    return "wanx2.1-i2v-turbo";
  }
  return "wanx2.1-i2v-plus";
}

export const WANX_TEMPLATES: WanxTemplate[] = [
  // ========== 通用特效（首帧） ==========
  {
    id: "squish",
    name: "解压捏捏",
    template: "squish",
    category: "general",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持任意主体，建议使用主体突出、与背景有明显区分度的图片",
    type: "i2v",
  },
  {
    id: "rotation",
    name: "转圈圈",
    template: "rotation",
    category: "general",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持任意主体，建议使用主体突出、与背景有明显区分度的图片",
    type: "i2v",
  },
  {
    id: "poke",
    name: "戳戳乐",
    template: "poke",
    category: "general",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持任意主体，建议使用主体突出、与背景有明显区分度的图片",
    type: "i2v",
  },
  {
    id: "inflate",
    name: "气球膨胀",
    template: "inflate",
    category: "general",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持任意主体，建议使用主体突出、与背景有明显区分度的图片",
    type: "i2v",
  },
  {
    id: "dissolve",
    name: "分子扩散",
    template: "dissolve",
    category: "general",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持任意主体，建议使用主体突出、与背景有明显区分度的图片",
    type: "i2v",
  },
  {
    id: "melt",
    name: "热浪融化",
    template: "melt",
    category: "general",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持任意主体，建议使用主体突出、与背景有明显区分度的图片",
    type: "i2v",
  },
  {
    id: "icecream",
    name: "冰淇淋星球",
    template: "icecream",
    category: "general",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持任意主体，建议使用主体突出、与背景有明显区分度的图片",
    type: "i2v",
  },

  // ========== 单人特效（首帧） ==========
  {
    id: "carousel",
    name: "时光木马",
    template: "carousel",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "i2v",
  },
  {
    id: "singleheart",
    name: "爱你哟",
    template: "singleheart",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "i2v",
  },
  {
    id: "dance1",
    name: "摇摆时刻",
    template: "dance1",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "i2v",
  },
  {
    id: "dance2",
    name: "头号甩舞",
    template: "dance2",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持单人照片，建议使用全身正面照片",
    type: "i2v",
  },
  {
    id: "dance3",
    name: "星摇时刻",
    template: "dance3",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持单人照片，建议使用全身正面照片",
    type: "i2v",
  },
  {
    id: "dance4",
    name: "指感节奏",
    template: "dance4",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "i2v",
  },
  {
    id: "dance5",
    name: "舞动开关",
    template: "dance5",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "i2v",
  },
  {
    id: "mermaid",
    name: "人鱼觉醒",
    template: "mermaid",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持单人照片，建议使用半身的正面照片",
    type: "i2v",
  },
  {
    id: "graduation",
    name: "学术加冕",
    template: "graduation",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "i2v",
  },
  {
    id: "dragon",
    name: "巨兽追袭",
    template: "dragon",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "i2v",
  },
  {
    id: "money",
    name: "财从天降",
    template: "money",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "i2v",
  },
  {
    id: "jellyfish",
    name: "水母之约",
    template: "jellyfish",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "i2v",
  },
  {
    id: "pupil",
    name: "瞳孔穿越",
    template: "pupil",
    category: "single",
    supportedModels: ["wanx2.1-i2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "i2v",
  },

  // ========== 单人或动物特效（首帧） ==========
  {
    id: "flying",
    name: "魔法悬浮",
    template: "flying",
    category: "single_animal",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持单人或动物照片，建议使用全身的正面照片",
    type: "i2v",
  },
  {
    id: "rose",
    name: "赠人玫瑰",
    template: "rose",
    category: "single_animal",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持单人或动物照片，建议使用半身至全身的正面照片，避免露出手部",
    type: "i2v",
  },
  {
    id: "crystalrose",
    name: "闪亮玫瑰",
    template: "crystalrose",
    category: "single_animal",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持单人或动物照片，建议使用半身至全身的正面照片，避免露出手部",
    type: "i2v",
  },

  // ========== 双人特效（首帧） ==========
  {
    id: "hug",
    name: "爱的抱抱",
    template: "hug",
    category: "double",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持双人照片，建议两人正面看向镜头或相对站立，可为半身或全身照",
    type: "i2v",
  },
  {
    id: "frenchkiss",
    name: "唇齿相依",
    template: "frenchkiss",
    category: "double",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持双人照片，建议两人正面看向镜头或相对站立，可为半身或全身照",
    type: "i2v",
  },
  {
    id: "coupleheart",
    name: "双倍心动",
    template: "coupleheart",
    category: "double",
    supportedModels: ["wanx2.1-i2v-plus", "wanx2.1-i2v-turbo"],
    inputTip: "支持双人照片，建议两人正面看向镜头或相对站立，可为半身或全身照",
    type: "i2v",
  },

  // ========== 单人特效（首尾帧） ==========
  {
    id: "hanfu-1",
    name: "唐韵翩然",
    template: "hanfu-1",
    category: "kf_single",
    supportedModels: ["wanx2.1-kf2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "kf2v",
  },
  {
    id: "solaron",
    name: "机甲变身",
    template: "solaron",
    category: "kf_single",
    supportedModels: ["wanx2.1-kf2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "kf2v",
  },
  {
    id: "magazine",
    name: "闪耀封面",
    template: "magazine",
    category: "kf_single",
    supportedModels: ["wanx2.1-kf2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "kf2v",
  },
  {
    id: "mech1",
    name: "机械觉醒",
    template: "mech1",
    category: "kf_single",
    supportedModels: ["wanx2.1-kf2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "kf2v",
  },
  {
    id: "mech2",
    name: "赛博登场",
    template: "mech2",
    category: "kf_single",
    supportedModels: ["wanx2.1-kf2v-plus"],
    inputTip: "支持单人照片，建议使用半身至全身的正面照片",
    type: "kf2v",
  },
];
