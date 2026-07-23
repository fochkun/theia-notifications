import { expect } from 'chai';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationPanelView } from '../panel/notification-panel-view';
import { Notification } from '../../common/notification-types';
import * as sinon from 'sinon';

describe('NotificationPanelView', () => {
    const now = Date.now();
    const today = now;
    const yesterday = now - 24 * 60 * 60 * 1000;
    const earlier = now - 3 * 24 * 60 * 60 * 1000;

    const makeNotification = (
        id: string,
        severity: 'info' | 'warning' | 'error',
        title: string,
        timestamp: number,
        actions?: { id: string; label: string }[]
    ): Notification => ({
        id,
        severity,
        title,
        message: `Message for ${title}`,
        timestamp,
        actions
    });

    const defaultProps = {
        notifications: [] as Notification[],
        filter: 'all' as const,
        onFilterChange: sinon.stub(),
        onClearHistory: sinon.stub(),
        onActionInvoked: sinon.stub(),
        invokedActions: new Set<string>()
    };

    afterEach(() => sinon.restore());

    describe('filters', () => {
        it('should show only error notifications when filter is "error"', () => {
            const notifications = [
                makeNotification('1', 'info', 'Info msg', today),
                makeNotification('2', 'warning', 'Warning msg', today),
                makeNotification('3', 'error', 'Error msg', today)
            ];
            render(
                <NotificationPanelView {...defaultProps} notifications={notifications} filter="error" />
            );
            expect(screen.queryByText('Info msg')).to.be.null;
            expect(screen.queryByText('Warning msg')).to.be.null;
            expect(screen.getByText('Error msg')).to.exist;
        });

        it('should show all notifications when filter is "all"', () => {
            const notifications = [
                makeNotification('1', 'info', 'Info msg', today),
                makeNotification('2', 'warning', 'Warning msg', today),
                makeNotification('3', 'error', 'Error msg', today)
            ];
            render(
                <NotificationPanelView {...defaultProps} notifications={notifications} filter="all" />
            );
            expect(screen.getByText('Info msg')).to.exist;
            expect(screen.getByText('Warning msg')).to.exist;
            expect(screen.getByText('Error msg')).to.exist;
        });

        it('should call onFilterChange when filter button clicked', () => {
            const onFilterChange = sinon.stub();
            render(
                <NotificationPanelView {...defaultProps} onFilterChange={onFilterChange} />
            );
            fireEvent.click(screen.getByText('Error'));
            expect(onFilterChange.calledOnceWith('error')).to.be.true;
        });
    });

    describe('grouping', () => {
        it('should place today notification in "Сегодня" section', () => {
            const notifications = [makeNotification('1', 'info', 'Today item', today)];
            render(
                <NotificationPanelView {...defaultProps} notifications={notifications} />
            );
            expect(screen.getByText('Сегодня')).to.exist;
            expect(screen.getByText('Today item')).to.exist;
        });

        it('should place yesterday notification in "Вчера" section', () => {
            const notifications = [makeNotification('1', 'info', 'Yesterday item', yesterday)];
            render(
                <NotificationPanelView {...defaultProps} notifications={notifications} />
            );
            expect(screen.getByText('Вчера')).to.exist;
            expect(screen.getByText('Yesterday item')).to.exist;
        });

        it('should place older notification in "Ранее" section', () => {
            const notifications = [makeNotification('1', 'info', 'Old item', earlier)];
            render(
                <NotificationPanelView {...defaultProps} notifications={notifications} />
            );
            expect(screen.getByText('Ранее')).to.exist;
            expect(screen.getByText('Old item')).to.exist;
        });

        it('should hide empty sections', () => {
            const notifications = [makeNotification('1', 'info', 'Only today', today)];
            render(
                <NotificationPanelView {...defaultProps} notifications={notifications} />
            );
            expect(screen.getByText('Сегодня')).to.exist;
            expect(screen.queryByText('Вчера')).to.be.null;
            expect(screen.queryByText('Ранее')).to.be.null;
        });
    });

    describe('empty state', () => {
        it('should show "No notifications" when list is empty', () => {
            render(<NotificationPanelView {...defaultProps} />);
            expect(screen.getByText('No notifications')).to.exist;
        });

        it('should show "No {filter} notifications" when filtered list is empty', () => {
            const notifications = [makeNotification('1', 'info', 'Info', today)];
            render(
                <NotificationPanelView {...defaultProps} notifications={notifications} filter="error" />
            );
            expect(screen.getByText('No error notifications')).to.exist;
        });
    });

    describe('clear history', () => {
        it('should call onClearHistory when Clear All button clicked', () => {
            const onClearHistory = sinon.stub();
            const notifications = [makeNotification('1', 'info', 'Test', today)];
            render(
                <NotificationPanelView
                    {...defaultProps}
                    notifications={notifications}
                    onClearHistory={onClearHistory}
                />
            );
            fireEvent.click(screen.getByText('Clear All'));
            expect(onClearHistory.calledOnce).to.be.true;
        });

        it('should disable Clear All button when no notifications', () => {
            render(<NotificationPanelView {...defaultProps} />);
            const button = screen.getByText('Clear All');
            expect(button.hasAttribute('disabled')).to.be.true;
        });
    });

    describe('actions', () => {
        it('should call onActionInvoked when action button clicked', () => {
            const onActionInvoked = sinon.stub();
            const notifications = [
                makeNotification('1', 'info', 'Test', today, [{ id: 'a1', label: 'Click Me' }])
            ];
            render(
                <NotificationPanelView
                    {...defaultProps}
                    notifications={notifications}
                    onActionInvoked={onActionInvoked}
                />
            );
            fireEvent.click(screen.getByText('Click Me'));
            expect(onActionInvoked.calledOnce).to.be.true;
            expect(onActionInvoked.firstCall.args[0]).to.equal('1');
            expect(onActionInvoked.firstCall.args[1].id).to.equal('a1');
        });

        it('should not render action buttons when notification has no actions', () => {
            const notifications = [makeNotification('1', 'info', 'Test', today)];
            render(
                <NotificationPanelView {...defaultProps} notifications={notifications} />
            );
            // Должны быть только Clear All + 4 фильтра = 5 кнопок
            const buttons = screen.getAllByRole('button');
            expect(buttons.length).to.equal(5);
        });
    });
});
