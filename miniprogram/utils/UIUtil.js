export function showToast(title, isSuccess) {
  const icon = isSuccess ? 'success' : 'none'
  wx.showToast({
    title,
    icon,
    duration: 2000
  })
}

export function showModal(title, content, onConfirm, onCancel) {
  wx.showModal({
    title,
    content,
    success(res) {
      if (res.confirm && onConfirm) {
        onConfirm()
      } else if (res.cancel && onCancel) {  //可以不传onCancel，则默认 点击关闭
        onCancel()
      }
    }
  })
}
