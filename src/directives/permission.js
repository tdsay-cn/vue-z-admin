import hasPermission from '@/utils/permission'

const permission = {
  inserted(el, binding) {
    const { value } = binding
    if (value) {
      const hasAuth = hasPermission(value)
      if (!hasAuth) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  }
}

export default permission
