let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("electronAPI", {
	getDocuments: () => electron.ipcRenderer.invoke("db:get-documents"),
	getDocument: (id) => electron.ipcRenderer.invoke("db:get-document", id),
	saveDocument: (document) => electron.ipcRenderer.invoke("db:save-document", document),
	deleteDocument: (id) => electron.ipcRenderer.invoke("db:delete-document", id),
	platform: process.platform
});
//#endregion
