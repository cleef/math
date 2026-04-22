import type { Locale } from "./types";

export type Quote = {
  text: string;
  author: string;
};

type ListSummaryArgs = {
  shown: number;
  total: number;
  activeTag: string;
  query: string;
};

export type MessageCatalog = {
  topNav: {
    homeAriaLabel: string;
    brandSubtitle: string;
    searchPlaceholder: string;
    searchAriaLabel: string;
    searchButton: string;
    currentUserAriaLabel: string;
    roleFallback: string;
    languageSwitcherAriaLabel: string;
    chineseLabel: string;
    englishLabel: string;
  };
  list: {
    tagFilterLabel: string;
    allTagLabel: string;
    filterSummary: (args: ListSummaryArgs) => string;
    emptyTitle: string;
    emptyDescription: string;
  };
  pagination: {
    ariaLabel: string;
    previous: string;
    next: string;
  };
  detail: {
    lessonReady: string;
    startLearning: string;
    lessonSpotlight: string;
    introTitle: string;
    introDescription: string;
    quotes: Quote[];
  };
  launch: {
    loadingTitle: (appName: string) => string;
    loadingSubtitle: string;
  };
  statePages: {
    accessDeniedTitle: string;
    accessDeniedDescription: string;
    loadErrorTitle: string;
    loadErrorDescription: string;
    notFoundTitle: string;
    notFoundDescription: string;
    backHome: string;
    reload: string;
  };
  appCard: {
    defaultOwner: string;
    introButton: string;
    openButton: string;
  };
  appTable: {
    app: string;
    owner: string;
    status: string;
    updatedAt: string;
  };
};

export const messages: Record<Locale, MessageCatalog> = {
  "zh-CN": {
    topNav: {
      homeAriaLabel: "返回数学中心首页",
      brandSubtitle: "教学工作台",
      searchPlaceholder: "搜索课程名、知识点或年级",
      searchAriaLabel: "搜索数学课程",
      searchButton: "搜索",
      currentUserAriaLabel: "当前用户",
      roleFallback: "教学管理员",
      languageSwitcherAriaLabel: "切换语言",
      chineseLabel: "中",
      englishLabel: "EN"
    },
    list: {
      tagFilterLabel: "知识分类",
      allTagLabel: "全部",
      filterSummary: ({ shown, total, activeTag, query }) => {
        const tagPart = activeTag ? ` 个「${activeTag}」课程` : " 个课程";
        const queryPart = query ? `（匹配关键词：${query}）` : "";
        return `当前展示 ${shown} / ${total}${tagPart}${queryPart}`;
      },
      emptyTitle: "未找到匹配课程",
      emptyDescription: "请尝试其他关键词，或清空筛选条件。"
    },
    pagination: {
      ariaLabel: "分页",
      previous: "上一页",
      next: "下一页"
    },
    detail: {
      lessonReady: "课程已就绪",
      startLearning: "开始学习",
      lessonSpotlight: "课程聚焦",
      introTitle: "课程介绍",
      introDescription: "先看课程目标与示例，再进入训练。",
      quotes: [
        {
          text: "理解比记忆更重要，步骤比答案更重要。",
          author: "Light Math Hub"
        },
        {
          text: "把抽象概念变成可见步骤，学习效率会明显提升。",
          author: "教学原则"
        },
        {
          text: "先慢后快，先准后熟，是数学训练的底层节奏。",
          author: "课堂经验"
        },
        {
          text: "好的数学练习，应该让学生看见自己的进步。",
          author: "学习设计"
        }
      ]
    },
    launch: {
      loadingTitle: (appName: string) => `正在进入 ${appName}`,
      loadingSubtitle: "课程资源加载中..."
    },
    statePages: {
      accessDeniedTitle: "访问受限",
      accessDeniedDescription: "你当前没有该课程应用的访问权限。",
      loadErrorTitle: "课程加载失败",
      loadErrorDescription: "启动课程时遇到异常，请稍后重试。",
      notFoundTitle: "页面不存在",
      notFoundDescription: "你访问的课程或页面不存在，或链接有误。",
      backHome: "返回数学中心",
      reload: "重新加载"
    },
    appCard: {
      defaultOwner: "数学团队",
      introButton: "课程介绍",
      openButton: "打开"
    },
    appTable: {
      app: "课程应用",
      owner: "维护方",
      status: "状态",
      updatedAt: "更新时间"
    }
  },
  "en-US": {
    topNav: {
      homeAriaLabel: "Back to Math Hub Home",
      brandSubtitle: "Teaching Studio",
      searchPlaceholder: "Search by app name, topic, or grade",
      searchAriaLabel: "Search math apps",
      searchButton: "Search",
      currentUserAriaLabel: "Current user",
      roleFallback: "Teaching Admin",
      languageSwitcherAriaLabel: "Switch language",
      chineseLabel: "中",
      englishLabel: "EN"
    },
    list: {
      tagFilterLabel: "Categories",
      allTagLabel: "All",
      filterSummary: ({ shown, total, activeTag, query }) => {
        const tagPart = activeTag ? ` in "${activeTag}"` : "";
        const queryPart = query ? ` (keyword: ${query})` : "";
        return `Showing ${shown} / ${total} courses${tagPart}${queryPart}`;
      },
      emptyTitle: "No matching courses",
      emptyDescription: "Try another keyword or clear the current filters."
    },
    pagination: {
      ariaLabel: "Pagination",
      previous: "Previous",
      next: "Next"
    },
    detail: {
      lessonReady: "Lesson Ready",
      startLearning: "Start Learning",
      lessonSpotlight: "Lesson Spotlight",
      introTitle: "Course Overview",
      introDescription: "Review the objective and demo first, then start practice.",
      quotes: [
        {
          text: "Understanding matters more than memorizing; process matters more than answers.",
          author: "Light Math Hub"
        },
        {
          text: "When abstract ideas become visible steps, learning accelerates.",
          author: "Teaching Principle"
        },
        {
          text: "Go slow before fast, be accurate before fluent.",
          author: "Classroom Practice"
        },
        {
          text: "Great math practice helps students see their own progress.",
          author: "Learning Design"
        }
      ]
    },
    launch: {
      loadingTitle: (appName: string) => `Opening ${appName}`,
      loadingSubtitle: "Loading lesson resources..."
    },
    statePages: {
      accessDeniedTitle: "Access restricted",
      accessDeniedDescription: "You do not have permission to access this app.",
      loadErrorTitle: "Failed to load app",
      loadErrorDescription: "An error occurred while launching the app. Please try again later.",
      notFoundTitle: "Page not found",
      notFoundDescription: "The requested app or page does not exist, or the link is invalid.",
      backHome: "Back to Math Hub",
      reload: "Reload"
    },
    appCard: {
      defaultOwner: "Math Team",
      introButton: "Overview",
      openButton: "Open"
    },
    appTable: {
      app: "App",
      owner: "Owner",
      status: "Status",
      updatedAt: "Updated"
    }
  }
};
