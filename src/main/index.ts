import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'node:path'
import { CardStore } from '../core/card-store'
import { openNodeDatabase } from '../core/database-node'
import { getDatabasePath } from '../core/data-path'
import {
  cardStatusSchema,
  createCardInputSchema,
  listCardsFiltersSchema,
  updateCardInputSchema,
} from '../shared/cards'
import { getPreloadPath } from './window-paths'

let store: CardStore | null = null

function getStore(): CardStore {
  if (!store) store = new CardStore(openNodeDatabase(getDatabasePath()))
  return store
}

function registerIpcHandlers(): void {
  ipcMain.handle('cards:list', (_event, filters) => getStore().list(listCardsFiltersSchema.parse(filters ?? {})))
  ipcMain.handle('cards:get', (_event, id: string) => getStore().get(id))
  ipcMain.handle('cards:create', (_event, input) => getStore().create(createCardInputSchema.parse(input)))
  ipcMain.handle('cards:update', (_event, id: string, input) => getStore().update(id, updateCardInputSchema.parse(input)))
  ipcMain.handle('cards:set-status', (_event, id: string, status) =>
    getStore().setStatus(id, cardStatusSchema.parse(status)),
  )
  ipcMain.handle('cards:set-favorite', (_event, id: string, favorite: boolean) =>
    getStore().setFavorite(id, favorite),
  )
  ipcMain.handle('cards:delete', (_event, id: string) => getStore().delete(id))
  ipcMain.handle('cards:projects', () => getStore().projects())
}

function createWindow(): void {
  const window = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 860,
    minHeight: 600,
    backgroundColor: '#09090b',
    icon: app.isPackaged ? undefined : join(__dirname, '../../build/icon.png'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: getPreloadPath(__dirname),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  window.setMenuBarVisibility(false)

  window.once('ready-to-show', () => window.show())

  if (process.env.ELECTRON_RENDERER_URL) {
    void window.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    void window.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => {
  store?.close()
  store = null
})
