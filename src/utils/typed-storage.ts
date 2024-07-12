import type { Predicate } from "./types";
import { useLocalStorage } from "@vueuse/core";
import { safely } from "@yyhhenry/rust-result";
import { ref, watchEffect, type Ref } from "vue";

export function useTypedStorage<T>(key: string, isT: Predicate<T>): Ref<T | undefined> {
    const base = useLocalStorage<string | undefined>(key, undefined);
    const typedRef: Ref<T | undefined> = ref(undefined);
    watchEffect(() => {
        const str = base.value;
        if (JSON.stringify(typedRef.value) === str) return;
        if (str === undefined) {
            typedRef.value = undefined;
            return;
        }
        const result = safely(() => JSON.parse(str) as unknown);
        if (result.isErr()) {
            typedRef.value = undefined;
            return;
        }
        const value = result.unwrap();
        if (!isT(value)) {
            typedRef.value = undefined;
            return;
        }
        typedRef.value = value;
        console.log("base -> ref", str);
    });
    watchEffect(() => {
        base.value = JSON.stringify(typedRef.value);
        console.log("ref -> base", base.value);
    });
    return typedRef;
}
