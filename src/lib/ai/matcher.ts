import { prisma } from "../prisma";

/**
 * Fuzzy Matcher: Finds the best matching property for a given address string.
 */
export async function matchProperty(address: string, userId: string) {
    const properties = await prisma.property.findMany({
        where: { userId }
    });

    if (properties.length === 0) return null;

    // Simple fuzzy match: check if property address is contained in bill address or vice versa
    const lowerAddr = address.toLowerCase();

    for (const prop of properties) {
        if (!prop.address) continue;
        const propAddr = prop.address.toLowerCase();

        if (lowerAddr.includes(propAddr) || propAddr.includes(lowerAddr)) {
            return prop;
        }
    }

    // Default to first property if only one exists (optional strategy)
    if (properties.length === 1) return properties[0];

    return null;
}
