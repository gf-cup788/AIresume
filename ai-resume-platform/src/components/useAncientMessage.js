import { ref } from 'vue'

export const ancientMessageRef = ref(null)

export function useAncientMessage() {
  const instance = ancientMessageRef.value

  return {
    success(text, duration) {
      instance?.success(text, duration)
    },
    error(text, duration) {
      instance?.error(text, duration)
    },
    warning(text, duration) {
      instance?.warning(text, duration)
    },
    info(text, duration) {
      instance?.info(text, duration)
    }
  }
}