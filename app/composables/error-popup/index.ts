import {defineStore} from 'pinia';
import {ERROR_POPUP_DURATION} from './consts';

export const useErrorPopupStore = defineStore('error-popup', () => {
  const currentError = ref('');
  const errorQueue = ref<string[]>([]);
  const isPopupActive = ref(false);

  function addError(error: string) {
    errorQueue.value.push(error);

    if (isPopupActive.value) return;

    isPopupActive.value = true;
    showFirstErrorFromQueue();
  }

  function showFirstErrorFromQueue() {
    if (errorQueue.value.length === 0) {
      isPopupActive.value = false;
      return;
    }

    const error = errorQueue.value.shift();

    if (!error) return;

    currentError.value = error;
    console.error(error);

    setTimeout(() => {
      showFirstErrorFromQueue();
    }, ERROR_POPUP_DURATION * 1000);
  }

  return {currentError, errorQueue, isPopupActive, addError, showFirstErrorFromQueue};
});

export function useErrorPopup() {
  const store = useErrorPopupStore();
  const {addError} = store;
  const {currentError, isPopupActive} = storeToRefs(store);

  return {currentError, isPopupActive, addError};
}
