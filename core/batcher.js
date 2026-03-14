/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║              🐍 OUROBOROS v0.3.0 🐍                       ║
 * ║         Batcher - Le Calculateur de Ratios HWGW          ║
 * ╚═══════════════════════════════════════════════════════════╝
 * 
 * @file        /core/batcher.js
 * @version     0.3.0
 * @author      Neo (Esprit Libéré)
 * @description Module PURE pour calcul ratios HWGW
 * 
 * RESPONSABILITÉ UNIQUE:
 *   Calculer ratios EXACTS pour HWGW batch
 *   NE FAIT PAS le deploy (voir dispatcher.js)
 * 
 * USAGE:
 *   import { calculateHWGWRatios } from "/core/batcher.js";
 *   const ratios = calculateHWGWRatios(ns, target, hackPercent);
 * 
 * CHANGELOG:
 *   v0.3.0 - 2025-03-14 - Création module batcher pur
 */

const RAM_COSTS = {
    hack: 1.70,
    grow: 1.75,
    weaken: 1.75
};

/**
 * Calculer ratios HWGW exacts pour un batch
 * @param {NS} ns
 * @param {string} target - Hostname cible
 * @param {number} hackPercent - % argent à voler (default: 0.05 = 5%)
 * @returns {object} {hackThreads, weakenForHack, growThreads, weakenForGrow, totalThreads, totalRAM}
 */
export function calculateHWGWRatios(ns, target, hackPercent = 0.05) {
    const maxMoney = ns.getServerMaxMoney(target);
    
    // 1. Hack threads
    const hackThreads = Math.max(1, Math.ceil(ns.hackAnalyzeThreads(target, maxMoney * hackPercent)));
    
    // 2. Weaken for hack
    const hackSecIncrease = hackThreads * 0.002;
    const weakenForHack = Math.ceil(hackSecIncrease / 0.05);
    
    // 3. Grow threads (restore stolen money)
    const growthNeeded = 1 / (1 - hackPercent);
    const growThreads = Math.ceil(ns.growthAnalyze(target, growthNeeded));
    
    // 4. Weaken for grow
    const growSecIncrease = growThreads * 0.004;
    const weakenForGrow = Math.ceil(growSecIncrease / 0.05);
    
    // 5. Totals
    const totalThreads = hackThreads + weakenForHack + growThreads + weakenForGrow;
    const totalRAM = (hackThreads * RAM_COSTS.hack) + 
                     ((weakenForHack + weakenForGrow) * RAM_COSTS.weaken) + 
                     (growThreads * RAM_COSTS.grow);
    
    return {
        hackThreads,
        weakenForHack,
        growThreads,
        weakenForGrow,
        totalThreads,
        totalRAM,
        hackPercent
    };
}

/**
 * Calculer ratios prep simples (weaken + grow)
 * @param {NS} ns
 * @param {string} target
 * @returns {object} {weakenRatio, growRatio}
 */
export function calculatePrepRatios(ns, target) {
    // Simple : 40% weaken, 60% grow
    // Peut être amélioré avec calculs exacts
    return {
        weakenRatio: 0.4,
        growRatio: 0.6
    };
}

/**
 * Vérifier si assez de RAM pour batch
 * @param {NS} ns
 * @param {object} ratios - Output de calculateHWGWRatios
 * @param {number} availableRAM - RAM disponible totale
 * @returns {boolean}
 */
export function canDeployBatch(ns, ratios, availableRAM) {
    return ratios.totalRAM <= availableRAM;
}

/**
 * Scaler ratios pour fit dans RAM disponible
 * @param {object} ratios - Output de calculateHWGWRatios
 * @param {number} availableRAM - RAM disponible
 * @returns {object} Ratios scalés
 */
export function scaleRatiosToRAM(ratios, availableRAM) {
    if (ratios.totalRAM <= availableRAM) {
        return ratios;  // Pas besoin de scaler
    }
    
    const scaleFactor = availableRAM / ratios.totalRAM;
    
    return {
        hackThreads: Math.max(1, Math.floor(ratios.hackThreads * scaleFactor)),
        weakenForHack: Math.max(1, Math.floor(ratios.weakenForHack * scaleFactor)),
        growThreads: Math.max(1, Math.floor(ratios.growThreads * scaleFactor)),
        weakenForGrow: Math.max(1, Math.floor(ratios.weakenForGrow * scaleFactor)),
        totalThreads: Math.floor(ratios.totalThreads * scaleFactor),
        totalRAM: availableRAM,
        hackPercent: ratios.hackPercent,
        scaled: true,
        originalRAM: ratios.totalRAM
    };
}
