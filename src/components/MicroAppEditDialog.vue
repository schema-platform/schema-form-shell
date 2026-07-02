/**
 * MicroAppEditDialog — 子应用编辑/创建对话框
 *
 * 基于 platform-shared 的 FormDialog 封装。
 */
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormRules } from 'element-plus'
import { createMicroApp, updateMicroApp, type MicroAppConfig, type MicroAppFormData } from '@/api/microAppApi'
import FormDialog from '@schema-platform/platform-shared/components/common/FormDialog.vue'
import AppIcon from '@schema-platform/platform-shared/components/common/AppIcon.vue'
import { ICON_MAP } from '@schema-platform/platform-shared/utils/iconRegistry'

const APP_ICON_NAMES = Object.keys(ICON_MAP).sort()

const props = defineProps<{
  visible: boolean
  app: MicroAppConfig | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const saving = ref(false)
const isEdit = computed(() => !!props.app)

const defaultForm: MicroAppFormData = {
  name: '',
  displayName: '',
  url: '',
  icon: 'grid',
  layout: 'without-menu',
  activeRule: [],
  permissions: [],
  status: 'active',
  sort: 100,
}

const form = ref<MicroAppFormData>({ ...defaultForm })

/** activeRule 显示用字符串（逗号分隔） */
const activeRuleStr = ref('')

// 同步 activeRuleStr ↔ form.activeRule
watch(activeRuleStr, (val) => {
  form.value.activeRule = val
    .split(/[,，\n]/)
    .map(s => s.trim())
    .filter(Boolean)
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入应用标识', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9-]*$/, message: '小写字母开头，只允许小写字母、数字、连字符', trigger: 'blur' },
  ],
  displayName: [
    { required: true, message: '请输入显示名称', trigger: 'blur' },
  ],
  url: [
    { required: true, message: '请输入入口 URL', trigger: 'blur' },
  ],
  activeRule: [
    {
      required: true,
      type: 'array',
      min: 1,
      message: '请输入至少一条激活规则',
      trigger: 'blur',
    },
  ],
}

// 监听 app 变化，填充表单
watch(() => props.app, (app) => {
  if (app) {
    const rules = Array.isArray(app.activeRule) ? app.activeRule : [app.activeRule]
    form.value = {
      name: app.name,
      displayName: app.displayName,
      url: app.url,
      icon: app.icon || 'grid',
      layout: app.layout,
      activeRule: rules,
      permissions: app.permissions ?? [],
      status: app.status,
      sort: app.sort,
    }
    activeRuleStr.value = rules.join(', ')
  } else {
    form.value = { ...defaultForm }
    activeRuleStr.value = ''
  }
}, { immediate: true })

async function handleSubmit() {
  saving.value = true
  try {
    if (isEdit.value && props.app) {
      await updateMicroApp(props.app.id, form.value)
      ElMessage.success('更新成功')
    } else {
      await createMicroApp(form.value)
      ElMessage.success('创建成功')
    }
    emit('saved')
    emit('update:visible', false)
  } catch (err: unknown) {
    ElMessage.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    saving.value = false
  }
}

const quickIcons = [
  'edit', 'connection', 'chat-dot-round', 'document', 'setting', 'user',
  'data-line', 'monitor', 'files', 'folder', 'key', 'lock', 'bell', 'calendar',
  'grid', 'platform', 'cpu', 'magic-stick', 'house', 'menu',
]

const iconPopoverVisible = ref(false)
const iconSearch = ref('')

const filteredIcons = computed(() => {
  const q = iconSearch.value.trim().toLowerCase()
  if (!q) return APP_ICON_NAMES
  return APP_ICON_NAMES.filter(name => name.includes(q))
})

function selectIcon(name: string) {
  form.value.icon = name
  iconPopoverVisible.value = false
  iconSearch.value = ''
}
</script>

<template>
  <FormDialog
    :model-value="visible"
    :title="isEdit ? '编辑子应用' : '创建子应用'"
    width="70%"
    :loading="saving"
    :form-data="form"
    :rules="rules"
    label-width="120px"
    @update:model-value="emit('update:visible', $event)"
    @submit="handleSubmit"
  >
    <template #default="{ form: formData }">
      <el-form-item label="应用标识" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="editor"
          :disabled="isEdit"
          maxlength="32"
        />
        <div :class="$style.fieldHint">唯一标识，创建后不可修改</div>
      </el-form-item>

      <el-form-item label="显示名称" prop="displayName">
        <el-input v-model="formData.displayName" placeholder="表单设计器" maxlength="50" />
      </el-form-item>

      <el-form-item label="入口 URL" prop="url">
        <el-input v-model="formData.url" placeholder="http://localhost:5100/" />
        <div :class="$style.fieldHint">子应用的入口地址（生产环境完整 URL）</div>
      </el-form-item>

      <el-form-item label="激活规则" prop="activeRule">
        <el-input
          v-model="activeRuleStr"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
          placeholder="/schema-platform/app/editor, /schema-platform/standalone/editor"
        />
        <div :class="$style.fieldHint">qiankun 路由匹配规则，多条用逗号分隔</div>
      </el-form-item>

      <el-form-item label="图标" prop="icon">
        <div :class="$style.iconSelector">
          <div
            v-for="icon in quickIcons"
            :key="icon"
            :class="[$style.iconOption, { [$style.iconActive]: formData.icon === icon }]"
            @click="formData.icon = icon"
          >
            <AppIcon :name="icon" :size="20" />
          </div>
          <div
            v-if="!quickIcons.includes(formData.icon)"
            :class="[$style.iconOption, $style.iconActive]"
            @click="iconPopoverVisible = true"
          >
            <AppIcon :name="formData.icon" :size="20" />
          </div>
          <el-popover
            v-model:visible="iconPopoverVisible"
            placement="bottom-start"
            :width="380"
            trigger="click"
          >
            <template #reference>
              <div :class="[$style.iconOption, $style.moreBtn]">
                <AppIcon name="more-filled" :size="16" />
                <span :class="$style.moreLabel">更多</span>
              </div>
            </template>
            <div :class="$style.iconPopover">
              <el-input
                v-model="iconSearch"
                placeholder="搜索图标名称"
                clearable
                size="small"
              />
              <div :class="$style.iconGrid">
                <div
                  v-for="icon in filteredIcons"
                  :key="icon"
                  :class="[$style.iconOption, { [$style.iconActive]: formData.icon === icon }]"
                  :title="icon"
                  @click="selectIcon(icon)"
                >
                  <AppIcon :name="icon" :size="18" />
                </div>
              </div>
            </div>
          </el-popover>
        </div>
      </el-form-item>

      <el-form-item label="布局类型" prop="layout">
        <el-radio-group v-model="formData.layout">
          <el-radio value="with-menu">带菜单</el-radio>
          <el-radio value="without-menu">独立全屏</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="formData.status"
          active-value="active"
          inactive-value="inactive"
          active-text="启用"
          inactive-text="停用"
        />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" :max="9999" :step="10" />
      </el-form-item>
    </template>
  </FormDialog>
</template>

<style module>
.fieldHint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-top: 4px;
  line-height: 1.4;
}

.iconSelector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.iconOption {
  width: 36px;
  height: 36px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--el-text-color-regular);
}

.iconOption:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.iconActive {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.moreBtn {
  width: auto;
  padding: 0 10px;
  gap: 4px;
}

.moreLabel {
  font-size: 12px;
  line-height: 1;
}

.iconPopover {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.iconGrid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
}
</style>
