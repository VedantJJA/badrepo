function deepMerge(target, source) {
    for (let key in source) {
        // Prevent Prototype Pollution by blocking sensitive keys
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            continue;
        }

        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
            if (!target[key] || typeof target[key] !== 'object') {
                target[key] = {};
            }

            deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }
    return target;
}

const userInput = '{"__proto__": {"isAdmin": true}}';
const parsedPayload = JSON.parse(userInput);

let userProfile = { username: "guest_user" };

deepMerge(userProfile, parsedPayload);

let newRandomObject = {};

if (newRandomObject.isAdmin) {
    console.log("CRITICAL SECURITY BREACH: The attacker polluted the prototype and gained Admin access!");
} else {
    console.log("System is secure.");
}

module.exports = { deepMerge };