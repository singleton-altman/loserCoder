<script setup>
import { computed, onMounted, reactive } from 'vue'
import {
  alignmentOptions,
  businessHealthOptions,
  departmentOptions,
  performanceOptions,
  projectStageOptions,
  redundancyOptions,
  titleOptions,
  versatilityOptions
} from './data/options'
import { calculateRisk } from './utils/riskModel'

const STORAGE_KEY = 'layoff-risk-simulator:form:v1'

const companyProfile = {
  name: '大陆游戏研发、推广与发行公司',
  description:
    '假设公司处于常见的降本增效周期，决策更关注项目流水、组织冗余、业务聚焦度与人才替代成本。'
}

const form = reactive({
  employeeName: '示例员工',
  department: 'growth',
  title: 'mid',
  salary: 48,
  performance: 'average',
  tenure: 2,
  projectStage: 'decline',
  businessHealth: 'soft',
  alignment: 'supportive',
  redundancy: 'high',
  versatility: 'normal',
  teamSize: 0
})

function loadSavedForm() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const saved = JSON.parse(raw)
    if (!saved || typeof saved !== 'object') return

    if (typeof saved.employeeName === 'string') form.employeeName = saved.employeeName
    if (typeof saved.department === 'string') form.department = saved.department
    if (typeof saved.title === 'string') form.title = saved.title
    if (typeof saved.performance === 'string') form.performance = saved.performance
    if (typeof saved.projectStage === 'string') form.projectStage = saved.projectStage
    if (typeof saved.businessHealth === 'string') form.businessHealth = saved.businessHealth
    if (typeof saved.alignment === 'string') form.alignment = saved.alignment
    if (typeof saved.redundancy === 'string') form.redundancy = saved.redundancy
    if (typeof saved.versatility === 'string') form.versatility = saved.versatility

    if (saved.salary != null) form.salary = Number(saved.salary) || 0
    if (saved.tenure != null) form.tenure = Number(saved.tenure) || 0
    if (saved.teamSize != null) form.teamSize = Number(saved.teamSize) || 0
  } catch {}
}

function saveForm() {
  const payload = {
    employeeName: form.employeeName,
    department: form.department,
    title: form.title,
    salary: form.salary,
    performance: form.performance,
    tenure: form.tenure,
    projectStage: form.projectStage,
    businessHealth: form.businessHealth,
    alignment: form.alignment,
    redundancy: form.redundancy,
    versatility: form.versatility,
    teamSize: form.teamSize
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

const result = computed(() => calculateRisk(form))

const scoreLabel = computed(() => `${result.value.score}%`)

const scoreTone = computed(() => {
  if (result.value.score >= 75) return 'danger'
  if (result.value.score >= 52) return 'warning'
  if (result.value.score >= 28) return 'neutral'
  return 'safe'
})

function deltaLabel(value) {
  return value > 0 ? `+${value}` : `${value}`
}

onMounted(() => {
  loadSavedForm()
})
</script>

<template>
  <div class="page-shell">
    <div class="glow glow-left"></div>
    <div class="glow glow-right"></div>

    <main class="app-grid">
      <section class="hero card">
        <div class="hero-copy">
          <p class="eyebrow">听说你会写代码?</p>
          <h1>根据岗位、绩效与业务状态，推测员工在大陆游戏公司中的被裁可能性</h1>
          <p class="hero-text">
            场景限定为中国大陆 IT 公司，主营游戏开发、推广与发行。模型采用启发式权重，只用于内部讨论与演示，不代表真实 HR 决策。
          </p>
        </div>

        <div class="hero-company">
          <span class="pill">公司设定</span>
          <h2>{{ companyProfile.name }}</h2>
          <p>{{ companyProfile.description }}</p>
        </div>
      </section>

      <section class="form-panel card">
        <div class="section-head section-head-row">
          <div>
            <p class="eyebrow">输入员工画像</p>
            <h2>风险因素表单</h2>
          </div>
          <button class="primary-button" type="button" @click="saveForm">保存</button>
        </div>

        <div class="form-grid">
          <label class="field field-wide">
            <span>员工称呼</span>
            <input v-model="form.employeeName" type="text" placeholder="例如：王某某" />
          </label>

          <label class="field">
            <span>岗位方向</span>
            <select v-model="form.department">
              <option v-for="item in departmentOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>身份 / Title</span>
            <select v-model="form.title">
              <option v-for="item in titleOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>年薪（万元）</span>
            <input v-model.number="form.salary" type="number" min="5" max="200" step="1" />
          </label>

          <label class="field">
            <span>近期绩效</span>
            <select v-model="form.performance">
              <option v-for="item in performanceOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>司龄（年）</span>
            <input v-model.number="form.tenure" type="number" min="0" max="30" step="0.5" />
          </label>

          <label class="field">
            <span>项目阶段</span>
            <select v-model="form.projectStage">
              <option v-for="item in projectStageOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>业务健康度</span>
            <select v-model="form.businessHealth">
              <option v-for="item in businessHealthOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>业务贴合度</span>
            <select v-model="form.alignment">
              <option v-for="item in alignmentOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>岗位替代性</span>
            <select v-model="form.redundancy">
              <option v-for="item in redundancyOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>跨职能能力</span>
            <select v-model="form.versatility">
              <option v-for="item in versatilityOptions" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </label>

          <label class="field">
            <span>直接管理人数</span>
            <input v-model.number="form.teamSize" type="number" min="0" max="200" step="1" />
          </label>
        </div>
      </section>

      <section class="result-panel card">
        <div class="section-head">
          <p class="eyebrow">推测结果</p>
          <h2>{{ form.employeeName || '该员工' }} 的当前风险面板</h2>
        </div>

        <div class="score-block" :data-tone="scoreTone">
          <div>
            <p class="score-caption">被裁员可能性</p>
            <p class="score-value">{{ scoreLabel }}</p>
          </div>
          <div class="score-meta">
            <span class="risk-level">风险等级：{{ result.level }}</span>
            <p>{{ result.summary }}</p>
          </div>
        </div>

        <div class="driver-grid">
          <article v-for="item in result.drivers" :key="item.key" class="driver-card">
            <div class="driver-top">
              <strong>{{ item.label }}</strong>
              <span :class="['delta', item.delta > 0 ? 'up' : 'down']">{{ deltaLabel(item.delta) }}</span>
            </div>
            <p>{{ item.reason }}</p>
          </article>
        </div>

        <div class="section-head mini-head">
          <h3>全部因子拆解</h3>
        </div>

        <div class="breakdown-list">
          <div v-for="item in result.breakdown" :key="item.key" class="breakdown-row">
            <span>{{ item.label }}</span>
            <div class="breakdown-bar">
              <div
                class="breakdown-fill"
                :class="item.delta > 0 ? 'up' : 'down'"
                :style="{ width: `${Math.min(Math.abs(item.delta) * 5, 100)}%` }"
              ></div>
            </div>
            <strong :class="item.delta > 0 ? 'up' : 'down'">{{ deltaLabel(item.delta) }}</strong>
          </div>
        </div>

        <p class="footnote">
          说明：该页面是启发式评估工具，适合产品演示、讨论模型设计或后续接入真实数据，不适合作为实际用工决策依据。
        </p>
      </section>
    </main>
  </div>
</template>
