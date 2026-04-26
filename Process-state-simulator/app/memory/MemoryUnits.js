// MiB is the base unit for binary memory values.
export const KiB = 1024;
export const MiB = KiB * KiB;

// Converts mebibytes (MiB) to kibibytes (KiB).
export function mibToKib(mib) {
    return mib * KiB;
}

// Converts mebibytes (MiB) to bytes, returning an integer value.
export function mibToBytes(mib) {
    return Math.round(mib * MiB);
}

