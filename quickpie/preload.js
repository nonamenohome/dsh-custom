'use strict';

const { contextBridge, ipcRenderer, webUtils } = require('electron');

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('api', {
  pathForFile: (file) => {
    try {
      return webUtils.getPathForFile(file);
    } catch (_) {
      return file && file.path ? file.path : null;
    }
  },
  getStore: () => invoke('store:get'),
  addItems: (payload) => invoke('items:add', payload),
  updateItem: (id, patch) => invoke('items:update', { id, patch }),
  removeItem: (id) => invoke('items:remove', id),
  reorder: (ids) => invoke('items:reorder', ids),
  probe: () => invoke('items:probe'),
  resolveIcon: (type, target) => invoke('icon:resolve', { type, target }),
  updateSettings: (patch) => invoke('settings:update', patch),
  openItem: (id) => invoke('app:open', id),
  revealItem: (id) => invoke('app:reveal', id),
  pick: (kind) => invoke('dialog:pick', kind),
  readClipboard: () => invoke('clipboard:read'),
  pickIcon: () => invoke('icon:pick'),
  windowsFor: (id) => invoke('windows:for', id),
  openChild: (groupId, childId) => invoke('child:open', { groupId, childId }),
  nestItems: (ids, groupId) => invoke('items:nest', { ids, groupId }),
  unnestItem: (groupId, childId) => invoke('items:unnest', { groupId, childId }),
  updateChild: (groupId, childId, patch) => invoke('child:update', { groupId, childId, patch }),
  addChild: (groupId, payload) => invoke('child:add', { groupId, payload }),
  focusWindow: (pid) => invoke('window:focus', pid),
  exportData: () => invoke('data:export'),
  importData: () => invoke('data:import'),
  openDataDir: () => invoke('dialog:dataDir'),
  showWheel: () => invoke('wheel:show'),
  hideWheel: () => invoke('wheel:hide'),
  openManager: () => invoke('manager:open'),
  minimize: () => invoke('win:min'),
  closeWindow: () => invoke('win:close'),
  on: (channel, callback) => {
    const handler = (_event, payload) => callback(payload);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },
  platform: process.platform,
});
