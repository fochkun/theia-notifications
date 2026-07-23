import { expect } from 'chai';
import * as sinon from 'sinon';
import { NotificationServiceImpl } from '../notification-service-impl';
import { NotificationHistoryService } from '../notification-history-service';
import { Notification } from '../../common/notification-types';

describe('NotificationServiceImpl (Backend)', () => {
    let service: NotificationServiceImpl;
    let historyServiceStub: sinon.SinonStubbedInstance<NotificationHistoryService>;
    let clientMock: { onNotification: sinon.SinonStub };

    beforeEach(() => {
        historyServiceStub = sinon.createStubInstance(NotificationHistoryService);
        historyServiceStub.load.resolves([]);
        historyServiceStub.save.resolves();

        service = new NotificationServiceImpl();
        // Подменяем инжектированный historyService
        (service as any).historyService = historyServiceStub;

        clientMock = { onNotification: sinon.stub() };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('push', () => {
        it('[1] should create notification with id and timestamp', async () => {
            service.setClient(clientMock);
            const result = await service.push({
                severity: 'info',
                title: 'Test',
                message: 'Test message'
            });

            expect(result.id).to.be.a('string').and.not.empty;
            expect(result.timestamp).to.be.a('number');
            expect(result.title).to.equal('Test');
            expect(result.severity).to.equal('info');
        });

        it('[2] should add notification to history', async () => {
            service.setClient(clientMock);
            await service.push({ severity: 'info', title: 'Test', message: 'Msg' });

            const history = await service.getHistory();
            expect(history).to.have.lengthOf(1);
            expect(history[0].title).to.equal('Test');
        });

        it('[8] should call client.onNotification with the notification', async () => {
            service.setClient(clientMock);
            const result = await service.push({
                severity: 'warning',
                title: 'Alert',
                message: 'Warning!'
            });

            expect(clientMock.onNotification.calledOnce).to.be.true;
            const sentNotification = clientMock.onNotification.firstCall.args[0];
            expect(sentNotification.id).to.equal(result.id);
            expect(sentNotification.title).to.equal('Alert');
        });

        it('[9] should not throw when client is undefined', async () => {
            service.setClient(undefined);
            const result = await service.push({
                severity: 'info',
                title: 'Test',
                message: 'Msg'
            });
            expect(result).to.have.property('id');
        });

        it('should save history to disk via historyService', async () => {
            service.setClient(clientMock);
            await service.push({ severity: 'info', title: 'Test', message: 'Msg' });

            expect(historyServiceStub.save.calledOnce).to.be.true;
            const savedHistory = historyServiceStub.save.firstCall.args[0];
            expect(savedHistory).to.have.lengthOf(1);
        });

        it('[5] should enforce MAX_HISTORY limit of 100', async () => {
            service.setClient(clientMock);

            for (let i = 0; i < 105; i++) {
                await service.push({
                    severity: 'info',
                    title: `Title ${i}`,
                    message: `Message ${i}`
                });
            }

            const history = await service.getHistory();
            expect(history).to.have.lengthOf(100);
            // Первые 5 должны быть удалены (самые старые)
            expect(history[0].title).to.equal('Title 5');
            expect(history[99].title).to.equal('Title 104');
        });
    });

    describe('getHistory', () => {
        it('[3] should return copies of notifications (immutability)', async () => {
            service.setClient(clientMock);
            await service.push({ severity: 'info', title: 'Original', message: 'Msg' });

            const history1 = await service.getHistory();
            history1[0].title = 'Mutated';

            const history2 = await service.getHistory();
            expect(history2[0].title).to.equal('Original');
        });

        it('[4] should maintain chronological order', async () => {
            service.setClient(clientMock);

            await service.push({ severity: 'info', title: 'First', message: 'Msg' });
            await new Promise(r => setTimeout(r, 5));
            await service.push({ severity: 'info', title: 'Second', message: 'Msg' });
            await new Promise(r => setTimeout(r, 5));
            await service.push({ severity: 'info', title: 'Third', message: 'Msg' });

            const history = await service.getHistory();
            expect(history).to.have.lengthOf(3);
            expect(history[0].title).to.equal('First');
            expect(history[1].title).to.equal('Second');
            expect(history[2].title).to.equal('Third');
        });

        it('should load history from historyService on first call', async () => {
            const savedHistory: Notification[] = [
                { id: '1', severity: 'info', title: 'Saved', message: 'M', timestamp: 1000 }
            ];
            historyServiceStub.load.resolves(savedHistory);

            const history = await service.getHistory();
            expect(historyServiceStub.load.calledOnce).to.be.true;
            expect(history).to.have.lengthOf(1);
            expect(history[0].title).to.equal('Saved');
        });
    });

    describe('clearHistory', () => {
        it('[6] should clear all notifications', async () => {
            service.setClient(clientMock);
            await service.push({ severity: 'info', title: 'Test', message: 'Msg' });
            await service.clearHistory();

            const history = await service.getHistory();
            expect(history).to.have.lengthOf(0);
        });

        it('should save empty array to disk', async () => {
            service.setClient(clientMock);
            await service.push({ severity: 'info', title: 'Test', message: 'Msg' });
            historyServiceStub.save.resetHistory();

            await service.clearHistory();

            expect(historyServiceStub.save.calledOnce).to.be.true;
            expect(historyServiceStub.save.firstCall.args[0]).to.deep.equal([]);
        });
    });

    describe('actionInvoked', () => {
        it('[7] should resolve without throwing', async () => {
            await service.actionInvoked('any-id', { id: 'action1', label: 'OK' });
            // No exception = pass
        });
    });

    describe('dispose', () => {
        it('should reset client and history', async () => {
            service.setClient(clientMock);
            await service.push({ severity: 'info', title: 'Test', message: 'Msg' });

            service.dispose();

            expect(service.getClient()).to.be.undefined;
            // После dispose история должна быть undefined, следующее обращение снова загрузит
            historyServiceStub.load.resetHistory();
            await service.getHistory();
            expect(historyServiceStub.load.calledOnce).to.be.true;
        });
    });
});