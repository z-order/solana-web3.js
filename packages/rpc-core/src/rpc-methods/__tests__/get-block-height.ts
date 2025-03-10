import { createHttpTransport, createJsonRpc, type SolanaJsonRpcErrorCode } from '@solana/rpc-transport';
import type { Rpc } from '@solana/rpc-types';
import { Commitment } from '@solana/rpc-types';
import fetchMock from 'jest-fetch-mock-fork';

import { createSolanaRpcApi, GetBlockHeightApi } from '../index';

describe('getBlockHeight', () => {
    let rpc: Rpc<GetBlockHeightApi>;
    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.dontMock();
        rpc = createJsonRpc<GetBlockHeightApi>({
            api: createSolanaRpcApi(),
            transport: createHttpTransport({ url: 'http://127.0.0.1:8899' }),
        });
    });
    (['confirmed', 'finalized', 'processed'] as Commitment[]).forEach(commitment => {
        describe(`when called with \`${commitment}\` commitment`, () => {
            it('returns the result as a bigint', async () => {
                expect.assertions(1);
                const result = await rpc.getBlockHeight({ commitment }).send();
                expect(result).toEqual(expect.any(BigInt));
            });
        });
    });
    describe('when called with a `minContextSlot` of 0', () => {
        it('returns the result as a bigint', async () => {
            expect.assertions(1);
            const result = await rpc.getBlockHeight({ minContextSlot: 0n }).send();
            expect(result).toEqual(expect.any(BigInt));
        });
    });
    describe('when called with a `minContextSlot` higher than the highest slot available', () => {
        it('throws an error', async () => {
            expect.assertions(1);
            const sendPromise = rpc
                .getBlockHeight({
                    minContextSlot: 2n ** 63n - 1n, // u64:MAX; safe bet it'll be too high.
                })
                .send();
            await expect(sendPromise).rejects.toMatchObject({
                code: -32016 satisfies (typeof SolanaJsonRpcErrorCode)['JSON_RPC_SERVER_ERROR_MIN_CONTEXT_SLOT_NOT_REACHED'],
                message: expect.any(String),
                name: 'SolanaJsonRpcError',
            });
        });
    });
});
