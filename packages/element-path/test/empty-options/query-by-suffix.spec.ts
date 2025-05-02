import {expect} from 'chai';
import {createElementPath} from '../../src';
import {
    getDescriptor,
    getPrivateDescriptor,
    checkAccessMethods,
    checkPreventExtensions,
    checkProperty,
} from '../utils';

describe("empty options ElementPath root['*foo']", () => {
    const root = createElementPath();
    const childFoo = root['*foo'];
    if (!childFoo) throw new Error('Element not found');

    describe('basic Object methods', () => {
        it('.toString()', () => {
            expect(childFoo.toString()).to.be.equal(
                "(//*[@data-test-automation-id='root']" +
                    '/descendant::*[substring(@data-test-automation-id, ' +
                    "string-length(@data-test-automation-id) - string-length('foo') + 1) = 'foo'])[1]",
            );
        });

        it('to string converting', () => {
            expect(`${childFoo}`).to.be.equal(
                "(//*[@data-test-automation-id='root']" +
                    '/descendant::*[substring(@data-test-automation-id, ' +
                    "string-length(@data-test-automation-id) - string-length('foo') + 1) = 'foo'])[1]",
            );
        });

        it('.toString(true)', () => {
            expect(childFoo.toString(true)).to.be.equal(
                "//*[@data-test-automation-id='root']" +
                    '/descendant::*[substring(@data-test-automation-id, ' +
                    "string-length(@data-test-automation-id) - string-length('foo') + 1) = 'foo']",
            );
        });

        checkAccessMethods(childFoo);
    });

    describe('preventExtensions traps', () => {
        checkPreventExtensions(childFoo);
    });

    // Public properties
    describe('.__path property traps', () => {
        checkProperty({
            object: childFoo,
            key: '__path',
            valueDescriptor: getDescriptor([
                {
                    isRoot: true,
                    name: 'root',
                    xpath: "//*[@data-test-automation-id='root']",
                },
                {
                    isRoot: false,
                    query: {
                        suffix: 'foo',
                    },
                    xpath:
                        '/descendant::*[substring(@data-test-automation-id, ' +
                        "string-length(@data-test-automation-id) - string-length('foo') + 1) = 'foo']",
                },
            ]),
        });
    });
    describe('.__flows property traps', () => {
        checkProperty({
            object: childFoo,
            key: '__flows',
            valueDescriptor: getDescriptor({}),
        });
    });

    // Private properties
    describe('.__searchOptions property traps', () => {
        checkProperty({
            object: childFoo,
            key: '__searchOptions',
            valueDescriptor: getPrivateDescriptor({
                suffix: 'foo',
            }),
        });
    });
    describe('.__parentPath property traps', () => {
        checkProperty({
            object: childFoo,
            key: '__parentPath',
            valueDescriptor: getPrivateDescriptor([
                {
                    isRoot: true,
                    name: 'root',
                    xpath: "//*[@data-test-automation-id='root']",
                },
            ]),
        });
    });

    describe('.__getReversedChain() call', () => {
        it('with root', () => {
            expect(childFoo.__getReversedChain()).to.be.equal('root["*foo"]');
        });
        it('without root', () => {
            expect(childFoo.__getReversedChain(false)).to.be.equal('["*foo"]');
        });
    });

    describe('.__getChildType() call', () => {
        it('return type check', () => {
            expect(childFoo.__getChildType()).to.be.a('symbol');
        });
    });
});
