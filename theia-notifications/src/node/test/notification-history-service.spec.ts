import { expect } from 'chai';
import * as sinon from 'sinon';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { NotificationHistoryService } from '../notification-history-service';
import { Notification } from '../../common/notification-types';

describe('NotificationHistoryService (Backend Persistence)', () => {
    let service: NotificationHistoryService;
    let tmpDir: string;
    let historyDir: string;
    let cwdStub: sinon.SinonStub;

    const sampleHistory: Notification[] = [
        {
            id: '1',
            severity: 'info',
            title: 'Test',
            message: 'Test message',
            timestamp: Date.now()
        }
    ];

    beforeEach(async () => {
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'theia-notifications-test-'));
        historyDir = path.join(tmpDir, '.theia-notifications');
        cwdStub = sinon.stub(process, 'cwd').returns(tmpDir);
        service = new NotificationHistoryService();
    });

    afterEach(async () => {
        cwdStub.restore();
        sinon.restore();
        try {
            await fs.rm(tmpDir, { recursive: true, force: true });
        } catch (e) {
            // ignore cleanup errors
        }
    });

    it('[10] should save and load history', async () => {
        await service.save(sampleHistory);
        const loaded = await service.load();
        expect(loaded).to.deep.equal(sampleHistory);
    });

    it('[11] should return empty array when file does not exist', async () => {
        const loaded = await service.load();
        expect(loaded).to.deep.equal([]);
    });

    it('[12] should return empty array when JSON is corrupted', async () => {
        await fs.mkdir(historyDir, { recursive: true });
        const filePath = path.join(historyDir, 'history.json');
        await fs.writeFile(filePath, '{invalid json', 'utf8');

        const loaded = await service.load();
        expect(loaded).to.deep.equal([]);
    });

    it('[12b] should return empty array when file contains non-array JSON', async () => {
        await fs.mkdir(historyDir, { recursive: true });
        const filePath = path.join(historyDir, 'history.json');
        await fs.writeFile(filePath, '{"not": "an array"}', 'utf8');

        const loaded = await service.load();
        expect(loaded).to.deep.equal([]);
    });

    it('[13] should clear history by saving empty array', async () => {
        await service.save(sampleHistory);
        await service.save([]);

        const loaded = await service.load();
        expect(loaded).to.deep.equal([]);
    });

    it('[14] should create directory automatically on save', async () => {
        // Убеждаемся, что директории нет
        let dirExists = true;
        try {
            await fs.access(historyDir);
        } catch {
            dirExists = false;
        }
        expect(dirExists).to.be.false;

        await service.save(sampleHistory);

        // Проверяем, что директория создана
        const stat = await fs.stat(historyDir);
        expect(stat.isDirectory()).to.be.true;

        const filePath = path.join(historyDir, 'history.json');
        const content = await fs.readFile(filePath, 'utf8');
        expect(JSON.parse(content)).to.deep.equal(sampleHistory);
    });

    it('should save UTF-8 correctly (non-ASCII characters)', async () => {
        const utf8History: Notification[] = [
            {
                id: '1',
                severity: 'info',
                title: 'Тест заголовок 🔔',
                message: 'Сообщение с юникодом: Привет мир',
                timestamp: Date.now()
            }
        ];

        await service.save(utf8History);
        const loaded = await service.load();
        expect(loaded[0].title).to.equal('Тест заголовок 🔔');
        expect(loaded[0].message).to.equal('Сообщение с юникодом: Привет мир');
    });
});
