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

// Usage examples.
export const EXAMPLE_16_MIB = {
    kib: mibToKib(16),
    bytes: mibToBytes(16)
};

export const EXAMPLE_05_MIB = {
    kib: mibToKib(0.5),
    bytes: mibToBytes(0.5)
};

export const EXAMPLE_025_MIB = {
    kib: mibToKib(0.25),
    bytes: mibToBytes(0.25)
};

export const EXAMPLE_4_MIB = {
    kib: mibToKib(4),
    bytes: mibToBytes(4)
};
