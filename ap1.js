/**
 * Performs a deep merge of two objects.
 * Fixed to prevent Prototype Pollution by filtering sensitive keys.
 * 
 * @param {Object} target - The destination object.
 * @param {Object} source - The source object containing properties to merge.
 * @returns {Object} The merged target object.
 */
function deepMerge(target, source) {
    // Ensure both target and source are objects and not null
    if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
        return target;
    }

    // Use Object.keys to iterate only over the source object's own properties
    const keys = Object.keys(source);

    for (let key of keys) {
        // 1. PREVENT PROTOTYPE POLLUTION:
        // Skip sensitive keys that could modify the prototype chain.
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            continue;
        }

        const sourceValue = source[key];

        // 2. DEEP MERGE LOGIC:
        // If the value is an object (and not null), recurse.
        if (typeof sourceValue === 'object' && sourceValue !== null) {
            
            // Ensure target[key] is an object to allow deep merging.
            // If it's not an object, we initialize it as one.
            if (typeof target[key] !== 'object' || target[key] === null) {
                target[key] = {};
            }

            deepMerge(target[key], sourceValue);
        } else {
            // 3. ASSIGNMENT:
            // For primitive values, simply assign them to the target.
            target[key] = sourceValue;
        }
    }
    return target;
}

// --- Test/Demonstration Code ---

const userInput = '{"__proto__": {"isAdmin": true}}';
let parsedPayload;

try {
    parsedPayload = JSON.parse(userInput);
} catch (e) {
    parsedPayload = {};
}

let userProfile = { username: "guest_user" };

// Perform the merge
deepMerge(userProfile, parsedPayload);

let newRandomObject = {};

// Check if prototype pollution occurred
if (newRandomObject.isAdmin) {
    console.log("CRITICAL SECURITY BREACH: The attacker polluted the prototype and gained Admin access!");
} else {
    console.log("System is secure.");
}

module.exports = { deepMerge };