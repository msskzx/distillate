import { contextBridge, ipcRenderer } from 'electron'
import type { DistillateApi } from '../shared/bridge'

const api: DistillateApi = {
  cards: {
    list: (filters = {}) => ipcRenderer.invoke('cards:list', filters),
    get: (id) => ipcRenderer.invoke('cards:get', id),
    create: (input) => ipcRenderer.invoke('cards:create', input),
    update: (id, input) => ipcRenderer.invoke('cards:update', id, input),
    setStatus: (id, status) => ipcRenderer.invoke('cards:set-status', id, status),
    delete: (id) => ipcRenderer.invoke('cards:delete', id),
    projects: () => ipcRenderer.invoke('cards:projects'),
  },
}

contextBridge.exposeInMainWorld('distillate', api)
