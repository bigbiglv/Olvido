import { BrowserWindow, app, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
//#region electron/db.ts
var prisma;
function initDatabase() {
	const isDev = !app.isPackaged;
	let dbPath;
	if (isDev) dbPath = path.join(app.getAppPath(), "prisma", "dev.db");
	else {
		const dbDir = app.getPath("userData");
		dbPath = path.join(dbDir, "database.db");
		if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
		if (!fs.existsSync(dbPath)) {
			const templatePath = path.join(process.resourcesPath, "database.db");
			if (fs.existsSync(templatePath)) try {
				fs.copyFileSync(templatePath, dbPath);
				console.log("Provisioned database from template:", templatePath);
			} catch (err) {
				console.error("Failed to copy database template:", err);
			}
			else console.warn("Production database template not found at:", templatePath);
		}
	}
	console.log("SQLite Database Path:", dbPath);
	prisma = new PrismaClient({ datasources: { db: { url: `file:${dbPath}` } } });
	return prisma;
}
function getPrisma() {
	if (!prisma) return initDatabase();
	return prisma;
}
//#endregion
//#region electron/main.ts
var __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
var VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
var MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
var RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
var win = null;
function registerIpcHandlers() {
	const prisma = getPrisma();
	ipcMain.handle("db:get-documents", async () => {
		try {
			return await prisma.document.findMany({ orderBy: { updatedAt: "desc" } });
		} catch (error) {
			console.error("Failed to get documents:", error);
			throw error;
		}
	});
	ipcMain.handle("db:get-document", async (_event, id) => {
		try {
			return await prisma.document.findUnique({ where: { id } });
		} catch (error) {
			console.error(`Failed to get document ${id}:`, error);
			throw error;
		}
	});
	ipcMain.handle("db:save-document", async (_event, doc) => {
		try {
			if (doc.id) return await prisma.document.update({
				where: { id: doc.id },
				data: {
					title: doc.title,
					content: doc.content,
					category: doc.category,
					project: doc.project,
					completed: doc.completed
				}
			});
			else return await prisma.document.create({ data: {
				title: doc.title,
				content: doc.content,
				category: doc.category || "日常",
				project: doc.project || null,
				completed: doc.completed || false
			} });
		} catch (error) {
			console.error("Failed to save document:", error);
			throw error;
		}
	});
	ipcMain.handle("db:delete-document", async (_event, id) => {
		try {
			return await prisma.document.delete({ where: { id } });
		} catch (error) {
			console.error(`Failed to delete document ${id}:`, error);
			throw error;
		}
	});
}
function createWindow() {
	win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: { preload: path.join(__dirname, "preload.mjs") }
	});
	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
		win.webContents.openDevTools();
	} else win.loadFile(path.join(RENDERER_DIST, "index.html"));
}
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
		win = null;
	}
});
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
app.whenReady().then(() => {
	initDatabase();
	registerIpcHandlers();
	createWindow();
});
//#endregion
export { MAIN_DIST, RENDERER_DIST, VITE_DEV_SERVER_URL };
