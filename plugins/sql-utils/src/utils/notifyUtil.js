import { createDiscreteApi } from 'naive-ui'

const { notification } = createDiscreteApi(['notification'])

class NotifyUtil {
  static success(title = '成功', message) {
    notification.success({ title, content: message, duration: 2000 })
  }

  static error(title = '错误', message) {
    notification.error({ title, content: message, duration: 3000 })
  }

  static warning(title = '警告', message) {
    notification.warning({ title, content: message, duration: 3000 })
  }

  static info(title = '提示', message) {
    notification.info({ title, content: message, duration: 2000 })
  }

  static notify(options) {
    notification.create(options)
  }
}

export default NotifyUtil
