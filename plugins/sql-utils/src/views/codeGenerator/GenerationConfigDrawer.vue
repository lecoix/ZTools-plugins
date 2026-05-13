<template>
  <n-drawer :show="visible" :width="'40%'" placement="right" @update:show="handleShowUpdate">
    <n-drawer-content title="生成配置">
      <div class="config-container">
        <n-form :model="config" ref="configFormRef" label-placement="left" label-width="80">
          <n-form-item label="基础包名" path="basePackage">
            <n-input v-model:value="config.basePackage" placeholder="请输入基础包名" />
          </n-form-item>
          <n-form-item label="作者" path="author">
            <n-input v-model:value="config.author" placeholder="请输入作者" />
          </n-form-item>
        </n-form>

        <n-divider title-placement="left">二级包名配置</n-divider>

        <n-form :model="config.subPackages" label-placement="left" label-width="100">
          <template v-for="(subPackage, key) in config.subPackages" :key="key">
            <n-form-item v-if="key !== 'mapperXML'" :label="getTemplateName(key)">
              <n-input v-model:value="config.subPackages[key]" placeholder="请输入二级包名">
                <template #prefix>{{ config.basePackage }}.</template>
              </n-input>
            </n-form-item>
          </template>
        </n-form>

        <div class="drawer-footer">
          <n-space>
            <n-button @click="handleClose">取消</n-button>
            <n-button type="primary" @click="saveConfig">保存</n-button>
          </n-space>
        </div>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import NotifyUtil from '@/utils/notifyUtil.js'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible', 'saved'])

const configFormRef = ref(null)

const config = reactive({
  basePackage: 'com.example.demo',
  author: 'Developer',
  subPackages: {
    javaBean: 'entity',
    controller: 'controller',
    service: 'service',
    mapper: 'mapper',
    mapperXML: ''
  }
})

const originalConfig = ref({})

const templateNameMap = {
  javaBean: 'Entity',
  controller: 'Controller',
  service: 'Service',
  mapper: 'Mapper',
  mapperXML: 'Mapper XML'
}

watch(() => props.visible, (val) => {
  if (val) loadConfig()
})

function handleShowUpdate(val) {
  emit('update:visible', val)
}

function getTemplateName(key) {
  return templateNameMap[key] || key
}

function loadConfig() {
  try {
    const savedConfig = localStorage.getItem('generationConfig')
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig)
      Object.assign(config, parsedConfig, { subPackages: { ...config.subPackages, ...(parsedConfig.subPackages || {}) } })
    }
    originalConfig.value = JSON.parse(JSON.stringify(config))
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

function saveConfig() {
  try {
    localStorage.setItem('generationConfig', JSON.stringify(config))
    originalConfig.value = JSON.parse(JSON.stringify(config))
    emit('saved', config)
    NotifyUtil.success('保存成功')
    emit('update:visible', false)
  } catch (error) {
    console.error('保存配置失败:', error)
    NotifyUtil.error('保存失败')
  }
}

function handleClose() {
  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig.value)
  if (hasChanges) {
    if (window.confirm('您有未保存的修改，确定要关闭吗？')) {
      emit('update:visible', false)
    }
  } else {
    emit('update:visible', false)
  }
}
</script>

<style scoped>
.config-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.drawer-footer {
  margin-top: auto;
  padding-top: 20px;
  text-align: right;
}
</style>
