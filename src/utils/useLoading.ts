import {ref, watch} from "vue";
import {ElLoading} from "element-plus";

export function useLoading() {
  const loading = ref(false);
  let loadingInstance: any = null;

  const startLoading = () => {
    loadingInstance = ElLoading.service({
      lock: true,
      text: "加载中...",
      background: "rgba(255, 255, 255, 0.7)"
    });
  };

  const stopLoading = () => {
    loadingInstance?.close();
  };

  watch(loading, val => {
    if (val) {
      startLoading();
    } else {
      stopLoading();
    }
  });

  return {
    loading
  };
}
