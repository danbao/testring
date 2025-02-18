/* eslint-disable @typescript-eslint/ban-ts-comment */
import {expect} from 'chai';
import {createElementPath} from '../../src';

describe('enabled strictMode', () => {
    const empty = createElementPath();

    describe('xpath getter', () => {
        it('call', () => {
            // @ts-ignore
            const error = () => empty.xpath('//testerror');
            expect(error).to.throw('Can not use xpath query in strict mode');
        });
    });
});
