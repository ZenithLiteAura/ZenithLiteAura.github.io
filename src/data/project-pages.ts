/**
 * 四个项目的介绍页内容（/projects/<slug>/）。
 * 只写 README 里能对上的事实；上游项目在 attribution 里写清作者与协议。
 */

export interface Bi {
  zh: string
  en: string
}

export interface ProjectPage {
  slug: string
  name: string
  tagline: Bi
  summary: Bi
  meta: Array<{ label: Bi; value: Bi }>
  features: Array<{ title: Bi; body: Bi }>
  shots?: Array<{ src: string; alt: Bi }>
  start?: { note: Bi; code: string[] }
  links: Array<{ label: Bi; href: string }>
  attribution?: Bi
}

export const PROJECTS: ProjectPage[] = [
  {
    slug: 'nezo',
    name: 'Nezo',
    tagline: {
      zh: '常驻安卓的剪贴板收藏器 + 短视频解析下载',
      en: 'A clipboard collector that lives on your Android, plus a video downloader',
    },
    summary: {
      zh: '复制抖音、小红书、B 站、快手的「复制打开…」分享文案，Nezo 会把它整理成卡片收进收件箱；粘贴作品链接还能解析出图文或视频，按「下载所有图片 ZIP」「下载所有视频 ZIP」直接存到手机。收录内容只存在应用私有目录，不联网、不上传；只有解析和下载时才联网。',
      en: 'Copy a share blurb from Douyin, Xiaohongshu, Bilibili or Kuaishou and Nezo turns it into a card in your inbox. Paste a post link and it resolves the images or video, then saves them as a ZIP to your phone. Collected items stay in the app private directory — no upload; the network is used only for resolving and downloading.',
    },
    meta: [
      { label: { zh: '平台', en: 'Platform' }, value: { zh: 'Android 8.0+（minSdk 26 · targetSdk 37）', en: 'Android 8.0+ (minSdk 26 · targetSdk 37)' } },
      { label: { zh: '语言', en: 'Language' }, value: { zh: 'Kotlin · Jetpack Compose', en: 'Kotlin · Jetpack Compose' } },
      { label: { zh: '界面', en: 'UI' }, value: { zh: 'MiUiX 液态玻璃', en: 'MiUiX liquid glass' } },
      { label: { zh: '版本', en: 'Version' }, value: { zh: '1.2.5（versionCode 12）', en: '1.2.5 (versionCode 12)' } },
      { label: { zh: '许可', en: 'License' }, value: { zh: 'AGPL-3.0', en: 'AGPL-3.0' } },
    ],
    features: [
      {
        title: { zh: '复制即收录', en: 'Copy to collect' },
        body: { zh: '剪贴板里出现分享文案就自动整理成卡片，进收件箱，不打乱原来的复制习惯。', en: 'A share blurb on the clipboard becomes a card in the inbox — your usual copy habits stay untouched.' },
      },
      {
        title: { zh: '后台收录三条通路', en: 'Three capture paths' },
        body: { zh: '常驻通知栏快捷收录、系统分享菜单、以及应用内粘贴，三种方式都能进。', en: 'A persistent quick-capture notification, the system share sheet, or paste inside the app.' },
      },
      {
        title: { zh: '四平台解析', en: 'Four platforms' },
        body: { zh: '抖音、小红书、B 站、快手的作品链接都能解析出图文或视频。', en: 'Post links from Douyin, Xiaohongshu, Bilibili and Kuaishou all resolve to images or video.' },
      },
      {
        title: { zh: '整包下载', en: 'Download as ZIP' },
        body: { zh: '「下载所有图片 ZIP」「下载所有视频 ZIP」一键存到手机相册目录。', en: 'One tap saves every image or video as a ZIP straight to your phone.' },
      },
      {
        title: { zh: '纯本地存储', en: 'Local only' },
        body: { zh: '收录内容只存在应用私有目录，不上传；解析时才联网。', en: 'Collected items stay in the app private directory; the network is used only for resolving.' },
      },
      {
        title: { zh: '内置更新', en: 'Built-in updates' },
        body: { zh: '可在应用内检查更新，也可以把 Releases 地址交给 Obtainium 订阅。', en: 'Check for updates inside the app, or point Obtainium at the Releases page.' },
      },
    ],
    start: {
      note: { zh: '从 Releases 下载最新的 APK 安装即可，无需登录。', en: 'Download the latest APK from Releases — no account needed.' },
      code: [
        '# 直接装 APK',
        'Nezo-1.2.5.apk',
        '',
        '# 或者用 Obtainium 订阅 Releases',
        'https://github.com/ZenithLiteAura/Zeno/releases',
      ],
    },
    links: [
      { label: { zh: '仓库源码', en: 'Source' }, href: 'https://github.com/ZenithLiteAura/Zeno' },
      { label: { zh: '下载 APK', en: 'Download' }, href: 'https://github.com/ZenithLiteAura/Zeno/releases' },
    ],
  },
  {
    slug: 'motioncraft',
    name: 'MotionCraft',
    tagline: { zh: '把视频变成 Google 动态照片', en: 'Turn videos into Google Motion Photos' },
    summary: {
      zh: '一个 Python 命令行工具，把 mp4 / mov / avi 转成符合 Google Motion Photos 1.0 规范的 .MP.jpg：视频和封面合成在一张图里，相册和系统相机都能识别。自动命名、自动清理临时文件，自带校验工具。',
      en: 'A command-line tool that turns mp4 / mov / avi into .MP.jpg files that comply with Google Motion Photos 1.0 — video and cover packed into one image that galleries and camera apps understand. Auto naming, temp cleanup, and a validator included.',
    },
    meta: [
      { label: { zh: '平台', en: 'Platform' }, value: { zh: 'Python 3.6+（命令行）', en: 'Python 3.6+ (CLI)' } },
      { label: { zh: '依赖', en: 'Requires' }, value: { zh: 'FFmpeg · ExifTool', en: 'FFmpeg · ExifTool' } },
      { label: { zh: '输出', en: 'Output' }, value: { zh: 'Motion Photos 1.0 · .MP.jpg', en: 'Motion Photos 1.0 · .MP.jpg' } },
      { label: { zh: '作者', en: 'Author' }, value: { zh: 'c4882488', en: 'c4882488' } },
      { label: { zh: '许可', en: 'License' }, value: { zh: 'MIT', en: 'MIT' } },
    ],
    features: [
      {
        title: { zh: '规范兼容', en: 'Spec compliant' },
        body: { zh: '完整写入 Motion Photo 标记与版本，支持的应用都能识别成动态照片。', en: 'Writes the full Motion Photo flag and version, so supported apps recognise it as a live photo.' },
      },
      {
        title: { zh: '自动命名', en: 'Auto naming' },
        body: { zh: 'video.mp4 → video.MP.jpg，不用手改后缀。', en: 'video.mp4 becomes video.MP.jpg — no renaming by hand.' },
      },
      {
        title: { zh: '自动清理', en: 'Auto cleanup' },
        body: { zh: '转换过程产生的临时文件自动删掉，目录不留垃圾。', en: 'Temporary files from the conversion are removed automatically.' },
      },
      {
        title: { zh: '内置校验', en: 'Validation' },
        body: { zh: 'verify.py 检查生成的文件结构是否符合规范。', en: 'verify.py checks the resulting file against the spec.' },
      },
      {
        title: { zh: '批量处理', en: 'Batch mode' },
        body: { zh: '一次传入多个视频，或对目录批量转换。', en: 'Pass several videos at once, or convert a whole directory.' },
      },
      {
        title: { zh: '交互演示', en: 'Demo' },
        body: { zh: 'demo.py 用示例视频跑一遍全部功能。', en: 'demo.py walks through every feature with a sample video.' },
      },
    ],
    shots: [{ src: '/projects/motioncraft/demo.jpg', alt: { zh: '转换出来的动态照片示例', en: 'A converted motion photo sample' } }],
    start: {
      note: { zh: '先装 FFmpeg 和 ExifTool，再跑一条命令装依赖。', en: 'Install FFmpeg and ExifTool first, then one command for the Python deps.' },
      code: [
        '# 1. 装依赖并自检',
        'python setup.py',
        '',
        '# 2. 转换',
        'python main.py your_video.mp4',
        '',
        '# 3. 校验',
        'python verify.py your_video.MP.jpg',
      ],
    },
    links: [{ label: { zh: '仓库源码', en: 'Source' }, href: 'https://github.com/c4882488/MotionCraft' }],
    attribution: {
      zh: '上游项目：c4882488/MotionCraft（MIT）。本页只做介绍，代码与版权归原作者。',
      en: 'Upstream: c4882488/MotionCraft (MIT). This page is an introduction; code and copyright belong to the original author.',
    },
  },
  {
    slug: 'nexio',
    name: 'Nexio 课程表',
    tagline: { zh: '一套课表，两种视图 · 液态玻璃 · 本地优先', en: 'One timetable, two views · liquid glass · local first' },
    summary: {
      zh: '周视图与时间轴随课表切换，外观可以逐项调到像素级；数据只存在本机的一个 SQLite 库里，备份走你自己选的本地目录或 WebDAV。多课表、排班、教务导入、桌面小部件都在里面。',
      en: 'Week view and timeline switch with your timetable, and the look can be tuned item by item. Data lives in one local SQLite database; backups go to a folder you pick or to WebDAV. Multiple timetables, shift work, campus imports and home-screen widgets are all included.',
    },
    meta: [
      { label: { zh: '平台', en: 'Platform' }, value: { zh: 'Android 8.0+（另有桌面 / 鸿蒙模块）', en: 'Android 8.0+ (desktop / Harmony modules too)' } },
      { label: { zh: '技术', en: 'Stack' }, value: { zh: 'Kotlin · Compose Multiplatform · MiUiX', en: 'Kotlin · Compose Multiplatform · MiUiX' } },
      { label: { zh: '数据', en: 'Data' }, value: { zh: 'SQLDelight（单库 nexio.db）', en: 'SQLDelight (single nexio.db)' } },
      { label: { zh: '作者', en: 'Author' }, value: { zh: 'HaoZai000', en: 'HaoZai000' } },
      { label: { zh: '许可', en: 'License' }, value: { zh: 'AGPL-3.0', en: 'AGPL-3.0' } },
    ],
    features: [
      {
        title: { zh: '两种视图', en: 'Two views' },
        body: { zh: '周视图和时间轴随课表切换，看本周还是看整学期都行。', en: 'Week view and timeline switch per timetable — this week or the whole term.' },
      },
      {
        title: { zh: '外观逐项可调', en: 'Pixel-level looks' },
        body: { zh: '背景、卡片、字号、圆角都能单独调，液态玻璃效果可开关。', en: 'Background, cards, type scale and corner radius are individually adjustable; the glass effect can be toggled.' },
      },
      {
        title: { zh: '多课表与排班', en: 'Timetables and shifts' },
        body: { zh: '一个应用里放多套课表，支持周次、单双周与排班。', en: 'Several timetables in one app, with week ranges, odd/even weeks and shift patterns.' },
      },
      {
        title: { zh: '教务导入', en: 'Campus import' },
        body: { zh: '粘贴教务系统课表文本或导入文件，自动拆成课程。', en: 'Paste text from a campus system or import a file; courses are split out automatically.' },
      },
      {
        title: { zh: '备份与同步', en: 'Backup and sync' },
        body: { zh: '备份到你选的本地目录或 WebDAV，不经过任何第三方服务器。', en: 'Back up to a local folder you choose or to WebDAV — no third-party server involved.' },
      },
      {
        title: { zh: '提醒与小部件', en: 'Reminders and widgets' },
        body: { zh: '课前提醒、桌面小部件；配合 Shizuku 还能用岛区通知。', en: 'Pre-class reminders and home-screen widgets; with Shizuku it can use island notifications.' },
      },
    ],
    shots: [
      { src: '/projects/nexio/timetable.png', alt: { zh: '主课程表', en: 'Main timetable' } },
      { src: '/projects/nexio/add.png', alt: { zh: '添加课程', en: 'Add a course' } },
      { src: '/projects/nexio/import.png', alt: { zh: '教务导入', en: 'Campus import' } },
      { src: '/projects/nexio/reminder.png', alt: { zh: '课程提醒', en: 'Course reminder' } },
    ],
    start: {
      note: { zh: '从上游 Releases 下载安装包，或直接看官网。', en: 'Get the APK from upstream Releases, or visit the project site.' },
      code: ['# 上游发布页', 'https://github.com/HaoZai000/NexioSchedule/releases', '', '# 官网', 'https://nexioschedule.icu'],
    },
    links: [
      { label: { zh: '上游仓库', en: 'Upstream' }, href: 'https://github.com/HaoZai000/NexioSchedule' },
      { label: { zh: '官网', en: 'Website' }, href: 'https://nexioschedule.icu' },
    ],
    attribution: {
      zh: '上游项目：HaoZai000/NexioSchedule（AGPL-3.0）。本页是介绍页，代码与版权归原作者。',
      en: 'Upstream: HaoZai000/NexioSchedule (AGPL-3.0). This page is an introduction; code and copyright belong to the original author.',
    },
  },
  {
    slug: 'prism',
    name: 'Prism Gallery',
    tagline: { zh: '四套设计风格的离线相册', en: 'A private gallery with four design styles' },
    summary: {
      zh: '完全离线的 Android 相册：没有网络权限、没有广告、没有追踪、不需要账号。内置 iOS 液态玻璃、三星 One UI、小米澎湃 HyperOS、Google Gemini 四套风格，各自有独立的排版与动效。',
      en: 'A fully offline Android gallery: no internet permission, no ads, no tracking, no account. Four built-in styles — iOS liquid glass, Samsung One UI, Xiaomi HyperOS and Google Gemini — each with its own layout and animations.',
    },
    meta: [
      { label: { zh: '平台', en: 'Platform' }, value: { zh: 'Android（离线，无网络权限）', en: 'Android (offline, no network permission)' } },
      { label: { zh: '风格', en: 'Styles' }, value: { zh: '液态玻璃 / One UI / HyperOS / Gemini', en: 'Liquid glass / One UI / HyperOS / Gemini' } },
      { label: { zh: '作者', en: 'Author' }, value: { zh: 'Soretake', en: 'Soretake' } },
      { label: { zh: '许可', en: 'License' }, value: { zh: 'GPL-3.0', en: 'GPL-3.0' } },
    ],
    features: [
      {
        title: { zh: '四套风格', en: 'Four styles' },
        body: { zh: '每种风格都有自己的布局、圆角和动画，不是换个配色。', en: 'Each style has its own layout, radii and animation — not just a recolour.' },
      },
      {
        title: { zh: '相册管理', en: 'Album control' },
        body: { zh: '新建、重命名、隐藏、子相册，媒体可在相册间移动，整组相册还可在内置存储与 SD 卡之间搬。', en: 'Create, rename, hide, sub-albums; move media between albums and whole albums between internal storage and SD card.' },
      },
      {
        title: { zh: '私密相册', en: 'Private album' },
        body: { zh: 'PIN、指纹或屏幕锁保护，数据留在应用内。', en: 'Protected by PIN, fingerprint or screen lock; data stays inside the app.' },
      },
      {
        title: { zh: '时间轴与搜索', en: 'Timeline and search' },
        body: { zh: '按日 / 月 / 年浏览，可按名称、相册、地点、日期、类型搜索，全部在设备上完成。', en: 'Browse by day, month or year; search by name, album, place, date or type — all on device.' },
      },
      {
        title: { zh: '阅读体验', en: 'Reading experience' },
        body: { zh: '深度缩放，超长滚动截图也能看清；支持幻灯片、动态照片、HDR、视频变速与逐帧截图。', en: 'Deep zoom that stays readable on huge photos and long screenshots; slideshow, motion photos, HDR, video speed and frame capture.' },
      },
      {
        title: { zh: '清理与整理', en: 'Cleanup' },
        body: { zh: '编辑器（裁剪、旋转、亮度对比、滤镜、涂画、文字），以及重复 / 相似照片、旧截图、大视频、RAW 的清理。', en: 'An editor (crop, rotate, light, filters, drawing, text) plus cleanup for duplicates, similar shots, old screenshots, large videos and RAW.' },
      },
    ],
    start: {
      note: { zh: '从上游 Releases 获取 APK；README 里有 APK 校验方法。', en: 'Get the APK from upstream Releases; the README explains how to verify it.' },
      code: ['# 上游发布页', 'https://github.com/Soretake/PrismGallery/releases'],
    },
    links: [{ label: { zh: '上游仓库', en: 'Upstream' }, href: 'https://github.com/Soretake/PrismGallery' }],
    attribution: {
      zh: '上游项目：Soretake/PrismGallery（GPL-3.0）。本页是介绍页，代码与版权归原作者。',
      en: 'Upstream: Soretake/PrismGallery (GPL-3.0). This page is an introduction; code and copyright belong to the original author.',
    },
  },
]

export const projectBySlug = (slug: string): ProjectPage | undefined =>
  PROJECTS.find((project) => project.slug === slug)
