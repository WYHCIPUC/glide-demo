// 公开展馆目录。只描述可核对的产品能力；互动样例为说明结构的本地示意。
export const halls = [
  { id: 'monitoring', title: '四专项监测馆', kicker: '01 / 发现变化', tagline: '世界动态 · 国家 · 日期 · 网页', intro: '先看专项运行总览，再按全球移民、重点国家、重要时间节点和指定网页逐层阅读。', index: '01' },
  { id: 'practical', title: '四专题实战馆', kicker: '02 / 面向业务', tagline: '四个视角，进入具体业务', intro: '涉外服务、偷渡态势、境外风险和全球暴恐各有六个阅读栏目，并共享事实、研判、广州关联与成果链路。', index: '02' },
  { id: 'intelligence', title: '信息与事件馆', kicker: '03 / 核对依据', tagline: '从一条线索，到事件脉络', intro: '从状态总览、监测概况和监控源状态进入文章、事件与治理记录。', index: '03' },
  { id: 'knowledge', title: '数据与知识馆', kicker: '04 / 积累复用', tagline: '资料积累，持续复用', intro: '把信息资产、AI 治理、事件证据、国情和日历资料组织成可检索的知识底座。', index: '04' },
  { id: 'outputs', title: '成果与应用馆', kicker: '05 / 形成材料', tagline: '简报 · 报告 · 提醒 · 知识包', intro: '简报、月度研判、专题报告、提醒和离线知识包服务不同的阅读与协作场景。', index: '05' },
  { id: 'engineering', title: '建设与设计馆', kicker: '06 / 了解系统', tagline: '看懂选择背后的理由', intro: '从建设思路进入技术取舍、配置与部署；需要时再查看版本、安全和恢复细节。', index: '06' },
];

// 每项为 [id, parent, title, summary, 深入说明]；统一生成 UI 所需的数组字段。
const entries = [
  ['lobby', null, '境鉴中央品牌大厅', '从广州观察全球，把监测、事实、研判与成果放在一条可追溯的阅读路径中。', '领导可从六馆快速定位重点，业务人员可沿变化继续看到来源和历史；这里提供展馆导航及六馆入口。'],
  ['monitoring', 'lobby', '四项专项监测', '按全球议题、重点国家、重要日期与指定网页持续发现值得阅读的变化。', '先看专项运行总览了解任务状态，再进入对应监测域；输出更新线索、版本差异和后续阅读入口。'],
  ['monitoring-overview', 'monitoring', '专项运行总览', '集中查看四项专项监测的最近任务、更新与推送状态，快速定位异常或新内容。', '从主站“专项运行总览”进入，按监测域查看最近运行；输出各专项的运行线索与待跟进事项。'],
  ['global-migration', 'monitoring', '全球移民动态', '围绕移民政策、边境执法及相关挑战，把全球信息串成可持续阅读的动态。', '从“全球移民动态”进入态势、简报和月度研判；输出按主题和时间组织的变化材料。'],
  ['migration-trends', 'global-migration', '变化趋势', '按时间观察相关报道与事件的变化，帮助发现需要追查的阶段。', '在全球移民动态的趋势视图选择时间段，再下钻事件；输出趋势图与对应记录，不把报道热度当作真实迁移规模。'],
  ['migration-alerts', 'global-migration', '态势预警', '把符合已配置规则的重要变化放到同一关注区，供后续核对与提醒。', '在专项页查看预警依据和状态，再回到事件或来源；输出待关注线索及其来源入口。'],
  ['country-monitoring', 'monitoring', '重点国家动态', '把重点国家的最新信息与人口、经济、政治、地理等背景放在一起阅读。', '从“重点国家动态”选择国家，再进入国情卡和来源；输出国别背景与近期变化线索。'],
  ['country-card', 'country-monitoring', '国家情报卡', '集中阅读国别基本情况，并保留中文优先、英文兜底和待补充的字段状态。', '打开国家资料卡核对字段和来源；输出可供研判引用的人口、经济、政体和地理背景。'],
  ['country-watchlist', 'country-monitoring', '国家关注范围', '按工作需要设置重点国家，使国别变化进入更聚焦的阅读范围。', '在监测配置中查看关注国家和相关任务；输出持续观察的国别列表与运行状态。'],
  ['timeline-monitoring', 'monitoring', '重要时间节点', '把节庆、会议和其他全球重要日期排进可查询的时间视图。', '从“重要时间节点”按日期或国家查找，打开详情核对依据；输出活动窗口与日期背景。'],
  ['calendar-view', 'timeline-monitoring', '时间日历', '以月历和日期索引呈现重要节点，方便提前找到需要准备的时间窗口。', '在日历中切换月份并点开日期；输出该日节点和相关说明。'],
  ['calendar-sources', 'calendar-view', '日期来源', '日期详情保留解析记录与原始来源的对应关系，便于核对具体条目。', '展开日期依据可见来源记录及版本；输出可复核的日期出处，缺原件时如实显示。'],
  ['webpage-monitoring', 'monitoring', '网页动态监测', '跟踪指定公开网页，识别内容更新并保留前后版本供阅读。', '从“网页动态监测”选择监测页和时间；输出变化摘要、历史版本及推送记录。'],
  ['webpage-list', 'webpage-monitoring', '监测网页清单', '把指定官网和公开页面汇成监测列表，显示各页最近检查与更新情况。', '在网页监测页选择对象查看状态；输出监测范围及最近变化入口。'],
  ['webpage-reading', 'webpage-monitoring', '网页变化阅读', '把新增、删改的正文内容与前后版本放到同一阅读页。', '打开某次更新，先读变化摘要，再比对原文片段；输出便于核对的差异阅读记录。'],
  ['demo-versions', 'webpage-reading', '网页版本对照', '用本地示例演示同一网页在两个时间点的正文如何对照，展示阅读方式。', '切换示例版本查看增删位置；输出示意差异，不代表实时抓取结果。'],
  ['version-design', 'demo-versions', '版本如何形成', '一次网页更新关联其来源、抓取时间和可比较的正文，形成可回看的版本链。', '在版本详情查看每次采集与变化摘要；输出时间顺序清晰的来源版本。'],
  ['archive-fingerprint', 'version-design', '归档指纹', '为归档内容保留指纹与来源信息，便于识别相同内容和核对历史版本。', '从版本链进入归档记录查看指纹和时间；输出可复核的归档标识，不把标题变化误当作新事实。'],
  ['webpage-push-history', 'webpage-monitoring', '网页变化推送记录', '已配置的网页更新提醒可回查发送历史，方便核对是否触达。', '在网页监测历史中查看推送时间和状态；输出提醒记录及对应网页版本。'],
  ['monitoring-source-setup', 'monitoring', '监测范围配置', '按监测主题维护来源与关注对象，让采集任务有清晰边界。', '在数据源配置和专项页核对范围；输出可调整的来源、国家、日期或网页对象。'],

  ['practical', 'lobby', '四专题实战', '同一资料底座服务四个固定专题，每馆从判断进入变化、空间、关联、依据与明细。', '六个栏目仅在独立专题工作台按幕次呈现；经典页使用自身的专题入口和阅读区。两种入口都可查看主题判断、依据与广州关联。'],
  ['topic-foreign-service', 'practical', '涉外服务管理', '围绕会展人员来源、涉外机构与服务资源，把公开信息转为服务准备背景。', '从专题首屏看服务判断，再沿六栏目核对趋势、覆盖、需求与资料；输出涉外服务参考材料。'],
  ['foreign-judgment', 'topic-foreign-service', '服务判断', '先呈现会展和涉外机构的已知变化，帮助确定需要继续看的问题。', '打开工作台第一栏看判断与依据入口；输出服务关注点，不替代业务决定。'],
  ['foreign-exhibition', 'topic-foreign-service', '会展变化', '按届次查看境外采购商与来源覆盖的公开变化，辨认服务准备窗口。', '在第二栏比较历届数据及来源；输出会展变化图与可追溯统计。'],
  ['foreign-coverage', 'topic-foreign-service', '服务覆盖', '把领馆、国际学校与商协会等公开机构资料汇成服务背景。', '在第三栏按机构和区域查看覆盖；输出机构类别与位置线索。'],
  ['enterprise-scope-analysis', 'topic-foreign-service', '企业资料同范围分析', '在涉外服务的企业资料视角中，让地区、行业、图表和原表明细沿用同一筛选范围。', '从专题页进入企业资料，应用行政区、行业等条件；地图、矩阵和表格同步更新，输出当前匹配记录及来源索引。'],
  ['foreign-demand', 'topic-foreign-service', '需求关联', '把会展与涉外资源变化放在一起，形成需要了解的服务关联。', '在第四栏沿关联关系下钻资料；输出与当前判断有关的服务需求线索。'],
  ['foreign-sources', 'topic-foreign-service', '名录与依据', '汇集机构名录和所用公开资料，方便从判断回到出处。', '在第五栏展开名录与引用；输出机构详情、原始来源和资料状态。'],
  ['foreign-detail', 'topic-foreign-service', '类别明细', '按来源国、机构类别和时间进一步核对涉外服务数据。', '在第六栏筛选明细并回看口径；输出当前条件下的可查记录。'],
  ['topic-smuggling', 'practical', '偷渡态势研判', '围绕迁移路线、边境侦测和相关后果，持续观察公开数据中的变化。', '先读结论总览，再依次查看路线、地图、结构、来源与明细；输出带出处的态势材料。'],
  ['smuggling-judgment', 'topic-smuggling', '结论总览', '把已知路线变化和关键指标放在首屏，供快速把握当前关注点。', '在工作台第一栏阅读结论和统计日期；输出需要继续核对的路线与地区。'],
  ['smuggling-change', 'topic-smuggling', '路线变化', '按时间比较主要迁移走廊和边境侦测记录，观察变化方向。', '在第二栏选择路线与时段；输出可追溯的变化曲线和对应资料。'],
  ['smuggling-routes', 'topic-smuggling', '全球路线', '在地图中定位公开资料涉及的迁移走廊，辅助空间阅读。', '在第三栏切换路线并查看详情；输出路线分布及来源说明。'],
  ['smuggling-impact', 'topic-smuggling', '结构与后果', '把流向、死亡失踪及相关背景分开呈现，避免混淆不同指标。', '在第四栏切换指标并核对单位；输出结构图与后果信息。'],
  ['smuggling-sources', 'topic-smuggling', '来源与口径', '为每个统计和地图图层标出数据来源、时间和可比边界。', '在第五栏查看来源记录与指标定义；输出可复核的数据依据。'],
  ['smuggling-detail', 'topic-smuggling', '数据明细', '按时间、路线和地区筛选具体记录，供核对或导出。', '在第六栏打开表格并应用筛选；输出当前条件下的记录列表。'],
  ['topic-overseas-risk', 'practical', '境外风险传导', '把境外事件、国别背景和广州关联放在同一问题中持续观察。', '从综合研判进入变化、地图、传导、证据与国家明细；输出研判线索与来源依据。'],
  ['risk-judgment', 'topic-overseas-risk', '综合研判', '先看当前国家变化、事件记录和广州关联，明确进一步查证的重点。', '在第一栏阅读判断并沿依据下钻；输出当前专题的核心观察。'],
  ['risk-change', 'topic-overseas-risk', '风险变化', '按时间和事件类型观察公开记录变化，区分事件活跃度与推断风险。', '在第二栏切换时间及类型；输出变化趋势及对应事件。'],
  ['risk-countries', 'topic-overseas-risk', '国家态势', '将事件和国别资料放在地图与国家列表中查看。', '在第三栏选择国家；输出国别事件构成和背景入口。'],
  ['risk-guangzhou', 'topic-overseas-risk', '广州传导', '沿人员往来与涉外服务相关公开条件分析境外变化的本地关联。', '在第四栏查看关联因素和来源；输出需要持续观察的广州关联说明。'],
  ['risk-evidence', 'topic-overseas-risk', '证据与缺口', '列出当前判断实际引用的资料，也指出影响阅读的缺项。', '在第五栏展开证据台账；输出来源、引用位置和待补充内容。'],
  ['risk-detail', 'topic-overseas-risk', '国家明细', '按国家继续阅读事件、背景和相关广州接口。', '在第六栏选国家与时间；输出具体国别记录和依据。'],
  ['topic-terrorism', 'practical', '全球暴恐监测', '观察袭击、图谋、反恐执法等公开事件及其地点、类型与归因资料。', '先读综合判断，再核对变化、地点、组织、来源和事件明细；输出专题研究材料。'],
  ['terror-judgment', 'topic-terrorism', '综合判断', '汇总当前专题分析发现，并提供回到具体事件的路径。', '在第一栏阅读判断和引用；输出当前关注的地区、事件类型与依据。'],
  ['terror-change', 'topic-terrorism', '事件变化', '按时间观察分析事件变化，保留袭击与其他事件类别的差异。', '在第二栏切换时段及类型；输出趋势与对应记录。'],
  ['terror-map', 'topic-terrorism', '地点分布', '把公开事件放到发生地点视图，辅助识别区域聚集。', '在第三栏点选地区查看记录；输出地点分布与事件列表。'],
  ['terror-groups', 'topic-terrorism', '组织与归因', '并列呈现组织活动与归因表述，允许追查来源，不把未证实归因写成事实。', '在第四栏查看组织和事件关系；输出带来源的关联线索。'],
  ['terror-sources', 'topic-terrorism', '来源对账', '将分析事件与公开来源记录对应起来，保留定义和缺口。', '在第五栏核对来源和时间；输出可回溯的证据台账。'],
  ['terror-detail', 'topic-terrorism', '事件明细', '按日期、地点和类别查看单条事件及其后续记录。', '在第六栏筛选并打开事件；输出具体事件与引用原文。'],
  ['practical-common', 'practical', '专题共同能力', '四个专题都把公开事实、系统研判、广州关联、报告提醒与版本更正串在一起。', '从任一专题的工作台或经典页进入对应区域；输出完整的判断和复核路径。'],
  ['public-facts', 'practical-common', '公开事实', '把来源可见的事件与资料作为事实层，与后续系统研判分开阅读。', '在专题内展开事实与原文；输出可回查的公开记录。'],
  ['system-analysis', 'practical-common', '系统研判', '在事实层之上形成有依据的分析，并保留所引用的资料。', '从专题判断进入分析产品和依据台账；输出分层结论与引用。'],
  ['guangzhou-relevance', 'practical-common', '广州关联', '从广州业务需要看全球变化的可能关联，显示分析所依据的公开条件。', '在专题关联栏目查看本地接口和来源；输出可继续核对的关联说明。'],
  ['topic-corrections', 'practical-common', '版本更正', '对后续修订和错误研判留痕，保留原始事实主记录。', '从报告与更正入口查看历史版本；输出修订原因与前后变化。'],
  ['demo-layers', 'practical-common', '三层研判示意', '示意长期基线、实时变化、组合研判如何承接，而不展示虚构业务成效。', '切换三个本地示意层次；输出每层需要的资料和阅读顺序。'],
  ['baseline-layer', 'demo-layers', '长期基线', '先积累国别、历史和专题结构化资料，供实时变化出现时参照。', '从专题资料区域打开基线资产；输出长期背景及来源清单。'],
  ['realtime-layer', 'demo-layers', '实时变化', '新事件和来源更新进入变化层，与已有基线形成时间对照。', '在专题动态区选时间段；输出新增记录和变化摘要。'],
  ['combined-layer', 'demo-layers', '组合研判', '把基线与实时变化共同用于当前问题，默认优先呈现组合结果。', '从专题首屏读组合判断，再按来源下钻；输出有引用的当前研判。'],

  ['intelligence', 'lobby', '信息与事件', '从运行状态和来源进入文章、事件与治理记录，保留线索变成判断的过程。', '先读核心中台，再打开事件详情核对正文与关联来源；输出可追溯的信息链。'],
  ['dashboard', 'intelligence', '状态总览', '汇集运行任务、采集产出与系统状态，提示当前需要关注的异常。', '从主站“状态总览”进入；输出任务状态、近期变化及后续处理入口。'],
  ['monitoring-summary', 'intelligence', '监测概况', '按日期查看信息分布、来源构成、关键词和变化趋势。', '从主站“监测概况”选择时段和维度；输出当前采集内容的概览。'],
  ['source-status', 'intelligence', '监控源状态', '查看来源分布、采集状态与更新时间，发现需要维护的来源。', '从主站“监控源状态”展开来源；输出运行状态与最近采集线索。'],
  ['event-data', 'intelligence', '事件数据', '集中检索文章与事件，阅读中文摘要、原文和后续进展。', '从主站“事件数据”筛选主题或日期并打开详情；输出事件记录及关联文章。'],
  ['source-collection', 'intelligence', '公开来源采集', '从已配置的公开站点和订阅源获取内容，形成阅读与筛选入口。', '从来源状态与事件数据进入采集结果；输出带来源和时间的信息记录。'],
  ['keyword-filter', 'intelligence', '关键词初筛', '用业务词组缩小待阅读范围，并保留规则的可调整性。', '在关键词规则页查看命中条件，再到事件数据核对结果；输出候选线索。'],
  ['ai-screening', 'intelligence', 'AI 智能筛选', '结合主题配置对已采集内容作进一步筛选，减少无关材料进入阅读区。', '在 AI 智能筛选设置中查看规则；输出筛选后的内容及运行记录。'],
  ['translation-summary', 'intelligence', '翻译与摘要', '为跨语种材料生成中文标题、摘要和重点信息，同时保留原文。', '在文章详情阅读中文内容并返回来源；输出便于快速理解的中文阅读材料。'],
  ['article-reader', 'intelligence', '原文阅读', '把摘要、正文、来源和时间放在同一详情中，方便核查转述是否准确。', '从事件或文章列表打开详情；输出完整阅读路径和原始来源入口。'],
  ['event-linking', 'intelligence', '事件关联', '将同一现实事件的多篇报道放在一起，保留各来源的独立表述。', '在事件详情查看关联文章与时间线；输出事件进展而非重复事件计数。'],
  ['event-governance', 'intelligence', '事件治理', '支持对事件归并、清洗和更正进行管理，使统计与详情沿用一致口径。', '在事件工作区查看治理操作和结果；输出可持续维护的事件记录。'],
  ['event-elements', 'intelligence', '事件要素', '从事件资料中整理时间、地点、主体与动作，并让要素回到文字依据。', '在事件详情展开要素证据；输出可定位来源片段的结构化信息。'],
  ['event-history', 'intelligence', '历史进展', '保留事件后续报道和状态变化，支持回看判断是怎样演进的。', '在事件详情按时间查看历史；输出进展链及对应原文。'],
  ['event-dedup', 'intelligence', '四专题共享事实', '四专题实战中的同一公开来源版本或事件共用一条事实主记录，各专题通过关联表引用。', '在实战专题的事实和来源台账中查看同一记录的不同专题引用；输出去重后的四专题证据关系。全项目其他链路遵守去重原则，不在此宣称共用一张物理主表。'],
  ['demo-dedup', 'event-dedup', '同一事实，多个视角', '用本地示例展示四专题如何引用同一条公开记录，避免重复采集和统计。', '切换转载归并与实质更新，观察发布、事实、来源版本和四专题引用如何分别变化。'],
  ['canonical-design', 'demo-dedup', '主记录与专题映射', '四专题实战先将来源版本归入共享事实主记录，再建立专题映射和事件关系。', '沿示例下钻主记录与关联表；输出同一条四专题事实被复用的位置。'],
  ['event-merge-guard', 'event-dedup', '防误合并', '同一事件簇需主体、动作与现实对象一致，单一相似线索不足以桥接整簇。', '在事件治理中查看归并依据；输出更可靠的事件边界。'],

  ['knowledge', 'lobby', '数据与知识', '整理可检索、可复用的资料资产，让判断能回到来源与历史。', '从数据中台进入资产、分析、证据和国情日历；输出可重复使用的知识材料。'],
  ['data-hub', 'knowledge', '综合治理与研判', '统一检索事件、文章和资料，按问题组织专题分析。', '从主站“数据中台”进入检索与研判区域；输出主题线索、引用与分析结果。'],
  ['asset-inventory', 'data-hub', '资产盘点', '了解已经接入的事件、报告和专题资料类型，找到可用的原始材料。', '在数据中台按类别浏览资产；输出资料清单与状态。'],
  ['ai-governance', 'data-hub', 'AI 治理', '记录筛选与分析的调用和结果，便于核对模型处理与资料之间的关系。', '在数据中台及运行记录查看任务；输出处理痕迹和需要人工阅读的分析材料。'],
  ['deep-analysis', 'data-hub', '深度研判', '围绕选定范围整理趋势、关联和证据，支持业务人员继续追问。', '在数据中台设置范围并打开结果；输出带引用事件的分析段落。'],
  ['evidence-trail', 'data-hub', '证据链', '把分析所用事件、原文与资料出处串起来，便于逐项核查。', '从分析结论点击引用进入详情；输出来源、时间和文字证据。'],
  ['entity-relations', 'data-hub', '实体关联底座', '存储和查询人物、机构、地点等实体关系，为事件阅读提供背景线索。', '在数据中台的关联视图按事件进入；输出关系线索与来源，当前不作为独立公开业务页。'],
  ['osint-lines', 'data-hub', '公开来源线索底座', '把公开来源线索用于资料检索和背景关联，支持后续研判。', '从综合检索和证据链查看关联内容；输出来源线索，当前不作为独立公开业务页。'],
  ['country-knowledge', 'knowledge', '全球国情资料', '把国家和地区的地理、人口、经济及政体信息提供给国别阅读。', '从重点国家或数据中台打开国家卡；输出带缺失提示的背景资料。'],
  ['calendar-knowledge', 'knowledge', '全球日期资料', '将重要日期及其来源记录供时间节点监测和专题准备复用。', '从重要时间节点打开日期详情；输出日期背景、原字段与来源。'],
  ['source-version', 'knowledge', '来源版本', '把同一来源的实质更新和更正串成版本，便于解释前后变化。', '从资料或网页版本详情进入历史；输出可回看的更新链。'],
  ['source-assets', 'knowledge', '来源资产引用', '研判产品标明实际使用的资料，而不是只写一份笼统来源列表。', '在专题判断的依据台账查看引用；输出资产名称、版本和具体用途。'],
  ['reuse-policy', 'knowledge', '跨专题复用', '四专题实战的事实主记录与结构化资产通过关联引用，各专题保留自己的分析视角。', '从四专题资料台账查看映射和来源；输出共享出处，不将同一公开事实重复计数。'],
  ['knowledge-export', 'knowledge', '知识导出与复用', '把事件、证据、AI 治理结果和综合研判成果整理为可校验的离线资料。', '在数据中台“数据流转”选择模式、日期、是否包含已存储正文及业务数据集，生成全量基线包或增量更新包。'],
  ['demo-scope', 'enterprise-scope-analysis', '同范围分析示意', '用本地示例展示行政区和行业条件如何联动涉外企业资料的地图、矩阵与记录。', '调整地区与行业后，图表、明细及当前全部匹配结果的 CSV 保持同一范围；仅演示涉外服务企业资料视角。'],

  ['outputs', 'lobby', '成果应用', '从日常简报到专题报告与变化提醒，让监测资料进入具体工作。', '按阅读目的选择成果，再沿引用回到事件和来源；输出可持续更新的材料。'],
  ['daily-briefing', 'outputs', '每日简报', '把当天重要内容汇成日常阅览材料，保留综合摘要、群体管理与影响、弱信号捕捉。', '从全球移民动态或月度页简报入口阅读；输出带来源的每日重点。'],
  ['monthly-analysis', 'outputs', '月度研判', '把阶段内的事件与材料按主题、区域和变化组织起来。', '在月度研判页切换时段并下钻事件；输出阶段性分析与引用。'],
  ['topic-report', 'outputs', '专题报告', '围绕四专题或特定问题组织判断、事实、广州关联和依据。', '从专题报告入口选择主题；输出可回到来源的专题材料。'],
  ['change-alert', 'outputs', '变化提醒', '按照已配置条件提示重要更新、报告或网页变化，支持持续跟踪。', '在专项或通知历史查看提醒；输出变化线索和对应来源。'],
  ['notification-channels', 'change-alert', '多渠道通知', '按本地配置向企业微信、飞书、钉钉、邮件等渠道分发材料。', '在基础与推送配置查看已启用渠道；输出送达状态与历史记录。'],
  ['filter-export', 'outputs', '筛选与导出', '按时间、国家、主题或来源缩小材料范围，再导出当前查询结果。', '在事件、数据明细或数据中台设置筛选；输出与当前条件一致的文件。'],
  ['offline-package', 'outputs', '离线知识包', '将所选业务数据集与日期范围内的材料打包，供离线阅读与知识库整理。', '在数据流转中选择基线或增量模式、日期、正文选项和数据集，再生成可校验文件；输出基线资料及后续增量材料。'],
  ['demo-package', 'offline-package', '基线与增量包示意', '用本地示例说明首次全量包与后续增量更新如何衔接。', '切换示意阶段查看文件构成；输出基线、增量与版本关系示意。'],
  ['package-manifest', 'demo-package', '包内清单', '包内清单记录资料类别、版本与引用关系，帮助判断一次导出包含什么。', '展开示意清单逐项查看；输出可核对的文件目录。'],
  ['scenario-exhibition', 'outputs', '会展服务保障', '从重要日期、涉外机构与会展变化入手，准备活动前的服务背景。', '依次查看时间节点、涉外服务专题和依据；输出会展背景、机构索引和关注事项。'],
  ['scenario-incident', 'outputs', '境外事件跟踪', '从一条境外消息出发，核对事件、国别背景和广州关联。', '沿事件详情、重点国家、境外风险专题阅读；输出事件进展和会商资料。'],
  ['scenario-policy', 'outputs', '政策变化研判', '持续观察某国政策或指定官网更新，并比较版本和背景。', '沿网页变化、重点国家和全球移民动态下钻；输出变化摘要与阶段材料。'],

  ['engineering', 'lobby', '建设与设计', '解释境鉴从需求到能力的发展路径，以及运行、配置与安全取舍。', '按建设思路、架构、使用和保障分层阅读；输出可供项目交流和部署准备的说明。'],
  ['building-idea', 'engineering', '建设思路', '从分散信息、持续变化和业务复用三个需要出发，建设共同的监测与研判工作环境。', '先看需求与能力关系，再进入对应业务馆；输出项目定位和建设脉络。'],
  ['capability-roadmap', 'building-idea', '需求到能力', '把找信息、读懂变化、核对依据、形成成果逐步映射为平台能力。', '沿需求节点选择能力并跳转六馆；输出一条可解释的能力发展路径。'],
  ['architecture', 'engineering', '技术路径', '采集、筛选、存储、事件治理与 Web/MCP 服务形成可追溯的处理链。', '在架构层按阶段阅读，必要时返回业务展项；输出模块分工和数据流说明。'],
  ['architecture-choice', 'architecture', '架构取舍', '以本地可运行、分层处理和来源可查为目标，保留必要的人工核对入口。', '对照采集、存储、展示模块查看选择；输出为什么采用当前边界的说明。'],
  ['cli-web-mcp', 'architecture', '三种使用入口', '命令行负责运行任务，Web 提供浏览与配置，MCP 提供结构化工具接入。', '按使用者选择 CLI、Web 或 MCP 说明；输出各入口职责与接入位置。'],
  ['config-flow', 'engineering', '配置、校验与执行', '从配置内容到版本核对、运行前预览与执行，形成可检查的工作步骤。', '在系统设置调整来源、关键词和推送，再以体检与运行记录核对；输出可复现的配置状态。'],
  ['source-settings', 'config-flow', '数据源配置', '维护公开信息来源及其采集范围，让新增或停用的来源有统一入口。', '从系统设置的“数据源配置”查看并调整来源；输出采集对象及启用状态。'],
  ['ai-filter-settings', 'config-flow', 'AI 智能筛选配置', '维护主题筛选规则和相关模型参数，让内容处理与业务需要保持对应。', '从系统设置的“AI 智能筛选”查看规则；输出当前筛选配置与运行依据。'],
  ['keyword-settings', 'config-flow', '关键词规则配置', '把关注词组按主题维护，为初筛和后续检索提供共同条件。', '从系统设置的“关键词规则”编辑分组；输出可检查的规则列表。'],
  ['user-settings', 'config-flow', '用户管理', '维护本地登录账号及其启停状态，使业务工作台有明确的登录入口。', '从系统设置的“用户管理”查看账号是否启用，并按需停用或重新启用；输出账号列表和登录状态。'],
  ['prompt-files', 'config-flow', '提示模板外置', 'AI 分析所用提示文本独立管理，便于按任务维护和追查版本。', '在配置说明中查看模板类别，再比对对应运行记录；输出清晰的模板来源。'],
  ['storage-design', 'architecture', '按日与系统存储', '每日新闻和订阅内容按日期保存，系统状态与治理信息集中保存。', '在技术层查看 SQLite 按日数据库与 system.db 的分工；输出易于备份和回查的存储结构。'],
  ['authentication', 'engineering', '登录与访问保护', '业务工作台通过登录控制访问，报告页和配置页按安全边界呈现。', '从使用说明查看登录流程与权限范围；输出受控的业务入口。'],
  ['browser-security', 'authentication', '浏览器安全边界', '通过内容安全策略和响应头约束页面资源，减少不受控脚本执行。', '在技术保障层查看 CSP 与报告页缓存要求；输出可审计的浏览器保护策略。'],
  ['backup-restore', 'engineering', '备份与恢复', '对内容、状态和配置安排备份，并在需要时依记录恢复运行。', '在运行保障说明中核对备份时间与恢复步骤；输出可回到既有记录的恢复路径。'],
  ['deployment', 'engineering', '本地部署', '面向本地用户提供运行包装和 Web 控制台入口，方便日常启动。', '按部署说明完成环境体检、配置和启动；输出可访问的本地工作环境。'],
  ['faq', 'deployment', '常见问题', '按启动、配置、来源状态和阅读路径整理常见疑问及处理线索。', '从部署页选择问题并跳转对应节点；输出定位问题的第一步。'],
  ['display-modes', 'engineering', '四套显示模式', '深色或浅色、经典或工作站可组合选择，业务内容保持对应。', '在登录页或用户菜单选择外观；输出适合不同环境的阅读界面。'],
  ['demo-themes', 'display-modes', '显示模式示意', '用本地示例切换四种组合，展示同一内容在不同外观中的排布。', '选择深浅色和经典/工作站；输出界面示意，不改变真实业务配置。'],
];

export const nodes = entries.map(([id, parent, title, summary, detail]) => ({
  id, parent, title, summary, paragraphs: [detail], bullets: [], steps: [], related: [],
  ...(id.startsWith('demo-') ? { demo: id.slice(5) } : {}),
  ...(['entity-relations', 'osint-lines'].includes(id) ? { status: 'foundation' } : { status: 'available' }),
}));

const links = {
  lobby: ['monitoring', 'practical', 'intelligence', 'knowledge', 'outputs', 'engineering'],
  monitoring: ['monitoring-overview', 'intelligence'], practical: ['practical-common', 'outputs'],
  intelligence: ['event-dedup', 'knowledge'], knowledge: ['reuse-policy', 'knowledge-export'],
  outputs: ['scenario-exhibition', 'scenario-incident', 'scenario-policy'], engineering: ['architecture', 'deployment'],
  'scenario-exhibition': ['scenario-incident', 'scenario-policy', 'topic-foreign-service'],
  'scenario-incident': ['scenario-exhibition', 'scenario-policy', 'topic-overseas-risk'],
  'scenario-policy': ['scenario-exhibition', 'scenario-incident', 'webpage-monitoring'],
  'webpage-monitoring': ['source-version', 'scenario-policy'], 'demo-versions': ['archive-fingerprint'],
  'event-dedup': ['reuse-policy', 'canonical-design'], 'demo-dedup': ['topic-foreign-service', 'topic-overseas-risk'],
  'practical-common': ['public-facts', 'system-analysis', 'guangzhou-relevance', 'topic-corrections'],
  'demo-layers': ['baseline-layer', 'realtime-layer', 'combined-layer'],
  'knowledge-export': ['offline-package'], 'demo-scope': ['foreign-detail'],
  'demo-package': ['package-manifest'], 'display-modes': ['demo-themes'],
};
const sources = {
  lobby: ['docs/demo/index.html', 'web/index.html'],
  monitoring: ['web/index.html', 'web/js/app.js'], practical: ['workstations/foreign-service-workstation.html', 'workstations/smuggling-workstation.html', 'workstations/overseas-risk-workstation.html', 'workstations/terrorism-workstation.html', 'web/index.html'],
  intelligence: ['web/index.html', 'web_routes/events.py'], knowledge: ['web/index.html', 'web_routes/data_hub.py'],
  outputs: ['docs/demo/index.html', 'web/index.html'], engineering: ['CLAUDE.md', 'GmwRadar/__main__.py'],
  'event-dedup': ['GmwRadar/core/practical_intelligence.py', 'CLAUDE.md'],
  'demo-versions': ['web/index.html', 'web/js/app.js'],
  'enterprise-scope-analysis': ['web/index.html', 'web/js/workstation-enterprises.js'],
  'demo-scope': ['web/index.html', 'web/js/workstation-enterprises.js'],
  'reuse-policy': ['GmwRadar/core/practical_intelligence.py', 'CLAUDE.md'],
  'knowledge-export': ['web/index.html', 'web_routes/_export.py'],
  'offline-package': ['web/index.html', 'web_routes/_export.py'],
  'user-settings': ['web/index.html', 'web/js/app.js'],
};
for (const node of nodes) {
  const hall = halls.find(item => item.id === node.id);
  if (hall) node.title = hall.title;
  node.related = links[node.id] || [];
  if (sources[node.id]) node.sourceRefs = sources[node.id];
}

// 深层展项展开真实设计，和上层业务介绍复用同一节点。
const depthContent = {
  'building-idea': {
    paragraphs: ['境鉴从日常工作的三个困难出发：公开信息分散，变化需要持续跟踪，整理过的资料还要反复使用。建设顺序因此不是先堆图表，而是先让信息进得来、读得懂、找得到依据，再服务专题研判与成果输出。', '四专项回答“怎样持续发现变化”；四专题回答“这些变化与具体工作有什么关系”。两组能力借助事件和资料衔接，保持各自的业务入口。'],
    steps: ['建立持续采集与中文阅读，把分散来源变为可用资料。', '关联报道、事件与来源版本，让变化具有前后脉络。', '引入国情、日期和长期资料，为近期变化补充背景。', '围绕四专题组织判断、广州关联和引用依据。', '将简报、报告与知识包留作下一次工作的起点。']
  },
  architecture: {
    paragraphs: ['境鉴把“获取内容”和“使用内容”分开。采集、关键词筛选、AI 处理、存储、事件治理和成果分发各自承担明确职责；Web、命令行与 MCP 使用共同的领域能力。', 'FastAPI 承接业务接口，Vue 3 组织阅读与操作，ECharts 提供地图和图表，SQLite 保存本地内容与共享状态。LiteLLM 连接部署者配置的外部模型，提示模板独立维护。'],
    steps: ['采集层：热榜、RSS 与需要脚本渲染的公开网页进入采集模块。', '处理层：关键词与优先级规则筛选，按配置调用模型进行翻译、摘要和分析。', '存储与事件层：文章落盘，关联事件、来源、状态与后续变化。', '应用层：四专项、四专题、国别资料和数据中台从各自业务入口组织内容。', '成果层：报告、通知与知识导出沿现有资料和引用继续使用。'],
    sourceRefs: ['GmwRadar/__main__.py', 'GmwRadar/core/event_pipeline.py', 'web_routes/__init__.py', 'mcp_server/server.py']
  },
  'architecture-choice': {
    bullets: ['本地优先：面向可以在本地电脑或服务器维护的工作环境，基础运行不要求先建设分布式集群。', '模块分工：采集、分析、存储、通知和展示分别维护，接口通过模型与适配层衔接。', '引用优先：四专题共享事实主记录，业务视角通过关联扩展。', '逐层阅读：首屏提供判断，继续下钻到图表、明细与来源，兼顾不同阅读深度。', '外部能力可配置：AI 模型与通知渠道由部署者选择，运行状态有记录可查。']
  },
  'storage-design': {
    paragraphs: ['每日新闻与 RSS 内容按日期保存，方便按天回查、归档与备份；system.db 集中承载事件索引、运行状态、配置及审计等共享信息。两类库承担不同职责。', '前端通过 API 访问内容，数据模型与适配层负责转换。实战应用资料以规范记录和引用关系组织，原始来源与后续更正保持关联。'],
    bullets: ['按日库：组织每天采集与处理的内容。', '共享系统库：关联跨日期的事件与运行信息。', '结构化参考资料：供国家、日期与专题视图引用。'],
    sourceRefs: ['GmwRadar/storage/local.py', 'GmwRadar/core/models.py', 'GmwRadar/core/adapters.py']
  },
  'cli-web-mcp': {
    bullets: ['CLI：python -m GmwRadar，执行采集、处理、报告与分发；--doctor 用于环境体检。', 'Web：python web_server.py，提供统一登录后的查询、监测、专题阅读与配置。', 'MCP：python -m mcp_server.server，向兼容客户端提供查询、分析与工具调用入口。'],
    paragraphs: ['三种入口对应不同使用习惯：任务运行、人工阅读、智能体接入。它们复用已有核心能力与数据，不另建三套事实。MCP 可采用 stdio；HTTP 接入由部署者配置网络与访问边界。']
  },
  'config-flow': {
    paragraphs: ['专项设置先校验字段，再核对服务端配置版本，保存后可预览执行范围，最后运行任务。版本检查用于识别并发修改，避免旧页面覆盖别人刚保存的内容。', '关键词、来源、运行时段和通知目标分别维护；提示文本保存在配置模板中。调整策略后，可以沿运行记录核对处理与发送结果。'],
    steps: ['读取当前配置及版本标识。', '编辑关注对象、规则或运行参数并校验。', '提交保存时带回所读取的版本标识。', '预览执行范围，再运行并查看结果记录。'],
    sourceRefs: ['web_routes/monitoring.py', 'GmwRadar/core/config.py', 'GmwRadar/core/config_validator.py']
  },
  'browser-security': {
    paragraphs: ['业务前端使用预编译的 Vue 渲染代码，使内容安全策略不必开放 unsafe-eval。受保护报告通过登录访问，并设置不缓存响应及受限资源策略。', '认证、CSRF 防护、限流及安全响应头属于不同层次的保护；业务部署仍需配置密钥、网络边界与备份。公开展馆仅承载静态介绍，不携带业务登录状态。'],
    sourceRefs: ['scripts/build_vue_app_render.js', 'web_routes/_base.py', 'web_routes/auth.py']
  },
  deployment: {
    paragraphs: ['实际业务系统由维护人员在取得的项目源码目录中部署。公开展馆用于了解项目，不包含业务数据库或登录账号。'],
    steps: ['准备 Python 3.10+ 环境，在项目目录创建虚拟环境并按 requirements.txt 安装依赖。', '参照 .env.example 配置本地环境；按使用需要填写 AI 服务、通知渠道及登录相关设置。凭据留在部署环境中。', '执行 python -m GmwRadar --doctor，检查环境与配置。', '执行 python -m GmwRadar 运行主流程；执行 python web_server.py 启动 Web 控制台。', '也可使用项目 docker/ 中的 compose 配置部署；按实际访问范围配置网络和服务参数。'],
    related: ['cli-web-mcp', 'config-flow', 'backup-restore', 'faq']
  },
  faq: {
    bullets: ['公开展馆需要登录吗？不需要。实际业务工作台使用部署方配置的账号登录。', '只看介绍需要安装软件吗？不需要，浏览器即可阅读；三维不可用时仍能查看全部内容。', '业务系统一定需要外部 AI 吗？AI 翻译与分析需要可用服务及配置；来源、阅读和任务能力按实际部署启用。', '数据从哪里来？公开新闻、RSS、指定网页及国别、日历和专题参考资料，按功能回到相应来源。', '四专项和四专题有什么区别？前者组织持续监测对象，后者围绕四类业务问题组织研判。', '深浅色模式会改变数据吗？不会；四种组合用于选择阅读外观与版式，具体入口保留各自业务结构。', '知识包会自动连接内外网吗？不会。离线包通过人工摆渡或既有安全交换方式交接。', '在哪里查看运行异常？从状态总览、监控源状态和专项运行记录开始，再检查本地配置和日志。']
  },
  'migration-trends': { paragraphs: ['在全球移民动态的趋势视图选择时间段，再下钻到相应事件，查看变化发生的阶段、地区与依据。'] },
  'demo-scope': { summary: '用本地示例展示地区筛选如何同时改变国别分布、图表、明细和 CSV 范围。', paragraphs: ['选择一个地区，对照地图、图表与明细，再下载相同范围的演示 CSV。这个展项解释同范围联动的设计，不是业务系统截图。'] }
};
for (const node of nodes) Object.assign(node, depthContent[node.id] || {});

export const legacyAliases = {
  top: 'lobby', project: 'lobby', why: 'building-idea', capabilities: 'museum-directory',
  topics: 'practical', scenarios: 'scenario-exhibition', foundation: 'knowledge',
  viz: 'monitoring-summary', status: 'dashboard', start: 'deployment', faq: 'faq',
  brand: 'lobby', arch: 'architecture', stack: 'cli-web-mcp', command: 'dashboard', feed: 'event-data',
};
