import type { Predicate } from "./types";
import { useLocalStorage } from "@vueuse/core";
import { safely } from "@yyhhenry/rust-result";
import { computed, type WritableComputedRef } from "vue";

export function useTypedStorage<T>(key: string, isT: Predicate<T>): WritableComputedRef<T | undefined> {
    const base = useLocalStorage<string | undefined>(key, undefined);
    const storage = computed<T | undefined>({
        get: () => {
            const str = base.value;
            if (!str) {
                return undefined;
            }
            const result = safely(() => JSON.parse(str) as unknown);
            if (result.isErr()) {
                return undefined;
            }
            const value = result.unwrap();
            if (!isT(value)) {
                return undefined;
            }
            return value;
        },
        set: (value: T | undefined) => {
            if (!value) {
                base.value = undefined;
                return;
            }
            base.value = JSON.stringify(value);
        }
    });
    return storage;
}
