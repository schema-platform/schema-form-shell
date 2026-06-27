/**
 * MicroAppEditDialog — 子应用编辑/创建对话框
 *
 * 支持：
 * - 创建新子应用
 * - 编辑已有子应用配置
 * - 表单校验
 */
<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createMicroApp, updateMicroApp, type MicroAppConfig, type MicroAppFormData } from '@/api/microAppApi'
import AppIcon from '@schema-platform/platform-shared/components/common/AppIcon.vue'

const props = defineProps<{
  /** 是否显示对话框 */
  visible: boolean
  /** 编辑模式下的子应用数据，null 表示创建模式 */
  app: MicroAppConfig | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  saved: []
}>()

const formRef = ref<FormInstance>()
const saving = ref(false)

const isEdit = computed(() => !!props.app)

const defaultForm: MicroAppFormData = {
  name: '',
  displayName: '',
  url: '',
  icon: 'box',
  layout: 'with-menu',
  activeRule: '',
  permissions: [],
  status: 'active',
  sort: 100,
}

const form = ref<MicroAppFormData>({ ...defaultForm })

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
    { required: true, message: '请输入激活规则', trigger: 'blur' },
  ],
  layout: [
    { required: true, message: '请选择布局类型', trigger: 'change' },
  ],
}

// 监听 app 变化，填充表单
watch(() => props.app, (app) => {
  if (app) {
    form.value = {
      name: app.name,
      displayName: app.displayName,
      url: app.url,
      icon: app.icon || 'box',
      layout: app.layout,
      activeRule: app.activeRule,
      permissions: app.permissions ?? [],
      status: app.status,
      sort: app.sort,
    }
  } else {
    form.value = { ...defaultForm }
  }
}, { immediate: true })

// 监听 visible，打开时重置校验
watch(() => props.visible, (val) => {
  if (val) {
    formRef.value?.clearValidate()
  }
})

function handleClose() {
  emit('update:visible', false)
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

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
    handleClose()
  } catch (err: unknown) {
    ElMessage.error(err instanceof Error ? err.message : '操作失败')
  } finally {
    saving.value = false
  }
}

const iconOptions = [
  'box', 'edit', 'connection', 'chat-dot-round', 'document',
  'setting', 'user', 'data-line', 'monitor', 'files',
  'folder', 'key', 'lock', 'bell', 'calendar',
]
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="isEdit ? '编辑子应用' : '创建子应用'"
    width="560px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="应用标识" prop="name">
        <el-input
          v-model="form.name"
          placeholder="editor"
          :disabled="isEdit"
          maxlength="32"
        />
        <div :class="$style.fieldHint">唯一标识，创建后不可修改</div>
      </el-form-item>

      <el-form-item label="显示名称" prop="displayName">
        <el-input v-model="form.displayName" placeholder="表单设计器" maxlength="50" />
      </el-form-item>

      <el-form-item label="入口 URL" prop="url">
        <el-input v-model="form.url" placeholder="http://localhost:5100/" />
        <div :class="$style.fieldHint">子应用的入口地址（生产环境完整 URL）</div>
      </el-form-item>

      <el-form-item label="激活规则" prop="activeRule">
        <el-input v-model="form.activeRule" placeholder="/schema-platform/app/editor" />
        <div :class="$style.fieldHint">qiankun 路由匹配规则</div>
      </el-form-item>

      <el-form-item label="图标" prop="icon">
        <div :class="$style.iconSelector">
          <div
            v-for="icon in iconOptions"
            :key="icon"
            :class="[$style.iconOption, { [$style.iconActive]: form.icon === icon }]"
            @click="form.icon = icon"
          >
            <AppIcon :name="icon" :size="20" />
          </div>
        </div>
      </el-form-item>

      <el-form-item label="布局类型" prop="layout">
        <el-radio-group v-model="form.layout">
          <el-radio value="with-menu">带菜单</el-radio>
          <el-radio value="without-menu">独立全屏</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="form.status"
          active-value="active"
          inactive-value="inactive"
          active-text="启用"
          inactive-text="停用"
        />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :max="9999" :step="10" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
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
</style>
