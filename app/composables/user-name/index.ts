import {USER_NAME_STORAGE_KEY} from './consts';

export function useUserName() {
  const username = useState(() => '');
  const usernamePopup = useState(() => false);

  function setUsername(toSave: string) {
    username.value = toSave;
    localStorage.setItem(USER_NAME_STORAGE_KEY, toSave);
    usernamePopup.value = false;
  }

  function openUsernamePopup() {
    usernamePopup.value = true;
  }

  function loadUsername() {
    const loadedName = localStorage.getItem(USER_NAME_STORAGE_KEY) ?? '';

    if (!loadedName) {
      usernamePopup.value = true;
      return '';
    }

    username.value = loadedName;

    return loadedName;
  }

  return {username, usernamePopup, setUsername, loadUsername, openUsernamePopup};
}
