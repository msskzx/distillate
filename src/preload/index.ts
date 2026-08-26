import { contextBridge, ipcRenderer } from 'electron'
import type { DistillateApi } from '../shared/bridge'

const api: DistillateApi = {
  preferences: {
    getLaunchAtStartup: () => ipcRenderer.invoke('preferences:get-launch-at-startup'),
    setLaunchAtStartup: (enabled) => ipcRenderer.invoke('preferences:set-launch-at-startup', enabled),
  },
  cards: {
    list: (filters = {}) => ipcRenderer.invoke('cards:list', filters),
    get: (id) => ipcRenderer.invoke('cards:get', id),
    create: (input) => ipcRenderer.invoke('cards:create', input),
    update: (id, input) => ipcRenderer.invoke('cards:update', id, input),
    setStatus: (id, status) => ipcRenderer.invoke('cards:set-status', id, status),
    setFavorite: (id, favorite) => ipcRenderer.invoke('cards:set-favorite', id, favorite),
    delete: (id) => ipcRenderer.invoke('cards:delete', id),
    projects: () => ipcRenderer.invoke('cards:projects'),
  },
}

contextBridge.exposeInMainWorld('distillate', api)
