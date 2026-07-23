import { injectable } from '@theia/core/shared/inversify';
import { Notification } from '../common/notification-types';
import * as fs from 'fs/promises';
import * as path from 'path';

const HISTORY_DIR_NAME = '.theia-notifications';
const HISTORY_FILE_NAME = 'history.json';

@injectable()
export class NotificationHistoryService {

    private get filePath(): string {
        return path.join(process.cwd(), HISTORY_DIR_NAME, HISTORY_FILE_NAME);
    }

    /**
     * Загружает историю с диска.
     * Если файл не существует или повреждён — возвращает пустой массив.
     */
    async load(): Promise<Notification[]> {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                return parsed;
            }
            console.warn('[NotificationHistoryService] Invalid format in history file. Returning empty array.');
            return [];
        } catch (error) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'ENOENT') {
                return [];
            }
            console.warn(`[NotificationHistoryService] Failed to load history: ${err.message}. Returning empty array.`);
            return [];
        }
    }

    /**
     * Сохраняет историю на диск.
     * Автоматически создаёт директорию, если её нет.
     */
    async save(history: Notification[]): Promise<void> {
        try {
            const dir = path.dirname(this.filePath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(this.filePath, JSON.stringify(history, null, 2), 'utf8');
        } catch (error) {
            const err = error as Error;
            console.error(`[NotificationHistoryService] Failed to save history: ${err.message}`);
        }
    }
}
