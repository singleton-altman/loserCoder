const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const sigmoid = (x) => 1 / (1 + Math.exp(-x))

const riskDictionary = {
  department: {
    web: 2,
    client: 1,
    server: -2,
    engine: -4,
    qa: 4,
    design: 3,
    art: 4,
    ops: -1,
    publishing: 1,
    growth: 5,
    marketing: 4,
    data: -1,
    support: 6
  },
  title: {
    intern: 5,
    junior: 4,
    mid: 1,
    senior: -2,
    expert: -5,
    lead: -3,
    director: 0
  },
  performance: {
    excellent: -12,
    good: -5,
    average: 2,
    weak: 10
  },
  projectStage: {
    incubation: 4,
    production: -3,
    launch: 0,
    mature: 3,
    decline: 10
  },
  businessHealth: {
    growth: -8,
    stable: -2,
    soft: 4,
    loss: 11
  },
  alignment: {
    core: -10,
    important: -4,
    supportive: 3,
    peripheral: 10
  },
  redundancy: {
    low: -7,
    medium: 1,
    high: 8
  },
  versatility: {
    strong: -7,
    normal: 0,
    limited: 6
  }
}

const factorLabels = {
  department: '岗位类型',
  title: '职级/头衔',
  salary: '年薪水平',
  performance: '近期表现',
  tenure: '司龄',
  projectStage: '项目阶段',
  businessHealth: '业务健康度',
  alignment: '核心业务贴合度',
  redundancy: '岗位替代性',
  versatility: '跨职能能力',
  teamSize: '管理跨度'
}

function scoreSalary(salary) {
  if (salary <= 20) return 0
  if (salary <= 35) return 2
  if (salary <= 50) return 4
  if (salary <= 80) return 8
  return 12
}

function scoreTenure(years) {
  if (years < 1) return 7
  if (years < 3) return 4
  if (years < 6) return -5
  if (years <= 8) return 0
  return 16
}

function scoreTeamSize(teamSize) {
  if (teamSize === 0) return 1
  if (teamSize <= 5) return -1
  if (teamSize <= 20) return -3
  return -1
}

function makeReason(label, delta) {
  if (delta <= -8) return `${label}明显降低了裁撤风险`
  if (delta < 0) return `${label}对保留岗位有一定帮助`
  if (delta === 0) return `${label}对当前风险判断基本中性`
  if (delta < 6) return `${label}对风险有轻微抬升`
  return `${label}是当前较强的风险信号`
}

export function calculateRisk(profile) {
  const tenureYears = Number(profile.tenure) || 0
  const tenureRawDelta = scoreTenure(tenureYears)
  const tenureDelta = tenureYears > 8 ? 20 : tenureRawDelta

  const breakdown = [
    {
      key: 'department',
      label: factorLabels.department,
      delta: riskDictionary.department[profile.department]
    },
    {
      key: 'title',
      label: factorLabels.title,
      delta: riskDictionary.title[profile.title]
    },
    {
      key: 'salary',
      label: factorLabels.salary,
      delta: scoreSalary(profile.salary)
    },
    {
      key: 'performance',
      label: factorLabels.performance,
      delta: riskDictionary.performance[profile.performance]
    },
    {
      key: 'tenure',
      label: factorLabels.tenure,
      delta: tenureDelta
    },
    {
      key: 'projectStage',
      label: factorLabels.projectStage,
      delta: riskDictionary.projectStage[profile.projectStage]
    },
    {
      key: 'businessHealth',
      label: factorLabels.businessHealth,
      delta: riskDictionary.businessHealth[profile.businessHealth]
    },
    {
      key: 'alignment',
      label: factorLabels.alignment,
      delta: riskDictionary.alignment[profile.alignment]
    },
    {
      key: 'redundancy',
      label: factorLabels.redundancy,
      delta: riskDictionary.redundancy[profile.redundancy]
    },
    {
      key: 'versatility',
      label: factorLabels.versatility,
      delta: riskDictionary.versatility[profile.versatility]
    },
    {
      key: 'teamSize',
      label: factorLabels.teamSize,
      delta: scoreTeamSize(profile.teamSize)
    }
  ]

  const weightedImpact = breakdown.reduce((sum, item) => sum + item.delta, 0)
  const probability = sigmoid((weightedImpact - 4) / 8.5)
  const score = clamp(Math.round(probability * 100), 5, 95)

  let level = '低'
  let summary = '目前更像是保留优先级较高的人选。'

  if (score >= 68) {
    level = '高'
    summary = '多个风险因素同时存在，属于需要重点警惕的状态。'
  } else if (score >= 45) {
    level = '中'
    summary = '存在结构性压力，是否被裁更依赖业务线后续走势。'
  }

  const drivers = [...breakdown]
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 4)
    .map((item) => ({
      ...item,
      reason: makeReason(item.label, item.delta)
    }))

  return {
    score,
    level,
    summary,
    breakdown: breakdown.map((item) => ({
      ...item,
      reason: makeReason(item.label, item.delta)
    })),
    drivers
  }
}
