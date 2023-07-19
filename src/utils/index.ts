const isEmpty = (val) => {
  if (val === 0 || val === '0') return false
  if (val) return false
  return true
}

export { isEmpty }
