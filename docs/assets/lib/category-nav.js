"use strict";
const THEME_ORDER = ['os', 'light', 'dark'];
/**
 * Set new Theme.
 * @param theme
 */
function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('tsd-theme', theme);
    const settingPicker = document.querySelector('#tsd-theme');
    if (settingPicker) {
        settingPicker.value = theme;
    }
}
/** User toggle themen */
function onToggleTheme() {
    const curTheme = document.documentElement.dataset.theme || 'os';
    const index = THEME_ORDER.indexOf(curTheme);
    const nextIndex = (index + 1) % THEME_ORDER.length;
    const nextTheme = THEME_ORDER[nextIndex];
    setTheme(nextTheme);
}
(() => {
    const themePicker = document.querySelector('#tsd-navigation-theme');
    if (!themePicker)
        return;
    themePicker.addEventListener('click', onToggleTheme);
})();
