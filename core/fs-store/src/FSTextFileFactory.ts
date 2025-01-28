import {
    requestMeta,
    FSStoreType,
    FSFileUniqPolicy,
    FSStoreDataOptions,
} from '@testring/types';
import {FSStoreFile} from './fs-store-file';

const baseMeta: requestMeta = {
    type: FSStoreType.text,
    uniqPolicy: FSFileUniqPolicy.global, //
};
const data: FSStoreDataOptions = {
    fsOptions: {encoding: 'utf8' as BufferEncoding},
};

export function create(
    extraMeta?: requestMeta,
    extraData?: FSStoreDataOptions,
) {
    return new FSStoreFile({
        ...data,
        ...extraData,
        meta: {...baseMeta, ...extraMeta},
    });
}
