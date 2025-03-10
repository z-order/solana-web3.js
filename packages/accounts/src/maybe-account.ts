import { Address } from '@solana/addresses';

import { Account } from './account';

/** Defines a Solana account that may or may not exist after having tried to fetch it. */
export type MaybeAccount<TData extends object | Uint8Array, TAddress extends string = string> =
    | ({ readonly exists: true } & Account<TData, TAddress>)
    | { readonly exists: false; readonly address: Address<TAddress> };

/** Defines a Solana account with encoded data that may or may not exist after having tried to fetch it. */
export type MaybeEncodedAccount<TAddress extends string = string> = MaybeAccount<Uint8Array, TAddress>;

/** Asserts that an account that may or may not exists, actually exists. */
export function assertAccountExists<TData extends object | Uint8Array, TAddress extends string = string>(
    account: MaybeAccount<TData, TAddress>,
): asserts account is Account<TData, TAddress> & { exists: true } {
    if (!account.exists) {
        // TODO: Coded error.
        throw new Error(`Expected account [${account.address}] to exist.`);
    }
}

/** Asserts that all accounts that may or may not exist, actually all exist. */
export function assertAccountsExist<TData extends object | Uint8Array, TAddress extends string = string>(
    accounts: MaybeAccount<TData, TAddress>[],
): asserts accounts is (Account<TData, TAddress> & { exists: true })[] {
    const missingAccounts = accounts.filter(a => !a.exists);
    if (missingAccounts.length > 0) {
        const missingAddresses = missingAccounts.map(a => a.address);
        // TODO: Coded error.
        throw new Error(`Expected accounts [${missingAddresses.join(', ')}] to exist.`);
    }
}
