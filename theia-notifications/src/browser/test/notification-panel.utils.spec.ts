import { expect } from 'chai';
import { getDateGroup } from '../panel/notification-panel.utils';

describe('getDateGroup', () => {
    it('should return "today" for current timestamp', () => {
        expect(getDateGroup(Date.now())).to.equal('today');
    });

    it('should return "today" for start of today (00:00:01)', () => {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 1, 0);
        expect(getDateGroup(startOfToday.getTime())).to.equal('today');
    });

    it('should return "yesterday" for 24 hours ago', () => {
        const yesterday = Date.now() - 24 * 60 * 60 * 1000;
        expect(getDateGroup(yesterday)).to.equal('yesterday');
    });

    it('should return "yesterday" for late yesterday evening (23:59:59)', () => {
        const lateYesterday = new Date();
        lateYesterday.setDate(lateYesterday.getDate() - 1);
        lateYesterday.setHours(23, 59, 59, 0);
        expect(getDateGroup(lateYesterday.getTime())).to.equal('yesterday');
    });

    it('should return "earlier" for 3 days ago', () => {
        const earlier = Date.now() - 3 * 24 * 60 * 60 * 1000;
        expect(getDateGroup(earlier)).to.equal('earlier');
    });

    it('should return "earlier" for timestamp from last year', () => {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        expect(getDateGroup(lastYear.getTime())).to.equal('earlier');
    });
});
